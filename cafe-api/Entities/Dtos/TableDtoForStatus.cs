using Entities.Models;

namespace Entities.Dtos
{
    public record TableDtoForStatus
    {
        public int Id { get; init; }
        public TableStatus Status { get; init; }
    }
}
