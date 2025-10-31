using Entities.Models;

namespace Entities.Dtos
{
    public record OrderDtoForUpdate : OrderDtoForCreation
    {
        public int Id { get; init; }
        public OrderStatus Status { get; set; }
    }
}
