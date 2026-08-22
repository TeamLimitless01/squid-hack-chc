const { PrismaClient } = require('./generated/prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Find all requested bookings
  const bookings = await prisma.booking.findMany({
    where: { bookingStatus: 'REQUESTED' }
  });

  console.log(`Found ${bookings.length} requested bookings.`);

  for (const booking of bookings) {
    // Simulate CHC sending a proposal
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        vpBasePrice: booking.area * 500, // random base price
        vpFinalAmount: (booking.area * 500) + 200, // random final amount
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
