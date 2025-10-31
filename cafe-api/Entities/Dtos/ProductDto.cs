namespace Entities.Dtos
{
    public record ProductDto
    {
        public int Id { get; init; }
        public string Name { get; init; } = null!;
        public string? Description { get; init; }
        public decimal Price { get; init; }
        public string ImageUrl { get; init; } = null!;
    }
}
