import { PrismaClient, EventType } from "@prisma/client";

const prisma = new PrismaClient();

const getQuery = (query: string) => {
  switch (query) {
    case "WEDDING":
      return "wedding";
    case "COLLEGE_FEST":
      return "college event";
    case "CORPORATE":
      return "corporate event";
    case "BIRTHDAY":
      return "birthday";
    case "OTHER":
    default:
      return "event";
  }
};

const randomIndex = (length: number) => Math.floor(Math.random() * length);

const generateUrl = (
  query: string,
  orientation: "landscape" | "portrait",
  limit = 10
) =>
  `https://api.unsplash.com/search/photos?client_id=GcDvkttRs2WE0WvMBf3oRc2rQ7W-Uuv6mDfolAwANeQ&query=${getQuery(
    query
  )}&orientation=${orientation}&per_page=${limit}`;

async function main() {
  const allEventTypes = Object.values(EventType);

  for (const eventType of allEventTypes) {
    console.log(`\n Processing ${eventType} events`);

    const events = await prisma.event.findMany({
      where: {
        type: eventType,
        coverImage: null,
        portraitImage: null,
      },
    });

    if (!events.length) {
      console.log("No events to update");
      continue;
    }

    const [landscapeRes, portraitRes] = await Promise.all([
      fetch(generateUrl(eventType, "landscape", 12)),
      fetch(generateUrl(eventType, "portrait", 12)),
    ]);

    const landscapeImages = (await landscapeRes.json())?.results ?? [];
    const portraitImages = (await portraitRes.json())?.results ?? [];

    if (!landscapeImages.length || !portraitImages.length) {
      console.warn(`No images from Unsplash for ${eventType}`);
      continue;
    }

    for (const event of events) {
      const cover =
        landscapeImages[randomIndex(landscapeImages.length)]?.urls?.full;
      const portrait =
        portraitImages[randomIndex(portraitImages.length)]?.urls?.full;

      if (!cover || !portrait) continue;

      const gallery = [
        landscapeImages[randomIndex(landscapeImages.length)]?.urls?.full,
        landscapeImages[randomIndex(landscapeImages.length)]?.urls?.full,
      ].filter(Boolean);

      await prisma.event.update({
        where: { id: event.id },
        data: {
          coverImage: cover,
          portraitImage: portrait,
          galleryImages: gallery,
        },
      });
    }

    console.log(`Updated ${events.length} ${eventType} events`);
  }
}


main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
