using Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Repositories.Configs
{
    public class OrderConfig : IEntityTypeConfiguration<Order>
    {
        public void Configure(EntityTypeBuilder<Order> builder)
        {
            builder.HasKey(o => o.Id);
            builder.Property(o => o.CreatedAt)
                   .IsRequired();
            builder.Property(o => o.TotalAmount)
                     .IsRequired()
                     .HasColumnType("decimal(18,2)");
            builder.Property(o => o.Status)
                     .IsRequired();

            builder.HasMany(o => o.OrderLines)
                   .WithOne(ol => ol.Order)
                   .HasForeignKey(ol => ol.OrderId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(o => o.Table)
                   .WithMany(t => t.Orders)
                   .HasForeignKey(o => o.TableId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
