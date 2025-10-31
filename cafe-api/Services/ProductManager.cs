using AutoMapper;
using Entities.Dtos;
using Entities.Exceptions;
using Entities.Models;
using Entities.RequestFeatures;
using Entities.RequestParameters;
using Repositories.Contracts;
using Services.Contracts;

namespace Services
{
    public class ProductManager : IProductService
    {
        private readonly IRepositoryManager _manager;
        private readonly IMapper _mapper;

        public ProductManager(IRepositoryManager manager, IMapper mapper)
        {
            _manager = manager;
            _mapper = mapper;
        }

        public async Task<(PagedList<ProductDto> products, MetaData metaData)> GetAllProductsAsync(RequestParameters p, bool trackChanges)
        {
            var products = await _manager.Product.GetAllProductsAsync(p, trackChanges);
            var productsDto = _mapper.Map<IEnumerable<ProductDto>>(products.products);

            var pagedProducts = PagedList<ProductDto>.ToPagedList(productsDto, p.PageNumber, p.PageSize, products.count);

            return (pagedProducts, pagedProducts.MetaData);
        }

        public async Task<int> GetAllProductsCountAsync() => await _manager.Product.GetAllProductsCountAsync();

        public async Task<ProductDto> GetOneProductByIdAsync(int productId, bool trackChanges)
        {
            var product = await GetOneProductForServiceAsync(productId, trackChanges);
            var productDto = _mapper.Map<ProductDto>(product);

            return productDto;
        }

        private async Task<Product> GetOneProductForServiceAsync(int productId, bool trackChanges)
        {
            var product = await _manager.Product.GetOneProductByIdAsync(productId, trackChanges);

            if (product == null)
            {
                throw new ProductNotFoundException(productId);
            }

            return product;
        }

        public async Task CreateProductAsync(ProductDtoForCreation productDto)
        {
            var product = _mapper.Map<Product>(productDto);

            _manager.Product.CreateProduct(product);
            await _manager.SaveAsync();
        }

        public async Task DeleteProductAsync(int productId)
        {
            var product = await GetOneProductForServiceAsync(productId, false);

            _manager.Product.DeleteProduct(product);
            await _manager.SaveAsync();
        }

        public async Task UpdateProductAsync(ProductDtoForUpdate productDto)
        {
            var product = await GetOneProductByIdAsync(productDto.Id, true);
            _mapper.Map(productDto, product);

            await _manager.SaveAsync();
        }
    }
}
