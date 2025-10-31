namespace Entities.Exceptions
{
    public class TableNotFoundException : NotFoundException
    {
        public TableNotFoundException(int tableId)
            : base($"{tableId} id'sine sahip masa bulunamadı.")
        {
        }
    }
}
