using Entities.Models;
using Entities.RequestParameters;

namespace Repositories.Contracts
{
    public interface IOrderRepository : IRepositoryBase<Order>
    {
        Task<(IEnumerable<Order> orders, int count)> GetAllOrdersAsync(RequestParameters p, bool trackChanges);
        Task<IEnumerable<Order>> GetOrdersOfOneTableAsync(int tableId);
        Task<int> GetAllOrdersCountAsync();
        Task<Order?> GetOneOrderByIdAsync(int orderId, bool trackChanges);
        void CreateOrder(Order order);
        void UpdateOrder(Order order);
        void DeleteOrder(Order order);
    }
}
