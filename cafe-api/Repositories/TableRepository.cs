using Entities.Models;
using Entities.RequestFeatures;
using Microsoft.EntityFrameworkCore;
using Repositories.Contracts;
using Repositories.Extensions;

namespace Repositories
{
    public class TableRepository : RepositoryBase<Table>, ITableRepository
    {
        public TableRepository(RepositoryContext context) : base(context)
        {
        }

        public async Task<(IEnumerable<Table> tables, int count)> GetAllTablesAsync(RequestParameters p, bool trackChanges)
        {
            var tablesQuery = FindAll(trackChanges);

            var count = await tablesQuery.CountAsync();

            var tables = await tablesQuery
                .OrderBy(t => t.Id)
                .ToPaginate(p.PageSize, p.PageNumber)
                .ToListAsync();
            return (tables, count);
        }

        public async Task<int> GetAllTablesCountAsync() => await CountAsync(false);

        public async Task<IEnumerable<Table>> GetAllTablesStatusesAsync(bool trackChanges)
        {
            var tables = await FindAll(trackChanges)
                .OrderBy(t => t.Id)
                .ToListAsync();

            return tables;
        }

        public async Task<(int occupiedCount, int availableCount)> GetTableStatusStatsAsync()
        {
            var stats = await FindByCondition(t => t.Status != TableStatus.OutOfOrder, false)
                .GroupBy(t => t.Status)
                .Select(g => new
                {
                    Status = g.Key,
                    Count = g.Count()
                })
                .ToListAsync();

            var occupiedCount = stats.FirstOrDefault(s => s.Status == TableStatus.Occupied)?.Count ?? 0;
            var freeCount = stats.FirstOrDefault(s => s.Status == TableStatus.Available)?.Count ?? 0;

            return (occupiedCount, freeCount);
        }

        public async Task<Table?> GetOneTableByIdAsync(int tableId, bool trackChanges)
        {
            var table = await FindByCondition(t => t.Id == tableId, trackChanges)
                .FirstOrDefaultAsync();

            return table;
        }

        public void CreateTable(Table table)
        {
            Create(table);
        }

        public void DeleteTable(Table table)
        {
            Remove(table);
        }

        public void UpdateTable(Table table)
        {
            Update(table);
        }
    }
}
