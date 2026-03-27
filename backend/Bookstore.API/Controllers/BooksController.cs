using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Bookstore.API.Data;

namespace Bookstore.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class BooksController(BookstoreDbContext context) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetBooks(
        int pageSize = 5,
        int pageNumber = 1,
        string sortOrder = "asc",
        string? category = null
    )
    {
        if (pageSize <= 0)
        {
            pageSize = 5;
        }

        if (pageNumber <= 0)
        {
            pageNumber = 1;
        }

        IQueryable<Book> query = context.Books.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(category))
        {
            query = query.Where(b => b.Category == category);
        }

        query = sortOrder.ToLower() == "desc"
            ? query.OrderByDescending(b => b.Title)
            : query.OrderBy(b => b.Title);

        // Count after filtering so pagination matches the selected category.
        var totalNumBooks = await query.CountAsync();

        var books = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new { Books = books, TotalNumBooks = totalNumBooks });
    }

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await context.Books.AsNoTracking()
            .Select(b => b.Category)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync();

        return Ok(categories);
    }
}
