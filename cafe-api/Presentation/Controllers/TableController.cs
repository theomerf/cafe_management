using Entities.Dtos;
using Entities.RequestFeatures;
using Microsoft.AspNetCore.Mvc;
using Services.Contracts;

namespace Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TableController : ControllerBase
    {
        private readonly IServiceManager _manager;

        public TableController(IServiceManager manager)
        {
            _manager = manager;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllTables([FromQuery] RequestParameters p)
        {
            var pagedTables = await _manager.TableService.GetAllTablesAsync(p, false);
            Response.Headers.Add("X-Pagination", System.Text.Json.JsonSerializer.Serialize(pagedTables.metaData));

            return Ok(pagedTables.tables);
        }

        [HttpGet("statuses")]
        public async Task<IActionResult> GetAllTablesStatuses()
        {
            var tablesStatuses = await _manager.TableService.GetAllTablesStatusesAsync(false);

            return Ok(tablesStatuses);
        }

        [HttpGet("count")]
        public async Task<IActionResult> GetAllTablesCount()
        {
            var count = await _manager.TableService.GetAllTablesCountAsync();

            return Ok(count);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOneTable([FromRoute] int id)
        {
            var table = await _manager.TableService.GetOneTableByIdAsync(id, false);

            return Ok(table);
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateTable([FromBody] TableDtoForCreation tableDto)
        {
            await _manager.TableService.CreateTableAsync(tableDto);

            return StatusCode(201);
        }

        [HttpPost("delete/{id}")]
        public async Task<IActionResult> DeleteTable([FromRoute] int id)
        {
            await _manager.TableService.DeleteTableAsync(id);

            return NoContent();
        }

        [HttpPut("update")]
        public async Task<IActionResult> UpdateTable([FromBody] TableDtoForUpdate tableDto)
        {
            await _manager.TableService.UpdateTableAsync(tableDto);

            return Ok();
        }
    }
}
