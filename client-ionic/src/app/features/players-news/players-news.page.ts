import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonGrid,
  IonRow,
  IonText,
  IonIcon,
  IonBadge,
  IonCard,
  IonContent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, personOutline } from 'ionicons/icons';
import { HeaderSubmenuComponent } from '../../shared/components/header-submenu/header-submenu.component';

@Component({
  selector: 'app-players-news',
  templateUrl: './players-news.page.html',
  styleUrls: ['./players-news.page.scss'],
  standalone: true,
  imports: [
    IonGrid,
    IonRow,
    IonText,
    IonIcon,
    IonBadge,
    IonContent,
    FormsModule,
    IonCard,
    HeaderSubmenuComponent,
  ],
})
export class PlayersNewsPage implements OnInit {
  constructor() {
    // Registramos los iconos localmente (Buena práctica en Standalone)
    addIcons({ calendarOutline, personOutline });
  }

  ngOnInit() {
    console.log('PlayersNewsPage inicializado');
  }
}
