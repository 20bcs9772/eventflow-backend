import { User } from "@prisma/client";

/**
 * PUBLIC events → always accessible
 */
export const publicEventAccess = {
  visibility: "PUBLIC" as const,
};

/**
 * UNLISTED events → user must be logged in
 */
export function unlistedEventAccess(user: User | null | undefined) {
  return user
    ? { visibility: "UNLISTED" as const }
    : { id: "__BLOCK_UNLISTED__" }; // Always false condition
}

/**
 * PRIVATE events → allowed if:
 * - user is admin of event
 * - OR user is guest of event
 */
export function privateEventAccess(user: User | null | undefined) {
  return user
    ? {
        AND: [
          { visibility: "PRIVATE" as const },
          {
            OR: [
              {
                admin: {
                  email: user.email,
                },
              },
              {
                guestEvents: {
                  some: {
                    user: {
                      email: user.email,
                    },
                  },
                },
              },
            ],
          },
        ],
      }
    : { id: "__BLOCK_PRIVATE__" }; // Prevent access when no login
}

/**
 * FULL ACCESS LOGIC:
 * Returns OR condition to include PUBLIC, UNLISTED, or PRIVATE events
 * depending on the authenticated user.
 */
export function buildEventAccessWhereClause(user: User | null | undefined) {
  return {
    OR: [
      publicEventAccess,
      unlistedEventAccess(user),
      privateEventAccess(user),
    ],
  };
}
