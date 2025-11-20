using Entities;
using Entities.Dtos;
using Entities.RequestFeatures;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Presentation.ActionFilters;
using Services.Contracts;
using System.Security.Claims;
using System.Text.Json;

namespace Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly IServiceManager _manager;

        public AccountController(IServiceManager manager)
        {
            _manager = manager;
        }

        [HttpPost("login")]
        [ServiceFilter(typeof(ValidationFilterAttribute))]
        public async Task<IActionResult> Login([FromBody] AccountDtoForLogin accountDto)
        {
            if (!await _manager.AccountService.LoginUserAsync(accountDto))
            {
                return Unauthorized();
            }

            var tokenDto = await _manager.AccountService.CreateTokenAsync(populateExp: true, rememberMe: accountDto.RememberMe);

            _manager.AccountService.SetTokensInsideCookie(tokenDto, HttpContext);
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var userInfo = await _manager.AccountService.GetCurrentUserInfoAsync(userId!);

            return Ok(userInfo);
        }

        [HttpPost("register")]
        [ServiceFilter(typeof(ValidationFilterAttribute))]
        public async Task<IActionResult> Register([FromBody] AccountDtoForRegistration accountDto)
        {
            var result = await _manager.AccountService.RegisterUserAsync(accountDto);

            if (result.Succeeded)
            {
                return Ok();
            }
            return BadRequest(result.Errors);
        }

        [HttpPost("refresh")]
        [Authorize]
        public async Task<IActionResult> Refresh()
        {
            HttpContext.Request.Cookies.TryGetValue("accessToken", out var accessToken);
            HttpContext.Request.Cookies.TryGetValue("refreshToken", out var refreshToken);

            var tokenDto = new TokenDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken
            };

            var tokenDtoToReturn = await _manager.AccountService.RefreshTokenAsync(tokenDto);

            _manager.AccountService.SetTokensInsideCookie(tokenDto, HttpContext);
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var userInfo = await _manager.AccountService.GetCurrentUserInfoAsync(userId!);

            return Ok(userInfo);
        }

        [HttpGet("check-auth")]
        [Authorize]
        public async Task<IActionResult> CheckAuth()
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized();
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var userInfo = await _manager.AccountService.GetCurrentUserInfoAsync(userId!);

            return Ok(userInfo);
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            Response.Cookies.Delete("refreshToken");
            Response.Cookies.Delete("accessToken");

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            await _manager.AccountService.InvalidateRefreshTokenAsync(userId!);

            return Ok();
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAccounts([FromQuery] RequestParameters p)
        {
            var pagedAccounts = await _manager.AccountService.GetAllAccountsAsync(p, false);
            Response.Headers.Add("X-Pagination", JsonSerializer.Serialize(pagedAccounts.metaData));

            return Ok(pagedAccounts.accounts);
        }

        [HttpGet("count")]
        public async Task<IActionResult> GetAccountsCount()
        {
            var count = await _manager.AccountService.GetAccountsCountAsync();

            return Ok(count);
        }

        [HttpPost("create")]
        [ServiceFilter(typeof(ValidationFilterAttribute))]
        public async Task<IActionResult> CreateAccount([FromBody] AccountDtoForCreation accountDto)
        {
            var result = await _manager.AccountService.CreateAccountAsync(accountDto);

            if (result.Succeeded)
            {
                return Ok();
            }
            return BadRequest(result.Errors);
        }

        [HttpPut("update")]
        [ServiceFilter(typeof(ValidationFilterAttribute))]
        public async Task<IActionResult> UpdateAccount([FromBody] AccountDtoForUpdate accountDto)
        {
            var result = await _manager.AccountService.UpdateAccountAsync(accountDto);

            if (result.Succeeded)
            {
                return Ok();
            }
            return BadRequest(result.Errors);
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteAccount([FromRoute] String id)
        {
            var result = await _manager.AccountService.DeleteAccountAsync(id);

            if (result.Succeeded)
            {
                return Ok();
            }
            return BadRequest(result.Errors);
        }
    }
}
