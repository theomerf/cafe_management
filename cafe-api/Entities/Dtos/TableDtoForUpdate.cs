using Entities.Models;
using System.ComponentModel.DataAnnotations;

namespace Entities.Dtos
{
    public record TableDtoForUpdate : TableDtoForCreation
    {
        public int Id { get; init; }
        [Required(ErrorMessage = "Durum alanı boş geçilemez.")]
        public TableStatus Status { get; init; }
    }
}
