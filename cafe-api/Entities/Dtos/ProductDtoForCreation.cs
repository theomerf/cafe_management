using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace Entities.Dtos
{
    public record ProductDtoForCreation
    {
        [Required(ErrorMessage = "Ürün adı gereklidir.")]
        [MaxLength(100, ErrorMessage = "Ürün adı en fazla 100 karakter olabilir.")]
        public String Name { get; init; } = null!;
        [MaxLength(300, ErrorMessage = "Açıklama en fazla 300 karakter olabilir.")]
        public String? Description { get; init; }
        [Required(ErrorMessage = "Fiyat gereklidir.")]
        public decimal Price { get; init; }
        [Required(ErrorMessage = "Ürün görseli gereklidir.")]
        public IFormFile Image { get; init; } = null!;
        [Required(ErrorMessage = "Kategori seçimi gereklidir.")]
        public int CategoryId { get; init; }
    }
}
