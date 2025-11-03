using AutoMapper;
using Entities.Dtos;
using Entities.Exceptions;
using Entities.Models;
using Entities.RequestFeatures;
using Microsoft.Extensions.Caching.Memory;
using Repositories.Contracts;
using Services.Contracts;

namespace Services
{
    public class TableManager : ITableService
    {
        private readonly IRepositoryManager _manager;
        private readonly IMapper _mapper;
        private readonly IMemoryCache _cache;

        public TableManager(IRepositoryManager manager, IMapper mapper, IMemoryCache cache)
        {
            _manager = manager;
            _mapper = mapper;
            _cache = cache;
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

        public async Task<(int occupiedCount, int availableCount)> GetTableStatusStatsAsync()
        {
            var cacheKey = "TableStatusStats";
            if (_cache.TryGetValue(cacheKey, out (int occupiedCount, int availableCount) stats))
            {
                return stats;
            }

            var stat = await _manager.Table.GetTableStatusStatsAsync();

            var cacheOptions = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10)
            };
            _cache.Set(cacheKey, stat, cacheOptions);

            return stat;
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

        public async Task ChangeTableStatusAsync(TableDtoForStatus tableDto)
        {
            var table = await GetOneTableByIdForServiceAsync(tableDto.Id, true);

            table.Status = tableDto.Status;
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
