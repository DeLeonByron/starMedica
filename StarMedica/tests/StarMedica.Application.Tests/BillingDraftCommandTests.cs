using StarMedica.Application.Features.Billing.Commands.CreateBillingDraft;
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

    private sealed class CapturingBillingRepository : IBillingRepository
    {
        public BillingDraft? SavedDraft { get; private set; }

        public Task AddDraftAsync(BillingDraft draft, CancellationToken cancellationToken = default)
        {
            draft.Id = 12;
            SavedDraft = draft;
            return Task.CompletedTask;
        }

        public Task<IReadOnlyList<BillingDraft>> GetRecentDraftsAsync(
            CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<BillingDraft>>([]);

        public Task<BillingDraft?> GetDraftByIdAsync(int id, CancellationToken cancellationToken = default) =>
            Task.FromResult<BillingDraft?>(null);
    }
}
