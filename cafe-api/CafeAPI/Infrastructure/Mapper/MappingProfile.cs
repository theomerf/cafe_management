using AutoMapper;
using Entities.Dtos;
using Entities.Models;

namespace CafeAPI.Infrastructure.Mapper
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Product, ProductDto>()
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category != null ? src.Category.Name : string.Empty));
            CreateMap<ProductDtoForCreation, Product>()
                .ForMember(dest => dest.ImageUrl, opt => opt.Ignore());
            CreateMap<ProductDtoForUpdate, Product>();
            CreateMap<Table, TableDto>();
            CreateMap<TableDtoForCreation, Table>();
            CreateMap<TableDtoForUpdate, Table>();
            CreateMap<Order, OrderDto>();
            CreateMap<OrderLine, OrderLineDto>()
                .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product != null ? src.Product.Name : string.Empty))
                .ForMember(dest => dest.ProductImageUrl, opt => opt.MapFrom(src => src.Product != null ? src.Product.ImageUrl : string.Empty))
                .ForMember(dest => dest.UnitPrice, opt => opt.MapFrom(src => src.Product != null ? src.Product.Price : 0));
            CreateMap<OrderLineDto, OrderLine>();
            CreateMap<OrderDtoForCreation, Order>();
            CreateMap<OrderDtoForUpdate, Order>();
            CreateMap<Category, CategoryDto>()
                .ForMember(dest => dest.ProductCount, opt => opt.MapFrom(src => src.Products != null ? src.Products.Count : 0));
            CreateMap<CategoryDtoForCreation, Category>();
            CreateMap<CategoryDtoForUpdate, Category>();
            CreateMap<Account, AccountDto>();
            CreateMap<AccountDtoForCreation, Account>();
            CreateMap<AccountDtoForUpdate, Account>();
        }
    }
}
