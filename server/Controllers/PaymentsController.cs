using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public PaymentsController(AppDbContext db) => _db = db;

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _db.Payments.ToListAsync());

        [HttpPost]
        public async Task<IActionResult> Create(Payment p)
        {
            _db.Payments.Add(p);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAll), new { id = p.Id }, p);
        }
    }
}
