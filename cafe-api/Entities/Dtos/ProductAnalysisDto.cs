namespace Entities.Dtos
{
    public record ProductAnalysisDto
    {
        public StatsDto LastMonthTopSoldProduct { get; init; } = null!;
        public StatsDto CurrentMonthTopSoldProduct { get; init; } = null!;
        public StatsDto LastMonthTopEarningProduct { get; init; } = null!;
        public StatsDto CurrentMonthTopEarningProduct { get; init; } = null!;
        public List<string> Suggestions { get; set; } = new();
    }
}
