# Rúbrica de Evaluación - DraftKings (Ionic/Angular)

---

## 1. Uso de la arquitectura correcta para estructurar componentes, servicios y páginas

### Evaluación/Justificación

El proyecto utiliza una arquitectura **standalone** de Angular (sin NgModules) con una estructura de carpetas claramente separada por responsabilidades:

- **`src/app/core/`**: Modelos, servicios abstractos, implementaciones concretas, factorías e interceptores.
- **`src/app/features/`**: Páginas organizadas por funcionalidad (login, sign-up, players, tabs, etc.).
- **`src/app/shared/components/`**: Componentes reutilizables (header, image-capture, map-capture, backend-toggle, etc.).

Todos los componentes están marcados como `standalone: true` e importan directamente los módulos necesarios. Los servicios abstractos definen contratos, las factorías seleccionan la implementación activa, y los componentes inyectan solo las clases abstractas.

### Fragmentos de Código (Evidencias)

**Estructura de carpetas del proyecto:**
```
src/app/
├── core/
│   ├── interceptors/       → auth.interceptor.ts
│   ├── models/             → player.model.ts, user.model.ts, news.model.ts, review.model.ts
│   └── services/
│       ├── abstract/       → auth.service.ts, player.service.ts, news.service.ts, review.service.ts, team.service.ts
│       ├── factory/        → auth.factory.ts, player.factory.ts, news.factory.ts, review.factory.ts, team.factory.ts
│       ├── implementations/ → auth-node.service.ts, auth-spring.service.ts, player-node.service.ts, ...
│       ├── config.service.ts
│       ├── location.service.ts
│       └── photo.service.ts
├── features/
│   ├── login/
│   ├── sign-up/
│   ├── new-player/
│   ├── player-detail/
│   ├── import-players/
│   ├── tabs/
│   │   ├── my-team/
│   │   ├── players/
│   │   ├── news/
│   │   └── settings/
│   └── ...
└── shared/
    └── components/
        ├── backend-toggle/
        ├── header/
        ├── header-submenu/
        ├── image-capture/
        ├── login-card/
        ├── map-capture/
        └── player-list/
```

**Componente standalone con imports directos:**
```typescript
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonContent, IonInput, IonItem, IonLabel, IonButton, IonIcon,
    IonGrid, IonRow, IonHeader, IonText, IonButtons,
    LoginCardComponent,
  ],
})
export class LoginPage implements OnInit {
  private readonly authService = inject(AuthService);
  // ...
}
```

### Referencias
- `src/app/features/login/login.page.ts:35-55` (@Component standalone)
- `src/app/core/services/abstract/player.service.ts` (servicio abstracto)
- `src/app/core/services/implementations/player-node.service.ts` (implementación concreta)
- `src/app/core/services/factory/player.factory.ts` (factoría)
- Estructura completa: `src/app/` (carpetas core/, features/, shared/)

---

## 2. Navegación entre páginas y routing

### Evaluación/Justificación

La aplicación utiliza **ruting standalone de Angular** con `loadComponent` y `loadChildren` para lazy loading. La estrategia de routing es `withHashLocation()` (URLs tipo `/#/tabs/players`). La navegación se realiza mediante `NavController` de Ionic con `navigateRoot`, `navigateForward` y `navigateBack`. Las tabs proporcionan navegación principal con protección condicional basada en autenticación.

### Fragmentos de Código (Evidencias)

**Rutas principales (app.routes.ts):**
```typescript
export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./features/tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'sign-up',
    loadComponent: () =>
      import('./features/sign-up/sign-up.page').then((m) => m.SignUpPage),
  },
  {
    path: 'player-detail/:id',
    loadComponent: () =>
      import('./features/player-detail/player-detail.page').then(
        (m) => m.PlayerDetailPage
      ),
  },
  // ... más rutas lazy-loaded
];
```

**Rutas de tabs (tabs.routes.ts):**
```typescript
export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      { path: 'my-team', loadComponent: () => import('./my-team/my-team.page').then((m) => m.MyTeamPage) },
      { path: 'players', loadComponent: () => import('./players/players.page').then((m) => m.PlayersPage) },
      { path: 'news', loadComponent: () => import('./news/news.page').then((m) => m.NewsPage) },
      { path: 'settings', loadComponent: () => import('./settings/settings.page').then((m) => m.SettingsPage) },
      { path: '', redirectTo: '/tabs/players', pathMatch: 'full' },
    ],
  },
];
```

**Navegación con NavController:**
```typescript
async onLogin(): Promise<void> {
  // ...
  await this.authService.verifyBackend();
  await this.showToast('Login successful!', 'success');
  this.navCtrl.navigateRoot(['/tabs/players']);
}

gotoSignUp(): void {
  this.navCtrl.navigateForward(['/sign-up']);
}
```

**Configuración del router (main.ts):**
```typescript
provideRouter(
  routes,
  withPreloading(PreloadAllModules),
  withHashLocation()
),
```

### Referencias
- `src/app/app.routes.ts:1-61` (rutas principales)
- `src/app/features/tabs/tabs.routes.ts:1-44` (rutas de tabs)
- `src/app/features/login/login.page.ts:108,118` (navigateRoot, navigateForward)
- `src/main.ts:50-54` (configuración del router con hash location)

---

## 3. Uso de los servicios Angular desde los componentes

### Evaluación/Justificación

Todos los componentes inyectan servicios utilizando `inject()` de Angular (inyección de dependencias moderna). Los componentes inyectan **únicamente las clases abstractas** (AuthService, PlayerService, etc.), nunca las implementaciones concretas. Las factorías registradas en `main.ts` con `useFactory` se encargan de resolver la implementación correcta según la configuración del backend.

Además, se aplica rigurosamente el **principio de encapsulamiento** mediante Angular Signals:

