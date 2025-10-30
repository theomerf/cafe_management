using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Presentation.ActionFilters
{
    public class ValidationFilterAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext context)
        {
            var controller = context.RouteData.Values["controller"];
            var action = context.RouteData.Values["action"];

            var param = context.ActionArguments
                .SingleOrDefault(p => p.Value.ToString()!.Contains("Dto")).Value;

            if (param is null)
            {
                context.Result = new BadRequestObjectResult(new
                {
                    message = "Geçersiz istek verisi",
                    errors = new { general = new[] { $"Controller: {controller}, Action: {action} - Nesne null." } }
                });
                return;
            }

            if (!context.ModelState.IsValid)
            {
                var errors = context.ModelState
                    .Where(x => x.Value?.Errors.Count > 0)
                    .ToDictionary(
                        kvp => kvp.Key,
                        kvp => kvp.Value?.Errors.Select(e => e.ErrorMessage).ToArray() ?? new string[0]
                    );

                context.Result = new UnprocessableEntityObjectResult(new
                {
                    message = "Doğrulama hatası.",
                    errors = errors
                });
            }
        }
    }
}
