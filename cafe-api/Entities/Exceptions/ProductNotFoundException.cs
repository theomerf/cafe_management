namespace Entities.Exceptions
{
    public class ProductNotFoundException : NotFoundException
    {
        public ProductNotFoundException(int productId)
            : base($"{productId} id'sine sahip ürün bulunamadı.")
        {
        }
    }
}
