using Microsoft.Extensions.DependencyInjection;
using Repositories.Contracts;

namespace Repositories
{
    public class RepositoryManager : IRepositoryManager
    {
        private readonly RepositoryContext _context;
        private readonly IServiceProvider _provider;
        private readonly Lazy<IProductRepository> _productRepository;
        private readonly Lazy<IOrderRepository> _orderRepository;
        private readonly Lazy<ITableRepository> _tableRepository;
        private readonly Lazy<ICategoryRepository> _categoryRepository;

        public RepositoryManager(RepositoryContext context, IServiceProvider provider)
        {
            _context = context;
            _provider = provider;
            _productRepository = new Lazy<IProductRepository>(() => _provider.GetRequiredService<IProductRepository>());
            _orderRepository = new Lazy<IOrderRepository>(() => _provider.GetRequiredService<IOrderRepository>());
            _tableRepository = new Lazy<ITableRepository>(() => _provider.GetRequiredService<ITableRepository>());
            _categoryRepository = new Lazy<ICategoryRepository>(() => _provider.GetRequiredService<ICategoryRepository>());
        }

        public IProductRepository Product => _productRepository.Value;
        public IOrderRepository Order => _orderRepository.Value;
        public ITableRepository Table => _tableRepository.Value;
        public ICategoryRepository Category => _categoryRepository.Value;

        public void Save()
        {
            _context.SaveChanges();
        }

        public async Task SaveAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
