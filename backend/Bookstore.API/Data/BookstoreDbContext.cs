using Microsoft.EntityFrameworkCore;

namespace Bookstore.API.Data;

public class BookstoreDbContext(DbContextOptions<BookstoreDbContext> options) : DbContext(options)
{
    public DbSet<Book> Books => Set<Book>();
}
