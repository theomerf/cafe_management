using Entities.Models;
using Entities.RequestFeatures;

namespace Repositories.Contracts
{
    public interface ITableRepository : IRepositoryBase<Table>
    {
        Task<IEnumerable<Table>> GetAllTablesAsync(bool trackChanges);
        Task<IEnumerable<Table>> GetAllTablesStatusesAsync(bool trackChanges);
        Task<(int occupiedCount, int availableCount)> GetTableStatusStatsAsync();
        Task<int> GetAllTablesCountAsync();
        Task<Table?> GetOneTableByIdAsync(int tableId, bool trackChanges);
        void CreateTable(Table table);
        void UpdateTable(Table table);
        void DeleteTable(Table table);
    }
}
