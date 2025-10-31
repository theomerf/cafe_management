using System.ComponentModel.DataAnnotations;

namespace Entities.Dtos
{
    public record AccountDtoForLogin
    {
        [Required(ErrorMessage = "Kullanıcı adı gereklidir.")]
        [MinLength(3, ErrorMessage = "Kullanıcı adı minimum 3 karakter olmalıdır.")]
        public String UserName { get; init; } = null!;
        [Required(ErrorMessage = "Şifre gereklidir.")]
        [MinLength(6, ErrorMessage = "Şifre minimum 6 karakter olmalıdır.")]
        public String Password { get; init; } = null!;
        public bool RememberMe { get; init; } = false;
    }
}
