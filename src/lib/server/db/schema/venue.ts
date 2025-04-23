import { integer, pgTable, serial, unique, varchar } from 'drizzle-orm/pg-core';
import { block } from './block';
import { relations } from 'drizzle-orm';

export const venue = pgTable(
	'venue',
	{
		id: serial('id').primaryKey(),
		name: varchar('name', { length: 255 }).notNull(),
		description: varchar('description', { length: 255 }).notNull(),
		capacity: integer('capacity').notNull(),
		block: integer('block').references(() => block.id, { onDelete: 'cascade' })
	},
	(table) => ({
		nameBlockUnique: unique('name_block_unique').on(table.name, table.block)
	})
);

export const venueRelations = relations(venue, ({ one }) => ({
	block: one(block, {
		fields: [venue.block],
		references: [block.id]
	})
}));
