using Entities.Dtos;
using Entities.Models;
using Entities.RequestFeatures;

namespace Repositories.Contracts
{
    public interface IOrderRepository : IRepositoryBase<Order>
    {
        Task<(IEnumerable<Order> orders, int count)> GetAllOrdersAsync(RequestParameters p, bool trackChanges);
        Task<IEnumerable<Order>> GetActiveOrdersAsync();
        Task<IEnumerable<Order>> GetOrdersOfOneTableAsync(int tableId);
        Task<decimal> GetTotalIncomeOfDayAsync();
        Task<int> GetOrdersCountOfDayAsync();
        Task<int> GetAllOrdersCountAsync();
        Task<(int preparingCount, int deliveredCount)> GetOrdersStatusStatsAsync();
        Task<Dictionary<OrderStatsType, OrderStatsDto>> GetOrdersStatsAsync();
        Task<Order?> GetOneOrderByIdAsync(int orderId, bool trackChanges);
        void CreateOrder(Order order);
        void UpdateOrder(Order order);
        void DeleteOrder(Order order);
    }
}
