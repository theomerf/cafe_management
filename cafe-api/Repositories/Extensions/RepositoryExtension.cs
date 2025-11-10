using Entities.Models;
using System.Linq.Expressions;

public enum FilterOperator
{
    Equal,
    NotEqual,
    GreaterThan,
    LessThan,
    Contains,
    StartsWith,
    EndsWith
}

namespace Repositories.Extensions
{
    public static class RepositoryExtension
    {
        public static IQueryable<T> FilterBy<T, TProperty>(
            this IQueryable<T> query,
            TProperty? value,
            Expression<Func<T, TProperty>> propertySelector,
            FilterOperator op = FilterOperator.Equal)
        {
            if (value == null || value.Equals(default(TProperty)))
                return query;

            var parameter = propertySelector.Parameters[0];
            var member = propertySelector.Body;
            var constant = Expression.Constant(value, typeof(TProperty));

            Expression body = op switch
            {
                FilterOperator.Equal => Expression.Equal(member, constant),
                FilterOperator.NotEqual => Expression.NotEqual(member, constant),
                FilterOperator.GreaterThan => Expression.GreaterThan(member, constant),
                FilterOperator.LessThan => Expression.LessThan(member, constant),
                FilterOperator.Contains => Expression.Call(
                    member,
                    typeof(string).GetMethod("Contains", new[] { typeof(string) })!,
                    Expression.Constant(value.ToString()!, typeof(string))
                ),
                FilterOperator.StartsWith => Expression.Call(
                    member,
                    typeof(string).GetMethod("StartsWith", new[] { typeof(string) })!,
                    Expression.Constant(value.ToString()!, typeof(string))
                ),
                FilterOperator.EndsWith => Expression.Call(
                    member,
                    typeof(string).GetMethod("EndsWith", new[] { typeof(string) })!,
                    Expression.Constant(value.ToString()!, typeof(string))
                ),
                _ => throw new NotImplementedException()
            };

            var lambda = Expression.Lambda<Func<T, bool>>(body, parameter);

            return query.Where(lambda);
        }

        public static IQueryable<T> ToPaginate<T>(this IQueryable<T> query, int pageSize, int pageNumber)
        {
            if (pageSize <= 0 || pageNumber <= 0)
                return query;

            return query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize);
        }

        public static IQueryable<Product> FilterByCategory(this IQueryable<Product> products, int? categoryId)
        {
            if (categoryId == null)
                return products;

            return products.Where(p => p.CategoryId == categoryId);
        }
    }
}
