using Microsoft.AspNetCore.Identity;

namespace Entities.Models
{
    public class Account : IdentityUser
    {
        public String FirstName { get; set; } = null!;
        public String LastName { get; set; } = null!;
        public DateTime? LastLoginDate { get; set; }
        public String? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiryTime { get; set; }
    }
}
