using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entities.Dtos
{
    public record ProductStatsDto
    {
        public int Id { get; init; }
        public String Name { get; init; } = null!;
        public int Count { get; init; }
    }
}
