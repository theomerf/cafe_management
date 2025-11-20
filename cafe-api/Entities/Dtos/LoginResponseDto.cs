namespace Entities.Dtos
{
    public record LoginResponseDto
    {
        public String UserName { get; init; } = null!;
        public String FirstName { get; init; } = null!;
        public String LastName { get; init; } = null!;
    }
}
