export interface Order {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  address: string;
  date: string;
  status: 'Active' | 'Inactive' | 'Pending' | 'Archive';
}

export type SortColumn = keyof Order;
export type SortDirection = 'asc' | 'desc';

export interface SortEvent {
  column: SortColumn;
  direction: SortDirection;
}