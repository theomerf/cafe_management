using System.ComponentModel.DataAnnotations;

namespace Entities.Dtos
{
    public record TableDtoForCreation 
    {
        [Required(ErrorMessage = "Masa adı gereklidir.")]
        [MaxLength(50, ErrorMessage = "Masa adı en fazla 50 karakter olabilir.")]
        public String Name { get; init; } = null!;
        [Required(ErrorMessage = "Masa kapasitesi gereklidir.")]
        public int Capacity { get; set; }
        [Required(ErrorMessage = "Masa konumu X koordinatı gereklidir.")]
        public decimal LocationX { get; set; }
        [Required(ErrorMessage = "Masa konumu Z koordinatı gereklidir.")]
        public decimal LocationZ { get; set; }
    }
}
