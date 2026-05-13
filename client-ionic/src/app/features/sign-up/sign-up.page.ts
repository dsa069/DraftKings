import { Component, OnInit, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  IonContent,
  IonCard,
  IonCardContent,
  IonInput,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
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
} from 'ionicons/icons';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonContent,
    IonCard,
    IonCardContent,
    IonInput,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
  ],
})
export class SignUpPage implements OnInit {
  showPassword: boolean = false;
  signUpForm!: FormGroup;

  private readonly formBuilder = inject(FormBuilder);
  private readonly navCtrl = inject(NavController);

  constructor() {
    addIcons({
      personOutline,
      mailOutline,
      lockClosedOutline,
      arrowForwardOutline,
      eyeOutline,
      eyeOffOutline,
    });
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.signUpForm = this.formBuilder.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onRegister() {
    // Handle registration logic here
    this.navCtrl.navigateRoot('/tabs/players');
  }

  gotoLogin() {
    this.navCtrl.navigateRoot('/login');
  }
}
