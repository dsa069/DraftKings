import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-create-players-news',
  templateUrl: './create-players-news.page.html',
  styleUrls: ['./create-players-news.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class CreatePlayersNewsPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
