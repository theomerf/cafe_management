namespace Entities.Dtos
{
    public record TimeslotAnalysisDto
    {
        public StatsDto LastMonthTopSellerSlot { get; init; } = null!;
        public StatsDto CurrentMonthTopSellerSlot { get; init; } = null!;
        public StatsDto LastMonthTopEarningSlot { get; init; } = null!;
        public StatsDto CurrentMonthTopEarningSlot { get; init; } = null!;
        public List<string> Suggestions { get; set; } = new();
    }
}
