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
  selector: 'app-new-players-news',
  templateUrl: './new-players-news.page.html',
  styleUrls: ['./new-players-news.page.scss'],
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
export class NewPlayersNewsPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
