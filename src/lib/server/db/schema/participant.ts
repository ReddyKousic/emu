import { pgTable, serial, text, varchar, integer } from 'drizzle-orm/pg-core';
import { event } from './event';

export const participant = pgTable('participant', {
	id: serial('id').primaryKey(),
	eventId: integer('event_id').references(() => event.id),
	name: text('name').notNull(),
	email: varchar('email', { length: 255 }).notNull(),
	phone: varchar('phone', { length: 15 }).notNull(),
	address: text('address').notNull()
});
