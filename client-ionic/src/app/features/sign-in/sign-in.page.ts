import { Component, OnInit, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonButton,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBack,
  personOutline,
  mailOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
  arrowForwardOutline,
} from 'ionicons/icons';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.page.html',
  styleUrls: ['./sign-in.page.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    IonContent,
    IonHeader,
    IonButton,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
  ],
})
export class SignInPage implements OnInit {
  signInForm!: FormGroup;
  showPassword: boolean = false;

  private readonly formBuilder = inject(FormBuilder);
  private readonly navCtrl = inject(NavController);

  constructor() {
    addIcons({
      'arrow-back': arrowBack,
      'person-outline': personOutline,
      'mail-outline': mailOutline,
      'lock-closed-outline': lockClosedOutline,
      'eye-outline': eyeOutline,
      'eye-off-outline': eyeOffOutline,
      'arrow-forward-outline': arrowForwardOutline,
    });
  }

  ngOnInit() {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.signInForm = this.formBuilder.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  onSubmit(): void {
    if (this.signInForm.valid) {
      console.log('Sign In Form Data:', this.signInForm.value);
      // TODO: Send data to auth service
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  goBack(): void {
    this.navCtrl.back();
  }
}
