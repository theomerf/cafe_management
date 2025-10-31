namespace Repositories.Contracts
{
    public interface IRepositoryManager
    {
        IProductRepository Product { get; }
        IOrderRepository Order { get; }
        ITableRepository Table { get; }

        void Save();
        Task SaveAsync();
    }
}
