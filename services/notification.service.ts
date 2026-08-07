import { client } from "@/lib/api/client";
import type { NotificationItem } from "@/types/notification";

export async function getNotifications(): Promise<NotificationItem[]> {
  const response = await client.get<NotificationItem[]>("/notifications");
  return response.data;
}

export async function markNotificationRead(id: string | number): Promise<void> {
  await client.post(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await client.post("/notifications/read-all");
}

export async function deleteNotification(id: string | number): Promise<void> {
  await client.delete(`/notifications/${id}`);
}

export async function deleteAllNotifications(): Promise<void> {
  await client.delete("/notifications");
}
