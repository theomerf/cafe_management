using Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Repositories.Configs
{
    public class OrderLineConfig : IEntityTypeConfiguration<OrderLine>
    {
        public void Configure(EntityTypeBuilder<OrderLine> builder)
        {
            builder.HasKey(ol => ol.Id);
            builder.Property(ol => ol.Quantity)
                .IsRequired();

            builder.HasOne(ol => ol.Order)
                .WithMany(o => o.OrderLines)
                .HasForeignKey(ol => ol.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(ol => ol.Product)
                .WithMany()
                .HasForeignKey(ol => ol.ProductId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
