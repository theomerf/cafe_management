using Entities.Dtos;
using Entities.RequestFeatures;

namespace Services.Contracts
{
    public interface ITableService
    {
        Task<IEnumerable<TableDto>> GetAllTablesAsync(bool trackChanges);
        Task<IEnumerable<TableDto>> GetAllTablesStatusesAsync(bool trackChanges);
        Task<int> GetAllTablesCountAsync();
        Task<(int occupiedCount, int availableCount)> GetTableStatusStatsAsync();
        Task<TableDto> GetOneTableByIdAsync(int tableId, bool trackChanges);
        Task CreateTableAsync(TableDtoForCreation tableDto);
        Task ChangeTableStatusAsync(TableDtoForStatus tableDto);
        Task UpdateTableAsync(TableDtoForUpdate tableDto);
        Task DeleteTableAsync(int tableId);
    }
}
