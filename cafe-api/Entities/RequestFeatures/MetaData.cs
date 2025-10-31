namespace Entities.RequestFeatures
{
    public class MetaData
    {
        public int PageSize { get; set; }
        public int CurrentPage { get; set; }
        public int TotalCount { get; set; }
        public int TotalPage { get; set; }
        public bool HasNext => CurrentPage < TotalPage;
        public bool HasPrevious => CurrentPage > 1;
    }
}
