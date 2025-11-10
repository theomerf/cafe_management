using Entities.Dtos;
using Entities.RequestFeatures;
using Microsoft.AspNetCore.Mvc;
using Presentation.ActionFilters;
using Services.Contracts;
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
            var result = await _manager.AccountService.LoginUserAsync(accountDto);

            if (result)
            {
                var tokenDto = await _manager.AccountService.CreateTokenAsync(true, accountDto.RememberMe);
                return Ok(tokenDto);
            }
            return Unauthorized();
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
        public async Task<IActionResult> RefreshToken([FromBody] TokenDto tokenDto)
        {
            var newTokenDto = await _manager.AccountService.RefreshTokenAsync(tokenDto);
            return Ok(newTokenDto);
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
