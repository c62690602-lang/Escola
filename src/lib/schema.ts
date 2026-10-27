import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  date,
  primaryKey,
} from "drizzle-orm/pg-core";
export const users = pgTable("users", {
  id: uuid().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  platformAdmin: boolean("platform_admin").notNull().default(false),
});
export const sessions = pgTable("sessions", {
  tokenHash: text("token_hash").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});
export const institutions = pgTable("institutions", {
  id: uuid().primaryKey(),
  name: text().notNull(),
  city: text().notNull(),
  state: text().notNull(),
  status: text().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
export const memberships = pgTable(
  "memberships",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    institutionId: uuid("institution_id")
      .notNull()
      .references(() => institutions.id),
    role: text().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.institutionId] })],
);
export const units = pgTable("units", {
  id: uuid().primaryKey(),
  institutionId: uuid("institution_id")
    .notNull()
    .references(() => institutions.id),
  name: text().notNull(),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
});
export const projects = pgTable("onboarding_projects", {
  id: uuid().primaryKey(),
  institutionId: uuid("institution_id")
    .notNull()
    .unique()
    .references(() => institutions.id),
  startsOn: date("starts_on").notNull(),
  endsOn: date("ends_on").notNull(),
});
export const tasks = pgTable("tasks", {
  id: uuid().primaryKey(),
  institutionId: uuid("institution_id")
    .notNull()
    .references(() => institutions.id),
  title: text().notNull(),
  description: text().notNull(),
  status: text().notNull(),
  priority: text().notNull(),
  dueOn: date("due_on").notNull(),
  ownerName: text("owner_name").notNull(),
  completionNote: text("completion_note"),
  onboarding: boolean().notNull(),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
export const audits = pgTable("audit_logs", {
  id: uuid().primaryKey(),
  institutionId: uuid("institution_id").references(() => institutions.id),
  actorId: uuid("actor_id")
    .notNull()
    .references(() => users.id),
  action: text().notNull(),
  entityId: uuid("entity_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
export const accountTokens = pgTable("account_tokens", {
  id: uuid().primaryKey(),
  tokenHash: text("token_hash").notNull().unique(),
  kind: text().notNull(),
  email: text().notNull(),
  institutionId: uuid("institution_id").references(() => institutions.id),
  role: text(),
  createdBy: uuid("created_by").references(() => users.id),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
