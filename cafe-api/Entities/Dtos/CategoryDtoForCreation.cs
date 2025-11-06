using System.ComponentModel.DataAnnotations;

namespace Entities.Dtos
{
    public record CategoryDtoForCreation
    {
        [Required(ErrorMessage = "Kategori adı gereklidir.")]
        [MaxLength(100, ErrorMessage = "Kategori adı en fazla 100 karakter olabilir.")]
        public String Name { get; init; } = null!;
        }
}
