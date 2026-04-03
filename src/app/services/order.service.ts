import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, delay } from 'rxjs/operators';
import { Order } from '../models/order.interface';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = '/assets/MOCK_DATA.json';
  private ordersCache: Order[] | null = null;

  getOrders(): Observable<Order[]> {
    if (this.ordersCache) {
      return of(this.ordersCache).pipe(delay(500));
    }
    
    return this.http.get<Order[]>(this.apiUrl).pipe(
      delay(500),
      map(orders => {
        this.ordersCache = orders;
        return orders;
      }),
      catchError(error => {
        console.error('Ошибка загрузки данных:', error);
        return of([]);
      })
    );
  }
  
  addOrder(order: Omit<Order, 'id'>): Observable<Order> {
    const newId = Math.max(...(this.ordersCache?.map(o => o.id) || [0]), 0) + 1;
    const newOrder: Order = { ...order, id: newId };
    
    if (this.ordersCache) {
      this.ordersCache = [...this.ordersCache, newOrder];
    } else {
      this.ordersCache = [newOrder];
    }
    
    return of(newOrder).pipe(delay(300));
  }
  
  updateOrder(id: number, changes: Partial<Order>): Observable<Order> {
    if (this.ordersCache) {
      const index = this.ordersCache.findIndex(o => o.id === id);
      if (index !== -1) {
        this.ordersCache[index] = { ...this.ordersCache[index], ...changes };
        return of(this.ordersCache[index]).pipe(delay(300));
      }
    }
    throw new Error('Order not found');
  }
  
  deleteOrder(id: number): Observable<boolean> {
    if (this.ordersCache) {
      this.ordersCache = this.ordersCache.filter(o => o.id !== id);
      return of(true).pipe(delay(300));
    }
    return of(false);
  }
}