namespace Entities.Dtos
{
    public record ProductDto
    {
        public int Id { get; init; }
        public String Name { get; init; } = null!;
        public String? Description { get; init; }
        public decimal Price { get; init; }
        public String ImageUrl { get; init; } = null!;
        public int CategoryId { get; init; }    
        public String CategoryName { get; init; } = null!;
    }
}
