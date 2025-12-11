import { z } from "zod";

// Auth Types
export const RegisterSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

export const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

// User Types
export const CreateUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1).optional(),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(1).optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

// Device Types
export const CreateDeviceSchema = z.object({
  userId: z.string().uuid(),
  fcmToken: z.string().min(1),
  deviceType: z.enum(["IOS", "ANDROID", "WEB"]),
});

export const UpdateDeviceSchema = z.object({
  fcmToken: z.string().min(1).optional(),
  deviceType: z.enum(["IOS", "ANDROID", "WEB"]).optional(),
});

export type CreateDeviceInput = z.infer<typeof CreateDeviceSchema>;
export type UpdateDeviceInput = z.infer<typeof UpdateDeviceSchema>;

// Event Types - Venue schema
const VenueSchema = z
  .object({
    name: z.string().optional(),
    fullAddress: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
  })
  .optional();

// Schedule item for event creation
const ScheduleItemForEventSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  startTime: z.string(), // ISO datetime string
  endTime: z.string(), // ISO datetime string
  location: z.string().optional(),
  orderIndex: z.number().int().min(0).optional(),
});

// Event Types
export const CreateEventSchema = z
  .object({
    name: z.string().min(1),
    description: z.string().optional(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    startTime: z.string().optional(), // Time string like "9:00 AM"
    endTime: z.string().optional(), // Time string like "5:00 PM"
    timeZone: z.string().optional(),
    location: z.string().optional(),
    coverImage: z.string().optional(),
    portraitImage: z.string().optional(),
    galleryImages: z.array(z.string()).optional(),
    venue: VenueSchema, // Detailed venue object
    visibility: z.enum(["PUBLIC", "PRIVATE", "UNLISTED"]).optional(),
    type: z
      .enum(["WEDDING", "BIRTHDAY", "CORPORATE", "COLLEGE_FEST", "OTHER"])
      .optional(),
    scheduleItems: z.array(ScheduleItemForEventSchema).optional(), // Schedule items to create with event
  })
  .refine(
    (data) =>
      new Date(data.startDate).getTime() < new Date(data.endDate).getTime(),
    {
      message: "endDate must be after startDate",
      path: ["endDate"],
    }
  );

export const UpdateEventSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  location: z.string().optional(),
  coverImage: z.string().optional(),
  portraitImage: z.string().optional(),
  galleryImages: z.array(z.string()).optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE", "UNLISTED"]).optional(),
  type: z
    .enum(["WEDDING", "BIRTHDAY", "CORPORATE", "COLLEGE_FEST", "OTHER"])
    .optional(),
});

export type CreateEventInput = z.infer<typeof CreateEventSchema>;
export type UpdateEventInput = z.infer<typeof UpdateEventSchema>;

// Schedule Item Types
const ScheduleItemBaseSchema = z.object({
  eventId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  location: z.string().optional(),
  orderIndex: z.number().int().min(0).optional(),
});

export const CreateScheduleItemSchema = ScheduleItemBaseSchema.refine(
  (data: z.infer<typeof ScheduleItemBaseSchema>) => {
    return (
      new Date(data.startTime).getTime() < new Date(data.endTime).getTime()
    );
  },
  {
    message: "endTime must be after startTime",
    path: ["endTime"],
  }
);

export const UpdateScheduleItemSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  location: z.string().optional(),
  orderIndex: z.number().int().min(0).optional(),
});

export type CreateScheduleItemInput = z.infer<typeof CreateScheduleItemSchema>;
export type UpdateScheduleItemInput = z.infer<typeof UpdateScheduleItemSchema>;

// Announcement Types
export const CreateAnnouncementSchema = z.object({
  eventId: z.string().uuid(),
  title: z.string().min(1),
  message: z.string().min(1),
});

export type CreateAnnouncementInput = z.infer<typeof CreateAnnouncementSchema>;

// Guest Event Types
export const JoinEventSchema = z.object({
  eventId: z.string().uuid().optional(),
  shortCode: z.string().optional(),
  userId: z.string().uuid().optional(),
  email: z.string().email().optional(),
  name: z.string().optional(),
});

export const UpdateGuestStatusSchema = z.object({
  status: z.enum(["INVITED", "JOINED", "CHECKED_IN"]),
});

export type JoinEventInput = z.infer<typeof JoinEventSchema>;
export type UpdateGuestStatusInput = z.infer<typeof UpdateGuestStatusSchema>;

// Socket.IO Event Types
export interface ServerToClientEvents {
  scheduleUpdated: (data: { eventId: string; scheduleItem: unknown }) => void;
  announcement: (data: { eventId: string; announcement: unknown }) => void;
  eventUpdated: (data: { eventId: string; event: unknown }) => void;
  joined: (data: { eventId: string; success: boolean }) => void;
  error: (data: { message: string }) => void;
}

export interface ClientToServerEvents {
  joinEvent: (eventId: string) => void;
  leaveEvent: (eventId: string) => void;
}

export type EventType =
  | "WEDDING"
  | "BIRTHDAY"
  | "CORPORATE"
  | "COLLEGE_FEST"
  | "OTHER";
