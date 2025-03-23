export interface FeedbackCategory {
  id: string;
  label: string;
  icon: string;
}

export interface FeedbackItem {
  id: string;
  title: string;
  message: string;
  category: string;
  status: string;
  createdAt: string;
  updatedAt: string;
} 