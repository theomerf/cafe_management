using CafeAPI.Infrastructure.Extensions;
using Microsoft.AspNetCore.Mvc;
using Services.Contracts;
using System.Text.Json;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers(config =>
{
    config.RespectBrowserAcceptHeader = true;
    config.ReturnHttpNotAcceptable = true;
})
    .AddApplicationPart(typeof(Presentation.AssemblyReference).Assembly)
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });



builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.SuppressModelStateInvalidFilter = true;
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.ConfigureSwagger();
builder.Services.ConfigureDbContext(builder.Configuration);
builder.Services.ConfigureIdentity();
builder.Services.ConfigureRepositoryRegistration();
builder.Services.ConfigureServiceRegistration();
builder.Services.ConfigureLoggerService();
builder.Services.ConfigureRouting();
builder.Services.ConfigureActionFilters();
builder.Services.ConfigureCors(builder.Configuration, builder.Environment);
builder.Services.AddMemoryCache();
builder.Services.ConfigureLocalization();

builder.Services.AddAutoMapper(typeof(Program));

builder.Services.ConfigureJwt(builder.Configuration);
builder.Services.AddAuthorization();

var app = builder.Build();

app.UseCors("AllowFrontend");

var logger = app.Services.GetRequiredService<ILoggerService>();
app.ConfigureExceptionHandler(logger);

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

if (app.Environment.IsProduction())
{
    app.UseHsts();
}

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.UseStaticFiles();
app.MapControllers();

if (app.Environment.IsDevelopment())
{
    app.ConfigureAndCheckMigration();
}

app.ConfigureLocalization();
await app.ConfigureDefaultAdminUser();

app.Run();
