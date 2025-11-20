namespace Entities.Dtos
{
    public record TokenDto
    {
        public String AccessToken { get; init; } = null!;
        public String RefreshToken { get; init; } = null!;

    }
}