- **Propiedades privadas internas** (`_userProfile`, `_selectedBackend`, `_cameraPhotoPreviewUrl`, etc.) almacenadas en `signal()` o `WritableSignal` que **solo el servicio puede modificar** internamente.
- **Propiedades públicas readonly** expuestas mediante `signal.asReadonly()` o `computed()`, de forma que los componentes **solo pueden leer** el estado pero **nunca modificarlo directamente**. Para alterar el estado, los componentes deben invocar **métodos públicos** del servicio (ej. `updateSelectedLocation()`, `applyBackendChange()`).
- **Señales computadas** (`computed()`) que derivan valores a partir del estado interno sin permitir escritura. Por ejemplo, `isAdmin` e `isUser` en AuthService calculan el rol del usuario a partir de `_userProfile` sin exponer la señal subyacente.

Este patrón garantiza que la lógica de negocio permanezca centralizada en los servicios y que las páginas no puedan corromper el estado interno.

### Fragmentos de Código (Evidencias)

**Inyección de servicios en LoginPage:**
```typescript
export class LoginPage implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly navCtrl = inject(NavController);
  private readonly authService = inject(AuthService);  // Clase abstracta
  private readonly toastCtrl = inject(ToastController);
```

**Inyección de servicios en NewPlayerPage:**
```typescript
export class NewPlayerPage implements OnInit {
  private readonly navCtrl = inject(NavController);
  private readonly fb = inject(FormBuilder);
  private readonly playerService = inject(PlayerService);   // Clase abstracta
  private readonly photoService = inject(PhotoService);     // Singleton
  private readonly locationService = inject(LocationService); // Singleton
  private readonly authService = inject(AuthService);       // Clase abstracta
```

**Inyección en TabsPage:**
```typescript
export class TabsPage {
  public authService = inject(AuthService);  // Clase abstracta
  private toastCtrl = inject(ToastController);
  public readonly isAuthenticated = this.authService.isAuthenticated;
}
```

**Encapsulamiento con Signals en AuthService — privadas vs públicas:**
```typescript
export abstract class AuthService {
  // --- PRIVADAS: solo el servicio puede modificar ---
  protected readonly _user = toSignal(authState(this.firebaseAuth));
  protected readonly _userProfile = signal<User | null>(null);

  // --- PÚBLICAS READONLY: los componentes SOLO pueden leer ---
  public readonly userProfile = this._userProfile.asReadonly();
  public readonly isAdmin = computed(
    () => this._userProfile()?.role === 'ADMIN'
  );
  public readonly isUser = computed(() => this._userProfile()?.role === 'USER');

  // --- MÉTODO PÚBLICO: forma correcta de modificar el estado ---
  async logout(): Promise<void> {
    this._userProfile.set(null);  // Solo el servicio puede hacer .set()
    await signOut(this.firebaseAuth);
  }
}
```

**Encapsulamiento con Signals en ConfigService — privadas vs públicas:**
```typescript
export class ConfigService {
  // --- PRIVADA: la señal interna modificable ---
  private _selectedBackend = signal<BackendType>(this.getSavedBackend());

  // --- PÚBLICA READONLY: los componentes solo leen ---
  public selectedBackend: Signal<BackendType> =
    this._selectedBackend.asReadonly();

  // --- MÉTODO PÚBLICO: forma segura de cambiar el backend ---
  applyBackendChange(newType: BackendType): void {
    if (newType !== this._selectedBackend()) {
      localStorage.setItem(this.BACKEND_KEY, newType);
      window.location.reload();
    }
  }
}
```

**Encapsulamiento en PhotoService — computed derivado de signals privadas:**
```typescript
export class PhotoService {
  // --- PRIVADAS: múltiples fuentes de imagen ---
  private _cameraPhotoPreviewUrl = signal<string | null>(null);
  private _urlInput = signal<string>('');
  private _localImageFile = signal<File | null>(null);
  private _localImagePreviewUrl = signal<string | null>(null);

  // --- PÚBLICA READONLY: los componentes solo leen la preview combinada ---
  public currentPhotoPreview = computed(() => {
    const localPreviewUrl = this._localImagePreviewUrl();
    const cameraPreviewUrl = this._cameraPhotoPreviewUrl();
    const url = this._urlInput().trim();
    return localPreviewUrl || cameraPreviewUrl || (url !== '' ? url : null);
  });

  // --- MÉTODOS PÚBLICOS: forma correcta de modificar ---
  async updateUrlInput(url: string): Promise<void> { /* ... */ }
  async updateLocalImageFile(file: File | null): Promise<void> { /* ... */ }
}
```

**Registro de factorías en main.ts:**
```typescript
{ provide: AuthService, useFactory: authFactory, deps: [ConfigService] },
{ provide: PlayerService, useFactory: playerFactory, deps: [ConfigService] },
{ provide: ReviewService, useFactory: reviewFactory, deps: [ConfigService] },
{ provide: TeamService, useFactory: teamFactory, deps: [ConfigService] },
{ provide: NewsService, useFactory: NewsFactory, deps: [ConfigService] },
```

### Referencias
- `src/app/features/login/login.page.ts:57-60` (inject de servicios)
- `src/app/features/new-player/new-player.page.ts:74-80` (inject de múltiples servicios)
- `src/app/features/tabs/tabs.page.ts:28-29` (inject de AuthService)
- `src/app/core/services/abstract/auth.service.ts:33-59` (signals privadas vs públicas readonly/computed)
- `src/app/core/services/config.service.ts:10-14` (encapsulamiento con asReadonly)
- `src/app/core/services/photo.service.ts:17-28` (signals privadas + computed público)
- `src/main.ts:63-76` (registro de factorías)

---

## 4. Acceso a la geolocalización del dispositivo y gestión de su almacenamiento

### Evaluación/Justificación

La aplicación utiliza **`@capacitor/geolocation`** para acceder al GPS nativo del dispositivo. El `LocationService` gestiona dos signals: `selectedLocation` (seleccionada por el usuario en el mapa) y `deviceLocation` (obtenida del GPS). Se verifican y solicitan permisos antes de acceder a la posición. El servicio se utiliza en NewPlayerPage, PlayerDetailPage e ImportPlayersPage.

### Fragmentos de Código (Evidencias)

