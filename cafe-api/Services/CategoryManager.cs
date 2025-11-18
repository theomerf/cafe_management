using AutoMapper;
using Entities.Dtos;
using Entities.Exceptions;
using Entities.Models;
using Entities.RequestFeatures;
using Microsoft.Extensions.Caching.Memory;
using Repositories.Contracts;
using Services.Contracts;

namespace Services
{
    public class CategoryManager : ICategoryService
    {
        private readonly IRepositoryManager _manager;
        private readonly IMapper _mapper;
        private readonly IMemoryCache _cache;

        public CategoryManager(IRepositoryManager manager, IMemoryCache cache, IMapper mapper)
        {
            _manager = manager;
            _mapper = mapper;
            _cache = cache;
        }

        public async Task<(PagedList<CategoryDto> categories, MetaData metaData)> GetAllCategoriesAsync(RequestParameters p, bool trackChanges)
        {
            var categories = await _manager.Category.GetAllCategoriesAsync(p, trackChanges);
            var categoriesDto = _mapper.Map<IEnumerable<CategoryDto>>(categories.categories);
            
            var pagedCategories = PagedList<CategoryDto>.ToPagedList(categoriesDto, p.PageNumber, p.PageSize, categories.count);

            return (pagedCategories, pagedCategories.MetaData);
        }

        public async Task<IEnumerable<CategoryDto>> GetAllCategoriesListAsync()
        {
            var categories = await _manager.Category.GetAllCategoriesListAsync();
            var categoriesDto = _mapper.Map<IEnumerable<CategoryDto>>(categories);

            return categoriesDto;
        }

        public async Task<int> GetCategoriesCountAsync() => await _manager.Category.GetCategoriesCountAsync();

        public async Task<CategoryDto> GetOneCategoryByIdAsync(int id, bool trackChanges)
        {
            var category = await GetOneCategoryByIdForServiceAsync(id, trackChanges);
            var categoryDto = _mapper.Map<CategoryDto>(category);

            return categoryDto;
        }

        private async Task<Category> GetOneCategoryByIdForServiceAsync(int id, bool trackChanges)
        {
            var category = await _manager.Category.GetOneCategoryByIdAsync(id, trackChanges);

            if (category == null)
            {
                throw new CategoryNotFoundException(id);
            }

            return category;
        }

        public async Task<IEnumerable<CategoryStatsDto>> GetTopSoldCategoriesAsync()
        {
            string cacheKey = "TopSoldCategories";
            if (_cache.TryGetValue(cacheKey, out IEnumerable<CategoryStatsDto>? cachedCategories))
            {
                if (cachedCategories != null)
                    return cachedCategories;
            }

            var categories = await _manager.Category.GetTopSoldCategoriesAsync();

            var cacheEntryOptions = new MemoryCacheEntryOptions()
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(20)
            };
            _cache.Set(cacheKey, categories, cacheEntryOptions);

            return categories;
        }

        public async Task CreateCategoryAsync(CategoryDtoForCreation categoryDto)
        {
            var category = _mapper.Map<Category>(categoryDto);

            _manager.Category.CreateCategory(category);
            await _manager.SaveAsync();
        }

        public async Task DeleteCategoryAsync(int categoryId)
        {
            var category = await GetOneCategoryByIdForServiceAsync(categoryId, true);

            _manager.Category.DeleteCategory(category);
            await _manager.SaveAsync();
        }

        public async Task UpdateCategoryAsync(CategoryDtoForUpdate categoryDto)
        {
            var category = await GetOneCategoryByIdForServiceAsync(categoryDto.Id, true);

            _mapper.Map(categoryDto, category);
            await _manager.SaveAsync();
        }
    }
}
