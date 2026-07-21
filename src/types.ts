/**
 * Styling and metadata options for the Discord embed.
 */
export type EmbedOptions = {
  title?: string;
  description?: string;
  author?: { name: string; icon_url?: string; url?: string };
  color?: number;
  footer?: { text: string; icon_url?: string };
  timestamp?: string | Date;
};

/**
 * Base options for all Formcord V2 notifications.
 */
export type FormcordOptions = {
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
  * The text that appears outside the embed (top message content).
  */
  text?: string;
  /**
  * Optional embed theming and metadata.
  */
  embed?: EmbedOptions;
  /**
  * Key-value fields that will be automatically formatted into the embed.
  */
  data?: Record<string, unknown>;
  /**
   * Files to attach to the message. Can be FormcordFile objects or raw standard File/Blob objects.
   */
  files?: (FormcordFile | Blob)[];
}

/** The delivery status returned by Formcord notification methods. */
export type FormcordResult = {
  success: boolean;
};

/**
 * Representation of a file to be attached to the Discord message.
 */
export type FormcordFile = {
  /**
   * Name of the file with extension (e.g. "report.pdf", "image.png").
   */
  name: string;
  /**
   * Raw file data. Can be a string, ArrayBuffer, Uint8Array, or Blob.
   */
  data: string | ArrayBuffer | Uint8Array | Blob;
  /**
   * Optional MIME type of the file.
   */
  contentType?: string;
  /**
   * Optional description of the file.
   */
  description?: string;
};
