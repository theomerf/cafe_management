using Entities.Dtos;
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

        public async Task<IEnumerable<Order>> GetActiveOrdersAsync()
        {
            var orders = await FindByCondition(o => o.Status == OrderStatus.Preparing, false)
                .Include(o => o.OrderLines)
                .ThenInclude(ol => ol.Product)
                .OrderBy(o => o.CreatedAt)
                .ToListAsync();

            return orders;
        }

        public async Task<int> GetAllOrdersCountAsync() => await CountAsync(false);

        public async Task<decimal> GetTotalIncomeOfDayAsync()
        {
            var today = DateTime.UtcNow.Day;

            var totalIncome = await FindByCondition(o => o.CreatedAt.Day == today, false)
                .SumAsync(o => o.TotalAmount);

            return totalIncome;
        }

        public async Task<int> GetOrdersCountOfDayAsync()
        {
            var today = DateTime.UtcNow.Day;

            var totalOrders = await FindByCondition(o => o.CreatedAt.Day == today, false)
                .CountAsync();

            return totalOrders;
        }

        public async Task<(int preparingCount, int deliveredCount)> GetOrdersStatusStatsAsync()
        {
            var stats = await FindByCondition(o => o.Status != OrderStatus.Old && o.Status != OrderStatus.Cancelled, false)
                .GroupBy(o => o.Status)
                .Select(g => new
                {
                    Status = g.Key,
                    Count = g.Count()
                })
                .ToListAsync();

            int preparingCount = stats.FirstOrDefault(s => s.Status == OrderStatus.Preparing)?.Count ?? 0;
            int deliveredCount = stats.FirstOrDefault(s => s.Status == OrderStatus.Delivered)?.Count ?? 0;

            return (preparingCount, deliveredCount);
        }

        public async Task<Dictionary<OrderStatsType, OrderStatsDto>> GetOrdersStatsAsync()
        {
            var today = DateTime.UtcNow;
            var startOfMonth = new DateTime(today.Year, today.Month, 1);
            var startOfYear = new DateTime(today.Year, 1, 1);

            var dailyStatsQuery = await FindByCondition(o => o.CreatedAt >= startOfMonth, false)
                .GroupBy(o => o.CreatedAt.Day)
                .Select(g => new
                {
                    Day = g.Key,
                    TotalCount = g.Count(),
                    TotalIncome = g.Sum(o => o.TotalAmount),
                })
                .ToListAsync();

            var weeklyStatsQuery = await FindByCondition(o => o.CreatedAt >= startOfMonth, false)
                .GroupBy(o => o.CreatedAt.Day / 7)
                .Select(g => new
                {
                    Week = g.Key,
                    TotalCount = g.Count(),
                    TotalIncome = g.Sum(o => o.TotalAmount),
                })
                .ToListAsync();

            var monthlyStatsQuery = await FindByCondition(o => o.CreatedAt >= startOfYear, false)
                .GroupBy(o => o.CreatedAt.Month)
                .Select(g => new
                {
                    Month = g.Key,
                    TotalCount = g.Count(),
                    TotalIncome = g.Sum(o => o.TotalAmount),
                })
                .ToListAsync();

            var dailyStats = new OrderStatsDto
            {
                Labels = Enumerable.Range(1, today.Day)
                    .Select(day => day.ToString())
                    .ToList(),
                TotalCounts = Enumerable.Range(1, today.Day)
                    .Select(day => dailyStatsQuery.FirstOrDefault(ds => ds.Day == day)?.TotalCount ?? 0)
                    .ToList(),
                TotalIncomes = Enumerable.Range(1, today.Day)
                    .Select(day => dailyStatsQuery.FirstOrDefault(ds => ds.Day == day)?.TotalIncome ?? 0)
                    .ToList(),
            };

            var weekCount = (today.Day - 1) / 7 + 1;

            var weeklyStats = new OrderStatsDto
            {
                Labels = Enumerable.Range(1, weekCount)
                    .Select(week => $"Hafta {week}")
                    .ToList(),
                TotalCounts = Enumerable.Range(0, weekCount)
                    .Select(week => weeklyStatsQuery.FirstOrDefault(ms => ms.Week == week)?.TotalCount ?? 0)
                    .ToList(),
                TotalIncomes = Enumerable.Range(0, weekCount)
                    .Select(week => weeklyStatsQuery.FirstOrDefault(ms => ms.Week == week)?.TotalIncome ?? 0)
                    .ToList(),
            };

            var monthlyStats = new OrderStatsDto
            {
                Labels = Enumerable.Range(1, today.Month)
                    .Select(month => $"Ay {month}")
                    .ToList(),
                TotalCounts = Enumerable.Range(1, today.Month)
                    .Select(month => monthlyStatsQuery.FirstOrDefault(ms => ms.Month == month)?.TotalCount ?? 0)
                    .ToList(),
                TotalIncomes = Enumerable.Range(1, today.Month)
                    .Select(month => monthlyStatsQuery.FirstOrDefault(ms => ms.Month == month)?.TotalIncome ?? 0)
                    .ToList(),
            };

            var stats = new Dictionary<OrderStatsType, OrderStatsDto>
            {
                { OrderStatsType.Daily, dailyStats },
                { OrderStatsType.Weekly, weeklyStats },
                { OrderStatsType.Monthly, monthlyStats }
            };

            return stats;
        }

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
                .ThenInclude(ol => ol.Product)
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
