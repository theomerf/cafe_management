using AutoMapper;
using Azure.Core;
using Entities;
using Entities.Dtos;
using Entities.Exceptions;
using Entities.Models;
using Entities.RequestFeatures;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Repositories.Contracts;
using Services.Contracts;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace Services
{
    public class AccountManager : IAccountService
    {
        private readonly IMapper _mapper;
        private readonly UserManager<Account> _userManager;
        private readonly IRepositoryManager _manager;
        private readonly IConfiguration _configuration;
        private readonly AppSettings _appSettings;

        private Account? _account;

        public AccountManager(IMapper mapper, UserManager<Account> userManager, IConfiguration configuration, IRepositoryManager manager, IOptions<AppSettings> appSettings)
        {
            _mapper = mapper;
            _userManager = userManager;
            _configuration = configuration;
            _manager = manager;
            _appSettings = appSettings.Value;
        }

        public async Task<IdentityResult> RegisterUserAsync(AccountDtoForRegistration accountDto)
        {
            var user = _mapper.Map<Account>(accountDto);
            accountDto.Roles?.Add("User");

            if (accountDto.Roles != null && accountDto.Password != null)
            {
                var result = await _userManager.CreateAsync(user, accountDto.Password);

                if (result.Succeeded)
                {
                    await _userManager.AddToRolesAsync(user, accountDto.Roles);
                }

                return result;
            }

            return IdentityResult.Failed(new IdentityError { Description = "Kullanıcı oluşturma başarısız." });
        }

        public async Task<bool> LoginUserAsync(AccountDtoForLogin accountDto)
        {
            if (accountDto.UserName != null && accountDto.Password != null)
            {
                _account = await _userManager.FindByNameAsync(accountDto.UserName);
                var result = (_account != null && await _userManager.CheckPasswordAsync(_account, accountDto.Password));

                if (_account != null && result)
                {
                    _account.LastLoginDate = DateTime.UtcNow;
                    await _userManager.UpdateAsync(_account);
                }

                return result;
            }
            return false;
        }

        public async Task<LoginResponseDto> GetCurrentUserInfoAsync(string userId)
        {
            Account? account;
            if (_account == null)
            {
                account = await _userManager.FindByIdAsync(userId);

                if (account == null || account.UserName == null)
                    throw new AccessViolationException("Kullanıcı bulunamadı");

                var loginResponse = new LoginResponseDto
                {
                    UserName = account.UserName,
                    FirstName = account.FirstName,
                    LastName = account.LastName
                };

                return loginResponse;
            }
            else
            {
                account = _account;
                var loginResponse = new LoginResponseDto
                {
                    UserName = account.UserName!,
                    FirstName = account.FirstName,
                    LastName = account.LastName
                };
                return loginResponse;
            }
        }

        public async Task<TokenDto> CreateTokenAsync(bool populateExp, bool rememberMe)
        {
            var signinCredentials = GetSigningCredentials();
            var claims = await GetClaimsAsync();
            var tokenOptions = GenerateTokenOptions(signinCredentials, claims);

            var refreshToken = GenerateRefreshToken();

            if (_account != null)
            {
                _account.RefreshToken = refreshToken;

                if (populateExp)
                {
                    if (rememberMe)
                    {
                        _account.RefreshTokenExpiryTime = DateTime.Now.AddDays(15);
                    }
                    else
                    {
                        _account.RefreshTokenExpiryTime = DateTime.Now.AddDays(7);
                    }
                }

                await _userManager.UpdateAsync(_account);
            }


            var accessToken = new JwtSecurityTokenHandler().WriteToken(tokenOptions);
            return new TokenDto()
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken
            };
        }

        private SigningCredentials GetSigningCredentials()
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var key = Encoding.UTF8.GetBytes(jwtSettings["secretKey"]!);
            var secret = new SymmetricSecurityKey(key);

            return new SigningCredentials(secret, SecurityAlgorithms.HmacSha256);
        }

        private async Task<List<Claim>> GetClaimsAsync()
        {
            var claims = new List<Claim>()
            {
                new Claim(ClaimTypes.NameIdentifier, _account?.Id!),
                new Claim(ClaimTypes.Name, _account?.UserName!),
            };

            var roles = await _userManager.GetRolesAsync(_account!);

            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            return claims;
        }

        private JwtSecurityToken GenerateTokenOptions(SigningCredentials signinCredentials, List<Claim> claims)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");

            var tokenOptions = new JwtSecurityToken(
                issuer: jwtSettings["validIssuer"],
                audience: jwtSettings["validAudience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(Convert.ToDouble(jwtSettings["expires"])),
                signingCredentials: signinCredentials);

            return tokenOptions;
        }

        private String GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomNumber);
                return Convert.ToBase64String(randomNumber);
            }
        }

        private ClaimsPrincipal GetPrincipalFromExpiredToken(string token)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["secretKey"];

            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = jwtSettings["validIssuer"],
                ValidAudience = jwtSettings["validAudience"],
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!))
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            SecurityToken securityToken;

            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out securityToken);

            var jwtSecurityToken = securityToken as JwtSecurityToken;

            if (jwtSecurityToken is null || !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
            {
                throw new SecurityTokenException("Geçersiz token");
            }

            return principal;
        }

        public async Task<TokenDto> RefreshTokenAsync(String refreshToken)
        {
            var account = await _userManager.Users.FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);

            if (account is null || account.RefreshToken != refreshToken || account.RefreshTokenExpiryTime <= DateTime.Now)
            {
                throw new RefreshTokenBadRequestException();
            }

            _account = account;
            return await CreateTokenAsync(populateExp: false, rememberMe: false);
        }

        public void SetTokensInsideCookie(TokenDto tokenDto, HttpContext context)
        {
            context.Response.Cookies.Append("accessToken", tokenDto.AccessToken,
                new CookieOptions
                {
                    Expires = DateTimeOffset.UtcNow.AddMinutes(15),
                    HttpOnly = true,
                    IsEssential = true,
                    Secure = true,
                    SameSite = SameSiteMode.None
                });

            context.Response.Cookies.Append("refreshToken", tokenDto.RefreshToken,
                new CookieOptions
                {
                    Expires = DateTimeOffset.UtcNow.AddDays(7),
                    HttpOnly = true,
                    IsEssential = true,
                    Secure = true,
                    SameSite = SameSiteMode.None
                });
        }

        public async Task InvalidateRefreshTokenAsync(string userId)
        {
            var account = await _userManager.FindByIdAsync(userId);

            if (account != null)
            {
                account.RefreshToken = null;
                account.RefreshTokenExpiryTime = null;
                await _userManager.UpdateAsync(account);
            }
        }

        public async Task<(PagedList<AccountDto> accounts, MetaData metaData)> GetAllAccountsAsync(RequestParameters p, bool trackChanges)
        {
            var account = await _manager.Account.GetAllAccountsAsync(p, trackChanges);
            var accountDto = _mapper.Map<IEnumerable<AccountDto>>(account.accounts);

            var pagedAccounts = PagedList<AccountDto>.ToPagedList(accountDto, p.PageNumber, p.PageSize, account.count);

            return (pagedAccounts, pagedAccounts.MetaData);
        }

        public async Task<int> GetAccountsCountAsync() => await _manager.Account.GetAccountsCountAsync();

        public async Task<IdentityResult> CreateAccountAsync(AccountDtoForCreation accountDto)
        {
            var user = _mapper.Map<Account>(accountDto);
            var result = await _userManager.CreateAsync(user, accountDto.Password);

            return result;
        }

        public async Task<IdentityResult> UpdateAccountAsync(AccountDtoForUpdate accountDto)
        {
            var user = await _userManager.FindByIdAsync(accountDto.Id.ToString());
            if (user == null)
            {
                return IdentityResult.Failed(new IdentityError { Description = "Kullanıcı bulunamadı." });
            }
            _mapper.Map(accountDto, user);
            var result = await _userManager.UpdateAsync(user);

            return result;
        }

        public async Task<IdentityResult> DeleteAccountAsync(String accountId)
        {
            var user = await _userManager.FindByIdAsync(accountId);
            if (user == null)
            {
                return IdentityResult.Failed(new IdentityError { Description = "Kullanıcı bulunamadı." });
            }
            var result = await _userManager.DeleteAsync(user);

            return result;
        }
    }
}