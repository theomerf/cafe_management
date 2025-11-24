using AutoMapper;
using Entities.Dtos;
using Entities.Exceptions;
using Entities.Models;
using Entities.RequestFeatures;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
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
        private readonly IMemoryCache _cache;
        private readonly string _imgbbApiKey;

        public ProductManager(IRepositoryManager manager, IMapper mapper, IMemoryCache cache, IConfiguration configuration)
        {
            _manager = manager;
            _mapper = mapper;
            _cache = cache;
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

        public async Task<IEnumerable<StatsDto>> GetTopSoldProductsAsync()
        {
            string cacheKey = "TopSoldProducts";
            if (_cache.TryGetValue(cacheKey, out IEnumerable<StatsDto>? cachedProducts))
            {
                if (cachedProducts != null)
                    return cachedProducts;
            }

            var products = await _manager.Product.GetTopSoldProductsAsync();

            var cacheEntryOptions = new MemoryCacheEntryOptions()
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(20)
            };
            _cache.Set(cacheKey, products, cacheEntryOptions);

            return products;
        }
        public async Task<ProductAnalysisDto> GetProductsAnalysisAsync()
        {
            var analysis = await _manager.Product.GetProductsAnalysisAsync();

            if (analysis.CurrentMonthTopSoldProduct.Count == 0 && analysis.LastMonthTopSoldProduct.Count == 0)
            {
                analysis.Suggestions = new List<string>
                {
                    "Henüz bir sipariş verilmedi. Analizler için ilk siparişler bekleniyor."
                };
            }
            else
            {
                analysis.Suggestions = new List<string>();

                if (analysis.CurrentMonthTopSoldProduct.Count > analysis.LastMonthTopSoldProduct.Count)
                {
                    analysis.Suggestions.Add("Bu ayın en çok satılan ürünü geçen aya göre daha fazla satış yaptı. Pazarlama stratejilerinizi bu ürüne odaklayabilirsiniz.");
                }
                else if (analysis.CurrentMonthTopSoldProduct.Count < analysis.LastMonthTopSoldProduct.Count)
                {
                    analysis.Suggestions.Add("Bu ayın en çok satılan ürünü geçen aya göre daha az satış yaptı. Satışları artırmak için promosyonlar düşünebilirsiniz.");
                }
                else
                {
                    analysis.Suggestions.Add("Bu ayın en çok satılan ürünü geçen ayla aynı satış sayısına sahip. İstikrarı korumak için mevcut stratejileri sürdürün.");
                }

                if (analysis.CurrentMonthTopEarningProduct.Id != analysis.CurrentMonthTopSoldProduct.Id)
                {
                    analysis.Suggestions.Add("En çok satılan ürün ile en çok kazandıran ürün farklı. Karlılığı artırmak için fiyatlandırma stratejilerinizi gözden geçirin.");
                }
                else
                {
                    analysis.Suggestions.Add("Geçen ay ve bu ay en çok kazandıran ürün aynı. Bu ürünün performansını artırmak için ek pazarlama kampanyaları düşünebilirsiniz.");
                }

                if (analysis.CurrentMonthTopEarningProduct.Value > analysis.LastMonthTopEarningProduct.Value)
                {
                    analysis.Suggestions.Add("Bu ayın en çok kazandıran ürünü geçen aya göre daha fazla gelir sağladı. Bu ürüne yönelik reklam harcamalarını artırmayı düşünebilirsiniz.");
                }
                else if (analysis.CurrentMonthTopEarningProduct.Value < analysis.LastMonthTopEarningProduct.Value)
                {
                    analysis.Suggestions.Add("Bu ayın en çok kazandıran ürünü geçen aya göre daha az gelir sağladı. Fiyatlandırma ve promosyon stratejilerinizi gözden geçirin.");
                }
                else
                {
                    analysis.Suggestions.Add("Bu ayın en çok kazandıran ürünü geçen ayla aynı gelire sahip. Mevcut stratejileri sürdürerek istikrarı koruyun.");
                }
            }

            return analysis;
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
                var imageUrl = await UploadImageAsync(productDto.Image);
                product.ImageUrl = imageUrl;
            }

            await _manager.SaveAsync();
        }
    }
}
