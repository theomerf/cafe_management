namespace Entities.Models
{
    public class Table
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public String Name { get; set; } = null!;
        public ICollection<Order>? Orders { get; set; }
        public TableStatus Status { get; set; } = TableStatus.Free;
    }

    public enum TableStatus
    {
        Occupied,
        Free,
        OutOfOrder
    }
}
