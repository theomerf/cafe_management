namespace Entities.Dtos
{
    public record ProductDtoForUpdate : ProductDtoForCreation
    {
        public int Id { get; init; }
    }
}
