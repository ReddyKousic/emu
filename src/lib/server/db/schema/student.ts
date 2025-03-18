import { pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';

export const student = pgTable('student', {
  id: serial('id').primaryKey(), // Auto-incrementing primary key
  name: text('name').notNull(), // Student's name
  email: varchar('email', { length: 255 }).notNull().unique(), // Unique email
  phone: varchar('phone', { length: 15 }).notNull(), // Phone number
  password: text('password').notNull(), // Password (hashed)
});