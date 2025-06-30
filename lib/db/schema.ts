import { pgTable, text, uuid, timestamp, integer } from 'drizzle-orm/pg-core';

// 🧍 participants table
export const participants = pgTable('participants', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
  teamId: uuid('team_id').references(() => teams.id),
});
 
export const teams = pgTable('teams', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  code: text('code').unique().notNull(),
  ownerId: uuid('owner_id').notNull(),
  tokens: integer('tokens').default(0)
});
