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

    [HttpGet("all")]
    public async Task<IActionResult> GetAllBooks()
    {
        var books = await context.Books.AsNoTracking()
            .OrderBy(b => b.Title)
            .ToListAsync();

        return Ok(books);
    }

    [HttpPost]
    public async Task<IActionResult> CreateBook([FromBody] BookRequest? body)
    {
        if (body is null)
        {
            return BadRequest("Request body is required.");
        }

        var validationError = ValidateBookRequest(body);
        if (validationError is not null)
        {
            return BadRequest(validationError);
        }

        var book = new Book
        {
            Title = body.Title.Trim(),
            Author = body.Author.Trim(),
            Publisher = body.Publisher.Trim(),
            ISBN = body.ISBN.Trim(),
            Classification = body.Classification.Trim(),
            Category = body.Category.Trim(),
            PageCount = body.PageCount,
            Price = body.Price,
        };

        context.Books.Add(book);
        await context.SaveChangesAsync();

        return StatusCode(StatusCodes.Status201Created, book);
    }

    [HttpPut("{bookId:int}")]
    public async Task<IActionResult> UpdateBook(int bookId, [FromBody] BookRequest? body)
    {
        if (body is null)
        {
            return BadRequest("Request body is required.");
        }

        var validationError = ValidateBookRequest(body);
        if (validationError is not null)
        {
            return BadRequest(validationError);
        }

        var book = await context.Books.FindAsync(bookId);
        if (book is null)
        {
            return NotFound();
        }

        book.Title = body.Title.Trim();
        book.Author = body.Author.Trim();
        book.Publisher = body.Publisher.Trim();
        book.ISBN = body.ISBN.Trim();
        book.Classification = body.Classification.Trim();
        book.Category = body.Category.Trim();
        book.PageCount = body.PageCount;
        book.Price = body.Price;

        await context.SaveChangesAsync();

        return Ok(book);
    }

    [HttpDelete("{bookId:int}")]
    public async Task<IActionResult> DeleteBook(int bookId)
    {
        var book = await context.Books.FindAsync(bookId);
        if (book is null)
        {
            return NotFound();
        }

        context.Books.Remove(book);
        await context.SaveChangesAsync();

        return NoContent();
    }

    private static string? ValidateBookRequest(BookRequest body)
    {
        if (string.IsNullOrWhiteSpace(body.Title))
        {
            return "Title is required.";
        }

        if (string.IsNullOrWhiteSpace(body.Author))
        {
            return "Author is required.";
        }

        if (string.IsNullOrWhiteSpace(body.Publisher))
        {
            return "Publisher is required.";
        }

        if (string.IsNullOrWhiteSpace(body.ISBN))
        {
            return "ISBN is required.";
        }

        if (string.IsNullOrWhiteSpace(body.Classification))
        {
            return "Classification is required.";
        }

        if (string.IsNullOrWhiteSpace(body.Category))
        {
            return "Category is required.";
        }

        if (body.PageCount <= 0)
        {
            return "Page count must be greater than zero.";
        }

        if (body.Price < 0)
        {
            return "Price cannot be negative.";
        }

        return null;
    }
}
