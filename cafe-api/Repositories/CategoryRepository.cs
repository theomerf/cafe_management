using Entities.Dtos;
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
                .Include(c => c.Products)
                .OrderBy(c => c.Id)
                .ToPaginate(p.PageSize, p.PageNumber)
                .ToListAsync();

            return (categories, count);
        }

        public async Task<IEnumerable<Category>> GetAllCategoriesListAsync()
        {
            var categories = await FindAll(false)
                .OrderBy(c => c.Id)
                .ToListAsync();

            return categories;
        }

        public async Task<IEnumerable<CategoryStatsDto>> GetTopSoldCategoriesAsync()
        {
            var categories = await _context.OrderLines
                .Include(ol => ol.Product)
                .ThenInclude(p => p!.Category)
                .GroupBy(ol => ol.Product!.CategoryId)
                .Select(g => new CategoryStatsDto
                {
                    Id = g.Key,
                    Name = g.FirstOrDefault()!.Product!.Category!.Name,
                    Count = g.Count()
                })
                .Take(5)
                .ToListAsync();

            return categories;
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
