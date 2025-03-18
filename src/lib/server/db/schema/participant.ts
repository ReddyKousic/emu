import { pgTable, serial, text, varchar, integer } from 'drizzle-orm/pg-core';
import { event } from './event'; // Import the event table for foreign key

export const participant = pgTable('participant', {
  id: serial('id').primaryKey(), // Auto-incrementing primary key
  eventId: integer('event_id').references(() => event.id), // Foreign key to event table
  name: text('name').notNull(), // Name of the participant
  email: varchar('email', { length: 255 }).notNull(), // Email of the participant
  phone: varchar('phone', { length: 15 }).notNull(), // Phone number of the participant
});