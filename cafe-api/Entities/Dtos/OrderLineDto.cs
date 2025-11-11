namespace Entities.Dtos
{
    public record OrderLineDto
    {
        public int Id { get; init; }
        public int OrderId { get; init; }
        public int ProductId { get; init; }
        public String? ProductName { get; init; }
        public String? ProductImageUrl { get; init; }
        public decimal UnitPrice { get; init; }
        public int Quantity { get; init; }
    }
}
