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
      // 0. AVISAMOS AL APP.COMPONENT: "No verifiques nada, estoy registrando"
      localStorage.setItem('is_registering', 'true');
      localStorage.setItem('pending_sync_data', JSON.stringify({ userName }));

      // 1. Registro en Firebase
      await this.authService.registerFirebase(email, password);

      // 2. Comprobar cambio de backend
      if (this.selectedBackend !== this.configService.selectedBackend()) {
        this.configService.applyBackendChange(this.selectedBackend);
        return; // El reload ocurre aquí
      }

      // 3. Si no hay cambio, sincronizamos manualmente
      await this.authService.registerBackend({ userName });

      // 4. LIMPIAMOS EL FLAG: Ahora sí puede verificar
      localStorage.removeItem('is_registering');
      localStorage.removeItem('pending_sync_data');

      this.navCtrl.navigateRoot('/tabs/players');
    } catch (error) {
      localStorage.removeItem('is_registering');
      localStorage.removeItem('pending_sync_data');
      console.error('Error en el registro:', error);
    }
  }

  gotoLogin(): void {
    this.navCtrl.navigateRoot('/login');
  }
}
