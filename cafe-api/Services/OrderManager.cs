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
    public class OrderManager : IOrderService
    {
        private readonly IRepositoryManager _manager;
        private readonly IMapper _mapper;
        private readonly IMemoryCache _cache;

        public OrderManager(IRepositoryManager manager, IMapper mapper, IMemoryCache cache)
        {
            _manager = manager;
            _mapper = mapper;
            _cache = cache;
        }

        public async Task<(PagedList<OrderDto> orders, MetaData metaData)> GetAllOrdersAsync(RequestParameters p, bool trackChanges)
        {
            var orders = await _manager.Order.GetAllOrdersAsync(p, trackChanges);
            var ordersDto = _mapper.Map<IEnumerable<OrderDto>>(orders.orders);

            var orderProducts = PagedList<OrderDto>.ToPagedList(ordersDto, p.PageNumber, p.PageSize, orders.count);

            return (orderProducts, orderProducts.MetaData);
        }

        public async Task<IEnumerable<OrderDto>> GetActiveOrdersAsync()
        {
            var orders = await _manager.Order.GetActiveOrdersAsync();
            var ordersDto = _mapper.Map<IEnumerable<OrderDto>>(orders);

            return ordersDto;
        }

        public async Task<int> GetAllOrdersCountAsync()
        {
            var cacheKey = "AllOrdersCount";
            
            if (_cache.TryGetValue(cacheKey, out int cachedStat))
            {
                return cachedStat;
            }

            var count = await _manager.Order.GetAllOrdersCountAsync();
            var cacheOptions = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(20)
            };
            _cache.Set(cacheKey, count, cacheOptions);

            return count;
        }

        public async Task<decimal> GetTotalIncomeOfDayAsync()
        {
            var cacheKey = "TotalIncomeOfDay";

            if (_cache.TryGetValue(cacheKey, out decimal cachedStat))
            {
                return cachedStat;
            }

            var stat = await _manager.Order.GetTotalIncomeOfDayAsync();
            var cacheOptions = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10)
            };
            _cache.Set(cacheKey, stat, cacheOptions);

            return stat;
        }

        public async Task<int> GetOrdersCountOfDayAsync()
        {
            var cacheKey = "OrdersCountOfDay";

            if (_cache.TryGetValue(cacheKey, out int cachedStat))
            {
                return cachedStat;
            }

            var stat = await _manager.Order.GetOrdersCountOfDayAsync();
            var cacheOptions = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(20)
            };
            _cache.Set(cacheKey, stat, cacheOptions);

            return stat;
        }

        public async Task<(int preparingCount, int deliveredCount)> GetOrdersStatusStatsAsync()
        {
            var cacheKey = "OrdersStatusStats";
            
            if(_cache.TryGetValue(cacheKey, out (int preparingCount, int deliveredCount) cachedStat))
            {
                return cachedStat;
            }

            var stat = await _manager.Order.GetOrdersStatusStatsAsync();
            var cacheOptions = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
            };
            _cache.Set(cacheKey, stat, cacheOptions);

            return stat;
        }

        public async Task<Dictionary<OrderStatsType, OrderStatsDto>> GetOrdersStatsAsync()
        {
            var cacheKey = "OrdersStats";

            if(_cache.TryGetValue(cacheKey, out Dictionary<OrderStatsType, OrderStatsDto>? cachedStats))
            {
                if (cachedStats != null)
                    return cachedStats;
            }

            var stats = await _manager.Order.GetOrdersStatsAsync();
            var cacheOptions = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1)
            };
            _cache.Set(cacheKey, stats, cacheOptions);

            return stats;
        }

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
            decimal totalAmount = 0;
            foreach (var line in order.OrderLines)
            {
                var product = await _manager.Product.GetOneProductByIdAsync(line.ProductId, false);
                if (product != null)
                {
                    totalAmount += product.Price * line.Quantity;
                }
            }
            order.TotalAmount = totalAmount;

            _cache.Remove("AllOrdersCount");
            _cache.Remove("OrdersCountOfDay");
            _cache.Remove("TotalIncomeOfDay");
            _cache.Remove("OrdersStatusStats");
            _cache.Remove("OrdersStats");
            _cache.Remove("TopSoldProducts");
            _cache.Remove("TopSoldCategories");

            _manager.Order.CreateOrder(order);
            await _manager.SaveAsync();
        }

        public async Task DeleteOrderAsync(int orderId)
        {
            var order = await GetOneOrderByIdForServiceAsync(orderId, true);
            _cache.Remove("AllOrdersCount");
            _cache.Remove("OrdersCountOfDay");
            _cache.Remove("TotalIncomeOfDay");
            _cache.Remove("OrdersStatusStats");
            _cache.Remove("OrdersStats");
            _cache.Remove("TopSoldProducts");
            _cache.Remove("TopSoldCategories");

            _manager.Order.DeleteOrder(order);
            await _manager.SaveAsync();
        }

        public async Task ChangeOrderStatusAsync(OrderDtoForStatus orderDto) 
        { 
            var order = await GetOneOrderByIdForServiceAsync(orderDto.Id, true);
            _cache.Remove("OrdersStatusStats");

            order.Status = orderDto.Status;
            await _manager.SaveAsync();
        }

        public async Task UpdateOrderAsync(OrderDtoForUpdate orderDto)
        {
            var order = await GetOneOrderByIdForServiceAsync(orderDto.Id, true);
            _mapper.Map(orderDto, order);
            _cache.Remove("TotalIncomeOfDay");
            _cache.Remove("OrdersStatusStats");

            await _manager.SaveAsync();
        }
    }
}
