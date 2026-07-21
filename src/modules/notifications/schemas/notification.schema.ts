import { isoInstantField, pagedEnvelopeFields, schemaBuilder } from '@/packages/schema';

import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CHANNELS,
} from '../constants/notifications.constants';

/**
 * Wire contracts for the notification surface. The same schemas validate mock
 * mode and remote mode, so switching is configuration only.
 *
 * `params` is deliberately a bag of scalars: the server sends the identifiers
 * a deep link needs and nothing else, so an inbox row can never carry the
 * target's contents into a client that may no longer read them.
 */
const notificationParamsField = schemaBuilder.record(
  schemaBuilder.string(),
  schemaBuilder.union([schemaBuilder.string(), schemaBuilder.number(), schemaBuilder.boolean()]),
);

export const notificationResponseSchema = schemaBuilder.object({
  id: schemaBuilder.string().min(1),
  teamId: schemaBuilder.string().nullable(),
  category: schemaBuilder.enum(NOTIFICATION_CATEGORIES),
  eventType: schemaBuilder.string().min(1),
  titleKey: schemaBuilder.string().min(1),
  bodyKey: schemaBuilder.string().min(1),
  params: notificationParamsField,
  readAt: isoInstantField.nullable(),
  createdAt: isoInstantField,
});

export const notificationListResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(notificationResponseSchema),
  ...pagedEnvelopeFields,
});

const notificationPreferenceSchema = schemaBuilder.object({
  category: schemaBuilder.enum(NOTIFICATION_CATEGORIES),
  channel: schemaBuilder.enum(NOTIFICATION_CHANNELS),
  enabled: schemaBuilder.boolean(),
});

export const notificationPreferencesResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(notificationPreferenceSchema),
});

export const quietHoursResponseSchema = schemaBuilder.object({
  userId: schemaBuilder.string().min(1),
  timezone: schemaBuilder.string().min(1),
  startsLocal: schemaBuilder.string().min(1),
  endsLocal: schemaBuilder.string().min(1),
  urgentCancellationOverride: schemaBuilder.boolean(),
});
