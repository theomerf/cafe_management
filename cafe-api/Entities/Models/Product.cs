namespace Entities.Models
{
    public class Product
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public String Name { get; set; } = null!;
        public String? Description { get; set; }
        public decimal Price { get; set; }
        public String ImageUrl { get; set; } = null!;  
    }
}
