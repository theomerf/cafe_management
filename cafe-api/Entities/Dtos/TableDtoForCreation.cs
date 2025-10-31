using System.ComponentModel.DataAnnotations;

namespace Entities.Dtos
{
    public record TableDtoForCreation
    {
        [Required(ErrorMessage = "Masa adı gereklidir.")]
        [MaxLength(50, ErrorMessage = "Masa adı en fazla 50 karakter olabilir.")]
        public String Name { get; init; } = null!;
    }
}
