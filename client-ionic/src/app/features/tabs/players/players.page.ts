import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../../../shared/components/header/header.component';

@Component({
  selector: 'app-players',
  templateUrl: 'players.page.html',
  styleUrls: ['players.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, HeaderComponent],
})
export class PlayersPage {
  constructor() {}
}
