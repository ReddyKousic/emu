// drizzle/schema/bookings.ts
import { pgTable, uuid, text, timestamp, integer, pgEnum, boolean } from 'drizzle-orm/pg-core';
import { venue } from './venue';
import { event } from './event';
import { student } from './student';
import { universityAdministration } from './universityAdministration';
import { relations } from 'drizzle-orm';
export const bookingApprovalStatusEnum = pgEnum('booking_approval_status', [
	'Approved',
	'Rejected',
	'Pending'
]);

export const bookings = pgTable('bookings', {
	id: uuid('id').defaultRandom().primaryKey(),
	venueId: integer('venue_id')
		.references(() => venue.id)
		.notNull(),
	eventId: integer('event_id')
		.references(() => event.id)
		.notNull(),
	bookedByStudent: integer('booked_by_student')
		.references(() => student.id)
		.notNull(),
	bookingStartDateTime: timestamp('booking_start_date_time').notNull(),
	bookingEndDateTime: timestamp('booking_end_date_time').notNull(),

	bookingApprovalStatus: bookingApprovalStatusEnum('booking_approval_status')
		.notNull()
		.default('Pending'),
	bookingApprovedBy: integer('booking_approved_by').references(() => universityAdministration.id),
	bookingRejectedBy: integer('booking_rejected_by').references(() => universityAdministration.id),
	isCancelled: boolean('is_cancelled').notNull().default(false),
	bookingRemarks: text('booking_remarks'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});