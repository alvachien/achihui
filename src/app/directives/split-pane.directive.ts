import { Directive, Input } from '@angular/core';

@Directive({selector: 'hih-split-pane'})
export class SplitPaneDirective {
  @Input() id: string;
}
