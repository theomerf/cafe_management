using Entities.Models;

namespace Entities.Dtos
{
    public record TableDto
    {
        public int Id { get; init; }
        public String Name { get; init; } = null!;
        public ICollection<OrderDto>? Orders { get; init; }
        public TableStatus Status { get; init; }
    }
}
