using AutoMapper;
using Entities.Dtos;
using Entities.Exceptions;
using Entities.Models;
using Entities.RequestFeatures;
using Repositories.Contracts;
using Services.Contracts;

namespace Services
{
    public class TableManager : ITableService
    {
        private readonly IRepositoryManager _manager;
        private readonly IMapper _mapper;

        public TableManager(IRepositoryManager manager, IMapper mapper)
        {
            _manager = manager;
            _mapper = mapper;
        }

        public async Task<(PagedList<TableDto> tables, MetaData metaData)> GetAllTablesAsync(RequestParameters p, bool trackChanges)
        {
            var tables = await _manager.Table.GetAllTablesAsync(p, trackChanges);
            var tablesDto = _mapper.Map<IEnumerable<TableDto>>(tables.tables);
          
            var pagedTables = PagedList<TableDto>.ToPagedList(tablesDto, p.PageNumber, p.PageSize, tables.count);

            return (pagedTables, pagedTables.MetaData);
        }

        public async Task<int> GetAllTablesCountAsync() => await _manager.Table.GetAllTablesCountAsync();

        public async Task<IEnumerable<TableDto>> GetAllTablesStatusesAsync(bool trackChanges)
        {
            var statuses = await _manager.Table.GetAllTablesStatusesAsync(trackChanges);
            var statusesDto = _mapper.Map<IEnumerable<TableDto>>(statuses);

            return statusesDto;
        }

        private async Task<Table> GetOneTableByIdForServiceAsync(int tableId, bool trackChanges)
        {
            var table = await _manager.Table.GetOneTableByIdAsync(tableId, trackChanges);

            if (table == null)
            {
                throw new TableNotFoundException(tableId);
            }

            return table;
        }

        public async Task<TableDto> GetOneTableByIdAsync(int tableId, bool trackChanges)
        {
            var table = await GetOneTableByIdForServiceAsync(tableId, trackChanges);
            var tableDto = _mapper.Map<TableDto>(table);

            return tableDto;
        }
        public async Task CreateTableAsync(TableDtoForCreation tableDto)
        {
            var table = _mapper.Map<Table>(tableDto);

            _manager.Table.CreateTable(table);
            await _manager.SaveAsync();
        }

        public async Task DeleteTableAsync(int tableId)
        {
            var table = await GetOneTableByIdForServiceAsync(tableId, true);

            _manager.Table.DeleteTable(table);
            await _manager.SaveAsync();
        }

        public async Task UpdateTableAsync(TableDtoForUpdate tableDto)
        {
            var table = await GetOneTableByIdForServiceAsync(tableDto.Id, true);
            _mapper.Map(tableDto, table);

            await _manager.SaveAsync();
        }
    }
}
