using Entities.Models;
using System.ComponentModel.DataAnnotations;

namespace Entities.Dtos
{
    public record TableDtoForUpdate
    {
        public int Id { get; init; }
        [Required(ErrorMessage = "Masa konumu X koordinatı gereklidir.")]
        public decimal LocationX { get; set; }
        [Required(ErrorMessage = "Masa konumu Z koordinatı gereklidir.")]
        public decimal LocationZ { get; set; }
        [Required(ErrorMessage = "Masa adı gereklidir.")]
        public String Name { get; init; } = null!;
        [Required(ErrorMessage = "Masa kapasitesi gereklidir.")]
        public int Capacity { get; init; }
    }
}
