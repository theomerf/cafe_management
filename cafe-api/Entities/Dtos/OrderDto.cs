using Entities.Models;

namespace Entities.Dtos
{
    public record OrderDto
    {
        public int Id { get; init; }
        public DateTime CreatedAt { get; init; }
        public decimal TotalAmount { get; init; }
        public OrderStatus Status { get; init; }
        public ICollection<OrderLineDto> OrderLines { get; init; } = new List<OrderLineDto>();
        public int TableId { get; init; }
    }
}
