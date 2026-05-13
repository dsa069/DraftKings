import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-new-players-news',
  templateUrl: './new-players-news.page.html',
  styleUrls: ['./new-players-news.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class NewPlayersNewsPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
