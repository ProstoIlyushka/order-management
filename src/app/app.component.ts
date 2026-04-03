import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';  // <-- ДОБАВЬТЕ ЭТОТ ИМПОРТ
import { OrderTableComponent } from './components/order-table/order-table.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, OrderTableComponent],  // <-- ДОБАВЬТЕ RouterOutlet
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'order-management';
}