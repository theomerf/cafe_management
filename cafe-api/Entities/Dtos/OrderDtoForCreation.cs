using System.ComponentModel.DataAnnotations;

namespace Entities.Dtos
{
    public record OrderDtoForCreation
    {
        public decimal TotalAmount { get; init; }
        [Required(ErrorMessage = "Sipariş ürünleri gereklidir.")]
        public ICollection<OrderLineDto> OrderLines { get; init; } = new List<OrderLineDto>();
        public int TableId { get; init; }
    }
}
