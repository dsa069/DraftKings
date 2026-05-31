import { Component, OnInit, inject } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavController, ToastController } from '@ionic/angular'; // <-- Para navegar hacia atrás
import { NewsService } from '../../core/services/abstract/news.service';
import { News } from '../../core/models/news.model';
import { AuthService } from '../../core/services/abstract/auth.service';
import {
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSegment,
  IonSegmentButton,
  IonAvatar,
  IonButton,
  IonIcon,
  IonChip,
  IonSpinner,
  IonImg,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, send } from 'ionicons/icons';
import { HeaderSubmenuComponent } from '../../shared/components/header-submenu/header-submenu.component';

@Component({
  selector: 'app-new-players-news',
  templateUrl: './new-players-news.page.html',
  styleUrls: ['./new-players-news.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonText,
    IonCard,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonSegment,
    IonSegmentButton,
    IonAvatar,
    IonButton,
    IonIcon,
    IonChip,
    IonSpinner,
    IonImg,
    UpperCasePipe,
    FormsModule,
    HeaderSubmenuComponent,
  ],
})
export class NewPlayersNewsPage implements OnInit {
  private navCtrl = inject(NavController);
  private newsService = inject(NewsService);
  private toastController = inject(ToastController);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  public readonly isAuthenticated = this.authService.isAuthenticated;
  public readonly isAdmin = this.authService.isAdmin;

  public isLoading = this.newsService.loading;
  public playerData: any = null;

  // Estado del formulario
  public formData = {
    fecha: new Date().toISOString().split('T')[0], // Formato inicial YYYY-MM-DD para el ion-input type="date"
    interes: 'media', // Valor por defecto
    jugador: '',
    titulo: '',
    descripcion: '',
    etiquetas: [] as string[],
  };

  // Variable temporal para capturar lo escrito en el input de tags
  public currentTag: string = '';

  constructor() {
    addIcons({ close, send });
  }

  removeLinkedPlayer() {
    this.playerData = null;
    this.formData.jugador = ''; // Limpiamos el nombre para que el formulario pida rellenarlo de nuevo
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['nombre']) {
        this.playerData = {
          name: params['nombre'],
          position: params['posicion'] || 'N/A',
          photoUrl:
            params['foto'] ||
            'https://ionicframework.com/docs/img/demos/avatar.svg',
        };

        // Asignamos el nombre al formData para que se envíe al endpoint
        this.formData.jugador = params['nombre'];
      }
    });
  }

  // Lógica de Etiquetas (Tags)
  addTag() {
    let tag = this.currentTag.trim();
    if (tag) {
      // Requisito XSD: \S+ (no puede contener espacios)
      tag = tag.replace(/\s+/g, '');

      // Requisito XSD: El patrón empieza por '#'
      if (!tag.startsWith('#')) {
        tag = '#' + tag;
      }

      // Requisito XSD: maxOccurs="6"
      if (
        this.formData.etiquetas.length < 6 &&
        !this.formData.etiquetas.includes(tag)
      ) {
        this.formData.etiquetas.push(tag);
      }
    }
    this.currentTag = '';
  }

  removeTag(tagToRemove: string) {
    this.formData.etiquetas = this.formData.etiquetas.filter(
      (t) => t !== tagToRemove
    );
  }

  // Convierte "YYYY-MM-DD" a "DD/MM/AAAA" según lo pide tu modelo News
  private formatToApiDate(dateString: string): string {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  }

  async onSubmit() {
    let errorMessage = '';

    // Validaciones desglosadas basadas en el XSD
    if (this.formData.jugador.length < 2 || this.formData.jugador.length > 50) {
      errorMessage = 'Player name must be between 2 and 50 characters long.';
    } else if (
      this.formData.titulo.length < 5 ||
      this.formData.titulo.length > 30
    ) {
      errorMessage = 'Title must be between 5 and 30 characters long.';
    } else if (
      this.formData.descripcion.length < 20 ||
      this.formData.descripcion.length > 250
    ) {
      errorMessage = 'Details must be between 20 and 250 characters long.';
    } else if (
      this.formData.etiquetas.length < 1 ||
      this.formData.etiquetas.length > 6
    ) {
      errorMessage = 'You must include between 1 and 6 tags.';
    }

    // Si hay un error, mostramos el Toast y detenemos el envío
    if (errorMessage) {
      const toast = await this.toastController.create({
        message: errorMessage,
        duration: 3000,
        position: 'bottom',
        color: 'danger',
        icon: 'warning', // Opcional, añade un icono de alerta
      });
      await toast.present();
      return;
    }

    const newArticle: News = {
      fecha: this.formatToApiDate(this.formData.fecha),
      interes: this.formData.interes,
      jugador: this.formData.jugador,
      titulo: this.formData.titulo,
      descripcion: this.formData.descripcion,
      etiquetas: this.formData.etiquetas,
    };

    try {
      await this.newsService.createNews(newArticle);
      this.navCtrl.back();
    } catch (error) {
      console.error('Error al crear la noticia:', error);
      const toast = await this.toastController.create({
        message: 'Hubo un error en el servidor al publicar la noticia.',
        duration: 3000,
        position: 'bottom',
        color: 'danger',
      });
      await toast.present();
    }
  }
}
