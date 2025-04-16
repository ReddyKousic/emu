import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';

export const block = pgTable('block', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	description: varchar('description', { length: 255 }).notNull(),
	image: varchar('image', { length: 255 }).notNull()
});
