using Entities.Models;
using Entities.RequestFeatures;

namespace Repositories.Contracts
{
    public interface IAccountRepository : IRepositoryBase<Account>
    {
        Task<(IEnumerable<Account> accounts, int count)> GetAllAccountsAsync(RequestParameters p, bool trackChanges);
        Task<int> GetAccountsCountAsync();
    }
}
