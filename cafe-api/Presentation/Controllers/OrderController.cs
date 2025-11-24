using Entities.Dtos;
using Entities.Models;
using Entities.RequestFeatures;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Presentation.ActionFilters;
using Services.Contracts;

namespace Presentation.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class OrderController : ControllerBase
    {
        private readonly IServiceManager _manager;

        public OrderController(IServiceManager manager)
        {
            _manager = manager;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllOrders([FromQuery] RequestParameters p)
        {
            var pagedOrders = await _manager.OrderService.GetAllOrdersAsync(p, false);
            Response.Headers.Add("X-Pagination", System.Text.Json.JsonSerializer.Serialize(pagedOrders.metaData));

            return Ok(pagedOrders.orders);
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetAllActiveOrders()
        {
            var activeOrders = await _manager.OrderService.GetActiveOrdersAsync();

            return Ok(activeOrders);
        }

        [HttpGet("table/{id}")]
        public async Task<IActionResult> GetOrdersOfOneTable([FromRoute] int id)
        {
            var orders = await _manager.OrderService.GetOrdersOfOneTableAsync(id);

            return Ok(orders);
        }

        [HttpGet("count")]
        public async Task<IActionResult> GetAllOrdersCount()
        {
            var count = await _manager.OrderService.GetAllOrdersCountAsync();

            return Ok(count);
        }

        [HttpGet("daily-income")]
        public async Task<IActionResult> GetDailyIncome()
        {
            var dailyIncome = await _manager.OrderService.GetTotalIncomeOfDayAsync();

            return Ok(dailyIncome);
        }

        [HttpGet("daily-count")]
        public async Task<IActionResult> GetDailyOrdersCount()
        {
            var dailyCount = await _manager.OrderService.GetOrdersCountOfDayAsync();

            return Ok(dailyCount);
        }

        [HttpGet("statuses-stats")]
        public async Task<IActionResult> GetOrderStatusesStats()
        {
            var (preparingCount, deliveredCount) = await _manager.OrderService.GetOrdersStatusStatsAsync();

            var stats = new
            {
                PreparingCount = preparingCount,
                DeliveredCount = deliveredCount
            };

            return Ok(stats);
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetOrdersStats()
        {
            var stats = await _manager.OrderService.GetOrdersStatsAsync();

            return Ok(stats);
        }

        [HttpGet("analysis")]
        public async Task<IActionResult> GetOrdersAnalysis()
        {
            var analysis = await _manager.OrderService.GetOrdersAnalysisAsync();

            return Ok(analysis);
        }

        [HttpGet("hourly-analysis")]
        public async Task<IActionResult> GetHourlyOrdersAnalysis()
        {
            var analysis = await _manager.OrderService.GetHourlyAnalysisAsync();

            return Ok(analysis);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOneOrder([FromRoute] int id)
        {
            var order = await _manager.OrderService.GetOneOrderByIdAsync(id, false);

            return Ok(order);
        }

        [HttpPost("create")]
        [ServiceFilter(typeof(ValidationFilterAttribute))]
        public async Task<IActionResult> CreateOrder([FromBody] OrderDtoForCreation orderDto)
        {
            await _manager.OrderService.CreateOrderAsync(orderDto);
            await _manager.TableService.ChangeTableStatusAsync(new TableDtoForStatus
            {
                Id = orderDto.TableId,
                Status = TableStatus.Occupied
            });

            return StatusCode(201);
        }

        [HttpPatch("change-status")]
        public async Task<IActionResult> ChangeOrderStatusAsync(OrderDtoForStatus orderDto)
        {
            await _manager.OrderService.ChangeOrderStatusAsync(orderDto);
            if (orderDto.Status == OrderStatus.Old)
            {
                var order = await _manager.OrderService.GetOneOrderByIdAsync(orderDto.Id, false);
                await _manager.TableService.ChangeTableStatusAsync(new TableDtoForStatus
                {
                    Id = order.TableId,
                    Status = TableStatus.Available
                });
            }

            return Ok();
        }

        [HttpPut("update")]
        [ServiceFilter(typeof(ValidationFilterAttribute))]
        public async Task<IActionResult> UpdateOrder([FromBody] OrderDtoForUpdate orderDto)
        {
            await _manager.OrderService.UpdateOrderAsync(orderDto);

            return Ok();
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteOrder([FromRoute] int id)
        {
            await _manager.OrderService.DeleteOrderAsync(id);

            return NoContent();
        }
    }
}
