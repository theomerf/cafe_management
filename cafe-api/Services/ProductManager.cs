using AutoMapper;
using Entities.Dtos;
using Entities.Exceptions;
using Entities.Models;
using Entities.RequestFeatures;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Repositories.Contracts;
using Services.Contracts;
using System.Net.Http.Headers;
using System.Text.Json;

namespace Services
{
    public class ProductManager : IProductService
    {
        private readonly IRepositoryManager _manager;
        private readonly IMapper _mapper;
        private readonly string _imgbbApiKey;

        public ProductManager(IRepositoryManager manager, IMapper mapper, IConfiguration configuration)
        {
            _manager = manager;
            _mapper = mapper;
            _imgbbApiKey = configuration["ApiSettings:ImgBB:ApiKey"] ?? throw new ArgumentNullException("ImgBB API anahtarı ayarlanmadı.");
        }

        public async Task<(PagedList<ProductDto> products, MetaData metaData)> GetAllProductsAsync(RequestParameters p, bool trackChanges)
        {
            var products = await _manager.Product.GetAllProductsAsync(p, trackChanges);
            var productsDto = _mapper.Map<IEnumerable<ProductDto>>(products.products);

            var pagedProducts = PagedList<ProductDto>.ToPagedList(productsDto, p.PageNumber, p.PageSize, products.count);

            return (pagedProducts, pagedProducts.MetaData);
        }

        public async Task<IEnumerable<ProductDto>> GetProductsForOrderAsync(ProductFilterParameters p, bool trackChanges)
        {
            var products = await _manager.Product.GetProductsForOrderAsync(p, trackChanges);
            var productsDto = _mapper.Map<IEnumerable<ProductDto>>(products);

            return productsDto;
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
            var imageUrl = await UploadImageAsync(productDto.Image);
            product.ImageUrl = imageUrl;

            _manager.Product.CreateProduct(product);
            await _manager.SaveAsync();
        }

        private async Task<string> UploadImageAsync(IFormFile imageFile)
        {
            var apiKey = _imgbbApiKey;
            var uploadUrl = $"https://api.imgbb.com/1/upload?&key={apiKey}";
            using var client = new HttpClient();

            byte[] imageBytes;
            using (var ms = new MemoryStream())
            {
                await imageFile.CopyToAsync(ms);
                imageBytes = ms.ToArray();
            }

            var formData = new MultipartFormDataContent();
            var imageContent = new ByteArrayContent(imageBytes);
            imageContent.Headers.ContentType = new MediaTypeHeaderValue(imageFile.ContentType);
            formData.Add(imageContent, "image", imageFile.FileName);

            var response = await client.PostAsync(uploadUrl, formData);
            var responseString = await response.Content.ReadAsStringAsync();
            if (response.IsSuccessStatusCode)
            {
                using var doc = JsonDocument.Parse(responseString);
                var root = doc.RootElement;

                var imageUrl = root.GetProperty("data").GetProperty("display_url").GetString();

                return imageUrl!;
            }
            else
            {
                throw new Exception("Resim yükleme başarısız.");
            }
        }

        public async Task DeleteProductAsync(int productId)
        {
            var product = await GetOneProductForServiceAsync(productId, false);

            _manager.Product.DeleteProduct(product);
            await _manager.SaveAsync();
        }

        public async Task UpdateProductAsync(ProductDtoForUpdate productDto)
        {
            var product = await GetOneProductForServiceAsync(productDto.Id, true);
            _mapper.Map(productDto, product);

            if (productDto.Image != null)
            {
                var imageUrl =  await UploadImageAsync(productDto.Image);
                product.ImageUrl = imageUrl;
            }

            await _manager.SaveAsync();
        }
    }
}
