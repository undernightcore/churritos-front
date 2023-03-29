import { Pipe, PipeTransform } from '@angular/core';
import { OptionInterface } from '../../../../interfaces/option.interface';

@Pipe({
  name: 'idToOption',
})
export class IdToOptionPipe implements PipeTransform {
  transform(id: number | null, options: OptionInterface[]) {
    return options.find((option) => option.id === id)?.title;
  }
}
