import { Component, OnInit, inject, signal } from '@angular/core';
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
  IonText,
  IonSpinner,
  IonIcon,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { NavController } from '@ionic/angular';
import { NewsService } from '../../../core/services/abstract/news.service';
import { News } from '../../../core/models/news.model';
import { AuthService } from '../../../core/services/abstract/auth.service';
import { addIcons } from 'ionicons';
import { personCircleOutline } from 'ionicons/icons';

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
    IonText,
    IonSpinner,
    IonIcon,
    CommonModule,
    FormsModule,
    HeaderComponent,
  ],
})
export class NewsPage implements OnInit {
  private navCtrl = inject(NavController);
  private newsService = inject(NewsService);
  private authService = inject(AuthService);

  // Señal reactiva para almacenar el listado de noticias proveniente del backend
  public newsList = signal<News[]>([]);
  public isLoading = this.newsService.loading;
  public readonly isAuthenticated = this.authService.isAuthenticated;

  constructor() {
    addIcons({
      personCircleOutline,
    });
  }

  async ngOnInit() {
    console.log('NewsPage initialized');
    try {
      // Consumimos el servicio (ya sea Node o Spring según tu entorno activo)
      const data = await this.newsService.getNews();
      this.newsList.set(data);
    } catch (error) {
      console.error('Error al cargar las noticias:', error);
    }
  }

  // Ahora recibimos el ID de la noticia para redirigir a su respectivo detalle
  onNewsItemClick(id: string | number | undefined) {
    if (id !== undefined) {
      this.navCtrl.navigateForward(`/players-news/${id}`);
    }
  }
}
