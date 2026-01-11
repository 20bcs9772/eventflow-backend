import { Router } from "express";
import announcementController from "../controllers/announcement.controller";
import { validate } from "../middleware/validation";
import { CreateAnnouncementSchema } from "../types";
import { verifyFirebaseToken } from "../middleware/auth";

const router = Router();

router.post(
  "/",
  validate(CreateAnnouncementSchema),
  announcementController.createAnnouncement
);
router.get("/event/:eventId", announcementController.getAnnouncementsByEvent);
router.get(
  "/",
  verifyFirebaseToken,
  announcementController.getUserAnnouncements
);
router.get("/:id", announcementController.getAnnouncementById);
router.patch("/:id", announcementController.updateAnnouncement);
router.delete("/:id", announcementController.deleteAnnouncement);

export default router;
