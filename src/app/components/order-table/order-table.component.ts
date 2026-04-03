import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { OrderService } from '../../services/order.service';
import { Order, SortColumn, SortDirection } from '../../models/order.interface';
import { OrderFormDialogComponent } from '../order-form-dialog/order-form-dialog.component';

type SortType = 'newest' | 'oldest' | 'status' | 'customer';

@Component({
  selector: 'app-order-table',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './order-table.component.html',
  styleUrls: ['./order-table.component.scss']
})
export class OrderTableComponent implements OnInit {
  private orderService = inject(OrderService);
  private dialog = inject(MatDialog);
  
  private ordersSignal = signal<Order[]>([]);
  isLoading = signal<boolean>(true);
  currentSort = signal<SortType>('newest'); // Текущий тип сортировки
  
  displayedColumns: string[] = ['id', 'customer', 'date', 'status', 'actions'];
  
  orders = this.ordersSignal.asReadonly();
  totalOrders = computed(() => this.ordersSignal().length);
  
  // Сортировка в зависимости от выбранного типа
  sortedOrders = computed(() => {
    const orders = [...this.ordersSignal()];
    const sortType = this.currentSort();
    
    switch(sortType) {
      case 'newest':
        return orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      case 'oldest':
        return orders.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      case 'status':
        const statusOrder = { 'Active': 1, 'Inactive': 2, 'Pending': 3, 'Archive': 4 };
        return orders.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
      default:
        return orders;
    }
  });
  
  ngOnInit(): void {
    this.loadOrders();
  }
  
  loadOrders(): void {
    this.isLoading.set(true);
    this.orderService.getOrders().subscribe({
      next: (orders: Order[]) => {
        this.ordersSignal.set(orders);
        this.isLoading.set(false);
      },
      error: (error: Error) => {
        console.error('Ошибка:', error);
        this.isLoading.set(false);
      }
    });
  }
  
  // Обработчик изменения сортировки
  onSortChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.currentSort.set(select.value as SortType);
  }
  
  openEditDialog(order: Order): void {
    const dialogRef = this.dialog.open(OrderFormDialogComponent, {
      width: '600px',
      data: { order, isEditMode: true }
    });
    
    dialogRef.afterClosed().subscribe((result: Partial<Order> | undefined) => {
      if (result) {
        this.orderService.updateOrder(order.id, result).subscribe({
          next: (updatedOrder: Order) => {
            this.ordersSignal.update(orders => 
              orders.map(o => o.id === updatedOrder.id ? updatedOrder : o)
            );
          }
        });
      }
    });
  }
  
  openNewOrderDialog(): void {
    const dialogRef = this.dialog.open(OrderFormDialogComponent, {
      width: '600px',
      data: { order: null, isEditMode: false }
    });
    
    dialogRef.afterClosed().subscribe((result: Omit<Order, 'id'> | undefined) => {
      if (result) {
        this.orderService.addOrder(result).subscribe({
          next: (newOrder: Order) => {
            this.ordersSignal.update(orders => [...orders, newOrder]);
          }
        });
      }
    });
  }
  
  isRowClickable(order: Order): boolean {
    return order.status !== 'Archive';
  }
}