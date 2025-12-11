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
      return "event";
    default:
      return "event";
  }
};

const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateUrl = (
  query: string,
  orientation: "landscape" | "portrait" | "squarish" = "landscape",
  limit: number = 10
) => {
  return `https://api.unsplash.com/search/photos?client_id=GcDvkttRs2WE0WvMBf3oRc2rQ7W-Uuv6mDfolAwANeQ&query=${getQuery(
    query
  )}&orientation=${orientation}&per_page=${limit}`;
};

async function main() {
  const allEventTypes = Object.values(EventType);
  allEventTypes.map(async (eventType) => {
    const totalRecords = await prisma.event.count({
      where: {
        type: eventType,
      },
    });

    console.log("Event Type - ", eventType, " Records - ", totalRecords);

    const fetchLandscapeImages = await fetch(
      generateUrl(eventType, "landscape", 6)
    );

    const jsonifiedLandscapeImages = await fetchLandscapeImages.json();

    const landscapeImages = jsonifiedLandscapeImages.results;

    const fetchPortraitImages = await fetch(
      generateUrl(eventType, "portrait", 6)
    );

    const jsonifiedPortraitImages = await fetchPortraitImages.json();

    const portraitImages = jsonifiedPortraitImages.results;

    await prisma.event
      .updateMany({
        where: {
          type: eventType,
          coverImage: null,
          portraitImage: null,
        },
        data: {
          coverImage:
            landscapeImages[randomInt(0, landscapeImages.length)]?.urls?.full,
          portraitImage:
            portraitImages[randomInt(0, portraitImages.length)].urls.full,
          galleryImages: [
            landscapeImages[randomInt(0, landscapeImages.length)].urls.full,
            landscapeImages[randomInt(0, landscapeImages.length)].urls.full,
          ],
        },
      })
      .then((res) => {
        console.log("Updated ", eventType);
      });
  });
}

main();
