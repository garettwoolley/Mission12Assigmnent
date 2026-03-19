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
        string sortOrder = "asc"
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

        query = sortOrder.ToLower() == "desc"
            ? query.OrderByDescending(b => b.Title)
            : query.OrderBy(b => b.Title);

        var totalNumBooks = await query.CountAsync();

        var books = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new { Books = books, TotalNumBooks = totalNumBooks });
    }
}
