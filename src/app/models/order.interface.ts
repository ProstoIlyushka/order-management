export interface Order {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  address: string;
  date: string;
  status: 'Active' | 'Pending' | 'Archive';
}