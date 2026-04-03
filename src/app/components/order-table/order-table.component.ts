import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.interface';
import { OrderFormDialogComponent } from '../order-form-dialog/order-form-dialog.component';
import { CustomDateFormatPipe } from '../../pipes/date-format.pipe';

type SortType = 'newest' | 'id' | 'status' | 'customer';

@Component({
  selector: 'app-order-table',
  standalone: true,
  imports: [CommonModule, MatDialogModule, CustomDateFormatPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './order-table.component.html',
  styleUrls: ['./order-table.component.scss']
})
export class OrderTableComponent implements OnInit {
  private orderService = inject(OrderService);
  private dialog = inject(MatDialog);
  
  private ordersSignal = signal<Order[]>([]);
  isLoading = signal<boolean>(true);
  currentSort = signal<SortType>('newest');
  
  orders = this.ordersSignal.asReadonly();
  totalOrders = computed(() => this.ordersSignal().length);
  
  private statusOrder: Record<string, number> = {
    'Active': 1,
    'Inactive': 2,
    'Pending': 3,
    'Archive': 4
  };
  
  private parseDate(dateStr: string): number {
    if (!dateStr) return 0;
    if (dateStr === 'Invalid Date') return 0;
    
    if (dateStr.includes('.')) {
      const parts = dateStr.split('.');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        const date = new Date(`${year}-${month}-${day}`);
        return isNaN(date.getTime()) ? 0 : date.getTime();
      }
    }
    
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? 0 : date.getTime();
  }
  
  sortedOrders = computed(() => {
    const orders = [...this.ordersSignal()];
    const sortType = this.currentSort();
    
    switch(sortType) {
      case 'newest':
        return orders.sort((a, b) => {
          const timeA = this.parseDate(a.date);
          const timeB = this.parseDate(b.date);
          if (timeA === 0 && timeB === 0) return 0;
          if (timeA === 0) return 1;
          if (timeB === 0) return -1;
          return timeB - timeA;
        });
        
      case 'id':
        return orders.sort((a, b) => a.id - b.id);
        
      case 'status':
        return orders.sort((a, b) => 
          this.statusOrder[a.status] - this.statusOrder[b.status]
        );
        
      case 'customer':
        return orders.sort((a, b) => {
          const fullNameA = `${a.last_name} ${a.first_name}`.toLowerCase();
          const fullNameB = `${b.last_name} ${b.first_name}`.toLowerCase();
          return fullNameA.localeCompare(fullNameB);
        });
        
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