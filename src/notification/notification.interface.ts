export interface IUserNotification {}

/**
 * A recipient of a notification
 */
export interface IRecipient {
  /**
   * The recipient's email address
   */
  email?: string;
  /**
   * The recipient's phone number
   */
  phone?: string;
  /**
   * The recipient's FCM push notification token
   */
  fcmTokens?: string[];
  /**
   * Language
   */
  language?: string;
}
