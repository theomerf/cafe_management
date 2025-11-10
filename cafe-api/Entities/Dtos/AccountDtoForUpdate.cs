using System.ComponentModel.DataAnnotations;

namespace Entities.Dtos
{
    public record AccountDtoForUpdate
    {
        [Required(ErrorMessage = "Kullanıcı Id gereklidir.")]
        public String Id { get; init; } = null!;
        [Required(ErrorMessage = "Kullanıcı adı gereklidir.")]
        [MinLength(3, ErrorMessage = "Kullanıcı adı en az 3 karakter uzunluğunda olmalıdır.")]
        [MaxLength(20, ErrorMessage = "Kullanıcı adı en fazla 20 karakter uzunluğunda olabilir.")]
        public String UserName { get; init; } = null!;
        [Required(ErrorMessage = "Ad gereklidir.")]
        [MinLength(2, ErrorMessage = "Ad en az 2 karakter uzunluğunda olmalıdır.")]
        [MaxLength(30, ErrorMessage = "Ad en fazla 30 karakter uzunluğunda olabilir.")]
        public String FirstName { get; init; } = null!;
        [Required(ErrorMessage = "Soyad gereklidir.")]
        [MinLength(2, ErrorMessage = "Soyad en az 2 karakter uzunluğunda olmalıdır.")]
        [MaxLength(30, ErrorMessage = "Soyad en fazla 30 karakter uzunluğunda olabilir.")]
        public String LastName { get; init; } = null!;
        [Required(ErrorMessage = "Email gereklidir.")]
        [EmailAddress(ErrorMessage = "Geçerli bir email adresi giriniz.")]
        public String Email { get; init; } = null!;
        [Required(ErrorMessage = "Telefon numarası gereklidir.")]
        [Phone(ErrorMessage = "Geçerli bir telefon numarası giriniz.")]
        public String PhoneNumber { get; init; } = null!;
    }
}
