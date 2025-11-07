using Entities.Dtos;
using Entities.RequestFeatures;
using Microsoft.AspNetCore.Mvc;
using Presentation.ActionFilters;
using Services.Contracts;
using System.Text.Json;

namespace Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")] 
    public class CategoryController : ControllerBase
    {
        private readonly IServiceManager _manager;

        public CategoryController(IServiceManager manager)
        {
            _manager = manager;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllCategories([FromQuery] RequestParameters p)
        {
            var pagedCategories = await _manager.CategoryService.GetAllCategoriesAsync(p, false);
            Response.Headers.Add("X-Pagination", JsonSerializer.Serialize(pagedCategories.metaData));

            return Ok(pagedCategories.categories);
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetCategoriesList()
        {
            var categories = await _manager.CategoryService.GetAllCategoriesListAsync();

            return Ok(categories);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOneCategory([FromRoute] int id)
        {
            var category = await _manager.CategoryService.GetOneCategoryByIdAsync(id, false);

            return Ok(category);
        }

        [HttpGet("count")]
        public async Task<IActionResult> GetCategoriesCount()
        {
            var count = await _manager.CategoryService.GetCategoriesCountAsync();

            return Ok(count);
        }

        [HttpPost("create")]
        [ServiceFilter(typeof(ValidationFilterAttribute))]
        public async Task<IActionResult> CreateCategory([FromBody] CategoryDtoForCreation categoryDto)
        {
            await _manager.CategoryService.CreateCategoryAsync(categoryDto);

            return StatusCode(201);
        }

        [HttpPut("update")]
        [ServiceFilter(typeof(ValidationFilterAttribute))]
        public async Task<IActionResult> UpdateCategory([FromBody] CategoryDtoForUpdate categoryDto)
        {
            await _manager.CategoryService.UpdateCategoryAsync(categoryDto);

            return Ok();
        }
        
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteCategory([FromRoute] int id)
        {
            await _manager.CategoryService.DeleteCategoryAsync(id);

            return NoContent();
        } 
    }
}
