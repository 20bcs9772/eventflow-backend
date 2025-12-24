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
  limit = 12
) =>
  `https://api.unsplash.com/search/photos?client_id=GcDvkttRs2WE0WvMBf3oRc2rQ7W-Uuv6mDfolAwANeQ&query=${getQuery(
    query
  )}&orientation=${orientation}&per_page=${limit}`;

// Cache for images per event type to avoid redundant API calls
const imageCache = new Map<
  EventType,
  { landscape: string[]; portrait: string[] }
>();

/**
 * Fetch images for an event type (with caching)
 */
async function fetchImagesForEventType(
  eventType: EventType
): Promise<{ landscape: string[]; portrait: string[] } | null> {
  // Check cache first
  if (imageCache.has(eventType)) {
    return imageCache.get(eventType)!;
  }

  try {
    const [landscapeRes, portraitRes] = await Promise.all([
      fetch(generateUrl(eventType, "landscape", 12)),
      fetch(generateUrl(eventType, "portrait", 12)),
    ]);

    const landscapeData = (await landscapeRes.json())?.results ?? [];
    const portraitData = (await portraitRes.json())?.results ?? [];

    if (!landscapeData.length || !portraitData.length) {
      return null;
    }

    const landscapeUrls = landscapeData
      .map((img: any) => img?.urls?.full)
      .filter(Boolean);
    const portraitUrls = portraitData
      .map((img: any) => img?.urls?.full)
      .filter(Boolean);

    if (!landscapeUrls.length || !portraitUrls.length) {
      return null;
    }

    const images = { landscape: landscapeUrls, portrait: portraitUrls };
    imageCache.set(eventType, images);
    return images;
  } catch (error) {
    console.warn(`Failed to fetch images for ${eventType}:`, error);
    return null;
  }
}

/**
 * Get random images from fetched image arrays
 */
function getRandomImages(
  eventType: EventType,
  images: { landscape: string[]; portrait: string[] }
): {
  coverImage: string;
  portraitImage: string;
  galleryImages: string[];
} {
  const cover =
    images.landscape[randomIndex(images.landscape.length)] ||
    images.landscape[0];
  const portrait =
    images.portrait[randomIndex(images.portrait.length)] ||
    images.portrait[0];

  // Get 2 random gallery images (can be duplicates, that's fine)
  const gallery = [
    images.landscape[randomIndex(images.landscape.length)],
    images.landscape[randomIndex(images.landscape.length)],
  ].filter(Boolean);

  return {
    coverImage: cover,
    portraitImage: portrait,
    galleryImages: gallery,
  };
}

/**
 * Get image URLs for an event type (for use during event creation)
 * This function fetches images if not cached and returns random image URLs
 * @param eventType - The type of event
 * @returns Object with coverImage, portraitImage, and galleryImages URLs, or null if fetch fails
 */
export async function getImagesForEventType(
  eventType: EventType
): Promise<{
  coverImage: string;
  portraitImage: string;
  galleryImages: string[];
} | null> {
  const images = await fetchImagesForEventType(eventType);
  if (!images) {
    return null;
  }

  return getRandomImages(eventType, images);
}

/**
 * Add images to events by their IDs
 * Optimized with batch updates
 */
export async function addImagesToEvents(
  eventIds: string[],
  prismaClient: PrismaClient = prisma
): Promise<void> {
  if (!eventIds.length) return;

  // Get events with their types
  const events = await prismaClient.event.findMany({
    where: { id: { in: eventIds } },
    select: { id: true, type: true },
  });

  if (!events.length) return;

  // Group events by type for efficient image fetching
  const eventsByType = new Map<EventType, string[]>();
  for (const event of events) {
    if (!eventsByType.has(event.type)) {
      eventsByType.set(event.type, []);
    }
    eventsByType.get(event.type)!.push(event.id);
  }

  // Fetch images for all types in parallel
  const imagePromises = Array.from(eventsByType.keys()).map((type) =>
    fetchImagesForEventType(type).then((images) => ({ type, images }))
  );

  const imageResults = await Promise.all(imagePromises);
  const imagesByType = new Map<EventType, { landscape: string[]; portrait: string[] }>();

  for (const { type, images } of imageResults) {
    if (images) {
      imagesByType.set(type, images);
    }
  }

  // Batch update events by type
  const updatePromises: Promise<any>[] = [];

  for (const [eventType, eventIdsForType] of eventsByType.entries()) {
    const images = imagesByType.get(eventType);
    if (!images) {
      console.warn(`No images available for ${eventType}, skipping ${eventIdsForType.length} events`);
      continue;
    }

    // Create update data for all events of this type
    const updates = eventIdsForType.map((eventId) => {
      const imageData = getRandomImages(eventType, images);
      return prismaClient.event.update({
        where: { id: eventId },
        data: imageData,
      });
    });

    updatePromises.push(...updates);
  }

  // Execute all updates in parallel (batched by Prisma)
  await Promise.all(updatePromises);
}

/**
 * Add images to events by event type
 * Optimized with batch operations
 */
export async function addImagesToEventsByType(
  eventType: EventType,
  prismaClient: PrismaClient = prisma
): Promise<number> {
  const events = await prismaClient.event.findMany({
    where: {
      type: eventType,
      coverImage: null,
      portraitImage: null,
    },
    select: { id: true },
  });

  if (!events.length) return 0;

  const eventIds = events.map((e) => e.id);
  await addImagesToEvents(eventIds, prismaClient);
  return events.length;
}

/**
 * Main function to update all events without images
 * Can be run independently as a script
 */
async function main() {
  console.log("🖼️  Starting image update process...\n");

  const allEventTypes = Object.values(EventType);
  let totalUpdated = 0;

  // Process all event types in parallel
  const updatePromises = allEventTypes.map(async (eventType) => {
    console.log(`📸 Processing ${eventType} events...`);
    const count = await addImagesToEventsByType(eventType);
    if (count > 0) {
      console.log(`✅ Updated ${count} ${eventType} events`);
    } else {
      console.log(`⏭️  No ${eventType} events to update`);
    }
    return count;
  });

  const counts = await Promise.all(updatePromises);
  totalUpdated = counts.reduce((sum, count) => sum + count, 0);

  console.log(`\n✨ Image update completed! Updated ${totalUpdated} events total.`);
}

// Run as script if executed directly
if (require.main === module) {
  main()
    .catch(console.error)
    .finally(async () => {
      await prisma.$disconnect();
    });
}
