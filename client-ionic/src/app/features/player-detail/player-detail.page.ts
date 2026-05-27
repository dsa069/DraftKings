import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectorRef,
  NgZone,
  ChangeDetectionStrategy,
  effect,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe, NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonBadge,
  IonButton,
  IonIcon,
  IonAccordionGroup,
  IonAccordion,
  IonItem,
  IonSpinner,
  IonNote,
  IonList,
  IonModal,
  IonLabel,
  IonAvatar,
  IonInput,
  NavController,
  IonTextarea,
} from '@ionic/angular/standalone';
import { HeaderSubmenuComponent } from '../../shared/components/header-submenu/header-submenu.component';
import { MapCaptureComponent } from '../../shared/components/map-capture/map-capture.component';
import { Player } from '../../core/models/player.model';
import { PlayerService } from '../../core/services/abstract/player.service';
import { Review } from '../../core/models/review.model';
import { ReviewService } from '../../core/services/abstract/review.service';
import { addIcons } from 'ionicons';
import {
  pencil,
  informationCircle,
  chatbox,
  person,
  star,
  starOutline,
  send,
  documentText,
  locationOutline,
  trash,
  personOutline,
  chatboxOutline,
  checkmark,
  close,
} from 'ionicons/icons';

export interface ReviewUI extends Review {
  isEditing?: boolean;
}

