using Entities.Dtos;
using Entities.RequestFeatures;

namespace Services.Contracts
{
    public interface ITableService
    {
        Task<(PagedList<TableDto> tables, MetaData metaData)> GetAllTablesAsync(RequestParameters p, bool trackChanges);
        Task<IEnumerable<TableDto>> GetAllTablesStatusesAsync(bool trackChanges);
        Task<int> GetAllTablesCountAsync();
        Task<TableDto> GetOneTableByIdAsync(int tableId, bool trackChanges);
        Task CreateTableAsync(TableDtoForCreation tableDto);
        Task UpdateTableAsync(TableDtoForUpdate tableDto);
        Task DeleteTableAsync(int tableId);
    }
}
