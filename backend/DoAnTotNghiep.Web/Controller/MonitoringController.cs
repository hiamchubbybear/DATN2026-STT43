using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Runtime.InteropServices;
using System.Diagnostics;

namespace DoAnTotNghiep.Web.Controller;

[ApiController]
[Route("api/admin/monitoring")]
// [Authorize(Roles = "Admin")] // Uncomment when auth is fully ready
public class MonitoringController : ControllerBase
{
    private readonly string _logPath = "logs";

    [HttpGet("system-info")]
    public IActionResult GetSystemInfo()
    {
        return Ok(new
        {
            os = RuntimeInformation.OSDescription,
            architecture = RuntimeInformation.OSArchitecture.ToString(),
            framework = RuntimeInformation.FrameworkDescription,
            processorCount = Environment.ProcessorCount,
            workingSet = Process.GetCurrentProcess().WorkingSet64 / 1024 / 1024 + " MB",
            uptime = (DateTime.Now - Process.GetCurrentProcess().StartTime).ToString(@"dd\.hh\:mm\:ss")
        });
    }

    [HttpGet("logs")]
    public IActionResult GetLatestLogs([FromQuery] int count = 100)
    {
        if (!Directory.Exists(_logPath))
            return NotFound("Log directory not found.");

        var logFiles = Directory.GetFiles(_logPath, "app-*.log")
            .OrderByDescending(f => f)
            .ToList();

        if (!logFiles.Any())
            return Ok(new List<string>());

        // Read the latest log file
        var latestFile = logFiles.First();
        var lines = System.IO.File.ReadLines(latestFile)
            .Reverse()
            .Take(count)
            .Reverse()
            .ToList();

        return Ok(lines);
    }
}
