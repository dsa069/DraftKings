import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonRow,
  IonCol,
  IonList,
  IonCard,
  IonBadge,
  IonAvatar,
  IonImg,
  IonText,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-news',
  templateUrl: './news.page.html',
  styleUrls: ['./news.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonRow,
    IonCol,
    IonList,
    IonCard,
    IonBadge,
    IonAvatar,
    IonImg,
    IonText,
    CommonModule,
    FormsModule,
    HeaderComponent,
  ],
})
export class NewsPage implements OnInit {
  private navCtrl = inject(NavController);

  ngOnInit() {
    console.log('NewsPage initialized');
  }

  onNewsItemClick() {
    this.navCtrl.navigateForward(`/players-news`);
  }
}
