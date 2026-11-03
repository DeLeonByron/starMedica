using StarMedica.Application.Features.Billing.Commands.CreateBillingDraft;
using StarMedica.Application.Features.Billing.Commands.UpdateBillingDraft;
using StarMedica.Application.Features.Billing.Queries.GetBillingDrafts;
using StarMedica.Domain.Entities;
using StarMedica.Domain.Interfaces;

namespace StarMedica.Application.Tests;

public sealed class BillingDraftCommandTests
{
    [Fact]
    public async Task Validator_AcceptsInternalDraftWithValidLines()
    {
        var result = await new CreateBillingDraftCommandValidator().ValidateAsync(
            new CreateBillingDraftCommand(
                "Tutor del paciente",
                "1234567-8",
                null,
                null,
                [new CreateBillingDraftLineCommand("Consulta", 1m, 125m)],
                7));

        Assert.True(result.IsValid);
    }

    [Fact]
    public async Task Validator_RejectsEmptyLinesAndExcessPrecision()
    {
        var validator = new CreateBillingDraftCommandValidator();
        var emptyLines = await validator.ValidateAsync(new CreateBillingDraftCommand(
            "Cliente",
            null,
            null,
            null,
            [],
            7));
        var excessPrecision = await validator.ValidateAsync(new CreateBillingDraftCommand(
            "Cliente",
            null,
            null,
            null,
            [new CreateBillingDraftLineCommand("Servicio", 1.0001m, 1m)],
            7));

        Assert.Contains(emptyLines.Errors, error => error.PropertyName == "Lines");
        Assert.Contains(excessPrecision.Errors, error => error.PropertyName == "Lines[0].Quantity");
    }

    [Fact]
    public async Task Handler_RoundsLineTotalsAndPersistsAuthenticatedActor()
    {
        var repository = new CapturingBillingRepository();
        var handler = new CreateBillingDraftCommandHandler(
            repository,
            new CreateBillingDraftCommandValidator());
        var command = new CreateBillingDraftCommand(
            "  Tutor del paciente  ",
            " 1234567-8 ",
            " Zona 1 ",
            null,
            [
                new CreateBillingDraftLineCommand(" Consulta ", 1.5m, 2.25m),
                new CreateBillingDraftLineCommand("Medicamento", 2m, 10m)
            ],
            7);

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.NotNull(repository.SavedDraft);
        Assert.Equal(7, repository.SavedDraft.CreatedBy);
        Assert.Equal("Tutor del paciente", repository.SavedDraft.CustomerName);
        Assert.Equal(3.38m, repository.SavedDraft.Lines.First().LineTotal);
        Assert.Equal(23.38m, repository.SavedDraft.Total);
        Assert.Equal(23.38m, result.Value?.Total);
    }

    [Fact]
    public async Task UpdateValidator_RejectsMissingDraftIdAndInvalidLines()
    {
        var result = await new UpdateBillingDraftCommandValidator().ValidateAsync(
            new UpdateBillingDraftCommand(
                0,
                "Cliente",
                null,
                null,
                null,
                [new CreateBillingDraftLineCommand("Servicio", 0m, 1m)],
                7));

        Assert.Contains(result.Errors, error => error.PropertyName == "Id");
        Assert.Contains(result.Errors, error => error.PropertyName == "Lines[0].Quantity");
    }

    [Fact]
    public async Task UpdateHandler_RecalculatesTotalsAndKeepsDraftCreationMetadata()
    {
        var repository = new CapturingBillingRepository();
        var handler = new UpdateBillingDraftCommandHandler(
            repository,
            new UpdateBillingDraftCommandValidator());
        var command = new UpdateBillingDraftCommand(
            12,
            "  Tutor actualizado  ",
            null,
            null,
            " Nota actualizada ",
            [
                new CreateBillingDraftLineCommand("Consulta", 1.5m, 2.25m),
                new CreateBillingDraftLineCommand("Medicamento", 1m, 10m)
            ],
            9);

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.NotNull(repository.SavedDraft);
        Assert.Equal(12, repository.SavedDraft.Id);
        Assert.Equal(7, repository.SavedDraft.CreatedBy);
        Assert.Equal(9, repository.SavedDraft.UpdatedBy);
        Assert.Equal("Tutor actualizado", repository.SavedDraft.CustomerName);
        Assert.Equal(13.38m, repository.SavedDraft.Total);
        Assert.Equal(13.38m, result.Value?.Total);
    }

