using Entities.Dtos;
using Entities.RequestFeatures;

namespace Services.Contracts
{
    public interface IProductService
    {
        Task<(PagedList<ProductDto> products, MetaData metaData)> GetAllProductsAsync(RequestParameters p, bool trackChanges);
        Task<int> GetAllProductsCountAsync();
        Task<ProductDto> GetOneProductByIdAsync(int productId, bool trackChanges);
        Task CreateProductAsync(ProductDtoForCreation productDto);
        Task UpdateProductAsync(ProductDtoForUpdate productDto);
        Task DeleteProductAsync(int productId);
    }
}
