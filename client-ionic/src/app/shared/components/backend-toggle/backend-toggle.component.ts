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
  @Input() isNodeSelected: boolean = true;
  @Output() selectionChange = new EventEmitter<boolean>();

  constructor() {
    addIcons({ logoNodejs, leafOutline });
  }

  select(value: boolean) {
    this.isNodeSelected = value;
    this.selectionChange.emit(value);
  }
}
