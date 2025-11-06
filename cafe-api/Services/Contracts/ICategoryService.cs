using Entities.Dtos;
using Entities.Models;
using Entities.RequestFeatures;

namespace Services.Contracts
{
    public interface ICategoryService
    {
        Task<(PagedList<CategoryDto> categories, MetaData metaData)> GetAllCategoriesAsync(RequestParameters p, bool trackChanges);
        Task<int> GetCategoriesCountAsync();
        Task<CategoryDto> GetOneCategoryByIdAsync(int id, bool trackChanges);
        Task CreateCategoryAsync(CategoryDtoForCreation categoryDto);
        Task UpdateCategoryAsync(CategoryDtoForUpdate categoryDto);
        Task DeleteCategoryAsync(int categoryId);
    }
}
