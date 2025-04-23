import { relations } from 'drizzle-orm';
import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';
import { venue } from './venue';

export const block = pgTable('block', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	description: varchar('description', { length: 255 }).notNull(),
	image: varchar('image', { length: 255 })
});
export const blockRelations = relations(block, ({ many }) => ({
	venues: many(venue)
}));
