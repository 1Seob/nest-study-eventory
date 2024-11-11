import { PrismaClient } from '@prisma/client';

type CreateEventCity = {
  eventId: number;
  cityId: number;
};

async function main(): Promise<void> {
  const prisma = new PrismaClient();
  const events = await prisma.event.findMany();

  const data: CreateEventCity[] = events.map((event) => ({
    eventId: event.id,
    cityId: event.cityId,
  }));

  console.log(data);

  await prisma.eventCity.createMany({
    data,
  });
}

main();
