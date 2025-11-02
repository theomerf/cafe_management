using Entities.Models;

namespace Entities.Dtos
{
    public record OrderDtoForStatus
    {
        public int Id { get; init; }
        public OrderStatus Status { get; init; }
    }
}
