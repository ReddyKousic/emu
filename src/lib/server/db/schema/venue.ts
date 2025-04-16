import { integer, pgTable, serial, varchar } from 'drizzle-orm/pg-core';
import { block } from './block';

export const venue = pgTable('venue', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	description: varchar('description', { length: 255 }).notNull(),
	capacity: integer('capacity').notNull(),
	block: integer('block').references(() => block.id, { onDelete: 'cascade' })
});
