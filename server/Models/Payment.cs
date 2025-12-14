using System.ComponentModel.DataAnnotations;

namespace Server.Models
{
    public class Payment
    {
        public int Id { get; set; }

        [Required]
        public decimal Amount { get; set; }

        public string? Description { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
