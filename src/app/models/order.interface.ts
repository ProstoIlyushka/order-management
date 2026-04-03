export interface Order {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  address: string;
  date: string;
  status: 'Active' | 'Pending' | 'Archive';
}

export type SortColumn = keyof Order; // Теперь экспортируется
export type SortDirection = 'asc' | 'desc'; // Теперь экспортируется

export interface SortEvent {
  column: SortColumn;
  direction: SortDirection;
}