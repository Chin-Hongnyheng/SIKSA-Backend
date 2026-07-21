import { Injectable, Logger } from '@nestjs/common';
import { getMessaging } from 'firebase-admin/messaging';

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>; // e.g. { screen: 'courseDetail', courseId: '123' }
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  /** Send to a single user's device token */
  async sendToToken(
    fcmToken: string | null | undefined,
    payload: NotificationPayload,
  ) {
    if (!fcmToken) return;
    try {
      await getMessaging().send({
        token: fcmToken,
        notification: { title: payload.title, body: payload.body },
        data: payload.data,
      });
    } catch (err: any) {
      this.logger.error(`FCM send failed: ${err.message}`);
    }
  }

  /** Send the same notification to many tokens at once (e.g. all students in a class) */
  async sendToTokens(
    fcmTokens: (string | null | undefined)[],
    payload: NotificationPayload,
  ) {
    const validTokens = fcmTokens.filter((t): t is string => !!t);
    if (validTokens.length === 0) return;
    try {
      await getMessaging().sendEachForMulticast({
        tokens: validTokens,
        notification: { title: payload.title, body: payload.body },
        data: payload.data,
      });
    } catch (err: any) {
      this.logger.error(`FCM multicast send failed: ${err.message}`);
    }
  }
}
