import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PollRoutingModule } from './poll-routing.module';
import { PollComponent } from './poll.component';

@NgModule({
  declarations: [PollComponent],
  imports: [CommonModule, PollRoutingModule],
})
export class PollModule {}
