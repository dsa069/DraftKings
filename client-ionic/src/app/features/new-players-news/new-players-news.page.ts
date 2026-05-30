import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSegment,
  IonSegmentButton,
  IonAvatar,
  IonButton,
  IonIcon,
  IonChip,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, send } from 'ionicons/icons';
import { HeaderSubmenuComponent } from '../../shared/components/header-submenu/header-submenu.component';

@Component({
  selector: 'app-new-players-news',
  templateUrl: './new-players-news.page.html',
  styleUrls: ['./new-players-news.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonText,
    IonCard,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonSegment,
    IonSegmentButton,
    IonAvatar,
    IonButton,
    IonIcon,
    IonChip,
    FormsModule,
    HeaderSubmenuComponent,
  ],
})
export class NewPlayersNewsPage implements OnInit {
  constructor() {
    // Registramos los iconos que se utilizan en la plantilla
    addIcons({ close, send });
  }

  ngOnInit() {
    // Temporal para que el linter no de error
    console.log('NewPlayersNewsPage inicializado');
  }
}
