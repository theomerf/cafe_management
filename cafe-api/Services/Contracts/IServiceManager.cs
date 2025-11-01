namespace Services.Contracts
{
    public interface IServiceManager
    {
        IAccountService AccountService { get; }
        IProductService ProductService { get; }
        IOrderService OrderService { get; }
        ITableService TableService { get; }
    }
}
