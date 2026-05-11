import type { UserSettings } from "../services/settingsService";

export const USER_SETTINGS_UPDATED_EVENT = "boramei:user-settings-updated";

export type UserSettingsUpdatedEvent = CustomEvent<UserSettings>;
