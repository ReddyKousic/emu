// src/lib/server/schema/relations.ts
import { relations } from 'drizzle-orm';
import { bookings } from './bookings';
import { event } from './event';
import { student } from './student';
import { universityAdministration } from './universityAdministration';
import { venue } from './venue';
import { block } from './block';

export const eventRelations = relations(event, ({ one, many }) => ({
  managedBy: one(student, {
    fields: [event.managedBy],
    references: [student.id]
  }),
  eventApprovedBy: one(universityAdministration, {
    fields: [event.eventApprovedBy],
    references: [universityAdministration.id]
  }),
  eventRejectedBy: one(universityAdministration, {
    fields: [event.eventRejectedBy],
    references: [universityAdministration.id]
  }),
  bookings: many(bookings)
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  event: one(event, {
    fields: [bookings.eventId],
    references: [event.id]
  }),
  venue: one(venue, {
    fields: [bookings.venueId],
    references: [venue.id]
  }),
  bookedByStudent: one(student, {
    fields: [bookings.bookedByStudent],
    references: [student.id]
  }),
  bookingApprovedBy: one(universityAdministration, {
    fields: [bookings.bookingApprovedBy],
    references: [universityAdministration.id]
  }),
  bookingRejectedBy: one(universityAdministration, {
    fields: [bookings.bookingRejectedBy],
    references: [universityAdministration.id]
  })
}));

export const venueRelations = relations(venue, ({ one }) => ({
  block: one(block, {
    fields: [venue.block],
    references: [block.id]
  })
}));

// Add this block relations definition
export const blockRelations = relations(block, ({ many }) => ({
  venues: many(venue)
}));