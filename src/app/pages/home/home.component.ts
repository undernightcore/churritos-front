import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MemoryStorageService } from '../../services/memory-storage.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  constructor(
    private router: Router,
    private memoryStorageService: MemoryStorageService
  ) {
    this.memoryStorageService.clear();
  }

  pollNumberControl = new FormControl('', [
    Validators.required,
    Validators.min(1),
  ]);

  handleSubmit() {
    this.pollNumberControl.markAsTouched();
    if (this.pollNumberControl.invalid) return;
    this.router.navigate(['/poll', this.pollNumberControl.value]);
  }
}