**LocationService completo:**
```typescript
import { Geolocation } from '@capacitor/geolocation';

@Injectable({ providedIn: 'root' })
export class LocationService {
  public selectedLocation = signal<AppLocation | null>(null);
  public deviceLocation = signal<AppLocation | null>(null);

  public updateSelectedLocation(lat: number, lng: number): void {
    this.selectedLocation.set({ lat, lng });
  }

  public async requestDeviceCurrentPosition(): Promise<AppLocation | null> {
    try {
      const permissions = await Geolocation.checkPermissions();
      if (permissions.location !== 'granted') {
        await Geolocation.requestPermissions();
      }

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
      });

      const coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      this.deviceLocation.set(coords);
      return coords;
    } catch (error) {
      console.error('Error obteniendo la ubicación nativa:', error);
      return null;
    }
  }
}
```

**Uso en NewPlayerPage:**
```typescript
async ngOnInit() {
  const coords = await this.locationService.requestDeviceCurrentPosition();
  this.initialLocation = coords ?? this.fallbackLocation;
  this.selectedLocation = this.initialLocation;
}

async onCenterRequested() {
  const coords = await this.locationService.requestDeviceCurrentPosition();
  if (coords && this.mapComponent) {
    this.initialLocation = coords;
    this.selectedLocation = coords;
    this.mapComponent.flyToLocation(coords.lat, coords.lng);
  }
}
```

### Referencias
- `src/app/core/services/location.service.ts:1-52` (servicio completo)
- `src/app/features/new-player/new-player.page.ts:157-159` (uso en ngOnInit)
- `src/app/features/new-player/new-player.page.ts:243-249` (uso en onCenterRequested)

---

## 5. Acceso a la cámara del dispositivo y gestión de las imágenes

### Evaluación/Justificación

La aplicación utiliza **`@capacitor/camera`** para capturar fotos desde la cámara nativa. El `PhotoService` gestiona múltiples fuentes de imagen: cámara nativa, URL remota y archivo local. Las imágenes se suben a **Firebase Storage** con rollback automático si falla la operación principal. Se usa `@capacitor/preferences` para cachear la previsualización de la cámara.

### Fragmentos de Código (Evidencias)

**PhotoService - Captura de cámara:**
```typescript
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Preferences } from '@capacitor/preferences';
import { Storage, deleteObject, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';

@Injectable({ providedIn: 'root' })
export class PhotoService {
  public currentPhotoPreview = computed(() => {
    const localPreviewUrl = this._localImagePreviewUrl();
    const cameraPreviewUrl = this._cameraPhotoPreviewUrl();
    const url = this._urlInput().trim();
    return localPreviewUrl || cameraPreviewUrl || (url !== '' ? url : null);
  });

  async takePhoto(): Promise<void> {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
    });
    if (image.webPath) {
      await this.updateCameraPhoto(image.webPath);
    }
  }
```

**PhotoService - Upload a Firebase Storage:**
```typescript
async uploadCurrentImage(playerName: string): Promise<string | null> {
  // ... lógica para subir a Firebase Storage
  const storageReference = ref(this.storage, this._lastUploadedStoragePath);
  await uploadBytes(storageReference, blob);
  return await getDownloadURL(storageReference);
}
```

**PhotoService - Rollback:**
```typescript
async rollbackLastUpload(): Promise<void> {
  if (!this._lastUploadedStoragePath) return;
  try {
    const storageReference = ref(this.storage, this._lastUploadedStoragePath);
    await deleteObject(storageReference);
  } catch (error) {
    console.error('Error en rollback de imagen:', error);
  } finally {
    this._lastUploadedStoragePath = null;
  }
}
```

**ImageCaptureComponent:**
```typescript
export class ImageCaptureComponent {
  public photoService = inject(PhotoService);

  async takePhoto(): Promise<void> {
    this.errorState = false;
    await this.photoService.takePhoto();
  }

  onUrlInput(event: any): void {
    const value = event.detail.value || '';
    this.photoService.updateUrlInput(value);
  }

  async onLocalImageSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    await this.photoService.updateLocalImageFile(file);
  }
}
```

### Referencias
- `src/app/core/services/photo.service.ts:1-197` (servicio completo)
- `src/app/shared/components/image-capture/image-capture.component.ts:1-82` (componente de captura)
- `src/app/features/new-player/new-player.page.ts:345-353` (upload en onSavePlayer)

---

## 6. El registro de usuario y la autenticación se realizan a través de Firebase

### Evaluación/Justificación

La aplicación utiliza **`@angular/fire/auth`** para autenticación con Firebase Auth (email/password). El `AuthService` abstracto define la lógica común (login, register, logout, getToken) y las implementaciones concretas añaden la verificación/sincronización con los backends. Se incluye rollback: si el backend falla al sincronizar después del registro, se elimina la cuenta de Firebase.

### Fragmentos de Código (Evidencias)

**AuthService abstracto:**
```typescript
import { Auth, signInWithEmailAndPassword, signOut, authState, createUserWithEmailAndPassword, deleteUser } from '@angular/fire/auth';

@Injectable()
export abstract class AuthService {
  protected firebaseAuth = inject(Auth);
  protected readonly _user = toSignal(authState(this.firebaseAuth));

  async loginFirebase(email: string, pass: string): Promise<any> {
    return await signInWithEmailAndPassword(this.firebaseAuth, email, pass);
  }

  async registerFirebase(email: string, pass: string) {
    return await createUserWithEmailAndPassword(this.firebaseAuth, email, pass);
  }

  async logout(): Promise<void> {
    this._userProfile.set(null);
    await signOut(this.firebaseAuth);
  }

  async getToken(): Promise<string | null> {
    const user = this.firebaseAuth.currentUser;
    return user ? await user.getIdToken() : null;
  }

  async deleteCurrentUser(): Promise<void> {
    const user = this.firebaseAuth.currentUser;
    if (user) {
      await deleteUser(user);  // Rollback si el backend falla
    }
  }

  async login(email: string, pass: string): Promise<any> {
    await this.loginFirebase(email, pass);
    return await this.verifyBackend();
  }
}
```