    [Fact]
    public async Task UpdateHandler_ReturnsNotFoundForMissingDraft()
    {
        var repository = new CapturingBillingRepository();
        repository.ClearDraft();
        var handler = new UpdateBillingDraftCommandHandler(
            repository,
            new UpdateBillingDraftCommandValidator());

        var result = await handler.Handle(new UpdateBillingDraftCommand(
            12,
            "Tutor",
            null,
            null,
            null,
            [new CreateBillingDraftLineCommand("Consulta", 1m, 100m)],
            9), CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(404, result.StatusCode);
    }

    [Theory]
    [InlineData(null, 1, 20, true)]
    [InlineData("cliente", 1, 100, true)]
    [InlineData(null, 0, 20, false)]
    [InlineData(null, 1, 101, false)]
    public async Task GetDraftsValidator_EnforcesPaginationLimits(
        string? search,
        int pageNumber,
        int pageSize,
        bool expectedValid)
    {
        var result = await new GetBillingDraftsQueryValidator().ValidateAsync(
            new GetBillingDraftsQuery(search, pageNumber, pageSize));

        Assert.Equal(expectedValid, result.IsValid);
    }

    [Fact]
    public async Task GetDraftsValidator_RejectsSearchLongerThan200Characters()
    {
        var result = await new GetBillingDraftsQueryValidator().ValidateAsync(
            new GetBillingDraftsQuery(new string('x', 201), 1, 20));

        Assert.False(result.IsValid);
    }

    [Fact]
    public async Task GetDraftsHandler_ReturnsPageMetadataAndMappedDrafts()
    {
        var repository = new CapturingBillingRepository
        {
            SearchResult = (
                [new BillingDraft
                {
                    Id = 14,
                    CustomerName = "Cliente",
                    Total = 125m,
                    Lines = [new BillingDraftLine
                    {
                        LineNumber = 1,
                        Description = "Consulta",
                        Quantity = 1m,
                        UnitPrice = 125m,
                        LineTotal = 125m
                    }]
                }],
                41)
        };
        var handler = new GetBillingDraftsQueryHandler(
            repository,
            new GetBillingDraftsQueryValidator());

        var result = await handler.Handle(
            new GetBillingDraftsQuery("cliente", 2, 20),
            CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(41, result.Value?.TotalCount);
        Assert.Equal(2, result.Value?.PageNumber);
        Assert.Equal(20, result.Value?.PageSize);
        Assert.Equal(3, result.Value?.TotalPages);
        Assert.Equal("Cliente", result.Value?.Items.Single().CustomerName);
    }

    private sealed class CapturingBillingRepository : IBillingRepository
    {
        public (IReadOnlyList<BillingDraft> Items, int TotalCount) SearchResult { get; set; } =
            (Array.Empty<BillingDraft>(), 0);

        public BillingDraft? SavedDraft { get; private set; } = new()
        {
            Id = 12,
            CustomerName = "Tutor original",
            CreatedBy = 7,
            CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        };

        public void ClearDraft() => SavedDraft = null;

        public Task AddDraftAsync(BillingDraft draft, CancellationToken cancellationToken = default)
        {
            draft.Id = 12;
            SavedDraft = draft;
            return Task.CompletedTask;
        }

        public Task<BillingDraft?> UpdateDraftAsync(
            BillingDraft draft,
            CancellationToken cancellationToken = default)
        {
            if (SavedDraft is null || SavedDraft.Id != draft.Id)
            {
                return Task.FromResult<BillingDraft?>(null);
            }

            draft.CreatedAt = SavedDraft.CreatedAt;
            draft.CreatedBy = SavedDraft.CreatedBy;
            SavedDraft = draft;
            return Task.FromResult<BillingDraft?>(SavedDraft);
        }

        public Task<(IReadOnlyList<BillingDraft> Items, int TotalCount)> SearchDraftsAsync(
            string? search,
            int pageNumber,
            int pageSize,
            CancellationToken cancellationToken = default) =>
            Task.FromResult(SearchResult);

        public Task<BillingDraft?> GetDraftByIdAsync(int id, CancellationToken cancellationToken = default) =>
            Task.FromResult<BillingDraft?>(null);
    }
}
