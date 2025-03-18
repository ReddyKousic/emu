import { pgTable, serial, text, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { student } from './student';

export const eventTypeEnum = pgEnum('event_type', ['open', 'limited']);
export const approvalStatusEnum = pgEnum('approval_status', ['pending', 'approved', 'rejected']);
export const publishStatusEnum = pgEnum('publish_status', ['published', 'pending_publish']);

export const event = pgTable('event', {
	id: serial('id').primaryKey(),
	eventName: text('event_name').notNull(),
	eventType: eventTypeEnum('event_type').notNull(),
	eventVenue: text('event_venue').notNull(),
	studentManager: integer('student_manager').references(() => student.id),
	eventDateTime: timestamp('event_date_time').notNull(),
	limit: integer('limit').notNull().default(0),
	universityAdministrationApproval: approvalStatusEnum('university_administration_approval')
		.notNull()
		.default('pending'),
	publishStatus: publishStatusEnum('publish_status').notNull().default('pending_publish'),
	rejectionRemarks: text('rejection_remarks')
});
