export interface SelectOption<T extends string = string> {
  label: string;
  value: T;
}

export interface NavItem {
  label: string;
  path: string;
  icon: string;
  badge?: number;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export type SortDirection = "asc" | "desc";

export type ThemeMode = "dark" | "light" | "system";