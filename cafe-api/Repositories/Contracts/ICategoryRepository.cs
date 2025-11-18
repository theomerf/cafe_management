using Entities.Dtos;
using Entities.Models;
using Entities.RequestFeatures;

namespace Repositories.Contracts
{
    public interface ICategoryRepository : IRepositoryBase<Category>
    {
        Task<(IEnumerable<Category> categories, int count)> GetAllCategoriesAsync(RequestParameters p, bool trackChanges);
        Task<IEnumerable<Category>> GetAllCategoriesListAsync();
        Task<int> GetCategoriesCountAsync();
        Task<Category?> GetOneCategoryByIdAsync(int id, bool trackChanges);
        Task<IEnumerable<CategoryStatsDto>> GetTopSoldCategoriesAsync();
        void CreateCategory(Category category);
        void UpdateCategory(Category category);
        void DeleteCategory(Category category);
    }
}
