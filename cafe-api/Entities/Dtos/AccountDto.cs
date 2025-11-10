namespace Entities.Dtos
{
    public record AccountDto
    {
        public String Id { get; init; } = null!;
        public String UserName { get; init; } = null!;
        public String FirstName { get; init; } = null!;
        public String LastName { get; init; } = null!;
        public String Email { get; init; } = null!;
        public String PhoneNumber { get; init; } = null!;
        public DateTime? LastLoginDate { get; init; }
    }
}