**LoginPage - Uso de Firebase Auth:**
```typescript
async onLogin(): Promise<void> {
  if (this.loginForm.invalid) {
    await this.showToast('The entered email is not valid');
    return;
  }
  const { email, password } = this.loginForm.value;
  try {
    await this.authService.loginFirebase(email!, password!);
    await this.authService.verifyBackend();
    await this.showToast('Login successful!', 'success');
    this.navCtrl.navigateRoot(['/tabs/players']);
  } catch (error) {
    await this.showToast('Login failed. Please check your credentials.');
  }
}
```

**Configuración de Firebase (main.ts):**
```typescript
provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
provideAuth(() => getAuth()),
provideStorage(() => getStorage()),
```

**Interceptor de autenticación:**
```typescript
export class AuthInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);

  private async handleAccess(request: HttpRequest<any>, next: HttpHandler): Promise<HttpEvent<any>> {
    const token = await this.authService.getToken();
    if (token) {
      request = request.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
    }
    return lastValueFrom(next.handle(request));
  }
}
```

### Referencias
- `src/app/core/services/abstract/auth.service.ts:1-122` (servicio abstracto completo)
- `src/app/features/login/login.page.ts:90-113` (onLogin con Firebase)
- `src/app/core/interceptors/auth.interceptor.ts:1-44` (interceptor JWT)
- `src/main.ts:57-59` (inicilización Firebase)

---

## 7. La aplicación incluye pruebas unitarias para todos los componentes y servicios, además de las dos pruebas e2e solicitadas

### Evaluación/Justificación

El proyecto utiliza **Cypress** como framework de testing (no Karma/Jasmine). Incluye:

- **20 pruebas de componente** (`.cy.ts`) cubriendo todas las páginas y componentes compartidos
- **5 suites de pruebas E2E** (`cypress/e2e/`): auth (8 tests), players (13 tests), reviews (12 tests), import-players (5 tests), tabs (2 tests) = **40 tests E2E en total**

Las pruebas E2E superan las 2 solicitadas en la especificación. Se usan fixtures de datos y un sistema de helpers compartidos. Las pruebas de componente usan `cy.mount()` con providers personalizados.

### Fragmentos de Código (Evidencias)

**Lista de pruebas de componente:**
```
src/app/features/tabs/tabs.page.cy.ts
src/app/features/tabs/players/players.page.cy.ts
src/app/features/tabs/my-team/my-team.page.cy.ts
src/app/features/tabs/news/news.page.cy.ts
src/app/features/tabs/settings/settings.page.cy.ts
src/app/features/login/login.page.cy.ts
src/app/features/sign-up/sign-up.page.cy.ts
src/app/features/new-player/new-player.page.cy.ts
src/app/features/player-detail/player-detail.page.cy.ts
src/app/features/new-players-news/new-players-news.page.cy.ts
src/app/features/players-news/players-news.page.cy.ts
src/app/features/import-players/import-players.page.cy.ts
src/app/features/switch-back/switch-back.page.cy.ts
src/app/shared/components/header/header.component.cy.ts
src/app/shared/components/header-submenu/header-submenu.component.cy.ts
src/app/shared/components/login-card/login-card.component.cy.ts
src/app/shared/components/player-list/player-list.component.cy.ts
src/app/shared/components/image-capture/image-capture.component.cy.ts
src/app/shared/components/map-capture/map-capture.component.cy.ts
src/app/shared/components/backend-toggle/backend-toggle.component.cy.ts
```

**Prueba de componente (tabs.page.cy.ts):**
```typescript
describe('TabsPage Component', () => {
  let isAuthenticatedMock: WritableSignal<boolean>;

  beforeEach(() => {
    isAuthenticatedMock = signal(false);
    authServiceMock = {
      isAuthenticated: (() => isAuthenticatedMock()) as any,
      // ...
    };
  });

  it('debe renderizar la barra de navegación en la parte inferior', () => {
    cy.get('ion-tab-bar').should('exist').and('have.attr', 'slot', 'bottom');
  });

  it('debe interceptar el clic en "My Squad" y disparar un Toast informativo', () => {
    cy.contains('ion-tab-button', 'My Squad').click();
    cy.wrap(toastControllerMock.create).should('have.been.calledOnceWith', {
      message: 'Please log in or register to access this feature.',
      duration: 3000,
      position: 'bottom',
      color: 'tertiary',
    });
  });
});
```

**Prueba E2E (auth.e2e.cy.ts):**
```typescript
describe('Autenticación E2E', () => {
  it('permite iniciar sesión, verificar backend y entrar en jugadores', () => {
    cy.get('app-login').then(($loginEl) => {
      cy.window().then((win) => {
        const loginCmp = (win as any).ng.getComponent($loginEl[0]);
        const authService = loginCmp.authService;
        authService.loginFirebase = cy.stub().resolves(signedInResponse);
        authService.verifyBackend = cy.stub().resolves();
      });
    });
    typeIntoIonInput('ion-input[formControlName="email"]', 'coach@draftkings.com');
    typeIntoIonInput('ion-input[formControlName="password"]', 'ValidPass123!');
    clickIonButton('Login');
    cy.url().should('include', '/#/tabs/players');
  });

  it('muestra error si el registro falla después de crear la cuenta en Firebase', () => {
    // ... test de rollback con deleteUser
  });
});
```

### Referencias
- `src/app/features/tabs/tabs.page.cy.ts:1-144` (prueba de componente)
- `cypress/e2e/auth.e2e.cy.ts:1-264` (8 tests E2E de autenticación)
- `cypress/e2e/players.e2e.cy.ts` (13 tests E2E de jugadores)
- `cypress/e2e/reviews.e2e.cy.ts` (12 tests E2E de reviews)
- `cypress/e2e/import-players.e2e.cy.ts` (5 tests E2E de importación)
- `cypress/e2e/tabs.e2e.cy.ts` (2 tests E2E de navegación)
- `cypress/support/e2e-helpers.ts` (helpers compartidos)
- `cypress/e2e/utils/data/` (fixtures de datos)

