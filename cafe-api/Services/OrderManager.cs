using AutoMapper;
using Entities.Dtos;
using Entities.Exceptions;
using Entities.Models;
using Entities.RequestFeatures;
using Repositories.Contracts;
using Services.Contracts;

namespace Services
{
    public class OrderManager : IOrderService
    {
        private readonly IRepositoryManager _manager;
        private readonly IMapper _mapper;

        public OrderManager(IRepositoryManager manager, IMapper mapper)
        {
            _manager = manager;
            _mapper = mapper;
        }

        public async Task<(PagedList<OrderDto> orders, MetaData metaData)> GetAllOrdersAsync(RequestParameters p, bool trackChanges)
        {
            var orders = await _manager.Order.GetAllOrdersAsync(p, trackChanges);
            var ordersDto = _mapper.Map<IEnumerable<OrderDto>>(orders.orders);

            var orderProducts = PagedList<OrderDto>.ToPagedList(ordersDto, p.PageNumber, p.PageSize, orders.count);

            return (orderProducts, orderProducts.MetaData);
        }

        public async Task<int> GetAllOrdersCountAsync() => await _manager.Order.GetAllOrdersCountAsync();
        public async Task<OrderDto> GetOneOrderByIdAsync(int orderId, bool trackChanges)
        {
            var order = await GetOneOrderByIdForServiceAsync(orderId, trackChanges);
            var orderDto = _mapper.Map<OrderDto>(order);

            return orderDto;
        }

        private async Task<Order> GetOneOrderByIdForServiceAsync(int orderId, bool trackChanges)
        {
            var order = await _manager.Order.GetOneOrderByIdAsync(orderId, trackChanges);

            if (order == null)
            {
                throw new OrderNotFoundException(orderId);
            }

            return order;
        }

        public async Task<IEnumerable<OrderDto>> GetOrdersOfOneTableAsync(int tableId)
        {
            var orders = await _manager.Order.GetOrdersOfOneTableAsync(tableId);
            var ordersDto = _mapper.Map<IEnumerable<OrderDto>>(orders);

            return ordersDto;
        }
        public async Task CreateOrderAsync(OrderDtoForCreation orderDto)
        {
            var order = _mapper.Map<Order>(orderDto);

            _manager.Order.CreateOrder(order);
            await _manager.SaveAsync();
        }

        public async Task DeleteOrderAsync(int orderId)
        {
            var order = await GetOneOrderByIdForServiceAsync(orderId, true);

            _manager.Order.DeleteOrder(order);
            await _manager.SaveAsync();
        }

        public async Task UpdateOrderAsync(OrderDtoForUpdate orderDto)
        {
            var order = await GetOneOrderByIdForServiceAsync(orderDto.Id, true);
            _mapper.Map(orderDto, order);

            await _manager.SaveAsync();
        }
    }
}
