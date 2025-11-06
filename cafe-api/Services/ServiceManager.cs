using Microsoft.Extensions.DependencyInjection;
using Repositories;
using Services.Contracts;

namespace Services
{
    public class ServiceManager : IServiceManager
    {
        private readonly Lazy<IAccountService> _accountService;
        private readonly Lazy<IProductService> _productService;
        private readonly Lazy<IOrderService> _orderService;
        private readonly Lazy<ITableService> _tableService;
        private readonly Lazy<ICategoryService> _categoryService;

        public ServiceManager(IServiceProvider provider)
        {
            _accountService = new Lazy<IAccountService>(() => provider.GetRequiredService<IAccountService>());
            _productService = new Lazy<IProductService>(() => provider.GetRequiredService<IProductService>());
            _orderService = new Lazy<IOrderService>(() => provider.GetRequiredService<IOrderService>());
            _tableService = new Lazy<ITableService>(() => provider.GetRequiredService<ITableService>());
            _categoryService = new Lazy<ICategoryService>(() => provider.GetRequiredService<ICategoryService>());
        }

        public IAccountService AccountService => _accountService.Value;
        public IProductService ProductService => _productService.Value;
        public IOrderService OrderService => _orderService.Value;
        public ITableService TableService => _tableService.Value;
        public ICategoryService CategoryService => _categoryService.Value;
    }
}
