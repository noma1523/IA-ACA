export type Role = "student" | "editor" | "admin";
export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  created_at: number;
};
export type Subscription = {
  user_id: string;
  plan: string;
  expires_at: number;
  status: string;
};
export type Question = {
  question: string;
  options: string[];
  correctIndex: number;
};
export type PublicQuestion = Omit<Question, "correctIndex">;
export type Content = {
  lesson_id: string;
  body: string;
  video_url: string;
  quiz_json: string;
  published: number;
  updated_at: number;
};
export type Progress = {
  lesson_id: string;
  best_score: number;
  completed_at: number | null;
};
export type Post = {
  id: string;
  title: string;
  body: string;
  category: string;
  source_url: string;
  status: "draft" | "published";
  created_at: number;
};
export type Comment = {
  id: string;
  name: string;
  body: string;
  created_at: number;
};
export type FeedPost = Post & { bookmarked: boolean; comments: Comment[] };
