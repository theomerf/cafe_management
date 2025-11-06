using Entities.Models;
using Entities.RequestFeatures;
using Microsoft.EntityFrameworkCore;
using Repositories.Contracts;
using Repositories.Extensions;

namespace Repositories
{
    public class CategoryRepository : RepositoryBase<Category>, ICategoryRepository
    {
        public CategoryRepository(RepositoryContext context) : base(context)
        {
        }

        public async Task<(IEnumerable<Category> categories, int count)> GetAllCategoriesAsync(RequestParameters p, bool trackChanges)
        {
            var categoriesQuery = FindAll(trackChanges);

            var count = await categoriesQuery.CountAsync();
            var categories = await categoriesQuery
                .OrderBy(c => c.Id)
                .ToPaginate(p.PageSize, p.PageNumber)
                .ToListAsync();

            return (categories, count);
        }

        public async Task<int> GetCategoriesCountAsync() => await CountAsync(false);

        public async Task<Category?> GetOneCategoryByIdAsync(int id, bool trackChanges)
        {
            var category = await FindByCondition(c => c.Id == id, trackChanges)
                .FirstOrDefaultAsync();

            return category;
        }

        public void CreateCategory(Category category)
        {
            Create(category);
        }

        public void DeleteCategory(Category category)
        {
            Remove(category);
        }

        public void UpdateCategory(Category category)
        {
            Update(category);
        }
    }
}
