using AutoMapper;
using Entities.Dtos;
using Entities.Models;

namespace CafeAPI.Infrastructure.Mapper
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Product, ProductDto>();
            CreateMap<ProductDtoForCreation, Product>();
            CreateMap<ProductDtoForUpdate, Product>();
            CreateMap<Table, TableDto>();
            CreateMap<TableDtoForCreation, Table>();
            CreateMap<TableDtoForUpdate, Table>();
            CreateMap<Order, OrderDto>();
            CreateMap<OrderDtoForCreation, Order>();
            CreateMap<OrderDtoForUpdate, Order>();
        }
    }
}
