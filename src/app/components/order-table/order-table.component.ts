import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OrderService } from '../../services/order.service';
import { Order, SortColumn, SortDirection } from '../../models/order.interface';
import { OrderFormDialogComponent } from '../order-form-dialog/order-form-dialog.component';

@Component({
  selector: 'app-order-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatTooltipModule,
    OrderFormDialogComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './order-table.component.html',
  styleUrls: ['./order-table.component.scss']
})
export class OrderTableComponent implements OnInit {
  private orderService = inject(OrderService);
  private dialog = inject(MatDialog);
  
  private ordersSignal = signal<Order[]>([]);
  isLoading = signal<boolean>(true);
  sortColumn = signal<SortColumn>('id');
  sortDirection = signal<SortDirection>('asc');
  
  displayedColumns: string[] = ['id', 'customer', 'date', 'status', 'actions'];
  
  orders = this.ordersSignal.asReadonly();
  totalOrders = computed(() => this.ordersSignal().length);
  
  sortedOrders = computed(() => {
    const orders = [...this.ordersSignal()];
    const column = this.sortColumn();
    const direction = this.sortDirection();
    
    orders.sort((a, b) => {
      let aValue: any = a[column as keyof Order];
      let bValue: any = b[column as keyof Order];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (column === 'date') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    return orders;
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
  
  sort(column: SortColumn): void {
    if (this.sortColumn() === column) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
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