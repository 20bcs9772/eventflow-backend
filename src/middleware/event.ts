import { User, Event } from "@prisma/client";
import guestEventService from "../services/guestEvent.service";

export async function checkEventAccess(
  event: Event & { admin: { email: string | null } },
  user: User | null | undefined
) {
  // PUBLIC → allowed for everyone
  if (event.visibility === "PUBLIC") {
    return { allowed: true };
  }

  // UNLISTED → must be logged in
  if (event.visibility === "UNLISTED" && !user?.email) {
    return {
      allowed: false,
      status: 401,
      message: "Unauthorized: Login required to access this unlisted event.",
    };
  }

  // PRIVATE → must be logged in AND admin OR guest
  if (event.visibility === "PRIVATE") {
    if (!user?.email) {
      return {
        allowed: false,
        status: 401,
        message: "Unauthorized: Login required to access this private event.",
      };
    }

    const guestEvent = await guestEventService.getGuestEventByUserAndEvent(
      user.id,
      event.id
    );

    const isAdmin = user.email === event?.admin?.email;
    const isGuest = !!guestEvent;

    if (!isAdmin && !isGuest) {
      return {
        allowed: false,
        status: 403,
        message: "Forbidden: You are not allowed to access this private event.",
      };
    }
  }

  // All checks passed
  return { allowed: true };
}
