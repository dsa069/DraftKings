import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../../../shared/components/header/header.component';

@Component({
  selector: 'app-my-team',
  templateUrl: 'my-team.page.html',
  styleUrls: ['my-team.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, HeaderComponent],
})
export class MyTeamPage {
  constructor() {}
}
