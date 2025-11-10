using Entities.Dtos;
using Entities.Models;
using Entities.RequestFeatures;
using Microsoft.AspNetCore.Identity;

namespace Services.Contracts
{
    public interface IAccountService
    {
        Task<IdentityResult> RegisterUserAsync(AccountDtoForRegistration accountDto);
        Task<bool> LoginUserAsync(AccountDtoForLogin accountDto);
        Task<TokenDto> CreateTokenAsync(bool populateExp, bool rememberMe);
        Task<TokenDto> RefreshTokenAsync(TokenDto tokenDto);
        Task<(PagedList<AccountDto> accounts, MetaData metaData)> GetAllAccountsAsync(RequestParameters p, bool trackChanges);
        Task<int> GetAccountsCountAsync();
        Task<IdentityResult> CreateAccountAsync(AccountDtoForCreation accountDto);
        Task<IdentityResult> UpdateAccountAsync(AccountDtoForUpdate accountDto);
        Task<IdentityResult> DeleteAccountAsync(String accountId);
    }
}
