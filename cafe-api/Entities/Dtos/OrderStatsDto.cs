namespace Entities.Dtos
{
    public record OrderStatsDto
    {
        public ICollection<string> Labels { get; init; } = new List<string>();
        public ICollection<int> TotalCounts { get; init; } = new List<int>();
        public ICollection<decimal> TotalIncomes { get; init; } = new List<decimal>();
    }

    public enum OrderStatsType
    {
        Daily,
        Weekly,
        Monthly
    }
}
