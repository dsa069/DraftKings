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

    // 1. Verificar si hay que cambiar el backend antes de proceder
    if (this.selectedBackend !== this.configService.selectedBackend()) {
      this.configService.applyBackendChange(this.selectedBackend);
      return; // El reload detendrá la ejecución aquí
    }

    const { email, password, userName } = this.signUpForm.value;

    try {
      console.log('Iniciando registro en:', this.selectedBackend);

      // 2. Llamar al servicio de registro
      // Esto ejecutará Firebase Auth y luego la sincronización con PostgreSQL
      await this.authService.register(email, password, { userName: userName });

      console.log('Registro y sincronización completados con éxito');

      // 3. Solo si lo anterior fue exitoso, navegamos
      this.navCtrl.navigateRoot('/tabs/players');
    } catch (error) {
      console.error('Error durante el proceso de registro:', error);
      // Aquí podrías mostrar una alerta al usuario indicando el fallo
    }
  }

  gotoLogin(): void {
    this.navCtrl.navigateRoot('/login');
  }
}
