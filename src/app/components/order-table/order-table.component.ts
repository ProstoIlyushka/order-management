import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.interface';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { OrderFormDialogComponent } from '../order-form-dialog/order-form-dialog.component';

@Component({
  selector: 'app-order-table',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './order-table.component.html',
  styleUrls: ['./order-table.component.scss']
})
export class OrderTableComponent implements OnInit {
  orders: Order[] = [];
  loading = true;

  showEmail = false;
  showAddress = false;

  constructor(
    private service: OrderService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.service.getOrders().subscribe(data => {
      this.orders = data;
      this.loading = false;
    });
  }

  openDialog(order?: Order) {
    if (order?.status === 'Archive') return;

    this.dialog.open(OrderFormDialogComponent, {
      data: order
    });
  }

  toggle(col: string) {
    if (col === 'email') this.showEmail = !this.showEmail;
    if (col === 'address') this.showAddress = !this.showAddress;
  }
}