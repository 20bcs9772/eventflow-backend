// prisma/seed-happening-now.ts
import { PrismaClient } from "@prisma/client";
import { customAlphabet } from "nanoid";
const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 8);

const generateShortCode = async (): Promise<string> => {
  let shortCode: string;
  let exists = true;

  while (exists) {
    shortCode = nanoid();
    const existing = await prisma.event.findUnique({
      where: { shortCode },
    });
    exists = !!existing;
  }

  return shortCode!;
};
const prisma = new PrismaClient();

async function main() {
  console.log("⏳ Seeding Happening-Now Events...\n");

  // Fetch existing admins & guests
  const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
  const guests = await prisma.user.findMany({ where: { role: "GUEST" } });

  if (admins.length < 3) {
    console.error(
      "❌ Need at least 3 admins seeded before running this script."
    );
    process.exit(1);
  }

  const [admin1, admin2, admin3] = admins;

  const now = new Date();

  const happeningNowTemplates = [
    {
      name: "Live Tech Meetup - In Progress",
      description:
        "Join us for an ongoing tech discussion. We're live right now!",
      type: "CORPORATE" as const,
      visibility: "PUBLIC" as const,
      admin: admin1,
      hoursFromNow: -1, // Started 1 hour ago
      duration: 3,
      location: "Tech Hub, 150 Innovation Street, San Francisco, CA 94105",
    },
    {
      name: "Afternoon Coffee Networking",
      description:
        "Casual networking event happening right now. Drop by for coffee and connections!",
      type: "CORPORATE" as const,
      visibility: "PUBLIC" as const,
      admin: admin2,
      hoursFromNow: -0.5, // Started 30 minutes ago
      duration: 2,
      location: "Coffee House, 200 Main Street, Seattle, WA 98101",
    },
    {
      name: "Lunch & Learn Session",
      description:
        "Educational session with free lunch. Currently in progress!",
      type: "CORPORATE" as const,
      visibility: "PUBLIC" as const,
      admin: admin3,
      hoursFromNow: 0, // Starting now
      duration: 2,
      location: "Conference Room, 300 Business Park, Austin, TX 78701",
    },
    {
      name: "Evening Yoga Class",
      description: "Relaxing evening yoga session. Starting soon!",
      type: "OTHER" as const,
      visibility: "PUBLIC" as const,
      admin: admin1,
      hoursFromNow: 1, // Starting in 1 hour
      duration: 1.5,
      location: "Yoga Studio, 400 Wellness Avenue, Portland, OR 97201",
    },
    {
      name: "Happy Hour Social",
      description:
        "After-work social gathering with drinks and appetizers. Join us in a few hours!",
      type: "OTHER" as const,
      visibility: "PUBLIC" as const,
      admin: admin2,
      hoursFromNow: 3, // Starting in 3 hours
      duration: 3,
      location: "Rooftop Bar, 500 Social Street, New York, NY 10001",
    },
    {
      name: "Dinner & Discussion",
      description:
        "Intimate dinner with engaging conversation. Reserve your spot!",
      type: "OTHER" as const,
      visibility: "PUBLIC" as const,
      admin: admin3,
      hoursFromNow: 5, // Starting in 5 hours
      duration: 3,
      location: "Fine Dining Restaurant, 600 Gourmet Lane, Chicago, IL 60601",
    },
    {
      name: "Late Night Music Session",
      description: "Live music performance starting tonight. Don't miss it!",
      type: "OTHER" as const,
      visibility: "PUBLIC" as const,
      admin: admin1,
      hoursFromNow: 8, // Starting in 8 hours
      duration: 4,
      location: "Music Venue, 700 Sound Avenue, Nashville, TN 37201",
    },
    {
      name: "Early Morning Fitness Bootcamp",
      description:
        "Start your day with an energizing workout. Tomorrow morning!",
      type: "OTHER" as const,
      visibility: "PUBLIC" as const,
      admin: admin2,
      hoursFromNow: 12, // Starting in 12 hours (tomorrow morning)
      duration: 1.5,
      location: "Fitness Center, 800 Health Road, Denver, CO 80201",
    },
    {
      name: "Midday Workshop",
      description: "Hands-on workshop on creative skills. Tomorrow afternoon!",
      type: "CORPORATE" as const,
      visibility: "PUBLIC" as const,
      admin: admin3,
      hoursFromNow: 18, // Starting in 18 hours
      duration: 4,
      location: "Workshop Space, 900 Creative Drive, Los Angeles, CA 90001",
    },
    {
      name: "Sunset Photography Walk",
      description:
        "Guided photography walk during golden hour. Tomorrow evening!",
      type: "OTHER" as const,
      visibility: "UNLISTED" as const,
      admin: admin1,
      hoursFromNow: 22, // Starting in 22 hours (just before 24-hour cutoff)
      duration: 2,
      location: "Scenic Park, 1000 Nature Trail, San Diego, CA 92101",
    },
    {
      name: "Hellfire Gala – Live Runway Show",
      description:
        "Mutant high-fashion showcase currently underway. Telepathic commentary included.",
      type: "OTHER" as const,
      visibility: "PUBLIC" as const,
      admin: admin1,
      hoursFromNow: -1.2, // Started 1 hour 12 minutes ago
      duration: 3,
      location: "Hellfire Mansion, Krakoa Island",
    },
    {
      name: "Star Wars Jedi Training Session – In Progress",
      description:
        "Lightsaber forms and Force guidance happening now. Padawans encouraged to join.",
      type: "OTHER" as const,
      visibility: "PUBLIC" as const,
      admin: admin2,
      hoursFromNow: -0.3, // Started ~20 minutes ago
      duration: 2.5,
      location: "Jedi Temple Courtyard, Coruscant",
    },
    {
      name: "Hogwarts Magic Workshop – Starting Now",
      description:
        "Spellcasting basics with Professor McGonagall. Wand safety advised.",
      type: "OTHER" as const,
      visibility: "PUBLIC" as const,
      admin: admin3,
      hoursFromNow: 0, // Starting now
      duration: 2,
      location: "Transfiguration Courtyard, Hogwarts Castle",
    },
    {
      name: "The Boys PR Press Conference",
      description:
        "Vought is live now doing damage control after another supe incident.",
      type: "CORPORATE" as const,
      visibility: "PUBLIC" as const,
      admin: admin1,
      hoursFromNow: -0.8, // Started 48 minutes ago
      duration: 1.5,
      location: "Vought Tower Auditorium, New York City",
    },
    {
      name: "The Shire Ale Festival – Starting Soon",
      description:
        "Second breakfast specials and live Hobbit music beginning shortly.",
      type: "OTHER" as const,
      visibility: "PUBLIC" as const,
      admin: admin2,
      hoursFromNow: 1.1, // Starts in 1 hour 6 minutes
      duration: 5,
      location: "Green Dragon Inn, Hobbiton, The Shire",
    },
    {
      name: "Spider-Verse Rooftop Mixer",
      description:
        "Interdimensional meetup happening later tonight. BYO web-shooters.",
      type: "OTHER" as const,
      visibility: "PUBLIC" as const,
      admin: admin3,
      hoursFromNow: 3.5, // Starts in ~3.5 hours
      duration: 3,
      location: "Brooklyn Rooftop, Earth-1610",
    },
    {
      name: "Stranger Things Arcade Showdown",
      description:
        "A live arcade tournament. Some opponents may be from the Upside Down.",
      type: "OTHER" as const,
      visibility: "PUBLIC" as const,
      admin: admin1,
      hoursFromNow: 5, // Starts in 5 hours
      duration: 3,
      location: "Starcourt Mall Arcade, Hawkins, Indiana",
    },
    {
      name: "Winterfell Feast Prep – Happening Tonight",
      description:
        "Stark kitchens are preparing for tonight’s feast. Warm mead to be served.",
      type: "OTHER" as const,
      visibility: "UNLISTED" as const,
      admin: admin2,
      hoursFromNow: 8, // Starts in 8 hours
      duration: 4,
      location: "Great Hall, Winterfell",
    },
    {
      name: "Breaking Bad Chemistry Crash Course",
      description:
        "Heisenberg’s legal educational demo starts tomorrow morning.",
      type: "CORPORATE" as const,
      visibility: "UNLISTED" as const,
      admin: admin3,
      hoursFromNow: 12, // Starts in 12 hours
      duration: 2,
      location: "ABQ Science Center, Albuquerque",
    },
    {
      name: "Wakanda Future Tech Preview",
      description:
        "A live exhibition of vibranium-powered prototypes happening tomorrow afternoon.",
      type: "CORPORATE" as const,
      visibility: "PUBLIC" as const,
      admin: admin1,
      hoursFromNow: 18, // Starts in 18 hours
      duration: 4,
      location: "Birnin Zana Research Dome, Wakanda",
    },
  ];

  let scheduleCount = 0;
  let guestEventCount = 0;
  let announcementCount = 0;

  for (const template of happeningNowTemplates) {
    const eventStart = new Date(now);
    eventStart.setHours(eventStart.getHours() + template.hoursFromNow);
    eventStart.setMinutes(
      eventStart.getMinutes() + (template.hoursFromNow % 1) * 60
    );

    const eventEnd = new Date(eventStart);
    eventEnd.setHours(eventEnd.getHours() + template.duration);

    // Create event
    const event = await prisma.event.create({
      data: {
        name: template.name,
        description: template.description,
        shortCode: await generateShortCode(),
        startDate: eventStart,
        endDate: eventEnd,
        visibility: template.visibility as any,
        type: template.type as any,
        location: template.location,
        adminId: template.admin.id,
      },
    });

    console.log(`✅ Created event: ${event.name}`);

    // Create schedule items
    const scheduleItems = [
      { title: "Welcome", startRatio: 0, endRatio: 0.3, location: "Entrance" },
      {
        title: "Main Activity",
        startRatio: 0.3,
        endRatio: template.duration,
        location: "Hall",
      },
    ];

    for (let i = 0; i < scheduleItems.length; i++) {
      const item = scheduleItems[i];

      const itemStart = new Date(eventStart);
      itemStart.setHours(eventStart.getHours() + item.startRatio);

      const itemEnd = new Date(eventStart);
      itemEnd.setHours(eventStart.getHours() + item.endRatio);

      await prisma.scheduleItem.create({
        data: {
          eventId: event.id,
          title: item.title,
          description: `${item.title} at ${item.location}`,
          startTime: itemStart,
          endTime: itemEnd,
          location: item.location,
          orderIndex: i,
          createdBy: template.admin.id,
        },
      });

      scheduleCount++;
    }

    // Add guests
    const shuffledGuests = guests.sort(() => Math.random() - 0.5);
    const numGuests = Math.floor(Math.random() * 10) + 5;

    for (let i = 0; i < numGuests; i++) {
      const guest = shuffledGuests[i];
      if (!guest) continue;

      const rand = Math.random();
      const status =
        template.hoursFromNow <= 0
          ? rand < 0.5
            ? "CHECKED_IN"
            : rand < 0.8
            ? "JOINED"
            : "INVITED"
          : rand < 0.4
          ? "JOINED"
          : rand < 0.6
          ? "CHECKED_IN"
          : "INVITED";

      await prisma.guestEvent.create({
        data: {
          userId: guest.id,
          eventId: event.id,
          status: status as any,
          joinedAt: status !== "INVITED" ? new Date() : null,
          checkedInAt: status === "CHECKED_IN" ? new Date() : null,
        },
      });

      guestEventCount++;
    }

    // Announcements
    const announcementMessages = [
      { title: "Event Starting Soon", message: "Get ready!" },
      { title: "Live Now", message: "We're live right now!" },
    ];

    for (let a = 0; a < 2; a++) {
      await prisma.announcement.create({
        data: {
          eventId: event.id,
          senderId: template.admin.id,
          title: announcementMessages[a].title,
          message: announcementMessages[a].message,
        },
      });
      announcementCount++;
    }
  }

  console.log(`
🎉 Done seeding happening-now events!
⭐ Events: ${happeningNowTemplates.length}
🗓️ Schedule Items: ${scheduleCount}
👥 GuestEvent Records: ${guestEventCount}
📢 Announcements: ${announcementCount}
`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err);
    prisma.$disconnect();
    process.exit(1);
  });
