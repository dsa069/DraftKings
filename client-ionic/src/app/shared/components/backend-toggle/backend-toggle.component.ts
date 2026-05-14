import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
  IonLabel,
  IonText,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logoNodejs, leafOutline } from 'ionicons/icons';

@Component({
  selector: 'app-backend-toggle',
  standalone: true,
  imports: [
    CommonModule,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    IonIcon,
    IonLabel,
    IonText,
  ],
  templateUrl: './backend-toggle.component.html',
  styleUrls: ['./backend-toggle.component.scss'],
})
export class BackendToggleComponent {
  @Input() selectedBackend: 'node' | 'springboot' = 'node';
  @Output() selectionChange = new EventEmitter<'node' | 'springboot'>();

  constructor() {
    addIcons({ logoNodejs, leafOutline });
  }

  select(backend: 'node' | 'springboot') {
    this.selectedBackend = backend;
    this.selectionChange.emit(backend);
  }
}
