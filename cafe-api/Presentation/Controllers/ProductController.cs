using Entities.Dtos;
using Entities.RequestFeatures;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Presentation.ActionFilters;
using Services.Contracts;
using System.Text.Json;

namespace Presentation.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ProductController : ControllerBase
    {
        private readonly IServiceManager _manager;

        public ProductController(IServiceManager manager)
        {
            _manager = manager;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllProducts([FromQuery] RequestParameters p)
        {
            var pagedProduct = await _manager.ProductService.GetAllProductsAsync(p, false);
            Response.Headers.Add("X-Pagination", JsonSerializer.Serialize(pagedProduct.metaData));

            return Ok(pagedProduct.products);
        }

        [HttpGet("top-sold")]
        public async Task<IActionResult> GetTopSoldProducts()
        {
            var products = await _manager.ProductService.GetTopSoldProductsAsync();

            return Ok(products);
        }

        [HttpGet("analysis")]
        public async Task<IActionResult> GetProductsAnalysis()
        {
            var analysis = await _manager.ProductService.GetProductsAnalysisAsync();

            return Ok(analysis);
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetProductsForOrder([FromQuery] ProductFilterParameters p)
        {
            var products = await _manager.ProductService.GetProductsForOrderAsync(p, false);

            return Ok(products);
        }

        [HttpGet("count")]
        public async Task<IActionResult> GetAllProductsCount()
        {
            var count = await _manager.ProductService.GetAllProductsCountAsync();

            return Ok(count);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOneProduct([FromRoute] int id)
        {
            var product = await _manager.ProductService.GetOneProductByIdAsync(id, false);

            return Ok(product);
        }

        [HttpPost("create")]
        [ServiceFilter(typeof(ValidationFilterAttribute))]
        public async Task<IActionResult> CreateProduct([FromForm] ProductDtoForCreation productDto)
        {
            await _manager.ProductService.CreateProductAsync(productDto);

            return StatusCode(201);
        }

        [HttpPut("update")]
        [ServiceFilter(typeof(ValidationFilterAttribute))]
        public async Task<IActionResult> UpdateProduct([FromForm] ProductDtoForUpdate productDto)
        {
            await _manager.ProductService.UpdateProductAsync(productDto);

            return Ok();
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteProduct([FromRoute] int id)
        {
            await _manager.ProductService.DeleteProductAsync(id);

            return NoContent();
        }
    }
}
