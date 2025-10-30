namespace Repositories.Contracts
{
    public interface IRepositoryManager
    {
        void Save();
        Task SaveAsync();
    }
}
