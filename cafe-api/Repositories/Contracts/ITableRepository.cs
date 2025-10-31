using Entities.Models;
using Entities.RequestParameters;

namespace Repositories.Contracts
{
    public interface ITableRepository : IRepositoryBase<Table>
    {
        Task<(IEnumerable<Table> tables, int count)> GetAllTablesAsync(RequestParameters p, bool trackChanges);
        Task<IEnumerable<Table>> GetAllTablesStatusesAsync(bool trackChanges);
        Task<int> GetAllTablesCountAsync();
        Task<Table?> GetOneTableByIdAsync(int tableId, bool trackChanges);
        void CreateTable(Table table);
        void UpdateTable(Table table);
        void DeleteTable(Table table);
    }
}
