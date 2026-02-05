/**
 * Optional overrides for embed styling.
 */
export type EmbedTheme = {
  title?: string;
  author?: { name: string };
  color?: number;
  footer?: { text: string };
  timestamp?: string;
};

/**
 * Base parameters shared by all notify helpers.
 */
export type BaseNotifyParams = {
  /**
  * Discord bot token.
  */
  token: string;
  /**
  * Discord channel ID.
  */
  channelId: string;
  /**
  * If true, errors are thrown instead of swallowed.
  */
  throwOnError?: boolean;
  /**
  * Optional embed theming overrides.
  */
  theme?: EmbedTheme;
  /**
  * Optional message content shown above the embed.
  */
  content?: string;
}