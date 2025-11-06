export default interface PaginationHeader {
    CurrentPage?: number;
    TotalPage?: number;
    PageSize?: number;
    TotalCount?: number;
    HasPrevious?: boolean;
    HasPage?: boolean;
}