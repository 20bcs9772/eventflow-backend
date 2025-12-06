import { PrismaClient } from '@prisma/client';
import { customAlphabet } from 'nanoid';

const prisma = new PrismaClient();

// Generate unique short code (same as in event.service.ts)
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);

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

async function main() {
  console.log('🌱 Starting database seeding...\n');

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log('🧹 Cleaning existing data...');
  await prisma.notificationLog.deleteMany();
  await prisma.guestEvent.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.scheduleItem.deleteMany();
  await prisma.event.deleteMany();
  await prisma.device.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Cleaned existing data\n');

  // Create Admin Users
  console.log('👤 Creating admin users...');
  const admin1 = await prisma.user.create({
    data: {
      firebaseUid: 'firebase-admin-1',
      email: 'admin1@eventflow.com',
      name: 'John Admin',
      avatarUrl: 'https://i.pravatar.cc/150?img=1',
      authProvider: 'EMAIL',
      role: 'ADMIN',
    },
  });

  const admin2 = await prisma.user.create({
    data: {
      firebaseUid: 'firebase-admin-2',
      email: 'admin2@eventflow.com',
      name: 'Sarah Organizer',
      avatarUrl: 'https://i.pravatar.cc/150?img=5',
      authProvider: 'GOOGLE',
      role: 'ADMIN',
    },
  });

  const admin3 = await prisma.user.create({
    data: {
      firebaseUid: 'firebase-admin-3',
      email: 'admin3@eventflow.com',
      name: 'Mike Event Manager',
      avatarUrl: 'https://i.pravatar.cc/150?img=12',
      authProvider: 'EMAIL',
      role: 'ADMIN',
    },
  });
  console.log(`✅ Created ${3} admin users\n`);

  // Create Guest Users
  console.log('👥 Creating guest users...');
  const guests = [];
  const guestNames = [
    'Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Prince', 'Eve Wilson',
    'Frank Miller', 'Grace Lee', 'Henry Davis', 'Ivy Chen', 'Jack Taylor',
    'Kate Anderson', 'Liam O\'Brien', 'Mia Rodriguez', 'Noah Kim', 'Olivia White',
    'Paul Martinez', 'Quinn Thompson', 'Rachel Green', 'Sam Wilson', 'Tina Park',
    'Uma Sharma', 'Victor Chen', 'Wendy Johnson', 'Xavier Lee', 'Yuki Tanaka',
    'Zoe Williams', 'Alex Rivera', 'Blake Cooper', 'Casey Morgan', 'Drew Foster',
    'Emma Stone', 'Felix Brown', 'Gina Lopez', 'Hugo Silva', 'Isla Martinez',
    // Marvel Characters
    'Peter Parker', 'Tony Stark', 'Steve Rogers', 'Natasha Romanoff', 'Bruce Banner',
    'Thor Odinson', 'Wanda Maximoff', 'Scott Lang', 'Carol Danvers', 'T\'Challa',
    'Wade Wilson', 'Logan Howlett', 'Jean Grey', 'Charles Xavier', 'Erik Lehnsherr',
    'Ororo Munroe', 'Kurt Wagner', 'Kitty Pryde', 'Bobby Drake', 'Rogue',
    // DC Characters
    'Clark Kent', 'Bruce Wayne', 'Diana Prince', 'Barry Allen', 'Arthur Curry',
    'Hal Jordan', 'Oliver Queen', 'J\'onn J\'onzz', 'Victor Stone', 'Kara Zor-El',
    // The Boys / Invincible
    'Hughie Campbell', 'Billy Butcher', 'Annie January', 'Mark Grayson', 'Omni-Man',
    // Star Wars
    'Luke Skywalker', 'Leia Organa', 'Han Solo', 'Obi-Wan Kenobi', 'Anakin Skywalker',
    'Padmé Amidala', 'Rey Palpatine', 'Finn', 'Poe Dameron', 'Ahsoka Tano',
    // Harry Potter
    'Harry Potter', 'Hermione Granger', 'Ron Weasley', 'Draco Malfoy', 'Luna Lovegood',
    'Neville Longbottom', 'Ginny Weasley', 'Severus Snape', 'Albus Dumbledore', 'Minerva McGonagall',
    // LOTR
    'Frodo Baggins', 'Samwise Gamgee', 'Aragorn', 'Legolas', 'Gimli',
    'Gandalf', 'Boromir', 'Merry Brandybuck', 'Pippin Took', 'Arwen',
    // Stranger Things
    'Eleven', 'Mike Wheeler', 'Dustin Henderson', 'Lucas Sinclair', 'Will Byers',
    'Max Mayfield', 'Steve Harrington', 'Nancy Wheeler', 'Jonathan Byers', 'Jim Hopper',
    // Game of Thrones
    'Jon Snow', 'Daenerys Targaryen', 'Tyrion Lannister', 'Arya Stark', 'Sansa Stark',
    'Cersei Lannister', 'Jaime Lannister', 'Brienne of Tarth', 'Samwell Tarly', 'Bran Stark',
    // Anime
    'Naruto Uzumaki', 'Goku', 'Luffy', 'Ichigo Kurosaki', 'Light Yagami',
    'Eren Yeager', 'Levi Ackerman', 'Tanjiro Kamado', 'Edward Elric', 'Spike Spiegel',
    // Hollywood / The Devil Wears Prada
    'Miranda Priestly', 'Andy Sachs', 'Emily Charlton', 'Nigel Kipling',
    // Breaking Bad
    'Walter White', 'Jesse Pinkman', 'Saul Goodman', 'Gus Fring',
    // Spider-Verse
    'Miles Morales', 'Gwen Stacy', 'Peter B. Parker', 'Spider-Ham',
    // Wakanda
    'Shuri', 'Okoye', 'Nakia', 'M\'Baku',
  ];

  for (let i = 0; i < guestNames.length; i++) {
    const guest = await prisma.user.create({
      data: {
        firebaseUid: `firebase-guest-${i + 1}`,
        email: `guest${i + 1}@example.com`,
        name: guestNames[i],
        avatarUrl: `https://i.pravatar.cc/150?img=${i + 3}`,
        authProvider: i % 3 === 0 ? 'EMAIL' : i % 3 === 1 ? 'GOOGLE' : 'APPLE',
        role: 'GUEST',
      },
    });
    guests.push(guest);
  }
  console.log(`✅ Created ${guests.length} guest users\n`);

  // Create Devices for some users
  console.log('📱 Creating devices...');
  const deviceTypes = ['IOS', 'ANDROID', 'WEB'] as const;
  let deviceCount = 0;

  // Add devices to admins
  for (const admin of [admin1, admin2, admin3]) {
    for (let i = 0; i < 2; i++) {
      await prisma.device.create({
        data: {
          userId: admin.id,
          fcmToken: `fcm-token-${admin.id}-${i}-${Date.now()}`,
          deviceType: deviceTypes[i % 3],
        },
      });
      deviceCount++;
    }
  }

  // Add devices to guests (more devices for better testing)
  for (let i = 0; i < guests.length; i++) {
    // Each guest gets at least one device, some get two
    await prisma.device.create({
      data: {
        userId: guests[i].id,
        fcmToken: `fcm-token-${guests[i].id}-1-${Date.now()}`,
        deviceType: deviceTypes[i % 3],
      },
    });
    deviceCount++;
    
    // Every third guest gets a second device
    if (i % 3 === 0) {
      await prisma.device.create({
        data: {
          userId: guests[i].id,
          fcmToken: `fcm-token-${guests[i].id}-2-${Date.now()}`,
          deviceType: deviceTypes[(i + 1) % 3],
        },
      });
      deviceCount++;
    }
  }
  console.log(`✅ Created ${deviceCount} devices\n`);

  // Create Events
  console.log('🎉 Creating events...');
  const now = new Date();
  const events: any[] = [];

  // Wedding Event
  const weddingStart = new Date(now);
  weddingStart.setMonth(weddingStart.getMonth() + 2);
  weddingStart.setHours(14, 0, 0, 0);
  const weddingEnd = new Date(weddingStart);
  weddingEnd.setHours(22, 0, 0, 0);

  const wedding = await prisma.event.create({
    data: {
      name: 'Summer Garden Wedding',
      description: 'A beautiful outdoor wedding celebration in the garden. Join us for an unforgettable day filled with love, laughter, and joy.',
      shortCode: await generateShortCode(),
      startDate: weddingStart,
      endDate: weddingEnd,
      location: 'Garden Venue, 123 Main Street, New York, NY 10001',
      visibility: 'PUBLIC',
      type: 'WEDDING',
      adminId: admin1.id,
    },
  });
  events.push(wedding);

  // Birthday Event
  const birthdayStart = new Date(now);
  birthdayStart.setDate(birthdayStart.getDate() + 7);
  birthdayStart.setHours(18, 0, 0, 0);
  const birthdayEnd = new Date(birthdayStart);
  birthdayEnd.setHours(23, 0, 0, 0);

  const birthday = await prisma.event.create({
    data: {
      name: '30th Birthday Bash',
      description: 'Join us for a night of celebration, music, and fun!',
      shortCode: await generateShortCode(),
      startDate: birthdayStart,
      endDate: birthdayEnd,
      location: 'Rooftop Bar, 456 Park Avenue, New York, NY 10002',
      visibility: 'PUBLIC',
      type: 'BIRTHDAY',
      adminId: admin2.id,
    },
  });
  events.push(birthday);

  // Corporate Event
  const corporateStart = new Date(now);
  corporateStart.setMonth(corporateStart.getMonth() + 1);
  corporateStart.setDate(15);
  corporateStart.setHours(9, 0, 0, 0);
  const corporateEnd = new Date(corporateStart);
  corporateEnd.setHours(17, 0, 0, 0);

  const corporate = await prisma.event.create({
    data: {
      name: 'Annual Tech Conference 2024',
      description: 'Join industry leaders for a day of innovation, networking, and insights into the future of technology.',
      shortCode: await generateShortCode(),
      startDate: corporateStart,
      endDate: corporateEnd,
      location: 'Convention Center, 789 Business Blvd, San Francisco, CA 94102',
      visibility: 'PUBLIC',
      type: 'CORPORATE',
      adminId: admin3.id,
    },
  });
  events.push(corporate);

  // College Fest
  const festStart = new Date(now);
  festStart.setMonth(festStart.getMonth() + 3);
  festStart.setDate(1);
  festStart.setHours(10, 0, 0, 0);
  const festEnd = new Date(festStart);
  festEnd.setDate(festEnd.getDate() + 2);
  festEnd.setHours(22, 0, 0, 0);

  const collegeFest = await prisma.event.create({
    data: {
      name: 'Spring Music Festival',
      description: 'Three days of music, food, and fun! Featuring local and international artists.',
      shortCode: await generateShortCode(),
      startDate: festStart,
      endDate: festEnd,
      location: 'University Campus, 321 College Road, Boston, MA 02115',
      visibility: 'PUBLIC',
      type: 'COLLEGE_FEST',
      adminId: admin1.id,
    },
  });
  events.push(collegeFest);

  // Private Event
  const privateStart = new Date(now);
  privateStart.setDate(privateStart.getDate() + 14);
  privateStart.setHours(19, 0, 0, 0);
  const privateEnd = new Date(privateStart);
  privateEnd.setHours(23, 0, 0, 0);

  const privateEvent = await prisma.event.create({
    data: {
      name: 'Exclusive VIP Dinner',
      description: 'An intimate dinner gathering for close friends and family.',
      shortCode: await generateShortCode(),
      startDate: privateStart,
      endDate: privateEnd,
      location: 'Private Residence, 555 Elite Street, Los Angeles, CA 90001',
      visibility: 'PRIVATE',
      type: 'OTHER',
      adminId: admin2.id,
    },
  });
  events.push(privateEvent);

  // Initialize counters
  let scheduleCount = 0;
  let guestEventCount = 0;
  let announcementCount = 0;

  // Create events happening NOW (for /happening-now endpoint testing)
  console.log('⏰ Creating events happening now...');
  
  const happeningNowEvents = [
    {
      name: 'Live Tech Meetup - In Progress',
      description: 'Join us for an ongoing tech discussion. We\'re live right now!',
      type: 'CORPORATE' as const,
      visibility: 'PUBLIC' as const,
      admin: admin1,
      hoursFromNow: -1, // Started 1 hour ago
      duration: 3,
      location: 'Tech Hub, 150 Innovation Street, San Francisco, CA 94105',
    },
    {
      name: 'Afternoon Coffee Networking',
      description: 'Casual networking event happening right now. Drop by for coffee and connections!',
      type: 'CORPORATE' as const,
      visibility: 'PUBLIC' as const,
      admin: admin2,
      hoursFromNow: -0.5, // Started 30 minutes ago
      duration: 2,
      location: 'Coffee House, 200 Main Street, Seattle, WA 98101',
    },
    {
      name: 'Lunch & Learn Session',
      description: 'Educational session with free lunch. Currently in progress!',
      type: 'CORPORATE' as const,
      visibility: 'PUBLIC' as const,
      admin: admin3,
      hoursFromNow: 0, // Starting now
      duration: 2,
      location: 'Conference Room, 300 Business Park, Austin, TX 78701',
    },
    {
      name: 'Evening Yoga Class',
      description: 'Relaxing evening yoga session. Starting soon!',
      type: 'OTHER' as const,
      visibility: 'PUBLIC' as const,
      admin: admin1,
      hoursFromNow: 1, // Starting in 1 hour
      duration: 1.5,
      location: 'Yoga Studio, 400 Wellness Avenue, Portland, OR 97201',
    },
    {
      name: 'Happy Hour Social',
      description: 'After-work social gathering with drinks and appetizers. Join us in a few hours!',
      type: 'OTHER' as const,
      visibility: 'PUBLIC' as const,
      admin: admin2,
      hoursFromNow: 3, // Starting in 3 hours
      duration: 3,
      location: 'Rooftop Bar, 500 Social Street, New York, NY 10001',
    },
    {
      name: 'Dinner & Discussion',
      description: 'Intimate dinner with engaging conversation. Reserve your spot!',
      type: 'OTHER' as const,
      visibility: 'PUBLIC' as const,
      admin: admin3,
      hoursFromNow: 5, // Starting in 5 hours
      duration: 3,
      location: 'Fine Dining Restaurant, 600 Gourmet Lane, Chicago, IL 60601',
    },
    {
      name: 'Late Night Music Session',
      description: 'Live music performance starting tonight. Don\'t miss it!',
      type: 'OTHER' as const,
      visibility: 'PUBLIC' as const,
      admin: admin1,
      hoursFromNow: 8, // Starting in 8 hours
      duration: 4,
      location: 'Music Venue, 700 Sound Avenue, Nashville, TN 37201',
    },
    {
      name: 'Early Morning Fitness Bootcamp',
      description: 'Start your day with an energizing workout. Tomorrow morning!',
      type: 'OTHER' as const,
      visibility: 'PUBLIC' as const,
      admin: admin2,
      hoursFromNow: 12, // Starting in 12 hours (tomorrow morning)
      duration: 1.5,
      location: 'Fitness Center, 800 Health Road, Denver, CO 80201',
    },
    {
      name: 'Midday Workshop',
      description: 'Hands-on workshop on creative skills. Tomorrow afternoon!',
      type: 'CORPORATE' as const,
      visibility: 'PUBLIC' as const,
      admin: admin3,
      hoursFromNow: 18, // Starting in 18 hours
      duration: 4,
      location: 'Workshop Space, 900 Creative Drive, Los Angeles, CA 90001',
    },
    {
      name: 'Sunset Photography Walk',
      description: 'Guided photography walk during golden hour. Tomorrow evening!',
      type: 'OTHER' as const,
      visibility: 'UNLISTED' as const,
      admin: admin1,
      hoursFromNow: 22, // Starting in 22 hours (just before 24-hour cutoff)
      duration: 2,
      location: 'Scenic Park, 1000 Nature Trail, San Diego, CA 92101',
    },
  ];

  for (const template of happeningNowEvents) {
    const eventStart = new Date(now);
    eventStart.setHours(eventStart.getHours() + template.hoursFromNow);
    eventStart.setMinutes(eventStart.getMinutes() + (template.hoursFromNow % 1) * 60);
    const eventEnd = new Date(eventStart);
    eventEnd.setHours(eventEnd.getHours() + template.duration);

    const newEvent = await prisma.event.create({
      data: {
        name: template.name,
        description: template.description,
        shortCode: await generateShortCode(),
        startDate: eventStart,
        endDate: eventEnd,
        location: template.location,
        visibility: template.visibility,
        type: template.type,
        adminId: template.admin.id,
      },
    });
    events.push(newEvent);

    // Add schedule items for happening-now events
    const scheduleItems = [
      { title: 'Welcome & Check-in', startTime: 0, endTime: 0.25, location: 'Entrance' },
      { title: 'Main Activity', startTime: 0.25, endTime: template.duration - 0.25, location: 'Main Area' },
      { title: 'Closing & Networking', startTime: template.duration - 0.25, endTime: template.duration, location: 'Networking Area' },
    ];

    for (let j = 0; j < scheduleItems.length; j++) {
      const item = scheduleItems[j];
      const startTime = new Date(eventStart);
      startTime.setHours(startTime.getHours() + item.startTime);
      startTime.setMinutes(startTime.getMinutes() + (item.startTime % 1) * 60);
      const endTime = new Date(eventStart);
      endTime.setHours(endTime.getHours() + item.endTime);
      endTime.setMinutes(endTime.getMinutes() + (item.endTime % 1) * 60);

      await prisma.scheduleItem.create({
        data: {
          eventId: newEvent.id,
          title: item.title,
          description: `${item.title} at ${item.location}`,
          startTime,
          endTime,
          location: item.location,
          orderIndex: j,
          createdBy: template.admin.id,
        },
      });
      scheduleCount++;
    }

    // Add guests to happening-now events
    const numGuests = Math.floor(Math.random() * 10) + 5; // 5-15 guests
    const shuffledGuests = [...guests].sort(() => Math.random() - 0.5);
    
    // Track which guests we've already added to this event to avoid duplicates
    const addedGuestIds = new Set<string>();
    
    for (let j = 0; j < numGuests && j < shuffledGuests.length; j++) {
      const guest = shuffledGuests[j];
      
      // Skip if this guest is already added to this event
      if (addedGuestIds.has(guest.id)) {
        continue;
      }
      
      // Check if this guest-event relationship already exists
      const existing = await prisma.guestEvent.findUnique({
        where: {
          userId_eventId: {
            userId: guest.id,
            eventId: newEvent.id,
          },
        },
      });
      
      // Skip if relationship already exists
      if (existing) {
        continue;
      }
      
      let status: 'INVITED' | 'JOINED' | 'CHECKED_IN';
      const rand = Math.random();
      
      // For events happening now, more guests should be JOINED or CHECKED_IN
      if (template.hoursFromNow <= 0) {
        // Event already started - more checked in
        if (rand < 0.5) {
          status = 'CHECKED_IN';
        } else if (rand < 0.8) {
          status = 'JOINED';
        } else {
          status = 'INVITED';
        }
      } else {
        // Event hasn't started yet
        if (rand < 0.4) {
          status = 'JOINED';
        } else if (rand < 0.6) {
          status = 'CHECKED_IN';
        } else {
          status = 'INVITED';
        }
      }
      
      const joinedAt = status !== 'INVITED' ? new Date() : null;
      const checkedInAt = status === 'CHECKED_IN' ? new Date() : null;

      await prisma.guestEvent.create({
        data: {
          userId: guest.id,
          eventId: newEvent.id,
          status: status as any,
          joinedAt,
          checkedInAt,
        },
      });
      addedGuestIds.add(guest.id);
      guestEventCount++;
    }

    // Add announcements for happening-now events
    const announcementMessages = [
      { title: 'Event Starting Soon!', message: 'Get ready! The event will begin shortly.' },
      { title: 'Live Now!', message: 'We\'re live! Join us if you haven\'t already.' },
      { title: 'Reminder', message: 'Don\'t forget about the event happening today!' },
    ];

    const numAnnouncements = Math.floor(Math.random() * 3) + 1; // 1-3 announcements
    for (let j = 0; j < numAnnouncements; j++) {
      const announcement = announcementMessages[j % announcementMessages.length];
      const createdAt = new Date();
      createdAt.setHours(createdAt.getHours() - Math.floor(Math.random() * 6)); // Last 6 hours

      await prisma.announcement.create({
        data: {
          eventId: newEvent.id,
          senderId: template.admin.id,
          title: announcement.title,
          message: announcement.message,
          createdAt,
        },
      });
      announcementCount++;
    }
  }
  console.log(`✅ Created ${happeningNowEvents.length} events happening now\n`);

  console.log(`✅ Created ${events.length} events\n`);

  // Create Schedule Items
  console.log('📅 Creating schedule items...');

  // Create 15 more events with varied data
  const eventTemplates = [
    {
      name: 'Tech Startup Networking Night',
      description: 'Connect with fellow entrepreneurs, investors, and tech enthusiasts. Food, drinks, and great conversations!',
      type: 'CORPORATE' as const,
      visibility: 'PUBLIC' as const,
      admin: admin1,
      daysOffset: 10,
      startHour: 18,
      duration: 4,
      location: 'Innovation Hub, 100 Tech Street, Seattle, WA 98101',
    },
    {
      name: 'Annual Company Retreat',
      description: 'Join us for team building activities, workshops, and fun! A weekend of collaboration and celebration.',
      type: 'CORPORATE' as const,
      visibility: 'PRIVATE' as const,
      admin: admin2,
      daysOffset: 21,
      startHour: 9,
      duration: 48,
      location: 'Mountain Resort, 200 Retreat Lane, Aspen, CO 81611',
    },
    {
      name: 'Graduation Party 2024',
      description: 'Celebrate our graduates! Food, music, and memories. All friends and family welcome.',
      type: 'COLLEGE_FEST' as const,
      visibility: 'PUBLIC' as const,
      admin: admin3,
      daysOffset: 30,
      startHour: 16,
      duration: 6,
      location: 'University Quad, 500 Campus Drive, Austin, TX 78712',
    },
    {
      name: 'Summer BBQ & Games',
      description: 'Outdoor BBQ with games, music, and fun for the whole family. Bring your appetite!',
      type: 'OTHER' as const,
      visibility: 'PUBLIC' as const,
      admin: admin1,
      daysOffset: 5,
      startHour: 12,
      duration: 8,
      location: 'Community Park, 300 Park Avenue, Denver, CO 80202',
    },
    {
      name: 'Jazz Night at the Lounge',
      description: 'An evening of smooth jazz, cocktails, and sophisticated vibes. Dress code: Smart casual.',
      type: 'OTHER' as const,
      visibility: 'PUBLIC' as const,
      admin: admin2,
      daysOffset: 12,
      startHour: 20,
      duration: 4,
      location: 'The Blue Note Lounge, 150 Music Street, New Orleans, LA 70112',
    },
    {
      name: 'Product Launch Event',
      description: 'Be the first to see our revolutionary new product! Live demos, Q&A, and exclusive early access.',
      type: 'CORPORATE' as const,
      visibility: 'PUBLIC' as const,
      admin: admin3,
      daysOffset: 18,
      startHour: 14,
      duration: 5,
      location: 'Convention Hall, 400 Business Park, San Jose, CA 95110',
    },
    {
      name: 'Charity Gala Dinner',
      description: 'Elegant evening supporting local charities. Black tie optional. Silent auction and live entertainment.',
      type: 'OTHER' as const,
      visibility: 'PUBLIC' as const,
      admin: admin1,
      daysOffset: 25,
      startHour: 19,
      duration: 5,
      location: 'Grand Ballroom, 250 Luxury Avenue, Beverly Hills, CA 90210',
    },
    {
      name: 'Hackathon Weekend',
      description: '48-hour coding competition. Build something amazing, win prizes, and network with developers.',
      type: 'COLLEGE_FEST' as const,
      visibility: 'PUBLIC' as const,
      admin: admin2,
      daysOffset: 35,
      startHour: 9,
      duration: 48,
      location: 'Tech Campus, 600 Innovation Way, Cambridge, MA 02139',
    },
    {
      name: 'Wedding Reception - Evening Celebration',
      description: 'Join us for an evening of celebration, dancing, and joy. Formal attire requested.',
      type: 'WEDDING' as const,
      visibility: 'PUBLIC' as const,
      admin: admin3,
      daysOffset: 42,
      startHour: 18,
      duration: 6,
      location: 'Elegant Venue, 350 Celebration Drive, Miami, FL 33101',
    },
    {
      name: 'Kids Birthday Party',
      description: 'Fun-filled party with games, cake, and entertainment for kids of all ages. Parents welcome!',
      type: 'BIRTHDAY' as const,
      visibility: 'PUBLIC' as const,
      admin: admin1,
      daysOffset: 8,
      startHour: 14,
      duration: 4,
      location: 'Party Zone, 450 Fun Street, Orlando, FL 32801',
    },
    {
      name: 'Yoga & Wellness Retreat',
      description: 'A day of mindfulness, yoga sessions, meditation, and healthy meals. Rejuvenate your mind and body.',
      type: 'OTHER' as const,
      visibility: 'PUBLIC' as const,
      admin: admin2,
      daysOffset: 15,
      startHour: 8,
      duration: 10,
      location: 'Wellness Center, 550 Peaceful Lane, Sedona, AZ 86336',
    },
    {
      name: 'Art Gallery Opening',
      description: 'Exclusive preview of new contemporary art collection. Wine and hors d\'oeuvres served.',
      type: 'OTHER' as const,
      visibility: 'PUBLIC' as const,
      admin: admin3,
      daysOffset: 20,
      startHour: 18,
      duration: 3,
      location: 'Modern Art Gallery, 700 Culture Boulevard, Portland, OR 97201',
    },
    {
      name: 'Sports Watch Party',
      description: 'Big game viewing party! Large screens, great food, and enthusiastic fans. All welcome!',
      type: 'OTHER' as const,
      visibility: 'PUBLIC' as const,
      admin: admin1,
      daysOffset: 3,
      startHour: 17,
      duration: 5,
      location: 'Sports Bar, 800 Game Street, Chicago, IL 60601',
    },
    {
      name: 'Book Club Meeting',
      description: 'Monthly book discussion. This month: "The Future of Technology". Light refreshments provided.',
      type: 'OTHER' as const,
      visibility: 'UNLISTED' as const,
      admin: admin2,
      daysOffset: 28,
      startHour: 19,
      duration: 2,
      location: 'Cozy Library, 900 Reading Road, Portland, ME 04101',
    },
    {
      name: 'Cooking Class & Dinner',
      description: 'Learn to cook a gourmet meal, then enjoy it together! All skill levels welcome.',
      type: 'OTHER' as const,
      visibility: 'PUBLIC' as const,
      admin: admin3,
      daysOffset: 22,
      startHour: 17,
      duration: 4,
      location: 'Culinary Studio, 1000 Chef Avenue, San Francisco, CA 94102',
    },
    // Pop Culture Themed Events
    {
      name: 'X-Men Hellfire Gala',
      description: 'The most exclusive mutant event of the year. Formal attire required. Join the X-Men for an evening of elegance and celebration.',
      type: 'OTHER' as const,
      visibility: 'PUBLIC' as const,
      admin: admin1,
      daysOffset: 40,
      startHour: 19,
      duration: 6,
      location: 'Krakoa Embassy, 1 Mutant Avenue, New York, NY 10001',
    },
    {
      name: 'Met Gala 2024',
      description: 'Fashion\'s biggest night. The Metropolitan Museum of Art Costume Institute Gala. Black tie, themed attire.',
      type: 'OTHER' as const,
      visibility: 'PUBLIC' as const,
      admin: admin2,
      daysOffset: 45,
      startHour: 18,
      duration: 5,
      location: 'Metropolitan Museum of Art, 1000 5th Avenue, New York, NY 10028',
    },
    {
      name: 'The Devil Wears Prada - Runway Show',
      description: 'Exclusive fashion showcase inspired by the iconic film. High fashion, high stakes.',
      type: 'OTHER' as const,
      visibility: 'PUBLIC' as const,
      admin: admin3,
      daysOffset: 35,
      startHour: 20,
      duration: 3,
      location: 'Runway Hall, 666 Fashion Boulevard, New York, NY 10018',
    },
    {
      name: 'Star Wars Galactic Summit',
      description: 'A gathering of beings from across the galaxy. Discuss diplomacy, trade, and the future of the galaxy.',
      type: 'CORPORATE' as const,
      visibility: 'PUBLIC' as const,
      admin: admin1,
      daysOffset: 50,
      startHour: 10,
      duration: 8,
      location: 'Coruscant Convention Center, Galactic City, Coruscant',
    },
    {
      name: 'Hogwarts Yule Ball',
      description: 'The Triwizard Tournament Yule Ball. Formal wizarding attire required. Dancing, feasting, and magical entertainment.',
      type: 'OTHER' as const,
      visibility: 'PUBLIC' as const,
      admin: admin2,
      daysOffset: 60,
      startHour: 19,
      duration: 5,
      location: 'Hogwarts Great Hall, Hogwarts School of Witchcraft and Wizardry, Scotland',
    },
    {
      name: 'LOTR Shire Festival',
      description: 'A celebration of peace and prosperity in the Shire. Food, music, fireworks, and good cheer for all hobbits and friends.',
      type: 'OTHER' as const,
      visibility: 'PUBLIC' as const,
      admin: admin3,
      daysOffset: 38,
      startHour: 14,
      duration: 8,
      location: 'Party Tree, Hobbiton, The Shire',
    },
    {
      name: 'Spider-Verse Festival',
      description: 'A multiversal gathering of Spider-People. Celebrate heroism, responsibility, and the power of choice.',
      type: 'OTHER' as const,
      visibility: 'PUBLIC' as const,
      admin: admin1,
      daysOffset: 42,
      startHour: 16,
      duration: 6,
      location: 'Multiverse Plaza, 1610 Brooklyn, New York, NY 11201',
    },
    {
      name: 'The Boys Vought BBQ',
      description: 'Vought International\'s annual company BBQ. Free food, entertainment, and meet your favorite Supes!',
      type: 'CORPORATE' as const,
      visibility: 'PUBLIC' as const,
      admin: admin2,
      daysOffset: 25,
      startHour: 12,
      duration: 6,
      location: 'Vought Tower Rooftop, 1 Vought Plaza, New York, NY 10001',
    },
    {
      name: 'Anime Multiverse Meetup',
      description: 'The ultimate anime fan gathering. Cosplay contest, panels, screenings, and meet fellow weebs from across dimensions.',
      type: 'COLLEGE_FEST' as const,
      visibility: 'PUBLIC' as const,
      admin: admin3,
      daysOffset: 55,
      startHour: 10,
      duration: 12,
      location: 'Anime Convention Center, 2000 Otaku Street, Los Angeles, CA 90015',
    },
    {
      name: 'Breaking Bad Chemistry Workshop',
      description: 'Advanced chemistry techniques and applications. For educational purposes only. Safety protocols strictly enforced.',
      type: 'CORPORATE' as const,
      visibility: 'PUBLIC' as const,
      admin: admin1,
      daysOffset: 32,
      startHour: 14,
      duration: 4,
      location: 'Chemistry Lab, 308 Negra Arroyo Lane, Albuquerque, NM 87104',
    },
    {
      name: 'Wakanda Tech Expo',
      description: 'Showcase of Wakandan technology and innovation. Vibranium applications, advanced AI, and sustainable energy solutions.',
      type: 'CORPORATE' as const,
      visibility: 'PUBLIC' as const,
      admin: admin2,
      daysOffset: 48,
      startHour: 9,
      duration: 8,
      location: 'Wakanda Design Group, Birnin Zana, Wakanda',
    },
  ];

  for (const template of eventTemplates) {
    const eventStart = new Date(now);
    eventStart.setDate(eventStart.getDate() + template.daysOffset);
    eventStart.setHours(template.startHour, 0, 0, 0);
    const eventEnd = new Date(eventStart);
    eventEnd.setHours(eventStart.getHours() + template.duration);

    const newEvent = await prisma.event.create({
      data: {
        name: template.name,
        description: template.description,
        shortCode: await generateShortCode(),
        startDate: eventStart,
        endDate: eventEnd,
        location: template.location,
        visibility: template.visibility,
        type: template.type,
        adminId: template.admin.id,
      },
    });
    events.push(newEvent);
  }

  console.log(`✅ Created ${events.length} events\n`);

  // Create Schedule Items
  console.log('📅 Creating schedule items...');

  // Wedding schedule
  const weddingSchedule = [
    { title: 'Ceremony', description: 'Wedding ceremony begins', startTime: 14, endTime: 15, location: 'Main Garden' },
    { title: 'Cocktail Hour', description: 'Drinks and appetizers', startTime: 15, endTime: 16, location: 'Garden Patio' },
    { title: 'Reception', description: 'Dinner and dancing', startTime: 16, endTime: 22, location: 'Reception Hall' },
  ];

  for (let i = 0; i < weddingSchedule.length; i++) {
    const item = weddingSchedule[i];
    const startTime = new Date(weddingStart);
    startTime.setHours(item.startTime, 0, 0, 0);
    const endTime = new Date(weddingStart);
    endTime.setHours(item.endTime, 0, 0, 0);

    await prisma.scheduleItem.create({
      data: {
        eventId: wedding.id,
        title: item.title,
        description: item.description,
        startTime,
        endTime,
        location: item.location,
        orderIndex: i,
        createdBy: admin1.id,
      },
    });
    scheduleCount++;
  }

  // Birthday schedule
  const birthdaySchedule = [
    { title: 'Welcome & Drinks', description: 'Arrival and welcome drinks', startTime: 18, endTime: 19, location: 'Main Bar' },
    { title: 'Dinner', description: 'Buffet dinner service', startTime: 19, endTime: 20, location: 'Dining Area' },
    { title: 'Cake Cutting', description: 'Birthday cake celebration', startTime: 20, endTime: 20.5, location: 'Main Hall' },
    { title: 'Dancing & Party', description: 'Music and dancing', startTime: 20.5, endTime: 23, location: 'Dance Floor' },
  ];

  for (let i = 0; i < birthdaySchedule.length; i++) {
    const item = birthdaySchedule[i];
    const startTime = new Date(birthdayStart);
    startTime.setHours(Math.floor(item.startTime), (item.startTime % 1) * 60, 0, 0);
    const endTime = new Date(birthdayStart);
    endTime.setHours(Math.floor(item.endTime), (item.endTime % 1) * 60, 0, 0);

    await prisma.scheduleItem.create({
      data: {
        eventId: birthday.id,
        title: item.title,
        description: item.description,
        startTime,
        endTime,
        location: item.location,
        orderIndex: i,
        createdBy: admin2.id,
      },
    });
    scheduleCount++;
  }

  // Corporate schedule
  const corporateSchedule = [
    { title: 'Registration & Breakfast', description: 'Check-in and networking breakfast', startTime: 9, endTime: 10, location: 'Lobby' },
    { title: 'Opening Keynote', description: 'Welcome and opening remarks', startTime: 10, endTime: 11, location: 'Main Hall' },
    { title: 'Panel Discussion', description: 'Future of AI in Business', startTime: 11, endTime: 12, location: 'Conference Room A' },
    { title: 'Lunch Break', description: 'Networking lunch', startTime: 12, endTime: 13, location: 'Dining Hall' },
    { title: 'Workshop Session 1', description: 'Hands-on workshop', startTime: 13, endTime: 15, location: 'Workshop Room 1' },
    { title: 'Workshop Session 2', description: 'Advanced techniques', startTime: 15, endTime: 17, location: 'Workshop Room 2' },
  ];

  for (let i = 0; i < corporateSchedule.length; i++) {
    const item = corporateSchedule[i];
    const startTime = new Date(corporateStart);
    startTime.setHours(item.startTime, 0, 0, 0);
    const endTime = new Date(corporateStart);
    endTime.setHours(item.endTime, 0, 0, 0);

    await prisma.scheduleItem.create({
      data: {
        eventId: corporate.id,
        title: item.title,
        description: item.description,
        startTime,
        endTime,
        location: item.location,
        orderIndex: i,
        createdBy: admin3.id,
      },
    });
    scheduleCount++;
  }

  // Create schedule items for all new events
  const scheduleTemplates = [
    // Tech Startup Networking Night
    [
      { title: 'Registration & Welcome', startTime: 18, endTime: 18.5, location: 'Lobby' },
      { title: 'Keynote: Future of Startups', startTime: 18.5, endTime: 19.5, location: 'Main Hall' },
      { title: 'Networking Session', startTime: 19.5, endTime: 21, location: 'Networking Area' },
      { title: 'Closing Remarks', startTime: 21, endTime: 22, location: 'Main Hall' },
    ],
    // Company Retreat
    [
      { title: 'Arrival & Check-in', startTime: 9, endTime: 10, location: 'Reception' },
      { title: 'Team Building Activities', startTime: 10, endTime: 12, location: 'Activity Center' },
      { title: 'Lunch', startTime: 12, endTime: 13, location: 'Dining Hall' },
      { title: 'Workshop Session', startTime: 13, endTime: 15, location: 'Workshop Room' },
      { title: 'Free Time', startTime: 15, endTime: 18, location: 'Resort Grounds' },
      { title: 'Dinner & Social', startTime: 18, endTime: 21, location: 'Main Dining' },
    ],
    // Graduation Party
    [
      { title: 'Welcome Reception', startTime: 16, endTime: 17, location: 'Main Hall' },
      { title: 'Graduation Ceremony', startTime: 17, endTime: 18, location: 'Auditorium' },
      { title: 'Photo Session', startTime: 18, endTime: 18.5, location: 'Photo Area' },
      { title: 'Dinner & Celebration', startTime: 18.5, endTime: 21, location: 'Dining Hall' },
      { title: 'Dancing & Music', startTime: 21, endTime: 22, location: 'Dance Floor' },
    ],
    // Summer BBQ
    [
      { title: 'Arrival & Setup', startTime: 12, endTime: 12.5, location: 'Park Area' },
      { title: 'BBQ Lunch', startTime: 12.5, endTime: 14, location: 'Grill Area' },
      { title: 'Games & Activities', startTime: 14, endTime: 17, location: 'Game Zone' },
      { title: 'Dessert & Social', startTime: 17, endTime: 20, location: 'Picnic Area' },
    ],
    // Jazz Night
    [
      { title: 'Doors Open', startTime: 20, endTime: 20.5, location: 'Lounge Entrance' },
      { title: 'Opening Act', startTime: 20.5, endTime: 21.5, location: 'Main Stage' },
      { title: 'Main Performance', startTime: 21.5, endTime: 23, location: 'Main Stage' },
      { title: 'After Party', startTime: 23, endTime: 24, location: 'VIP Lounge' },
    ],
    // Product Launch
    [
      { title: 'Registration', startTime: 14, endTime: 14.5, location: 'Lobby' },
      { title: 'Product Presentation', startTime: 14.5, endTime: 15.5, location: 'Main Stage' },
      { title: 'Live Demo', startTime: 15.5, endTime: 16.5, location: 'Demo Area' },
      { title: 'Q&A Session', startTime: 16.5, endTime: 17.5, location: 'Main Stage' },
      { title: 'Networking & Refreshments', startTime: 17.5, endTime: 19, location: 'Networking Area' },
    ],
    // Charity Gala
    [
      { title: 'Cocktail Reception', startTime: 19, endTime: 20, location: 'Reception Hall' },
      { title: 'Dinner Service', startTime: 20, endTime: 21.5, location: 'Main Ballroom' },
      { title: 'Silent Auction', startTime: 21.5, endTime: 22.5, location: 'Auction Room' },
      { title: 'Live Entertainment', startTime: 22.5, endTime: 24, location: 'Main Ballroom' },
    ],
    // Hackathon
    [
      { title: 'Check-in & Breakfast', startTime: 9, endTime: 10, location: 'Main Hall' },
      { title: 'Opening Ceremony', startTime: 10, endTime: 10.5, location: 'Main Stage' },
      { title: 'Hacking Begins', startTime: 10.5, endTime: 18, location: 'Workspace' },
      { title: 'Dinner Break', startTime: 18, endTime: 19, location: 'Dining Area' },
      { title: 'Night Hacking', startTime: 19, endTime: 9, location: 'Workspace' },
      { title: 'Breakfast & Final Push', startTime: 9, endTime: 12, location: 'Workspace' },
      { title: 'Project Submissions', startTime: 12, endTime: 13, location: 'Submission Desk' },
      { title: 'Judging & Presentations', startTime: 13, endTime: 15, location: 'Presentation Hall' },
      { title: 'Awards Ceremony', startTime: 15, endTime: 16, location: 'Main Stage' },
    ],
    // Wedding Reception
    [
      { title: 'Cocktail Hour', startTime: 18, endTime: 19, location: 'Garden Terrace' },
      { title: 'Grand Entrance', startTime: 19, endTime: 19.5, location: 'Main Hall' },
      { title: 'Dinner Service', startTime: 19.5, endTime: 21, location: 'Dining Hall' },
      { title: 'First Dance', startTime: 21, endTime: 21.5, location: 'Dance Floor' },
      { title: 'Open Dancing', startTime: 21.5, endTime: 24, location: 'Dance Floor' },
    ],
    // Kids Birthday Party
    [
      { title: 'Arrival & Welcome', startTime: 14, endTime: 14.5, location: 'Party Entrance' },
      { title: 'Games & Activities', startTime: 14.5, endTime: 16, location: 'Activity Zone' },
      { title: 'Cake & Candles', startTime: 16, endTime: 16.5, location: 'Party Room' },
      { title: 'Gift Opening', startTime: 16.5, endTime: 17, location: 'Party Room' },
      { title: 'Free Play', startTime: 17, endTime: 18, location: 'Play Area' },
    ],
    // Yoga & Wellness Retreat
    [
      { title: 'Morning Meditation', startTime: 8, endTime: 8.5, location: 'Meditation Hall' },
      { title: 'Yoga Session 1', startTime: 9, endTime: 10.5, location: 'Yoga Studio' },
      { title: 'Healthy Breakfast', startTime: 10.5, endTime: 11.5, location: 'Dining Area' },
      { title: 'Wellness Workshop', startTime: 11.5, endTime: 13, location: 'Workshop Room' },
      { title: 'Lunch Break', startTime: 13, endTime: 14, location: 'Dining Area' },
      { title: 'Yoga Session 2', startTime: 14, endTime: 15.5, location: 'Yoga Studio' },
      { title: 'Free Time & Spa', startTime: 15.5, endTime: 17, location: 'Spa Area' },
      { title: 'Evening Meditation', startTime: 17, endTime: 18, location: 'Meditation Hall' },
    ],
    // Art Gallery Opening
    [
      { title: 'Gallery Opening', startTime: 18, endTime: 18.5, location: 'Gallery Entrance' },
      { title: 'Artist Talk', startTime: 18.5, endTime: 19.5, location: 'Main Gallery' },
      { title: 'Wine & Viewing', startTime: 19.5, endTime: 21, location: 'Gallery Spaces' },
    ],
    // Sports Watch Party
    [
      { title: 'Pre-Game Social', startTime: 17, endTime: 18, location: 'Bar Area' },
      { title: 'Game Viewing', startTime: 18, endTime: 21, location: 'Main Viewing Area' },
      { title: 'Post-Game Discussion', startTime: 21, endTime: 22, location: 'Bar Area' },
    ],
    // Book Club Meeting
    [
      { title: 'Arrival & Refreshments', startTime: 19, endTime: 19.5, location: 'Meeting Room' },
      { title: 'Book Discussion', startTime: 19.5, endTime: 20.5, location: 'Discussion Area' },
      { title: 'Q&A & Social', startTime: 20.5, endTime: 21, location: 'Meeting Room' },
    ],
    // Cooking Class
    [
      { title: 'Welcome & Introduction', startTime: 17, endTime: 17.5, location: 'Kitchen Studio' },
      { title: 'Cooking Demonstration', startTime: 17.5, endTime: 19, location: 'Main Kitchen' },
      { title: 'Hands-On Cooking', startTime: 19, endTime: 20, location: 'Cooking Stations' },
      { title: 'Dinner Together', startTime: 20, endTime: 21, location: 'Dining Area' },
    ],
    // X-Men Hellfire Gala
    [
      { title: 'Red Carpet Arrival', startTime: 19, endTime: 20, location: 'Main Entrance' },
      { title: 'Cocktail Reception', startTime: 20, endTime: 21, location: 'Grand Ballroom' },
      { title: 'Dinner Service', startTime: 21, endTime: 22.5, location: 'Dining Hall' },
      { title: 'Mutant Showcase', startTime: 22.5, endTime: 23.5, location: 'Main Stage' },
      { title: 'Dancing & Celebration', startTime: 23.5, endTime: 1, location: 'Dance Floor' },
    ],
    // Met Gala
    [
      { title: 'Red Carpet Arrivals', startTime: 18, endTime: 19.5, location: 'Museum Steps' },
      { title: 'Exhibition Viewing', startTime: 19.5, endTime: 21, location: 'Costume Institute' },
      { title: 'Dinner & Speeches', startTime: 21, endTime: 22.5, location: 'Temple of Dendur' },
      { title: 'After Party', startTime: 22.5, endTime: 23, location: 'VIP Lounge' },
    ],
    // The Devil Wears Prada Runway
    [
      { title: 'VIP Reception', startTime: 20, endTime: 20.5, location: 'Backstage Lounge' },
      { title: 'Fashion Show', startTime: 20.5, endTime: 22, location: 'Main Runway' },
      { title: 'Designer Meet & Greet', startTime: 22, endTime: 23, location: 'Reception Area' },
    ],
    // Star Wars Galactic Summit
    [
      { title: 'Opening Ceremony', startTime: 10, endTime: 11, location: 'Senate Chamber' },
      { title: 'Diplomatic Sessions', startTime: 11, endTime: 13, location: 'Conference Rooms' },
      { title: 'Lunch Break', startTime: 13, endTime: 14, location: 'Dining Facility' },
      { title: 'Trade Negotiations', startTime: 14, endTime: 16, location: 'Trade Hall' },
      { title: 'Cultural Exchange', startTime: 16, endTime: 17, location: 'Cultural Pavilion' },
      { title: 'Closing Address', startTime: 17, endTime: 18, location: 'Senate Chamber' },
    ],
    // Hogwarts Yule Ball
    [
      { title: 'Arrival & Welcome', startTime: 19, endTime: 19.5, location: 'Great Hall Entrance' },
      { title: 'Opening Dance', startTime: 19.5, endTime: 20, location: 'Great Hall' },
      { title: 'Feast Service', startTime: 20, endTime: 21.5, location: 'Great Hall' },
      { title: 'Dancing & Entertainment', startTime: 21.5, endTime: 23.5, location: 'Great Hall' },
      { title: 'Midnight Toast', startTime: 23.5, endTime: 24, location: 'Great Hall' },
    ],
    // LOTR Shire Festival
    [
      { title: 'Festival Opening', startTime: 14, endTime: 14.5, location: 'Party Field' },
      { title: 'Food & Ale Service', startTime: 14.5, endTime: 17, location: 'Feast Tables' },
      { title: 'Music & Dancing', startTime: 17, endTime: 20, location: 'Dance Floor' },
      { title: 'Fireworks Display', startTime: 20, endTime: 20.5, location: 'Party Field' },
      { title: 'Evening Social', startTime: 20.5, endTime: 22, location: 'Party Field' },
    ],
    // Spider-Verse Festival
    [
      { title: 'Multiverse Portal Opening', startTime: 16, endTime: 16.5, location: 'Main Plaza' },
      { title: 'Spider-People Meetup', startTime: 16.5, endTime: 18, location: 'Meetup Zone' },
      { title: 'Hero Showcase', startTime: 18, endTime: 19.5, location: 'Main Stage' },
      { title: 'Responsibility Panel', startTime: 19.5, endTime: 20.5, location: 'Panel Hall' },
      { title: 'Community Celebration', startTime: 20.5, endTime: 22, location: 'Main Plaza' },
    ],
    // The Boys Vought BBQ
    [
      { title: 'Check-in & Welcome', startTime: 12, endTime: 12.5, location: 'Rooftop Entrance' },
      { title: 'BBQ Lunch Service', startTime: 12.5, endTime: 14.5, location: 'Grill Area' },
      { title: 'Supe Meet & Greet', startTime: 14.5, endTime: 16, location: 'Meet & Greet Zone' },
      { title: 'Entertainment & Games', startTime: 16, endTime: 17.5, location: 'Activity Area' },
      { title: 'Closing Remarks', startTime: 17.5, endTime: 18, location: 'Main Stage' },
    ],
    // Anime Multiverse Meetup
    [
      { title: 'Registration & Cosplay Check-in', startTime: 10, endTime: 11, location: 'Convention Lobby' },
      { title: 'Opening Ceremony', startTime: 11, endTime: 11.5, location: 'Main Hall' },
      { title: 'Panel Sessions', startTime: 11.5, endTime: 14, location: 'Panel Rooms' },
      { title: 'Lunch Break', startTime: 14, endTime: 15, location: 'Food Court' },
      { title: 'Cosplay Contest', startTime: 15, endTime: 17, location: 'Main Stage' },
      { title: 'Anime Screenings', startTime: 17, endTime: 19, location: 'Screening Rooms' },
      { title: 'Merchandise & Artist Alley', startTime: 19, endTime: 21, location: 'Exhibition Hall' },
      { title: 'Closing Ceremony', startTime: 21, endTime: 22, location: 'Main Hall' },
    ],
    // Breaking Bad Chemistry Workshop
    [
      { title: 'Safety Briefing', startTime: 14, endTime: 14.5, location: 'Lecture Hall' },
      { title: 'Theory Session', startTime: 14.5, endTime: 15.5, location: 'Lecture Hall' },
      { title: 'Lab Demonstration', startTime: 15.5, endTime: 17, location: 'Chemistry Lab' },
      { title: 'Q&A & Discussion', startTime: 17, endTime: 18, location: 'Lecture Hall' },
    ],
    // Wakanda Tech Expo
    [
      { title: 'Opening Keynote', startTime: 9, endTime: 10, location: 'Main Auditorium' },
      { title: 'Vibranium Applications', startTime: 10, endTime: 11.5, location: 'Tech Pavilion' },
      { title: 'AI & Robotics Showcase', startTime: 11.5, endTime: 13, location: 'Innovation Hall' },
      { title: 'Lunch Break', startTime: 13, endTime: 14, location: 'Dining Facility' },
      { title: 'Sustainable Energy Solutions', startTime: 14, endTime: 15.5, location: 'Energy Pavilion' },
      { title: 'Medical Technology', startTime: 15.5, endTime: 17, location: 'Medical Wing' },
      { title: 'Closing & Networking', startTime: 17, endTime: 17, location: 'Networking Lounge' },
    ],
  ];

  // Add schedules to new events (starting from index 5, after the original 5 events)
  for (let i = 0; i < eventTemplates.length; i++) {
    const event = events[5 + i]; // Start from 6th event
    const schedule = scheduleTemplates[i];
    const eventStart = event.startDate;

    for (let j = 0; j < schedule.length; j++) {
      const item = schedule[j];
      const startTime = new Date(eventStart);
      const startHours = Math.floor(item.startTime);
      const startMinutes = (item.startTime % 1) * 60;
      startTime.setHours(startHours, startMinutes, 0, 0);
      
      const endTime = new Date(eventStart);
      const endHours = Math.floor(item.endTime);
      const endMinutes = (item.endTime % 1) * 60;
      endTime.setHours(endHours, endMinutes, 0, 0);

      await prisma.scheduleItem.create({
        data: {
          eventId: event.id,
          title: item.title,
          description: `${item.title} at ${item.location}`,
          startTime,
          endTime,
          location: item.location,
          orderIndex: j,
          createdBy: eventTemplates[i].admin.id,
        },
      });
      scheduleCount++;
    }
  }

  console.log(`✅ Created ${scheduleCount} schedule items\n`);

  // Create Guest Events (guests joining events)
  console.log('🎫 Creating guest event relationships...');

  // Wedding guests
  for (let i = 0; i < 8; i++) {
    const status = i < 3 ? 'JOINED' : i < 6 ? 'CHECKED_IN' : 'INVITED';
    const joinedAt = status !== 'INVITED' ? new Date() : null;
    const checkedInAt = status === 'CHECKED_IN' ? new Date() : null;

    await prisma.guestEvent.create({
      data: {
        userId: guests[i].id,
        eventId: wedding.id,
        status: status as any,
        joinedAt,
        checkedInAt,
      },
    });
    guestEventCount++;
  }

  // Birthday guests
  for (let i = 0; i < 6; i++) {
    const status = i < 2 ? 'JOINED' : i < 4 ? 'CHECKED_IN' : 'INVITED';
    const joinedAt = status !== 'INVITED' ? new Date() : null;
    const checkedInAt = status === 'CHECKED_IN' ? new Date() : null;

    await prisma.guestEvent.create({
      data: {
        userId: guests[i + 2].id,
        eventId: birthday.id,
        status: status as any,
        joinedAt,
        checkedInAt,
      },
    });
    guestEventCount++;
  }

  // Corporate event guests
  for (let i = 0; i < 10; i++) {
    const status = i < 5 ? 'JOINED' : 'INVITED';
    const joinedAt = status === 'JOINED' ? new Date() : null;

    await prisma.guestEvent.create({
      data: {
        userId: guests[i % guests.length].id,
        eventId: corporate.id,
        status: status as any,
        joinedAt,
      },
    });
    guestEventCount++;
  }

  // Add guests to all new events (varying numbers and statuses)
  const guestCountsPerEvent = [12, 8, 15, 20, 10, 18, 14, 25, 16, 12, 8, 6, 22, 5, 9, 30, 25, 15, 35, 28, 22, 20, 18, 25, 15, 20];
  
  for (let i = 0; i < eventTemplates.length; i++) {
    const event = events[5 + i];
    const guestCount = guestCountsPerEvent[i];
    
    // Shuffle guests to avoid duplicates
    const shuffledGuests = [...guests].sort(() => Math.random() - 0.5);
    
    // Track which guests we've already added to this event to avoid duplicates
    const addedGuestIds = new Set<string>();
    
    for (let j = 0; j < guestCount && j < shuffledGuests.length; j++) {
      const guest = shuffledGuests[j];
      
      // Skip if this guest is already added to this event
      if (addedGuestIds.has(guest.id)) {
        continue;
      }
      
      // Check if this guest-event relationship already exists
      const existing = await prisma.guestEvent.findUnique({
        where: {
          userId_eventId: {
            userId: guest.id,
            eventId: event.id,
          },
        },
      });
      
      // Skip if relationship already exists
      if (existing) {
        continue;
      }
      
      let status: 'INVITED' | 'JOINED' | 'CHECKED_IN';
      const rand = Math.random();
      
      if (rand < 0.4) {
        status = 'JOINED';
      } else if (rand < 0.7) {
        status = 'CHECKED_IN';
      } else {
        status = 'INVITED';
      }
      
      const joinedAt = status !== 'INVITED' ? new Date() : null;
      const checkedInAt = status === 'CHECKED_IN' ? new Date() : null;

      await prisma.guestEvent.create({
        data: {
          userId: guest.id,
          eventId: event.id,
          status: status as any,
          joinedAt,
          checkedInAt,
        },
      });
      addedGuestIds.add(guest.id);
      guestEventCount++;
    }
  }

  console.log(`✅ Created ${guestEventCount} guest event relationships\n`);

  // Create Announcements
  console.log('📢 Creating announcements...');
  
  const announcementTemplates = [
    { title: 'Welcome!', message: 'Thank you for joining us! We\'re excited to have you here.' },
    { title: 'Event Starting Soon', message: 'The event will begin shortly. Please make your way to the main area.' },
    { title: 'Important Update', message: 'Please note the updated schedule. Check the app for details.' },
    { title: 'Reminder', message: 'Don\'t forget to check in when you arrive!' },
    { title: 'Schedule Change', message: 'There has been a slight change to today\'s schedule.' },
    { title: 'Thank You', message: 'Thank you for being part of this amazing event!' },
    { title: 'Next Activity', message: 'The next activity is starting in 10 minutes.' },
    { title: 'Food Service', message: 'Food is now being served. Enjoy!' },
  ];

  // Add announcements to all events
  for (const event of events) {
    const eventAdmin = [admin1, admin2, admin3].find(a => a.id === event.adminId) || admin1;
    const numAnnouncements = Math.floor(Math.random() * 4) + 2; // 2-5 announcements per event
    
    for (let i = 0; i < numAnnouncements; i++) {
      const template = announcementTemplates[Math.floor(Math.random() * announcementTemplates.length)];
      const createdAt = new Date();
      createdAt.setHours(createdAt.getHours() - Math.floor(Math.random() * 24)); // Random time in last 24 hours

      await prisma.announcement.create({
        data: {
          eventId: event.id,
          senderId: eventAdmin.id,
          title: template.title,
          message: template.message,
          createdAt,
        },
      });
      announcementCount++;
    }
  }
  console.log(`✅ Created ${announcementCount} announcements\n`);

  // Create Notification Logs
  console.log('📬 Creating notification logs...');
  const allDevices = await prisma.device.findMany();
  const notificationTemplates = [
    { title: 'Event Reminder', message: 'Your event starts in 1 hour', success: true },
    { title: 'New Announcement', message: 'Check out the latest update', success: true },
    { title: 'Schedule Update', message: 'Schedule has been updated', success: true },
    { title: 'Welcome', message: 'Welcome to the event!', success: true },
    { title: 'Event Starting', message: 'Your event is about to begin', success: true },
    { title: 'Check-in Reminder', message: 'Don\'t forget to check in!', success: true },
    { title: 'Failed Notification', message: 'This notification failed', success: false, errorMessage: 'Invalid FCM token' },
    { title: 'Network Error', message: 'Notification delivery failed', success: false, errorMessage: 'Network timeout' },
  ];

  // Create notification logs for all events and devices
  let notificationCount = 0;
  for (const event of events) {
    // Get guests for this event
    const eventGuests = await prisma.guestEvent.findMany({
      where: { eventId: event.id },
      select: { userId: true },
    });
    
    // Create 3-8 notifications per event
    const numNotifications = Math.floor(Math.random() * 6) + 3;
    
    for (let i = 0; i < numNotifications; i++) {
      // Pick a random guest from this event
      const randomGuest = eventGuests[Math.floor(Math.random() * eventGuests.length)];
      if (!randomGuest) continue;
      
      // Get devices for this guest
      const guestDevices = allDevices.filter(d => d.userId === randomGuest.userId);
      if (guestDevices.length === 0) continue;
      
      const device = guestDevices[Math.floor(Math.random() * guestDevices.length)];
      const template = notificationTemplates[Math.floor(Math.random() * notificationTemplates.length)];
      const createdAt = new Date();
      createdAt.setHours(createdAt.getHours() - Math.floor(Math.random() * 72)); // Random time in last 3 days

      await prisma.notificationLog.create({
        data: {
          userId: device.userId,
          eventId: event.id,
          deviceId: device.id,
          title: template.title,
          message: template.message,
          fcmToken: device.fcmToken,
          success: template.success,
          errorMessage: template.errorMessage || null,
          createdAt,
        },
      });
      notificationCount++;
    }
  }
  console.log(`✅ Created ${notificationCount} notification logs\n`);

  console.log('✨ Seeding completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - ${3} Admin users`);
  console.log(`   - ${guests.length} Guest users`);
  console.log(`   - ${deviceCount} Devices`);
  console.log(`   - ${events.length} Events`);
  console.log(`   - ${scheduleCount} Schedule items`);
  console.log(`   - ${guestEventCount} Guest event relationships`);
  console.log(`   - ${announcementCount} Announcements`);
  console.log(`   - ${notificationCount} Notification logs`);
  console.log('\n🎉 Your database is now seeded with comprehensive test data!');
  console.log('💡 You now have plenty of data to test all event-related APIs!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

