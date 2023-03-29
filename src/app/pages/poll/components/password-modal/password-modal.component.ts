import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-password-modal',
  templateUrl: './password-modal.component.html',
  styleUrls: ['./password-modal.component.scss'],
})
export class PasswordModalComponent {
  constructor(private dialogRef: MatDialogRef<PasswordModalComponent>) {}

  passwordField = new FormControl('', [
    Validators.required,
    Validators.minLength(4),
  ]);

  handleSave() {
    this.passwordField.markAsTouched();
    if (this.passwordField.invalid) return;
    this.dialogRef.close(this.passwordField.value);
  }
}
