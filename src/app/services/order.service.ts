// src/app/services/order.service.ts
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
    
    return this.http.get<any[]>(this.apiUrl).pipe(
      delay(500),
      map(orders => {
        // Нормализуем и очищаем данные
        this.ordersCache = orders
          .map(order => this.normalizeOrder(order))
          .filter(order => order !== null) as Order[];
        
        return this.ordersCache;
      }),
      catchError(error => {
        console.error('Ошибка загрузки данных:', error);
        return of([]);
      })
    );
  }
  
  /**
   * Нормализует один заказ: проверяет и исправляет все поля
   * @returns Order или null, если заказ невалидный
   */
  private normalizeOrder(raw: any): Order | null {
    // Проверяем обязательные поля
    if (!raw || typeof raw !== 'object') return null;
    
    // 1. ID: должен быть числом
    const id = typeof raw.id === 'number' ? raw.id : null;
    if (id === null) return null;
    
    // 2. Имя и фамилия: строки, минимум 1 символ
    const first_name = this.normalizeString(raw.first_name);
    const last_name = this.normalizeString(raw.last_name);
    if (!first_name || !last_name) return null;
    
    // 3. Email: валидный email
    const email = this.normalizeEmail(raw.email);
    if (!email) return null;
    
    // 4. Адрес: строка, не пустая
    const address = this.normalizeString(raw.address);
    if (!address) return null;
    
    // 5. Дата: валидная дата
    const date = this.normalizeDate(raw.date);
    if (!date) return null;
    
    // 6. Статус: только допустимые значения
    const status = this.normalizeStatus(raw.status);
    if (!status) return null;
    
    return {
      id,
      first_name,
      last_name,
      email,
      address,
      date,
      status
    };
  }
  
  /**
   * Нормализует строку: убирает лишние пробелы, проверяет на пустоту
   */
  private normalizeString(value: any): string | null {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  
  /**
   * Нормализует email: проверяет формат
   */
  private normalizeEmail(email: any): string | null {
    const str = this.normalizeString(email);
    if (!str) return null;
    
    // Простая проверка email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(str) ? str : null;
  }
  
  /**
   * Нормализует дату: преобразует DD.MM.YYYY или YYYY-MM-DD в единый формат
   */
  private normalizeDate(dateStr: any): string | null {
    if (typeof dateStr !== 'string') return null;
    
    // Убираем лишние пробелы
    dateStr = dateStr.trim();
    if (!dateStr || dateStr === 'Invalid Date') return null;
    
    let year: number, month: number, day: number;
    
    // Формат DD.MM.YYYY (например, 30.08.2019)
    if (dateStr.includes('.')) {
      const parts = dateStr.split('.');
      if (parts.length === 3) {
        day = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10);
        year = parseInt(parts[2], 10);
        
        if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
        
        const date = new Date(year, month - 1, day);
        if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) {
          // Возвращаем в ISO формате
          return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
      }
    }
    
    // Формат YYYY-MM-DD
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10);
        day = parseInt(parts[2], 10);
        
        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
          const date = new Date(year, month - 1, day);
          if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) {
            return dateStr;
          }
        }
      }
    }
    
    // Пробуем стандартный парсинг
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    
    return null;
  }
  
  /**
   * Нормализует статус: только допустимые значения
   */
  private normalizeStatus(status: any): Order['status'] | null {
    const validStatuses: Order['status'][] = ['Active', 'Inactive', 'Pending', 'Archive'];
    const str = this.normalizeString(status);
    
    if (!str) return null;
    
    // Приводим к правильному формату (первая буква заглавная, остальные строчные)
    const normalized = str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    
    return validStatuses.includes(normalized as Order['status']) 
      ? normalized as Order['status'] 
      : null;
  }
  
  // Остальные методы (addOrder, updateOrder, deleteOrder) без изменений
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