export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  type: "assignment" | "result" | "system" | "class";
  link_to?: string;
}
