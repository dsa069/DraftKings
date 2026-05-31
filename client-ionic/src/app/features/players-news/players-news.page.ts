import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  IonGrid,
  IonRow,
  IonText,
  IonIcon,
  IonBadge,
  IonCard,
  IonContent,
  IonSpinner,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, personOutline } from 'ionicons/icons';
import { HeaderSubmenuComponent } from '../../shared/components/header-submenu/header-submenu.component';
import { NewsService } from '../../core/services/abstract/news.service';
import { AuthService } from '../../core/services/abstract/auth.service';
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
    IonCard,
    IonSpinner,
    FormsModule,
    HeaderSubmenuComponent,
  ],
})
export class PlayersNewsPage implements OnInit {
  private route = inject(ActivatedRoute);
  private newsService = inject(NewsService);
  private authService = inject(AuthService);

  // Enlazamos directamente con las señales reactivas del servicio centralizado
  public selectedNews = this.newsService.selectedNews;
  public isLoading = this.newsService.loading;

  public readonly isAuthenticated = this.authService.isAuthenticated;

  constructor() {
    // Registramos los iconos localmente
    addIcons({ calendarOutline, personOutline });
  }

  async ngOnInit() {
    console.log('PlayersNewsPage inicializado');

    // Capturamos el parámetro 'id' enviado desde la lista de noticias
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      try {
        // Ejecutamos la petición al endpoint correspondiente (Node o Spring automáticamente)
        await this.newsService.getNewsById(id);
      } catch (error) {
        console.error('Error al obtener el detalle de la noticia:', error);
      }
    }
  }
}
