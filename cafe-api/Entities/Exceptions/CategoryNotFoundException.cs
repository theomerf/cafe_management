namespace Entities.Exceptions
{
    public class CategoryNotFoundException : NotFoundException
    {
        public CategoryNotFoundException(int id) : base ($"{id}'sine sahip kategori bulunamadı.")
        {
        }
    }
}
