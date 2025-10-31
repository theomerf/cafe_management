using Entities.Models;
using Entities.RequestParameters;

namespace Repositories.Contracts
{
    public interface IProductRepository : IRepositoryBase<Product>
    {
        Task<(IEnumerable<Product> products, int count)> GetAllProductsAsync(RequestParameters p, bool trackChanges);
        Task<int> GetAllProductsCountAsync();
        Task<Product?> GetOneProductByIdAsync(int productId, bool trackChanges);
        void CreateProduct(Product product);
        void UpdateProduct(Product product);
        void DeleteProduct(Product product);
    }
}
