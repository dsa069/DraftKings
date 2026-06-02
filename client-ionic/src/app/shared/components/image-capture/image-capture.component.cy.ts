import { signal, WritableSignal } from '@angular/core';
import { ImageCaptureComponent } from './image-capture.component';
import { PhotoService } from '../../../core/services/photo.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('ImageCaptureComponent - Test Suite Exhaustivo', () => {
  // 1. Mocks y Signals
  let photoServiceMock: any;
  let currentPhotoPreviewMock: WritableSignal<string | null>;
  let urlInputValueMock: WritableSignal<string>;

  beforeEach(() => {
    // Inicializamos Signals reactivas para controlar la UI desde el Test
    currentPhotoPreviewMock = signal<string | null>(null);
    urlInputValueMock = signal<string>('');

    // Mock del PhotoService
    photoServiceMock = {
      // Exponemos las signals (el componente las invoca como funciones en el HTML)
      currentPhotoPreview: currentPhotoPreviewMock,
      urlInputValue: urlInputValueMock,
      // Stubs para acciones asíncronas
      takePhoto: cy.stub().resolves(),
      updateUrlInput: cy.stub().resolves(),
      updateLocalImageFile: cy.stub().resolves(),
    };
  });

  // 2. Helper de Montaje
  const mountComponent = () => {
    cy.mount(ImageCaptureComponent, {
      imports: [BrowserAnimationsModule],
      providers: [{ provide: PhotoService, useValue: photoServiceMock }],
    }).then((wrapper) => {
      // Guardamos la instancia para aserciones internas
      cy.wrap(wrapper.component).as('componentInstance');
    });
  };

  describe('1. Renderizado Inicial y Estados Visuales (@if / @else)', () => {
    it('debe mostrar el "Placeholder" de captura cuando no hay imagen', () => {
      // Estado por defecto: null
      mountComponent();

      // Verificamos el bloque @if (!photoService.currentPhotoPreview() ...)
      cy.get('.capture-placeholder').should('be.visible');
      cy.get('.capture-text').should('contain.text', 'Invalid Photo or URL');
      cy.get('ion-icon[name="image-outline"].capture-icon').should('exist');

      // La imagen NO debe existir
      cy.get('ion-img.capture-image').should('not.exist');
    });

    it('debe mostrar la imagen capturada (<ion-img>) cuando el servicio provee una URL válida', () => {
      // Cambiamos el estado ANTES de montar
      currentPhotoPreviewMock.set('https://mi-dominio.com/foto-valida.png');
      mountComponent();

      // El placeholder ya NO debe existir
      cy.get('.capture-placeholder').should('not.exist');

      // Verificamos el estado que gobierna el bloque @else
      cy.get('@componentInstance').then((instance: any) => {
        expect(instance.errorState).to.be.false;
        expect(instance.photoService.currentPhotoPreview()).to.equal(
          'https://mi-dominio.com/foto-valida.png'
        );
      });
    });
  });

  describe('2. Interacciones del Usuario: Botones y Inputs', () => {
    beforeEach(() => mountComponent());

    it('debe llamar al servicio para tomar una foto usando la cámara nativa', () => {
      cy.get('.take-photo-button').contains('Take Photo').click();

      // Verificamos la llamada asíncrona al servicio
      cy.wrap(photoServiceMock.takePhoto).should('have.been.calledOnce');

      // Verificamos reseteo del errorState
      cy.get('@componentInstance').its('errorState').should('be.false');
    });

    it('debe propagar los cambios del input de URL al PhotoService', () => {
      const testUrl = 'https://ejemplo.com/nueva-imagen.jpg';

      // Disparamos el evento nativo ionInput simulando la escritura del usuario
      cy.get('ion-input.url-input').trigger('ionInput', {
        detail: { value: testUrl },
      });

      // Validamos que se envíe el valor al servicio y se resetee el error local
      cy.wrap(photoServiceMock.updateUrlInput).should(
        'have.been.calledOnceWithExactly',
        testUrl
      );
      cy.get('@componentInstance').its('errorState').should('be.false');
    });
  });

  describe('3. Flujo Asíncrono de Carga de Archivos Locales (Upload Image)', () => {
    beforeEach(() => mountComponent());

    it('debe delegar el clic del botón "Upload Image" al input tipo file oculto', () => {
      // Interceptamos el click real sobre el elemento nativo del DOM
      cy.window().then((win) => {
        cy.stub(win.HTMLInputElement.prototype, 'click').as('nativeClickStub');
      });

      // Clic en el botón visual de Ionic
      cy.contains('ion-label', 'Upload Image').closest('ion-button').click();

      // Esperamos a que la promesa resuelva y dispare el clic nativo
      cy.get('@nativeClickStub').should('have.been.calledOnce');
    });

    it('debe procesar el archivo seleccionado por el usuario y limpiar el input', () => {
      const mockFile = new File(['dummy content'], 'test-image.png', {
        type: 'image/png',
      });

      cy.get('@componentInstance').then((instance: any) => {
        const fakeInput = {
          files: [mockFile],
          value: 'fake',
        } as any;

        return instance
          .onLocalImageSelected({ target: fakeInput } as any)
          .then(() => {
            expect(fakeInput.value).to.equal('');
          });
      });

      // Verificaciones:
      // 1. Debe resetear el error
      cy.get('@componentInstance').its('errorState').should('be.false');

      // 2. Debe llamar al servicio con un objeto tipo File real
      cy.wrap(photoServiceMock.updateLocalImageFile).should((stub: any) => {
        expect(stub).to.have.been.calledOnce;
        const passedArg = stub.getCall(0).args[0];
        expect(passedArg.name).to.equal('test-image.png');
      });

      // 3. El input se vacía para permitir resubir el mismo archivo (input.value = '')
      cy.wrap(photoServiceMock.updateLocalImageFile).should(
        'have.been.calledOnce'
      );
    });
  });

  describe('4. Ciclo de Vida de la Imagen y Manejo de Errores (<ion-img>)', () => {
    beforeEach(() => {
      // Arrancamos con una imagen "válida" para que exista el <ion-img>
      currentPhotoPreviewMock.set('https://mi-dominio.com/foto.png');
      mountComponent();
    });

    it('debe cambiar al estado de error y mostrar el placeholder si la imagen falla al cargar', () => {
      cy.get('@componentInstance').then((instance: any) => {
        instance.onImageError();
      });

      cy.get('@componentInstance').its('errorState').should('be.true');
      cy.get('.capture-placeholder').should('be.visible');
    });

    it('debe mantener el estado correcto si la imagen carga exitosamente', () => {
      // Forzamos un error previo para probar la recuperación
      cy.get('@componentInstance').then((instance: any) => {
        instance.onImageError();
      });
      cy.get('@componentInstance').its('errorState').should('be.true');

      cy.get('@componentInstance').then((instance: any) => {
        instance.onImageLoad();
      });

      cy.get('@componentInstance').its('errorState').should('be.false');
      cy.get('.capture-placeholder').should('not.exist');
    });
  });
});
