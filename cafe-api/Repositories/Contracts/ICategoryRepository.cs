using Entities.Models;
using Entities.RequestFeatures;

namespace Repositories.Contracts
{
    public interface ICategoryRepository : IRepositoryBase<Category>
    {
        Task<(IEnumerable<Category> categories, int count)> GetAllCategoriesAsync(RequestParameters p, bool trackChanges);
        Task<int> GetCategoriesCountAsync();
        Task<Category?> GetOneCategoryByIdAsync(int id, bool trackChanges);
        void CreateCategory(Category category);
        void UpdateCategory(Category category);
        void DeleteCategory(Category category);
    }
}
