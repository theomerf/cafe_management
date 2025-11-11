using Entities.Dtos;
using Entities.RequestFeatures;

namespace Services.Contracts
{
    public interface IOrderService
    {
        Task<(PagedList<OrderDto> orders, MetaData metaData)> GetAllOrdersAsync(RequestParameters p, bool trackChanges);
        Task<IEnumerable<OrderDto>> GetOrdersOfOneTableAsync(int tableId);
        Task<int> GetAllOrdersCountAsync();
        Task<decimal> GetTotalIncomeOfDayAsync();
        Task<int> GetOrdersCountOfDayAsync();
        Task<(int preparingCount, int deliveredCount)> GetOrdersStatusStatsAsync();
        Task<OrderDto> GetOneOrderByIdAsync(int orderId, bool trackChanges);
        Task CreateOrderAsync(OrderDtoForCreation orderDto);
        Task ChangeOrderStatusAsync(OrderDtoForStatus orderDto);
        Task UpdateOrderAsync(OrderDtoForUpdate orderDto);
        Task DeleteOrderAsync(int orderId);
    }
}
