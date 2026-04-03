namespace Bookstore.API.Data;

public class BookRequest
{
    public string Title { get; set; } = string.Empty;

    public string Author { get; set; } = string.Empty;

    public string Publisher { get; set; } = string.Empty;

    public string ISBN { get; set; } = string.Empty;

    public string Classification { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public int PageCount { get; set; }

    public double Price { get; set; }
}
