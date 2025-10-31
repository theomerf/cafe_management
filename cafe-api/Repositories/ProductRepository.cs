using Entities.Models;
using Entities.RequestParameters;
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
                .FilterBySearch(p.SearchTerm ?? "");

            var count = await productQuery.CountAsync();

            var products = await productQuery
                .OrderBy(p => p.Id)
                .ToPaginate(p.PageSize, p.PageNumber)
                .ToListAsync();

            return (products, count);
        }

        public async Task<int> GetAllProductsCountAsync() => await CountAsync(false);

        public async Task<Product?> GetOneProductByIdAsync(int productId, bool trackChanges)
        {
            var product = await FindByCondition(p => p.Id == productId, trackChanges)
                .FirstOrDefaultAsync();

            return product;
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
