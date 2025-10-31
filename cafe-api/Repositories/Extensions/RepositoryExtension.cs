using Entities.Models;

namespace Repositories.Extensions
{
    public static class RepositoryExtension
    {
        public static IQueryable<Product> FilterBySearch(this IQueryable<Product> products, string searchTerm)
        {
            if (String.IsNullOrWhiteSpace(searchTerm))
                return products;

            var lowerCaseTerm = searchTerm.Trim().ToLower();

            return products.Where(p => p.Name.ToLower().Contains(lowerCaseTerm));
        }

        public static IQueryable<T> ToPaginate<T>(this IQueryable<T> query, int pageSize, int pageNumber)
        {
            if (pageSize <= 0 || pageNumber <= 0)
                return query;

            return query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize);
        }
    }
}
