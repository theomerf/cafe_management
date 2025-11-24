namespace Entities.Dtos
{
    public record StatsDto
    {
        public int Id { get; init; }
        public String Name { get; init; } = null!;
        public int Count { get; init; }
        public decimal? Value { get; init; }
    }
}
