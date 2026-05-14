import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-player-detail',
  templateUrl: './player-detail.page.html',
  styleUrls: ['./player-detail.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    FormsModule,
    HeaderComponent,
  ],
})
export class PlayerDetailPage implements OnInit {
  constructor() {}

  ngOnInit() {
    // Temporal para que el linter no de error
    console.log('PlayerDetailPage inicializado');
  }
}
