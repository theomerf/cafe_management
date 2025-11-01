using Entities.Dtos;
using Entities.RequestFeatures;
using Microsoft.AspNetCore.Mvc;
using Presentation.ActionFilters;
using Services.Contracts;

namespace Presentation.Controllers
{
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

            return StatusCode(201);
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
