import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Order } from '../../models/order.interface';

export interface DialogData {
  order: Order | null;
  isEditMode: boolean;
}

@Component({
  selector: 'app-order-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './order-form-dialog.component.html',
  styleUrls: ['./order-form-dialog.component.scss']
})
export class OrderFormDialogComponent {
  orderForm: FormGroup;
  isEditMode: boolean;
  
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<OrderFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.isEditMode = data.isEditMode;
    
    this.orderForm = this.fb.group({
      first_name: [
        data.order?.first_name || '', 
        [Validators.required, Validators.minLength(2)]
      ],
      last_name: [
        data.order?.last_name || '', 
        [Validators.required, Validators.minLength(2)]
      ],
      email: [
        data.order?.email || '', 
        [Validators.required, Validators.email]
      ],
      address: [
        data.order?.address || '', 
        Validators.required
      ],
      date: [
        data.order?.date ? new Date(data.order.date) : new Date(), 
        Validators.required
      ],
      status: [
        data.order?.status || 'Pending', 
        Validators.required
      ]
    });
  }
  
  onSubmit(): void {
    if (this.orderForm.valid) {
      const formValue = this.orderForm.value;
      
      const orderData = {
        ...formValue,
        date: formValue.date instanceof Date 
          ? formValue.date.toISOString().split('T')[0] 
          : formValue.date
      };
      
      this.dialogRef.close(orderData);
    } else {
      Object.keys(this.orderForm.controls).forEach(key => {
        this.orderForm.get(key)?.markAsTouched();
      });
    }
  }
  
  onCancel(): void {
    this.dialogRef.close();
  }
  
  getErrorMessage(controlName: string): string {
    const control = this.orderForm.get(controlName);
    
    if (control?.hasError('required')) {
      return 'This field is required';
    }
    
    if (control?.hasError('minlength')) {
      return `Minimum ${control.errors?.['minlength'].requiredLength} characters`;
    }
    
    if (control?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    
    return '';
  }
}