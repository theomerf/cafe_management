using System.ComponentModel.DataAnnotations;

namespace Entities.Dtos
{
    public record CategoryDtoForUpdate : CategoryDtoForCreation
    {
        [Required(ErrorMessage = "Kategori Id alanı gereklidir.")]
        public int Id { get; init; }
    }
}
