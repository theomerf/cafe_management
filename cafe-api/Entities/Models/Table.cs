namespace Entities.Models
{
    public class Table
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public String Name { get; set; } = null!;
        public int Capacity { get; set; }
        public decimal LocationX { get; set; }
        public decimal LocationZ { get; set; }
        public ICollection<Order>? Orders { get; set; }
        public TableStatus Status { get; set; } = TableStatus.Available;
    }

    public enum TableStatus
    {
        Occupied,
        Available,
        OutOfOrder
    }
}
