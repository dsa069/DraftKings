import { Component, OnInit, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonBackButton,
} from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  personOutline,
  mailOutline,
  lockClosedOutline,
  arrowForwardOutline,
  eyeOutline,
  eyeOffOutline,
  gameControllerOutline,
} from 'ionicons/icons';
import { LoginCardComponent } from '../../shared/components/login-card/login-card.component';
import { ConfigService, BackendType } from '../../core/services/config.service';
import { AuthService } from '../../core/services/abstract/auth.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonContent,
    IonInput,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonBackButton,
    LoginCardComponent,
  ],
})
export class SignUpPage implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly navCtrl = inject(NavController);
  private readonly configService = inject(ConfigService);
  private readonly authService = inject(AuthService);

  showPassword: boolean = false;
  signUpForm!: FormGroup;
  selectedBackend: BackendType = this.configService.selectedBackend();

  constructor() {
    addIcons({
      personOutline,
      mailOutline,
      lockClosedOutline,
      arrowForwardOutline,
      eyeOutline,
      eyeOffOutline,
      gameControllerOutline,
    });
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.signUpForm = this.formBuilder.group({
      userName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // En sign-up.page.ts
  async onRegister(): Promise<void> {
    if (this.signUpForm.invalid) {
      console.log('Formulario de registro no válido');
      return;
    }

    const { email, password, userName } = this.signUpForm.value;

    try {
      // 1. Bloqueamos al centinela temporalmente para que no interfiera en caliente
      localStorage.setItem('bypass_centinela', 'true');

      // 2. Registro en Firebase (Paso común)
      await this.authService.registerFirebase(email, password);

      // 3. ¿Hay cambio de backend?
      if (this.selectedBackend !== this.configService.selectedBackend()) {
        // Preparamos las banderas EXCLUSIVAS para el post-reload
        localStorage.setItem('pending_sync_data', JSON.stringify({ userName }));
        localStorage.setItem('execute_sync_on_reload', 'true');

        // Liberamos el bypass para que el centinela despierte al recargar
        localStorage.removeItem('bypass_centinela');

        // Provoca el window.location.reload()
        this.configService.applyBackendChange(this.selectedBackend);
        return;
      }

      // 4. Si es el mismo backend (Sin reload)
      await this.authService.registerBackend({ userName });

      // Limpieza total y navegación
      localStorage.removeItem('bypass_centinela');
      this.navCtrl.navigateRoot('/tabs/players');
    } catch (error) {
      // Si falla CUALQUIER COSA de arriba, hacemos rollback y limiampos todo
      console.error('❌ Error en el registro, iniciando ROLLBACK:', error);
      await this.authService.deleteCurrentUser();
      localStorage.removeItem('bypass_centinela');
      localStorage.removeItem('pending_sync_data');
      localStorage.removeItem('execute_sync_on_reload');
      console.error('Error en el registro:', error);
    }
  }

  gotoLogin(): void {
    this.navCtrl.navigateRoot('/login');
  }
}
