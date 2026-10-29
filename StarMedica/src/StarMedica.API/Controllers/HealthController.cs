using Microsoft.AspNetCore.Mvc;
using StarMedica.Infrastructure.Data;

namespace StarMedica.API.Controllers;

[ApiController]
[Route("[controller]")]
public class HealthController : ControllerBase
{
    private readonly AppDbContext _context;

    public HealthController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var databaseAvailable = await _context.Database.CanConnectAsync(cancellationToken);
        return StatusCode(databaseAvailable ? StatusCodes.Status200OK : StatusCodes.Status503ServiceUnavailable, new
        {
            status = databaseAvailable ? "ok" : "unhealthy",
            service = "StarMedica API",
            database = databaseAvailable ? "connected" : "unavailable",
            timestampUtc = DateTimeOffset.UtcNow
        });
    }
}
