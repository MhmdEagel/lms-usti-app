type TNotificationType = "ASSIGNMENT_CREATED" | "SUBMISSION_GRADED" | "FORUM_POST_CREATED";

interface INotification {
  id: string;
  type: TNotificationType;
  title: string;
  body: string;
  classroom_id: string;
  assignment_id: string;
  forum_post_id: string;
  is_read: boolean;
  created_at: string;
}
