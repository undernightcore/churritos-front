import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PollRoutingModule } from './poll-routing.module';
import { PollComponent } from './poll.component';
import { PasswordModalComponent } from './components/password-modal/password-modal.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { IdToOptionPipe } from './pipes/id-to-option.pipe';
import { OptionComponent } from './pages/option/option.component';
import {InfiniteScrollModule} from "../../directives/infinite-scroll/infinite-scroll.module";

@NgModule({
  declarations: [PollComponent, PasswordModalComponent, IdToOptionPipe, OptionComponent],
  imports: [
    CommonModule,
    PollRoutingModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSelectModule,
    InfiniteScrollModule,
  ],
})
export class PollModule {}
