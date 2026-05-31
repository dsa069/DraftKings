import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavController, ToastController } from '@ionic/angular'; // <-- Para navegar hacia atrás
import { NewsService } from '../../core/services/abstract/news.service';
import { News } from '../../core/models/news.model';
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
  IonSpinner, // <-- AGREGADO
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
    IonSpinner, // <-- AGREGADO
    FormsModule,
    HeaderSubmenuComponent,
  ],
})
export class NewPlayersNewsPage implements OnInit {
  private navCtrl = inject(NavController);
  private newsService = inject(NewsService);
  private toastController = inject(ToastController);
  public isLoading = this.newsService.loading;

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

  ngOnInit() {
    console.log('NewPlayersNewsPage initialized');
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
