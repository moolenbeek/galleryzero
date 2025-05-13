import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	role: text('role').notNull(),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull()
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => user.id),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export const gallery_category = pgTable('gallery_category', {
	id: serial('id').primaryKey(),
	name: text('name').notNull().unique(),
	slug: text('slug').notNull().unique(),
});

export const gallery_item = pgTable('gallery_item', {
	id: serial('id').primaryKey(),
	categoryId: integer('category_id').references(() => gallery_category.id),
	imageUrl: text('image_url').notNull(),
	description: text('description').notNull(),
});

export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;
