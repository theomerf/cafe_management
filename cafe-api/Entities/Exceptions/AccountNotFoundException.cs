namespace Entities.Exceptions
{
    public class AccountNotFoundException : NotFoundException
    {
        public AccountNotFoundException(String userName) : base($"{userName} id'li kullanıcı bulunamadı.")
        {
        }
    }
}
