namespace Entities.Exceptions
{
    public class OrderNotFoundException : NotFoundException
    {
        public OrderNotFoundException(int orderId)
            : base($"{orderId} id'sine sahip sipariş bulunamadı.")
        {
        }
    }
}
