namespace Entities.Dtos
{
    public record CategoryDto
    {
        public int Id { get; init; }
        public String Name { get; init; } = null!;
        public int ProductCount { get; init; }
    }
}
