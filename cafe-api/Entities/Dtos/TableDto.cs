using Entities.Models;

namespace Entities.Dtos
{
    public record TableDto
    {
        public int Id { get; init; }
        public String Name { get; init; } = null!;
        public int Capacity { get; init; }
        public decimal LocationX { get; init; }
        public decimal LocationZ { get; init; }
        public ICollection<OrderDto>? Orders { get; init; }
        public TableStatus Status { get; init; }
    }
}