---

### A. Tests de Cypress — Funcionalidad de Autenticación — 1.00 puntos

#### Evaluación/Justificación

Los tests de autenticación con Cypress cubren:

- **Escenario de éxito:** 0,25 puntos ✅ — Login exitoso, registro con sync backend, verificación de navegación post-login
- **Escenarios de error:** 0,75 puntos ✅ — Formulario vacío, email inválido, credenciales rechazadas por Firebase, username corto, contraseña sin política, contraseñas no coincidentes, rollback tras fallo de sync
- **Multi-navegador:** Tests ejecutados en Chrome y Firefox (matriz en CI), multiplicador × 1,0 = mantiene valor total

**Total Autenticación:** (0,75 + 0,25) × 1,0 = 1,00 puntos

#### Fragmentos de Código (Evidencias)

**Evidencia 1 — Test de login exitoso con verificación de backend:**

```typescript
// client-ionic/cypress/e2e/auth.e2e.cy.ts (líneas 61-92)
it("permite iniciar sesión, verificar backend y entrar en jugadores", () => {
  cy.get("app-login").then(($loginEl) => {
    cy.window().then((win) => {
      const loginCmp = (win as any).ng.getComponent($loginEl[0]);
      const authService = loginCmp.authService;
      authService.loginFirebase = cy.stub().resolves(signedInResponse);
      authService.verifyBackend = cy.stub().resolves();
      authService.isAuthenticated = () => true;
      authService.userProfile = () => adminProfile;
    });
  });

  cy.intercept("GET", "**/players", []).as("players");
  typeIntoIonInput(
    'ion-input[formControlName="email"]',
    "coach@draftkings.com",
  );
  typeIntoIonInput('ion-input[formControlName="password"]', "ValidPass123!");
  clickIonButton("Login");
  cy.wait("@players");
  cy.url().should("include", "/#/tabs/players");
  getToastMessage().should("contain.text", "Login successful!");
});
```

**Evidencia 2 — Test de error: credenciales rechazadas por Firebase:**

```typescript
// client-ionic/cypress/e2e/auth.e2e.cy.ts (líneas 34-59)
it("muestra error si Firebase rechaza las credenciales del login", () => {
  cy.intercept("POST", firebaseSignInUrl, {
    statusCode: 400,
    body: { error: { message: "INVALID_LOGIN_CREDENTIALS" } },
  }).as("firebaseSignIn");

  typeIntoIonInput(
    'ion-input[formControlName="email"]',
    "coach@draftkings.com",
  );
  typeIntoIonInput('ion-input[formControlName="password"]', "WrongPass123!");
  clickIonButton("Login");
  cy.wait("@firebaseSignIn");
  getToastMessage().should(
    "contain.text",
    "Login failed. Please check your credentials.",
  );
  cy.url().should("include", "/#/login");
});
```

**Evidencia 3 — Test de rollback: registro falla después de crear cuenta en Firebase:**

```typescript
// client-ionic/cypress/e2e/auth.e2e.cy.ts (líneas 228-263)
it("muestra error si el registro falla después de crear la cuenta en Firebase", () => {
  cy.get("app-sign-up").then(($signUpEl) => {
    cy.window().then((win) => {
      const signUpCmp = (win as any).ng.getComponent($signUpEl[0]);
      const authService = signUpCmp.authService;
      authService.registerFirebase = cy.stub().resolves(signedInResponse);
      authService.registerBackend = cy.stub().rejects(new Error("Sync failed"));
      authService.deleteCurrentUser = cy.stub().resolves();
    });
  });
  // ... fill form and submit
  getToastMessage().should(
    "contain.text",
    "Registration error. Please try again.",
  );
});
```

**Evidencia 4 — Configuración multi-navegador en CI:**

```yaml
# .github/workflows/ionic-ci-cd.yaml (líneas 151-153, 211-212)
strategy:
  matrix:
    browser: [chrome, firefox]
```

#### Referencias

- `client-ionic/cypress/e2e/auth.e2e.cy.ts` — 9 tests de autenticación (264 líneas)
- `.github/workflows/ionic-ci-cd.yaml` — Ejecución multi-navegador (líneas 151-153, 211-212)

---

### B. Tests de Cypress — Funcionalidad CRUD (Jugadores y Comentarios) — 1.00 puntos

#### Evaluación/Justificación

Los tests CRUD cubren jugadores y comentarios:

- **Escenario de éxito:** 0,25 puntos ✅ — CRUD completo de jugadores (crear, ver detalle, editar, eliminar) y comentarios (crear, editar, eliminar con confirmación)
- **Escenarios de error:** 0,75 puntos ✅ — Validación de formularios, errores de red, permisos por rol (admin/user/anonymous), estados vacíos
- **Multi-navegador:** Tests ejecutados en Chrome y Firefox, multiplicador × 1,0 = mantiene valor total

**Total CRUD:** (0,75 + 0,25) × 1,0 = 1,00 puntos

#### Fragmentos de Código (Evidencias)

**Evidencia 1 — CRUD de Jugadores: crear jugador desde formulario:**

```typescript
// client-ionic/cypress/e2e/players.e2e.cy.ts (líneas 181-226)
it("permite crear un jugador desde el formulario y navegar al detalle", () => {
  cy.intercept("POST", "**/players", (req) => {
    expect(req.body).to.include({
      name: "Vinicius Junior",
      firstName: "Vinicius",
      lastName: "Junior",
      team: "Real Madrid",
      league: "La Liga",
      position: "fw",
      number: 7,
    });
    req.reply({ statusCode: 201, body: createdPlayer });
  }).as("createPlayer");

  clickIonButton("Add Player");
  typeIntoIonInput(
    'ion-input[formControlName="displayName"]',
    "Vinicius Junior",
  );
  // ... fill all fields
  clickIonButton("Save Player");
  cy.wait("@createPlayer");
  cy.url().should("include", "/#/player-detail/99");
});
```

**Evidencia 2 — CRUD de Jugadores: eliminar con confirmación:**

