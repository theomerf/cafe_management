namespace Entities.Dtos
{
    public record CategoryStatsDto
    {
        public int Id { get; init; }
        public String Name { get; init; } = null!;
        public int Count { get; init; }
    }
}
