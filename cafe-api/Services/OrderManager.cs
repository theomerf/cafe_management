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

        public async Task<OrderAnalysisDto> GetOrdersAnalysisAsync()
        {
            var analysis = await _manager.Order.GetOrdersAnalysisAsync();
            
            if (analysis.CurrentMonthOrderCount == 0 && analysis.LastMonthOrderCount == 0)
            {
                analysis.Suggestions = new List<string>
                {
                    "Henüz bir sipariş verilmedi. Analizler için ilk siparişler bekleniyor."
                };
            }
            else
            {
                analysis.Suggestions = new List<string>();

                if (analysis.CurrentMonthOrderCount < analysis.LastMonthOrderCount)
                {
                    if (analysis.LastMonthIncome < analysis.CurrentMonthIncome)
                    {
                        analysis.Suggestions.Add("Sipariş sayısı azaldı ancak gelir arttı. Daha karlı ürünlere odaklanmayı düşünün.");
                    }
                    else
                    {
                        analysis.Suggestions.Add("Sipariş sayısı geçen aya göre azaldı. Daha fazla müşteri çekmek için promosyonlar veya özel teklifler düzenlemeyi düşünün.");
                    }
                }
                else
                {
                    analysis.Suggestions.Add("Sipariş sayısı arttı. Müşteri memnuniyetini sürdürmek için hizmet kalitesine odaklanın.");
                }

                if (analysis.CurrentMonthIncome < analysis.LastMonthIncome)
                {
                    if (analysis.LastMonthOrderCount < analysis.CurrentMonthOrderCount)
                    {
                        analysis.Suggestions.Add("Gelir düştü ancak sipariş sayısı arttı. Maliyetleri gözden geçirin ve fiyatlandırma stratejinizi değerlendirin.");
                    }
                    else
                    {
                        analysis.Suggestions.Add("Gelir, geçen aya göre azaldı. Menü fiyatlandırmanızı gözden geçirin ve ek satış tekniklerini düşünün.");
                    }
                }
                else
                {
                    analysis.Suggestions.Add("Gelir arttı. Başarıyı sürdürmek için popüler ürünleri ve promosyonları analiz edin.");
                }

                if (analysis.CurrentMonthAvgCount < analysis.LastMonthAvgCount)
                {
                    analysis.Suggestions.Add("Ortalama günlük sipariş sayısı düştü. Müşteri deneyimini iyileştirmeye odaklanın ve tekrar ziyaretleri teşvik edin.");
                }
                else
                {
                    analysis.Suggestions.Add("Ortalama günlük sipariş sayısı arttı. Bu olumlu trendi sürdürmek için pazarlama stratejilerinizi güçlendirin.");
                }

                if (analysis.CurrentMonthAvgIncome < analysis.LastMonthAvgIncome)
                {
                    analysis.Suggestions.Add("Ortalama günlük gelir düştü. Popüler yemekleri analiz edin ve satışları artırmak için yeni ürünler tanıtmayı düşünün.");
                }
                else
                {
                    analysis.Suggestions.Add("Ortalama günlük gelir arttı. Bu olumlu trendi sürdürmek için müşteri sadakat programları uygulamayı düşünün.");
                }
            }

            return analysis;
        }

        public async Task<TimeslotAnalysisDto> GetHourlyAnalysisAsync()
        {
            var analysis = await _manager.Order.GetHourlyAnalysisAsync();

            if (analysis.CurrentMonthTopSellerSlot.Count == 0 && analysis.LastMonthTopSellerSlot.Count == 0)
            {
                analysis.Suggestions = new List<string>
                {
                    "Henüz bir sipariş verilmedi. Analizler için ilk siparişler bekleniyor."
                };
            }
            else
            {
                analysis.Suggestions = new List<string>();
                if (analysis.CurrentMonthTopSellerSlot.Count < analysis.LastMonthTopSellerSlot.Count)
                {
                    analysis.Suggestions.Add("En çok satan zaman dilimindeki sipariş sayısı azaldı. Bu zaman diliminde özel promosyonlar düzenlemeyi düşünün.");
                }
                else
                {
                    analysis.Suggestions.Add("En çok satan zaman dilimindeki sipariş sayısı arttı. Bu olumlu trendi sürdürmek için pazarlama stratejilerinizi güçlendirin.");
                }
                if (analysis.CurrentMonthTopEarningSlot.Count < analysis.LastMonthTopEarningSlot.Count)
                {
                    analysis.Suggestions.Add("En yüksek gelir elde edilen zaman dilimindeki gelir düştü. Menü fiyatlandırmanızı gözden geçirin ve ek satış tekniklerini düşünün.");
                }
                else
                {
                    analysis.Suggestions.Add("En yüksek gelir elde edilen zaman dilimindeki gelir arttı. Bu olumlu trendi sürdürmek için müşteri sadakat programları uygulamayı düşünün.");
                }

                if (analysis.CurrentMonthTopSellerSlot.Name != analysis.LastMonthTopSellerSlot.Name)
                {
                    analysis.Suggestions.Add("En çok satan zaman dilimi değişti. Yeni trendleri analiz edin ve bu zaman diliminde pazarlama stratejilerinizi uyarlayın.");
                }
                if (analysis.CurrentMonthTopEarningSlot.Name != analysis.LastMonthTopEarningSlot.Name)
                {
                    analysis.Suggestions.Add("En yüksek gelir elde edilen zaman dilimi değişti. Menü ve promosyon stratejilerinizi bu zaman dilimine göre optimize edin.");
                }

                if (analysis.CurrentMonthTopEarningSlot.Name != analysis.CurrentMonthTopSellerSlot.Name)
                {
                    analysis.Suggestions.Add("En çok satan ve en yüksek gelir elde edilen zaman dilimleri farklı. Her iki zaman diliminde de özel kampanyalar düzenlemeyi düşünün.");
                }
            }

            return analysis;
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
