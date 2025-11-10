export default interface RequestParameters {
    searchTerm?: string;
    pageNumber?: number;
    pageSize?: number;
}

export interface ProductFilters {
    searchTerm?: string;
    categoryId?: number;
}