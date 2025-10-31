using Entities.Dtos;
using Microsoft.AspNetCore.Identity;

namespace Services.Contracts
{
    public interface IAccountService
    {
        Task<IdentityResult> RegisterUserAsync(AccountDtoForRegistration accountDto);
        Task<bool> LoginUserAsync(AccountDtoForLogin accountDto);
        Task<TokenDto> CreateTokenAsync(bool populateExp, bool rememberMe);
        Task<TokenDto> RefreshTokenAsync(TokenDto tokenDto);
    }
}
