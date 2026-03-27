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

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowVite", policy =>
    {
        policy
            .WithOrigins("http://localhost:3002", "http://127.0.0.1:3002")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors("AllowVite");

app.UseAuthorization();

app.MapControllers();

app.Run();
