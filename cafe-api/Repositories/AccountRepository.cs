using Entities.Models;
using Entities.RequestFeatures;
using Microsoft.EntityFrameworkCore;
using Repositories.Contracts;
using Repositories.Extensions;

namespace Repositories
{
    public class AccountRepository : RepositoryBase<Account>, IAccountRepository
    {
        public AccountRepository(RepositoryContext context) : base(context)
        {
        }

        public async Task<(IEnumerable<Account> accounts, int count)> GetAllAccountsAsync(RequestParameters p, bool trackChanges)
        {
            var accountQuery = FindAll(trackChanges)
                .FilterBy(p.SearchTerm, a => a.UserName, FilterOperator.Contains);
            var count = await accountQuery.CountAsync();
            
            var accounts = await accountQuery
                .OrderBy(a => a.Id)
                .ToPaginate(p.PageSize, p.PageNumber)
                .ToListAsync();

            return (accounts, count);
        }

        public async Task<int> GetAccountsCountAsync() => await CountAsync(false);
    }
}
