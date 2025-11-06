namespace Entities.Models
{
    public class Category
    {
        public int Id { get; set; }
        public String Name { get; set; } = null!;
        public ICollection<Product>? Products { get; set; }
    }
}
