import { pgTable, text, uuid, timestamp, integer } from 'drizzle-orm/pg-core';
import { RAW_MATERIALS } from '../constants';

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
  tokens: integer('tokens').notNull().default(1500),
});

export const items = pgTable('items', {
  id: text('id').primaryKey(), 
  name: text('name').notNull(),
  smallBundlePrice: integer('small_bundle_price'),
  largeBundlePrice: integer('large_bundle_price'),
});

export const wonItems = pgTable('won_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id').notNull().references(() => teams.id),
  itemId: text('item_id').notNull().references(() => items.id),
  amountPurchased: integer('amount_purchased').notNull(),
  baseAmount: integer('base_amount').notNull(),
  quantity: integer('quantity').notNull(),
})