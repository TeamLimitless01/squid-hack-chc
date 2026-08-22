import prisma from './src/lib/db';

async function main() {
  const bookings = await prisma.booking.findMany({
    where: { bookingStatus: 'REQUESTED' },
    include: { chcService: true }
  });

  console.log(`Found ${bookings.length} requested bookings.`);

  for (const booking of bookings) {
    const basePrice = booking.area * booking.chcService.price;
    const finalAmount = basePrice + 200;

    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        vpBasePrice: basePrice,
        vpFinalAmount: finalAmount,
        vpProposedAt: new Date(),
        additionalCharges: {
          create: [
            { reason: "Simulated Travel Fee", amount: 200 }
          ]
        }
      }
    });
    console.log(`Updated booking ${booking.id} with a proposal.`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
