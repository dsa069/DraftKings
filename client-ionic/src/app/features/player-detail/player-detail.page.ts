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
import { DatePipe, NgStyle, UpperCasePipe } from '@angular/common';
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
import { LocationService } from '../../core/services/location.service';
// --- NUEVAS IMPORTACIONES DE NOTICIAS ---
import { News } from '../../core/models/news.model';
import { NewsService } from '../../core/services/abstract/news.service';
// ----------------------------------------
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
  add,
  documentTextOutline,
} from 'ionicons/icons';
import { AuthService } from '../../core/services/abstract/auth.service';

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
    UpperCasePipe,
    HeaderSubmenuComponent,
    MapCaptureComponent,
    FormsModule,
  ],
})
export class PlayerDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly playerService = inject(PlayerService);
  private readonly reviewService = inject(ReviewService);
  private readonly locationService = inject(LocationService);
  // --- INYECTAR EL SERVICIO DE NOTICIAS ---
  private readonly newsService = inject(NewsService);
  // ----------------------------------------
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly ngZone = inject(NgZone);
  private readonly navCtrl = inject(NavController);
  public readonly authService = inject(AuthService);

  player = signal<Player | null>(null);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  private isLeavingPage = false;

  private _showConfirmModal = signal(false);
  public showConfirmModal = this._showConfirmModal.asReadonly();

  comments = signal<ReviewUI[]>([]);
  isLoadingComments = signal<boolean>(false);

  // --- SIGNAL PARA ALMACENAR NOTICIAS RELACIONADAS ---
  relatedNews = signal<News[]>([]);
  // ---------------------------------------------------

  newCommentAuthor = signal<string>('');
  newCommentText = signal<string>('');
  newCommentRating = signal<number>(5);

  editTempText = signal<string>('');
  editTempRating = signal<number>(5);

  showDeleteCommentModal = signal<boolean>(false);
  commentToDeleteId = signal<string | number | null>(null);

  constructor() {
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
      add,
      documentTextOutline,
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
    if (this.isLeavingPage) {
      this.isLeavingPage = false;
      return;
    }
    const playerId = this.route.snapshot.paramMap.get('id');
    if (playerId) {
      await this.loadPlayerDetail(playerId);
    }
  }

  ionViewDidLeave(): void {
    this.isLeavingPage = true;
  }

  private async loadPlayerDetail(playerId: string): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const playerIdNum = isNaN(Number(playerId)) ? playerId : Number(playerId);
      const playerData = await this.playerService.getPlayerById(
        playerIdNum as any
      );

      this.ngZone.run(() => {
        this.player.set(playerData);
        // --- CARGAR LAS NOTICIAS CUANDO YA TENEMOS EL JUGADOR ---
        this.loadRelatedNews(playerData.name);
        // --------------------------------------------------------
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

  // --- NUEVA FUNCIÓN PARA OBTENER Y FILTRAR NOTICIAS ---
  private async loadRelatedNews(playerName: string): Promise<void> {
    try {
      await this.waitForAuthReady();
      const allNews = await this.newsService.getNews();
      const filteredNews = allNews.filter((n) => n.jugador === playerName);
      this.relatedNews.set(filteredNews);
    } catch (error) {
      console.error('Error cargando las noticias:', error);
    } finally {
      this.cdr.markForCheck();
    }
  }

  private async waitForAuthReady(
    maxAttempts = 20,
    delayMs = 150
  ): Promise<void> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (this.authService.isAuthenticated()) {
        return;
      }

      await new Promise<void>((resolve) => setTimeout(resolve, delayMs));
    }
  }
  // -----------------------------------------------------

  onDeletePlayer(): void {
    this._showConfirmModal.set(true);
  }

  onEditPlayer(): void {
    if (this.player()?.id) {
      const playerId = String(this.player()!.id);
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

  async loadReviews(playerId: string | number): Promise<void> {
    this.isLoadingComments.set(true);
    try {
      const reviews = await this.reviewService.getReviewsByPlayer(playerId);
      this.comments.set(reviews.reverse());
    } catch (error) {
      console.error('Error cargando comentarios de la BD:', error);
    } finally {
      this.isLoadingComments.set(false);
      this.cdr.markForCheck();
    }
  }

  async addComment(): Promise<void> {
    const targetPlayer = this.player();
    if (!targetPlayer || !targetPlayer.id) return;
    const inputAuthor = this.newCommentAuthor().trim();
    if (!inputAuthor || !this.newCommentText().trim()) return;

    let username = 'Anonymous';
    const userProfile = this.authService.userProfile();
    if (this.authService.isAuthenticated() && userProfile?.userName) {
      username = userProfile.userName;
    }

    const finalAuthor = `${inputAuthor} (${username})`;

    try {
      const deviceCoords =
        await this.locationService.requestDeviceCurrentPosition();

      const reviewPayload: Partial<Review> = {
        author: finalAuthor,
        text: this.newCommentText(),
        rating: this.newCommentRating(),
        userId: '1',
        latitude: deviceCoords?.lat ?? 0,
        longitude: deviceCoords?.lng ?? 0,
      };

      const savedReview = await this.reviewService.createReview(
        targetPlayer.id,
        reviewPayload
      );
      this.comments.update((curr) => [savedReview, ...curr]);

      this.newCommentAuthor.set('');
      this.newCommentText.set('');
      this.newCommentRating.set(5);
    } catch (error) {
      console.error('Error al guardar el comentario en la BD:', error);
    } finally {
      this.cdr.markForCheck();
    }
  }

  editComment(comment: ReviewUI) {
    this.editTempText.set(comment.text);
    this.editTempRating.set(comment.rating || 5);
    this.comments.update((curr) =>
      curr.map((c) => ({ ...c, isEditing: c.id === comment.id }))
    );
  }

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

  promptDeleteComment(commentId: string | number) {
    this.commentToDeleteId.set(commentId);
    this.showDeleteCommentModal.set(true);
  }

  async confirmDeleteComment(): Promise<void> {
    const id = this.commentToDeleteId();
    if (!id) return;

    try {
      await this.reviewService.deleteReview(id);
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
    event.stopPropagation();
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

  onCreateNews() {
    const player = this.player();
    if (player) {
      this.navCtrl.navigateForward('/new-players-news', {
        queryParams: {
          nombre: player.name,
          posicion: player.position,
          foto: player.photoUrl,
        },
      });
    }
  }

  // --- ACTUALIZADO: RECIBE EL OBJETO Y NAVEGA A SU DETALLE ---
  onViewNews(news: News): void {
    this.navCtrl.navigateForward(`/players-news/${news.id}`);
  }
  // ---------------------------------------------------------
}