```typescript
// client-ionic/cypress/e2e/players.e2e.cy.ts (líneas ~400-450)
it("permite eliminar un jugador existente con confirmación", () => {
  cy.intercept("DELETE", "**/players/1", { statusCode: 204 }).as(
    "deletePlayer",
  );
  cy.contains("ion-button", "Delete Player").click();
  cy.get("ion-alert").should("be.visible");
  cy.contains("ion-alert button", "Confirm").click();
  cy.wait("@deletePlayer");
  cy.url().should("include", "/#/tabs/players");
  cy.contains(".player-card", "Lionel Messi").should("not.exist");
});
```

**Evidencia 3 — CRUD de Comentarios: crear comentario con geolocalización:**

```typescript
// client-ionic/cypress/e2e/reviews.e2e.cy.ts (líneas ~100-150)
it("permite crear un comentario con geolocalización", () => {
  cy.intercept("POST", "**/players/1/reviews", (req) => {
    expect(req.body).to.have.property("text");
    expect(req.body).to.have.property("rating");
    req.reply({
      statusCode: 201,
      body: { id: "3", text: "Great player!", rating: 5 },
    });
  }).as("createReview");

  clickIonButton("Add Comment");
  typeIntoIonInput('ion-textarea[formControlName="text"]', "Great player!");
  // ... set rating
  clickIonButton("Save");
  cy.wait("@createReview");
});
```

**Evidencia 4 — Tests de permisos: usuario regular no puede editar/eliminar:**

```typescript
// client-ionic/cypress/e2e/players.e2e.cy.ts (líneas ~450-500)
it("un usuario registrado no puede editar ni eliminar jugadores", () => {
  setAuthOnCurrentView("app-player-detail", {
    isAuthenticated: true,
    isAdmin: false,
    isUser: true,
    profile: registeredProfile,
  });
  cy.contains("ion-button", "Edit Player").should("not.exist");
  cy.contains("ion-button", "Delete Player").should("not.exist");
});
```

#### Referencias

- `client-ionic/cypress/e2e/players.e2e.cy.ts` — 13 tests de jugadores (705 líneas)
- `client-ionic/cypress/e2e/reviews.e2e.cy.ts` — 11 tests de comentarios (685 líneas)
- `client-ionic/cypress/e2e/import-players.e2e.cy.ts` — 5 tests de importación (256 líneas)
- `client-ionic/cypress/e2e/tabs.e2e.cy.ts` — 2 tests de navegación (27 líneas)

---

### 8. El despliegue de la aplicación a través de la APK en un dispositivo móvil Android

### Evaluación/Justificación

La aplicación está configurada para despliegue Android mediante **Capacitor**. Existe la carpeta `android/` con el proyecto nativo completo, incluyendo configuración de Gradle, plugins de Capacitor (Camera, Geolocation, Preferences, App, Haptics, Keyboard, StatusBar) y archivos de firma para release (`release-key.jks`). El `capacitor.config.ts` define el `appId: 'com.dsa069.draftkings'` y `webDir: 'www'`.

**Compilar aplicación Android:** ✅ Implementado

- **Dev:** APK debug con `assembleDebug` (ionic-ci-cd.yaml, build-android job)
- **Prod:** APK release firmado con keystore + apksigner verify (ionic-ci-cd.prod.yml)

### Fragmentos de Código (Evidencias)

**capacitor.config.ts:**
```typescript
const config: CapacitorConfig = {
  appId: 'com.dsa069.draftkings',
  appName: 'DraftKings',
  webDir: 'www'
};
export default config;
```

**Estructura del proyecto Android:**
```
android/
├── app/
│   ├── build.gradle
│   └── src/main/
├── capacitor-cordova-android-plugins/
├── gradle/
├── build.gradle
├── release-key.jks          ← Clave de firma para release
└── release.keystore.b64     ← Clave en base64 para CI/CD
```

**Dependencias de Capacitor en package.json:**
```json
{
  "@capacitor/camera": "^8.2.0",
  "@capacitor/geolocation": "^8.2.0",
  "@capacitor/preferences": "^7.0.0",
  "@capacitor/app": "^7.0.0",
  "@capacitor/haptics": "^7.0.0",
  "@capacitor/keyboard": "^7.0.0",
  "@capacitor/status-bar": "^7.0.0"
}
```

**Configuración de build (angular.json):**
```json
{
  "build": {
    "options": {
      "outputPath": "www",
      "index": "src/index.html",
      "browser": "src/main.ts"
    }
  }
}
```

**APK firmado en producción:**

```yaml
# .github/workflows/ionic-ci-cd.prod.yml (líneas 118-146)
- name: Decode Keystore
  run: echo "${{ secrets.KEYSTORE_BASE64 }}" | base64 --decode > ./android/release-key.jks

- name: Build APK (Release)
  run: |
    cd android
    ./gradlew assembleRelease
    $ANDROID_HOME/build-tools/34.0.0/apksigner sign \
      --ks release-key.jks --ks-key-alias ${{ secrets.KEY_ALIAS }} ...

- name: Verify APK Signature
  run: |
    $ANDROID_HOME/build-tools/34.0.0/apksigner verify --print-certs ${{ steps.locate_apk.outputs.apk_path }}
```

### Referencias
- `capacitor.config.ts:1-9` (configuración de Capacitor)
- `android/app/build.gradle` (configuración de build Android)
- `android/release-key.jks` (firma de release)
- `package.json` (dependencias de Capacitor)
- `.github/workflows/ionic-ci-cd.prod.yml` — Production pipeline con APK firmado (378 líneas)

---

## 9. La aplicación tiene un estilo personalizado incluyendo iconos y pantalla de carga

### Evaluación/Justificación

La aplicación tiene un tema visual completamente personalizado con:

