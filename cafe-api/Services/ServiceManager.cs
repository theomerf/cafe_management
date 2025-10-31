using Repositories;
using Services.Contracts;

namespace Services
{
    public class ServiceManager : IServiceManager
    {
        private readonly Lazy<IAccountService> _accountService;
        public ServiceManager(Lazy<IAccountService> accountService)
        {
            _accountService = accountService;
        }

        public IAccountService AccountService => _accountService.Value;
    }
}
