import type { UserSettings } from "../services/settingsService";

export const USER_SETTINGS_UPDATED_EVENT = "sistema-mei:user-settings-updated";

export type UserSettingsUpdatedEvent = CustomEvent<UserSettings>;
