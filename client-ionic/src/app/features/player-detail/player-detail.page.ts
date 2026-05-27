import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectorRef,
  NgZone,
  ChangeDetectionStrategy,
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

  // Variables de Estado para el formulario y modal
  newCommentAuthor = signal('');
  newCommentText = signal('');
  editTempText = signal('');
  commentToDeleteId = signal<string | null>(null);
  showDeleteCommentModal = signal(false);

  // Estado de los Comentarios Simulados (basado en tus datos originales)
  comments = signal<any[]>([
    {
      id: '1',
      author: 'TacticalGenius99',
      text: "Absolute monster in the box. His finishing is unmatched, but don't expect him to drop deep and link play up too much. Worth every coin.",
      stars: [1, 1, 1, 1, 1], // 1 = estrella llena
      isEditing: false,
    },
    {
      id: '2',
      author: 'CityFan2024',
      text: 'Great pace and physical stats. Just keep him central and feed him through balls.',
      stars: [1, 1, 1, 1, 0], // 0 = estrella vacía
      isEditing: false,
    },
  ]);

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
  }

  async ngOnInit(): Promise<void> {
    // Obtener el ID del jugador de los parámetros de la ruta
    const playerId = this.route.snapshot.paramMap.get('id');

    if (!playerId) {
      this.errorMessage.set('ID de jugador no válido');
      return;
    }

    await this.loadPlayerDetail(playerId);
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
  // Métodos para Crear un Comentario
  addComment() {
    if (!this.newCommentAuthor().trim() || !this.newCommentText().trim())
      return;

    const newComment = {
      id: Date.now().toString(),
      author: this.newCommentAuthor(),
      text: this.newCommentText(),
      stars: [1, 1, 1, 1, 1], // Default a 5 estrellas
      isEditing: false,
    };

    this.comments.update((curr) => [newComment, ...curr]);
    this.newCommentAuthor.set('');
    this.newCommentText.set('');
  }

  // Métodos para Editar un Comentario
  editComment(comment: any) {
    // 1. Asignamos el texto original al estado temporal
    this.editTempText.set(comment.text);

    // 2. Actualizamos el Signal mapeando la lista.
    // Esto activa la detección OnPush de Angular de forma limpia.
    this.comments.update((curr) =>
      curr.map((c) => ({
        ...c,
        isEditing: c.id === comment.id, // Solo el seleccionado pasa a ser true, los demás false
      }))
    );
  }

  saveComment(comment: any) {
    this.comments.update((curr) =>
      curr.map((c) => {
        if (c.id === comment.id) {
          return { ...c, text: this.editTempText(), isEditing: false };
        }
        return c;
      })
    );
  }

  cancelEditComment(comment: any) {
    this.comments.update((curr) =>
      curr.map((c) => (c.id === comment.id ? { ...c, isEditing: false } : c))
    );
  }

  // Métodos para Borrar un Comentario
  promptDeleteComment(commentId: string) {
    this.commentToDeleteId.set(commentId);
    this.showDeleteCommentModal.set(true);
  }

  confirmDeleteComment() {
    const id = this.commentToDeleteId();
    if (id) {
      this.comments.update((curr) => curr.filter((c) => c.id !== id));
    }
    this.showDeleteCommentModal.set(false);
    this.commentToDeleteId.set(null);
  }
}
