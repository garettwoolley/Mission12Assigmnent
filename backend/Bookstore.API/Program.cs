using Microsoft.EntityFrameworkCore;
using Bookstore.API.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

var databaseFileName =
    builder.Configuration.GetConnectionString("BookstoreConnection") ?? "Bookstore.sqlite";
var databasePath = Path.GetFullPath(
    Path.Combine(builder.Environment.ContentRootPath, "..", "..", databaseFileName)
);

builder.Services.AddDbContext<BookstoreDbContext>(options =>
    options.UseSqlite($"Data Source={databasePath}")
);

var corsOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? Array.Empty<string>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowVite", policy =>
    {
        if (corsOrigins.Length > 0)
        {
            policy.WithOrigins(corsOrigins).AllowAnyHeader().AllowAnyMethod();
        }
        else
        {
            policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
        }
    });
});

var app = builder.Build();

app.UseCors("AllowVite");

app.UseAuthorization();

app.MapControllers();

app.Run();
