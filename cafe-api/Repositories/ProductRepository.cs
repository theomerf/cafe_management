using Entities.Dtos;
using Entities.Models;
using Entities.RequestFeatures;
using Microsoft.EntityFrameworkCore;
using Repositories.Contracts;
using Repositories.Extensions;

namespace Repositories
{
    public class ProductRepository : RepositoryBase<Product>, IProductRepository
    {
        public ProductRepository(RepositoryContext context) : base(context)
        {
        }

        public async Task<(IEnumerable<Product> products, int count)> GetAllProductsAsync(RequestParameters p, bool trackChanges)
        {
            var productQuery = FindAll(trackChanges)
                .FilterBy(p.SearchTerm, p => p.Name, FilterOperator.Contains);

            var count = await productQuery.CountAsync();

            var products = await productQuery
                .Include(p => p.Category)
                .OrderBy(p => p.Id)
                .ToPaginate(p.PageSize, p.PageNumber)
                .ToListAsync();

            return (products, count);
        }

        public async Task<IEnumerable<Product>> GetProductsForOrderAsync(ProductFilterParameters p, bool trackChanges)
        {
            var products = await FindAll(trackChanges)
                .FilterBy(p.SearchTerm, p => p.Name, FilterOperator.Contains)
                .FilterByCategory(p.CategoryId)
                .OrderBy(p => p.Id)
                .ToListAsync();

            return products;
        }

        public async Task<int> GetAllProductsCountAsync() => await CountAsync(false);

        public async Task<Product?> GetOneProductByIdAsync(int productId, bool trackChanges)
        {
            var product = await FindByCondition(p => p.Id == productId, trackChanges)
                .FirstOrDefaultAsync();

            return product;
        }

        public async Task<IEnumerable<StatsDto>> GetTopSoldProductsAsync()
        {
            var products = await _context.OrderLines
                .GroupBy(ol => ol.ProductId)
                .Select(g => new StatsDto
                {
                    Id = g.Key,
                    Name = g.FirstOrDefault()!.Product!.Name,
                    Count = g.Sum(ol => ol.Quantity)
                })
                .OrderByDescending(ol => ol.Count)
                .Take(5)
                .ToListAsync();

            return products;
        }

        public async Task<ProductAnalysisDto> GetProductsAnalysisAsync()
        {
            var today = DateTime.UtcNow;
            var lastMonth = today.AddMonths(-1).Month;

            var lastTopSeller = await _context.OrderLines
                .Where(ol => ol.Order!.CreatedAt.Month == lastMonth)
                .GroupBy(ol => ol.ProductId)
                .OrderByDescending(g => g.Sum(x => x.Quantity))
                .Select(g => new StatsDto
                {
                    Id = g.Key,
                    Name = g.Select(x => x.Product!.Name).First(),
                    Count = g.Sum(x => x.Quantity)
                })
                .FirstOrDefaultAsync();

            var lastTopEarner = await _context.OrderLines
                .Where(ol => ol.Order!.CreatedAt.Month == lastMonth)
                .GroupBy(ol => ol.ProductId)
                .OrderByDescending(g => g.Sum(x => x.Quantity * x.Product!.Price))
                .Select(g => new StatsDto
                {
                    Id = g.Key,
                    Name = g.Select(x => x.Product!.Name).First(),
                    Value = g.Sum(x => x.Quantity * x.Product!.Price)
                })
                .FirstOrDefaultAsync();

            var currentTopSeller = await _context.OrderLines
                .Where(ol => ol.Order!.CreatedAt.Month == today.Month)
                .GroupBy(ol => ol.ProductId)
                .OrderByDescending(g => g.Sum(x => x.Quantity))
                .Select(g => new StatsDto
                {
                    Id = g.Key,
                    Name = g.Select(x => x.Product!.Name).First(),
                    Count = g.Sum(x => x.Quantity)
                })
                .FirstOrDefaultAsync();

            var currentTopEarner = await _context.OrderLines
                .Where(ol => ol.Order!.CreatedAt.Month == today.Month)
                .GroupBy(ol => ol.ProductId)
                .OrderByDescending(g => g.Sum(x => x.Quantity * x.Product!.Price))
                .Select(g => new StatsDto
                {
                    Id = g.Key,
                    Name = g.Select(x => x.Product!.Name).First(),
                    Value = g.Sum(x => x.Quantity * x.Product!.Price)
                })
                .FirstOrDefaultAsync();

            var analysis = new ProductAnalysisDto
            {
                LastMonthTopSoldProduct = lastTopSeller ?? new StatsDto(),
                CurrentMonthTopSoldProduct = currentTopSeller ?? new StatsDto(),
                LastMonthTopEarningProduct = lastTopEarner ?? new StatsDto(),
                CurrentMonthTopEarningProduct = currentTopEarner ?? new StatsDto(),
                Suggestions = new List<string>()
            };

            return analysis;
        }

        public void CreateProduct(Product product)
        {
            Create(product);
        }

        public void DeleteProduct(Product product)
        {
            Remove(product);
        }

        public void UpdateProduct(Product product)
        {
            Update(product);
        }
    }
}
