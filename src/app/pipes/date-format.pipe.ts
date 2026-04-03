import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customDate',
  standalone: true
})
export class CustomDateFormatPipe implements PipeTransform {
  transform(value: string | Date): string {
    if (!value) return '';
    
    // Если уже Date объект
    if (value instanceof Date) {
      return value.toLocaleDateString('ru-RU');
    }
    
    // Преобразуем "30.08.2019" в "2019-08-30"
    if (typeof value === 'string' && value.includes('.')) {
      const parts = value.split('.');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        const date = new Date(`${year}-${month}-${day}`);
        return date.toLocaleDateString('ru-RU');
      }
    }
    
    // Если ISO формат
    const date = new Date(value);
    return date.toLocaleDateString('ru-RU');
  }
}