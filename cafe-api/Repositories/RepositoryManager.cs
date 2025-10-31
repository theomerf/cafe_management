using Repositories.Contracts;

namespace Repositories
{
    public class RepositoryManager : IRepositoryManager
    {
        private readonly RepositoryContext _context;
        private readonly Lazy<IProductRepository> _productRepository;
        private readonly Lazy<IOrderRepository> _orderRepository;
        private readonly Lazy<ITableRepository> _tableRepository;

        public RepositoryManager(RepositoryContext context, Lazy<IProductRepository> productRepository, Lazy<IOrderRepository> orderRepository, Lazy<ITableRepository> tableRepository)
        {
            _context = context;
            _productRepository = productRepository;
            _orderRepository = orderRepository;
            _tableRepository = tableRepository;
        }

        public IProductRepository Product => _productRepository.Value;
        public IOrderRepository Order => _orderRepository.Value;
        public ITableRepository Table => _tableRepository.Value;

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
