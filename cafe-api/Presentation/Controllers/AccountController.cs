using Entities.Dtos;
using Microsoft.AspNetCore.Mvc;
using Services.Contracts;

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
        public async Task<IActionResult> Register([FromBody] AccountDtoForRegistration accountDto)
        {
            var result = await _manager.AccountService.RegisterUserAsync(accountDto);

            if (result.Succeeded)
            {
                return Ok();
            }
            return BadRequest(result.Errors);
        }

        [HttpPost("refreshtoken")]
        public async Task<IActionResult> RefreshToken([FromBody] TokenDto tokenDto)
        {
            var newTokenDto = await _manager.AccountService.RefreshTokenAsync(tokenDto);
            return Ok(newTokenDto);
        }
    }
}