@Component({
  selector: 'app-player-detail',
  templateUrl: './player-detail.page.html',
  styleUrls: ['./player-detail.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonContent,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonGrid,
    IonRow,
    IonCol,
    IonText,
    IonBadge,
    IonButton,
    IonIcon,
    IonAccordionGroup,
    IonAccordion,
    IonItem,
    IonSpinner,
    IonNote,
    IonList,
    IonModal,
    IonLabel,
    IonAvatar,
    IonInput,
    IonTextarea,
    DatePipe,
    NgStyle,
    HeaderSubmenuComponent,
    MapCaptureComponent,
    FormsModule,
  ],
})
export class PlayerDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly playerService = inject(PlayerService);
  private readonly reviewService = inject(ReviewService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly ngZone = inject(NgZone);
  private readonly navCtrl = inject(NavController);

  player = signal<Player | null>(null);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  private isLeavingPage = false;

  // Modal state para confirmación de delete
  private _showConfirmModal = signal(false);
  public showConfirmModal = this._showConfirmModal.asReadonly();

  // Lógica y estados reales para Comentarios (Reviews)
  comments = signal<ReviewUI[]>([]);
  isLoadingComments = signal<boolean>(false);

  // Formulario de nuevo comentario
  newCommentAuthor = signal<string>('');
  newCommentText = signal<string>('');
  newCommentRating = signal<number>(5); // Reemplaza "stars" por el rating numérico

  // Formulario de edición temporal
  editTempText = signal<string>('');
  editTempRating = signal<number>(5);

  // Modales de eliminación
  showDeleteCommentModal = signal<boolean>(false);
  commentToDeleteId = signal<string | number | null>(null);

  constructor() {
    // Registramos los íconos globalmente para este componente standalone
    addIcons({
      pencil,
      informationCircle,
      chatbox,
      person,
      star,
      starOutline,
      send,
      documentText,
      locationOutline,
      trash,
      personOutline,
      chatboxOutline,
      checkmark,
      close,
    });

    effect(() => {
      const currentPlayer = this.player();
      if (currentPlayer && currentPlayer.id) {
        this.loadReviews(currentPlayer.id);
      }
    });
  }

  ngOnInit(): void {
    const playerId = this.route.snapshot.paramMap.get('id');
    if (playerId) {
      this.loadPlayerDetail(playerId);
    } else {
      this.errorMessage.set('Player ID not found in route');
      this.isLoading.set(false);
    }
  }

  async ionViewWillEnter(): Promise<void> {
    // No recargar si estamos saliendo de esta página
    if (this.isLeavingPage) {
      this.isLeavingPage = false;
      return;
    }

    // Recargar el jugador cada vez que la vista se muestra
    // Esto asegura que los datos estén actualizados después de editar
    const playerId = this.route.snapshot.paramMap.get('id');
    if (playerId) {
      await this.loadPlayerDetail(playerId);
    }
  }

  ionViewDidLeave(): void {
    // Marcar que estamos saliendo para evitar recargas innecesarias
    this.isLeavingPage = true;
  }

  private async loadPlayerDetail(playerId: string): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      // Convertir playerId a número si es necesario
      const playerIdNum = isNaN(Number(playerId)) ? playerId : Number(playerId);
      const playerData = await this.playerService.getPlayerById(
        playerIdNum as any
      );

      // Usar ngZone para evitar ExpressionChangedAfterItHasBeenCheckedError
      this.ngZone.run(() => {
        this.player.set(playerData);
        this.cdr.markForCheck();
      });
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Error loading player details';
      this.errorMessage.set(errorMsg);
      console.error('Error cargando jugador:', error);
    } finally {
      this.isLoading.set(false);
      this.cdr.markForCheck();
    }
  }

  // Métodos para manejar delete player
  onDeletePlayer(): void {
    this._showConfirmModal.set(true);
  }

  onEditPlayer(): void {
    if (this.player()?.id) {
      const playerId = String(this.player()!.id);
      console.log('[PlayerDetailPage] Navegando a edición con ID:', playerId);
      this.navCtrl.navigateForward(`/new-player?id=${playerId}`);
    }
  }

  async confirmDeletePlayer(): Promise<void> {
    const playerId = this.player()?.id;

    if (!playerId) {
      this.errorMessage.set('ID de jugador no disponible');
      return;
    }

    this.isLoading.set(true);

    try {
      await this.playerService.deletePlayer(playerId);
      this._showConfirmModal.set(false);
      // Navegar a la lista de jugadores después de eliminar
      await this.navCtrl.navigateRoot('/tabs/players');
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Error al eliminar el jugador';
      this.errorMessage.set(errorMsg);
      console.error('Error eliminando jugador:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  cancelDeletePlayer(): void {
    this._showConfirmModal.set(false);
  }

  onModalDismiss(event: any): void {
    this._showConfirmModal.set(false);
  }
  // ==========================================
  // FUNCIONALIDADES REALES DE COMENTARIOS (BD)
  // ==========================================

  // 1. Cargar automáticamente de la Base de Datos
  async loadReviews(playerId: string | number): Promise<void> {
    this.isLoadingComments.set(true);
    try {
      const reviews = await this.reviewService.getReviewsByPlayer(playerId);
      // Ordenar por ID o fecha para mostrar los más recientes arriba si tu backend no lo hace
      this.comments.set(reviews.reverse());
    } catch (error) {
      console.error('Error cargando comentarios de la BD:', error);
    } finally {
      this.isLoadingComments.set(false);
      this.cdr.markForCheck();
    }
  }

  // 2. Crear Comentario Real en la BD
  async addComment(): Promise<void> {
    const targetPlayer = this.player();
    if (!targetPlayer || !targetPlayer.id) return;
    if (!this.newCommentAuthor().trim() || !this.newCommentText().trim())
      return;

    const reviewPayload: Partial<Review> = {
      author: this.newCommentAuthor(),
      text: this.newCommentText(),
      rating: this.newCommentRating(),
      userId: '1', // Aquí puedes vincular el UID real de tu servicio de autenticación si lo tienes
      latitude: targetPlayer.latitude || 0,
      longitude: targetPlayer.longitude || 0,
    };

    try {
      const savedReview = await this.reviewService.createReview(
        targetPlayer.id,
        reviewPayload
      );
      // Actualizamos el Signal agregando el nuevo comentario al inicio del array
      this.comments.update((curr) => [savedReview, ...curr]);

      // Limpiamos el formulario
      this.newCommentAuthor.set('');
      this.newCommentText.set('');
      this.newCommentRating.set(5);
    } catch (error) {
      console.error('Error al guardar el comentario en la BD:', error);
    } finally {
      this.cdr.markForCheck();
    }
  }

  // 3. Activar Modo Edición (Local)
  editComment(comment: ReviewUI) {
    this.editTempText.set(comment.text);
    this.editTempRating.set(comment.rating || 5);
    this.comments.update((curr) =>
      curr.map((c) => ({ ...c, isEditing: c.id === comment.id }))
    );
  }

  // 4. Guardar Edición Real en la BD
  async saveComment(comment: ReviewUI): Promise<void> {
    if (!comment.id || !this.editTempText().trim()) return;

    const updatedPayload: Partial<Review> = {
      text: this.editTempText(),
      rating: this.editTempRating(),
    };

    try {
      const updatedReview = await this.reviewService.updateReview(
        comment.id,
        updatedPayload
      );

      this.comments.update((curr) =>
        curr.map((c) =>
          c.id === comment.id ? { ...updatedReview, isEditing: false } : c
        )
      );
    } catch (error) {
      console.error('Error al editar el comentario en la BD:', error);
    } finally {
      this.cdr.markForCheck();
    }
  }

  cancelEditComment(comment: ReviewUI) {
    this.comments.update((curr) =>
      curr.map((c) => (c.id === comment.id ? { ...c, isEditing: false } : c))
    );
  }

  // 5. Borrado Real en la BD
  promptDeleteComment(commentId: string | number) {
    this.commentToDeleteId.set(commentId);
    this.showDeleteCommentModal.set(true);
  }

  async confirmDeleteComment(): Promise<void> {
    const id = this.commentToDeleteId();
    if (!id) return;

    try {
      await this.reviewService.deleteReview(id);
      // Removemos el comentario eliminado del Signal local de forma reactiva
      this.comments.update((curr) => curr.filter((c) => c.id !== id));
      this.showDeleteCommentModal.set(false);
      this.commentToDeleteId.set(null);
    } catch (error) {
      console.error('Error al eliminar el comentario de la BD:', error);
    } finally {
      this.cdr.markForCheck();
    }
  }

  cancelDeleteComment() {
    this.showDeleteCommentModal.set(false);
    this.commentToDeleteId.set(null);
  }
  updateNewRating(event: Event, rating: number) {
    event.stopPropagation(); // Evita que el clic detecte que hemos tocado el "fondo" vacío

    // Si tocas la misma estrella que ya tienes seleccionada, se resetea a 0
    if (this.newCommentRating() === rating) {
      this.newCommentRating.set(0);
    } else {
      this.newCommentRating.set(rating);
    }
  }

  updateEditRating(event: Event, rating: number) {
    event.stopPropagation();

    if (this.editTempRating() === rating) {
      this.editTempRating.set(0);
    } else {
      this.editTempRating.set(rating);
    }
  }
}