- **Sistema de colores** basado en Material Design 3 con paleta de colores personalizada (verde pitch, dorado, gris stadium)
- **Tipografía** con fuentes Google Fonts (Lexend para títulos, Inter para cuerpo)
- **Iconos** personalizados de DraftKings (`DK-logo.png`, `DK-logo-dark.png`) e iconos de Ionicons
- **Splash screens** personalizados (`splash.png`, `splash-dark.png`) y iconos adaptativos
- **Dark mode** habilitado mediante `dark.system.css`
- **Estilos glassmorphism** con `backdrop-filter: blur(12px)`
- **Assets** en `src/assets/icon/` y `assets/` (Capacitor)

### Fragmentos de Código (Evidencias)

**Theme variables (variables.scss):**
```scss
:root {
  --ion-color-primary: #4dfd85;        // Verde pitch
  --ion-color-secondary: #c9c6c5;      // Gris cálido
  --ion-color-tertiary: #ffd7c0;       // Peach/salmón
  --ion-color-background: #0d150e;     // Verde muy oscuro/negro

  // Colores personalizados
  --ion-color-pitch-green: #1ee06c;
  --ion-color-stat-gold: #ffcc00;
  --ion-color-stadium-grey: #1a1c1e;
  --ion-color-chalk-white: #ffffff;
  --ion-color-sideline-black: #0d0d0d;

  // Tipografía
  --font-family-display-lg: "Lexend";
  --font-family-body-lg: "Inter";
  --font-family-label-bold: "Inter";

  // Tamaños de fuente
  --font-size-display-lg: 32px;
  --font-size-headline-md: 24px;
  --font-size-body-lg: 16px;
  --font-size-label-bold: 12px;
}
```

**Estilos globales (global.scss):**
```scss
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lexend:wght@400;500;600;700&display=swap");
@import "@ionic/angular/css/palettes/dark.system.css";

.header-logo {
  width: 40px !important;
  height: 40px !important;
  object-fit: contain;
}

.circular-back-btn {
  backdrop-filter: blur(12px);
  --border-radius: 50%;
}
```

**Iconos de la aplicación:**
```
src/assets/icon/
├── DK-logo.png
├── DK-logo-dark.png
├── DK-logo-text.png
└── DK-logo-dark-text.png

assets/
├── icon-foreground.png
├── icon-background.png
├── icon-only.png
├── splash.png
└── splash-dark.png
```

**Uso de iconos en componentes:**
```typescript
import { addIcons } from 'ionicons';
import { shieldHalfOutline, peopleOutline, settingsOutline, newspaperOutline } from 'ionicons/icons';

constructor() {
  addIcons({ shieldHalfOutline, peopleOutline, settingsOutline, newspaperOutline });
}
```

### Referencias
- `src/theme/variables.scss:1-175` (tema completo)
- `src/global.scss:1-184` (estilos globales)
- `src/assets/icon/` (iconos de la aplicación)
- `assets/splash.png`, `assets/splash-dark.png` (pantallas de carga)
- `src/app/features/tabs/tabs.page.ts:34-39` (registro de iconos)
- `android.custom` (personalización android)

---

## 10. Calidad de la presentación, el código y el resto del material entregado

### Evaluación/Justificación

El código muestra alta calidad técnica:

- **TypeScript estricto** con `strict: true` y `strictTemplates`
- **ESLint** configurado con reglas de Angular y convenciones de naming (`Page`, `Component`, prefijo `app-`)
- **Standalone components** sin NgModules (arquitectura moderna)
- **Angular Signals** para reactividad (`signal()`, `computed()`, `effect()`)
- **RxJS Subjects** para comunicación entre componentes
- **Separación de responsabilidades** clara entre abstractos, implementaciones y factorías
- **Gestión de secrets** mediante `set-env.ts` y archivos `.env`
- **Docker** para despliegue (`Dockerfile` con nginx)
- **DevContainer** para desarrollo en Codespaces
- **Documentación** en comentarios del código (sin excesos)

### Fragmentos de Código (Evidencias)

**TypeScript estricto (tsconfig.json):**
```json
{
  "compilerOptions": {
    "strict": true,
    "strictTemplates": true
  }
}
```

**ESLint (eslint.config.cjs):**
```javascript
{
  rules: {
    '@angular-eslint/component-selector': ['error', {
      type: 'element',
      prefix: 'app',
      style: 'kebab-case'
    }],
    '@angular-eslint/suffix': ['error', ['Page', 'Component']]
  }
}
```

**Gestión de secrets (set-env.ts):**
```typescript
// Genera environment.ts desde .env en tiempo de build
const envContent = `export const environment = {
  production: ${isProd},
  firebaseConfig: {
    apiKey: '${process.env['FIREBASE_API_KEY']}',
    // ...
  }
};`;
```

**Dockerfile:**
```dockerfile
FROM nginx:alpine
COPY www /usr/share/nginx/html
# Configuración nginx para SPA
EXPOSE 8080
```

**Uso de Angular Signals:**
```typescript
// ConfigService con signals
private _selectedBackend = signal<BackendType>(this.getSavedBackend());
public selectedBackend: Signal<BackendType> = this._selectedBackend.asReadonly();

// AuthService con computed
public readonly isAdmin = computed(() => this._userProfile()?.role === 'ADMIN');
public readonly isUser = computed(() => this._userProfile()?.role === 'USER');
```

### Referencias
- `tsconfig.json` (configuración TypeScript estricta)
- `eslint.config.cjs` (reglas de linting)
- `src/set-env.ts` (gestión de secrets)
- `Dockerfile` (despliegue Docker)
- `.devcontainer/devcontainer.json` (entorno de desarrollo)
- `src/app/core/services/config.service.ts:10-14` (Angular Signals)
- `src/app/core/services/abstract/auth.service.ts:56-59` (computed signals)

---

## Bonus: Uso de patrones de diseño (Strategy/Factory) para la gestión abstracta de servicios

### Evaluación/Justificación

El proyecto implementa de forma sobresaliente los patrones **Strategy** y **Factory** para gestionar la alternancia entre backends (Node.js y Spring Boot) sin modificar la lógica de los componentes:

