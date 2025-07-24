import {
	pgTable,
	serial,
	text,
	integer,
	timestamp,
	pgEnum,
	index,
	boolean
} from 'drizzle-orm/pg-core';
import { student } from './student';
import { universityAdministration } from './universityAdministration';
import { relations } from 'drizzle-orm';
import { bookings } from './bookings';

export const eventTypeEnum = pgEnum('event_type', ['open', 'limited']);
export const approvalStatusEnum = pgEnum('approval_status', ['pending', 'approved', 'rejected']);
export const publishStatusEnum = pgEnum('publish_status', ['published', 'pending_publish']);

export const event = pgTable(
	'event',
	{
		id: serial('id').primaryKey(),
		eventName: text('event_name').notNull(),
		eventType: eventTypeEnum('event_type').notNull(),

		limit: integer('limit').notNull().default(0),

		description: text('description').notNull(),

		managedBy: integer('managed_by')
			.references(() => student.id)
			.notNull(),

		universityAdministrationApproval: approvalStatusEnum('university_administration_approval')
			.notNull()
			.default('pending'),
		publishStatus: publishStatusEnum('publish_status').notNull().default('pending_publish'),
		rejectionRemarks: text('rejection_remarks'),
		isOpenForBookingVenue: boolean('is_open_for_booking_venue').notNull().default(false),
		eventApprovedBy: integer('event_approved_by').references(() => universityAdministration.id),
		eventRejectedBy: integer('event_rejected_by').references(() => universityAdministration.id),
		slug: text('slug').notNull().unique()
	},
	(table) => [index('slug_idx').on(table.slug)]
);
