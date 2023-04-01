import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PollComponent } from './poll.component';
import {OptionComponent} from "./pages/option/option.component";

const routes: Routes = [
  {
    path: '',
    component: PollComponent,
  },
  {
    path: 'option/:optionId',
    component: OptionComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PollRoutingModule {}
