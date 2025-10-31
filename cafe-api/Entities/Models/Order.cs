namespace Entities.Models
{
    public class Order
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public decimal TotalAmount { get; set; }
        public OrderStatus Status { get; set; } = OrderStatus.Processing;
        public ICollection<OrderLine> OrderLines { get; set; } = new List<OrderLine>();
        public int TableId { get; set; }
        public Table? Table { get; set; }
    }

    public enum OrderStatus
    {
        Processing,
        Delivered,
        Cancelled,
        Old
    }

}
