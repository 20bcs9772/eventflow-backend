import { Router } from "express";
import eventController from "../controllers/event.controller";
import { validate } from "../middleware/validation";
import { optionalAuth, verifyFirebaseToken } from "../middleware/auth";
import { CreateEventSchema, UpdateEventSchema } from "../types";

const router = Router();

// Protected routes - require authentication
router.get("/", optionalAuth, eventController.listEvents);

// Protected routes - require authentication
router.post(
  "/",
  verifyFirebaseToken,
  validate(CreateEventSchema),
  eventController.createEvent
);
router.get("/admin", verifyFirebaseToken, eventController.getEventsByAdmin);
router.get("/calendar", verifyFirebaseToken, eventController.getCalendarEvents);
router.patch(
  "/:id",
  verifyFirebaseToken,
  validate(UpdateEventSchema),
  eventController.updateEvent
);
router.delete("/:id", verifyFirebaseToken, eventController.deleteEvent);

// Public routes
router.get("/public", eventController.getPublicEvents);
router.get("/happening-now", eventController.getEventsHappeningNow);
router.get("/code/:shortCode", eventController.getEventByShortCode);
router.get("/types", eventController.getTypesOfEvents);
router.get("/types/:type", optionalAuth, eventController.getEventsByType);
router.get("/:id", optionalAuth, eventController.getEventById);

export default router;
