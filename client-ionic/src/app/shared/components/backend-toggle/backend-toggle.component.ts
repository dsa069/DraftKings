import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logoNodejs, leafOutline } from 'ionicons/icons';

@Component({
  selector: 'app-backend-toggle',
  standalone: true,
  imports: [CommonModule, IonIcon],
  templateUrl: './backend-toggle.component.html',
  styleUrls: ['./backend-toggle.component.scss'],
})
export class BackendToggleComponent {
  @Input() selected: 'node' | 'springboot' = 'node';
  @Output() selectionChange = new EventEmitter<'node' | 'springboot'>();

  constructor() {
    addIcons({ logoNodejs, leafOutline });
  }

  select(option: 'node' | 'springboot') {
    this.selected = option;
    this.selectionChange.emit(option);
  }
}