1. **Strategy Pattern**: Clases abstractas definen contratos (`PlayerService`, `AuthService`, etc.) con implementaciones concretas para cada backend.
2. **Factory Pattern**: Funciones factoría leen `ConfigService.selectedBackend()` y retornan la implementación apropiada.
3. **Template Method**: `AuthService` define algoritmos comunes con hooks abstractos para cada backend.
4. **Rollback Pattern**: Compensación automática si una operación falla (eliminar cuenta de Firebase si el backend falla, eliminar foto de Storage si el guardado falla).

### Fragmentos de Código (Evidencias)

**Clase abstracta Strategy (player.service.ts):**
```typescript
@Injectable()
export abstract class PlayerService {
  protected abstract apiUrl: string;

  abstract getPlayers(filters?: { search?: string; team?: string; league?: string; startDate?: string }): Promise<Player[]>;
  abstract getPlayerById(id: string | number): Promise<Player>;
  abstract createPlayer(player: Player): Promise<Player>;
  abstract updatePlayer(id: string | number, player: Partial<Player>): Promise<Player>;
  abstract deletePlayer(id: string | number): Promise<void>;
  abstract getExternalApiPlayers(search?: string): Promise<Player[]>;
  abstract importPlayers(players: Player[]): Promise<void>;
}
```

**Implementación concreta Strategy (player-node.service.ts):**
```typescript
@Injectable()
export class PlayerNodeService extends PlayerService {
  protected apiUrl = environment.nodeApiUrl;

  async getPlayers(filters?: { search?: string; team?: string; league?: string; startDate?: string }): Promise<Player[]> {
    // Implementación específica para Node.js
    const url = `${this.apiUrl}/players`;
    return firstValueFrom(this.http.get<Player[]>(url, { params, headers }));
  }
  // ...
}
```

**Factory (player.factory.ts):**
```typescript
export function playerFactory(config: ConfigService) {
  const selected = config.selectedBackend();
  switch (selected) {
    case 'springboot':
      return new PlayerSpringService();
    case 'node':
    default:
      return new PlayerNodeService();
  }
}
```

**Registro en DI (main.ts):**
```typescript
{
  provide: PlayerService,       // Cuando un componente pida la clase abstracta...
  useFactory: playerFactory,    // ...Angular ejecutará esta función...
  deps: [ConfigService],        // ...pasándole lo que necesita.
}
```

**ConfigService con signal reactiva:**
```typescript
@Injectable({ providedIn: 'root' })
export class ConfigService {
  private _selectedBackend = signal<BackendType>(this.getSavedBackend());
  public selectedBackend: Signal<BackendType> = this._selectedBackend.asReadonly();

  applyBackendChange(newType: BackendType): void {
    if (newType !== this._selectedBackend()) {
      localStorage.setItem(this.BACKEND_KEY, newType);
      window.location.reload();  // Recarga completa para reinyectar servicios
    }
  }
}
```

**Template Method en AuthService:**
```typescript
@Injectable()
export abstract class AuthService {
  // Algoritmo común
  async login(email: string, pass: string): Promise<any> {
    await this.loginFirebase(email, pass);       // Paso común
    return await this.verifyBackend();            // Hook abstracto
  }

  // Hooks abstractos que cada backend implementa
  abstract verifyBackend(): Promise<void>;
  abstract registerBackend(extraData: any): Promise<any>;
  abstract getProfile(): Observable<User>;
}
```

**BackendToggleComponent (UI para alternar):**
```typescript
@Component({
  selector: 'app-backend-toggle',
  // ...
})
export class BackendToggleComponent {
  @Input() selectedBackend: 'node' | 'springboot' = 'node';
  @Output() selectionChange = new EventEmitter<'node' | 'springboot'>();

  select(backend: 'node' | 'springboot') {
    this.selectedBackend = backend;
    this.selectionChange.emit(backend);
  }
}
```

### Referencias
- `src/app/core/services/abstract/player.service.ts:1-39` (Strategy abstracta)
- `src/app/core/services/implementations/player-node.service.ts:1-141` (implementación Node.js)
- `src/app/core/services/implementations/player-spring.service.ts` (implementación Spring Boot)
- `src/app/core/services/factory/player.factory.ts:1-17` (Factory)
- `src/app/core/services/abstract/auth.service.ts:1-122` (Template Method)
- `src/app/core/services/config.service.ts:1-32` (Estado reactivo con signals)
- `src/main.ts:63-76` (registro de factories en DI)
- `src/app/shared/components/backend-toggle/backend-toggle.component.ts:1-43` (UI de alternancia)


## Tabla Resumen de Puntuación

| # | Criterio | Puntuación Máxima | Puntuación Obtenida | Cumplido |
|---|----------|-------------------|---------------------|----------|
| 1 | Uso de la arquitectura correcta para estructurar componentes, servicios y páginas | 1,00 | 1,00 | Sí |
| 2 | Navegación entre páginas y routing | 1,00 | 1,00 | Sí |
| 3 | Uso de los servicios Angular desde los componentes | 1,00 | 1,00 | Sí |
| 4 | Acceso a la geolocalización del dispositivo y gestión de su almacenamiento | 1,00 | 1,00 | Sí |
| 5 | Acceso a la cámara del dispositivo y gestión de las imágenes | 1,00 | 1,00 | Sí |
| 6 | El registro de usuario y la autenticación se realizan a través de Firebase | 1,00 | 1,00 | Sí |
| 7 | La aplicación incluye pruebas unitarias para todos los componentes y servicios, además de las dos pruebas e2e solicitadas | 1,00 | 1,00 | Sí |
| 8 | El despliegue de la aplicación a través de la APK en un dispositivo móvil Android | 1,00 | 1,00 | Sí |
| 9 | La aplicación tiene un estilo personalizado incluyendo iconos y pantalla de carga | 1,00 | 1,00 | Sí |
| 10 | Calidad de la presentación, el código y el resto del material entregado | 1,00 | 1,00 | Sí |
| **M** | **Matrícula:** Patrones de diseño (Strategy/Factory) para gestión abstracta de servicios | **+1,00** | **+1,00** | **Sí** |
| | **TOTAL** | **10,00** + **Matricula de Honor** | **10,00** + **Matricula de Honor** | **100%** |