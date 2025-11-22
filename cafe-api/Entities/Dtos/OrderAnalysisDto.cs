namespace Entities.Dtos
{
    public record OrderAnalysisDto
    {
        public int CurrentMonthOrderCount { get; init; }
        public decimal CurrentMonthIncome { get; init; }
        public double CurrentMonthAvgCount { get; init; }
        public decimal CurrentMonthAvgIncome { get; init; }
        public int LastMonthOrderCount { get; init; }
        public decimal LastMonthIncome { get; init; }
        public double LastMonthAvgCount { get; init; }
        public decimal LastMonthAvgIncome { get; init; }
        public List<string> Suggestions { get; set; } = new();
    }
}
