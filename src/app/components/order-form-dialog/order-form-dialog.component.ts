import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Order } from '../../models/order.interface';

@Component({
  selector: 'app-order-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './order-form-dialog.component.html',
  styleUrls: ['./order-form-dialog.component.scss']
})
export class OrderFormDialogComponent {
  form = this.fb.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    address: [''],
    date: ['', Validators.required],
    status: ['Active']
  });

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<OrderFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Order
  ) {
    if (data) this.form.patchValue(data);
  }

  save() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}