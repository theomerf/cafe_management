using Entities.Models;
using Entities.RequestFeatures;
using Microsoft.EntityFrameworkCore;
using Repositories.Contracts;
using Repositories.Extensions;

namespace Repositories
{
    public class OrderRepository : RepositoryBase<Order>, IOrderRepository
    {
        public OrderRepository(RepositoryContext context) : base(context)
        {
        }

        public async Task<(IEnumerable<Order> orders, int count)> GetAllOrdersAsync(RequestParameters p, bool trackChanges)
        {
            var ordersQuery = FindAll(trackChanges);

            var count = await ordersQuery.CountAsync();

            var orders = await ordersQuery
                .Include(o => o.OrderLines)
                .OrderBy(o => o.Id)
                .ToPaginate(p.PageSize, p.PageNumber)
                .ToListAsync();

            return (orders, count);
        }

        public async Task<int> GetAllOrdersCountAsync() => await CountAsync(false);

        public async Task<Order?> GetOneOrderByIdAsync(int orderId, bool trackChanges)
        {
            var order = await FindByCondition(o => o.Id == orderId, trackChanges)
                .Include(o => o.OrderLines)
                .FirstOrDefaultAsync();

            return order;
        }

        public async Task<IEnumerable<Order>> GetOrdersOfOneTableAsync(int tableId)
        {
            var orders = await FindByCondition(o => o.TableId == tableId && o.Status != OrderStatus.Old, false)
                .Include(o => o.OrderLines)
                .OrderBy(o => o.Id)
                .ToListAsync();

            return orders;
        }

        public void CreateOrder(Order order)
        {
            Create(order);
        }

        public void DeleteOrder(Order order)
        {
            Remove(order);
        }

        public void UpdateOrder(Order order)
        {
            Update(order);
        }
    }
}
