import { MapCaptureComponent } from './map-capture.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SimpleChange } from '@angular/core';

describe('MapCaptureComponent - Test Suite Exhaustivo', () => {
  // Coordenadas base para las pruebas (Ej. Madrid)
  const defaultLocation = { lat: 40.4168, lng: -3.7038 };

  // Helper de montaje que inyecta estilos para asegurar que Leaflet tenga dimensiones
  const mountComponent = (
    props?: Partial<{
      initialLocation: { lat: number; lng: number };
      isReadOnly: boolean;
    }>
  ) => {
    // 1. Inyectamos los estilos directamente en el documento de pruebas de Cypress antes o durante el renderizado
    cy.document().then((doc) => {
      const styleId = 'leaflet-test-dimensions';
      if (!doc.getElementById(styleId)) {
        const style = doc.createElement('style');
        style.id = styleId;
        style.innerHTML = `
          /* Forzamos dimensiones para que Leaflet pueda inicializarse en el entorno de pruebas */
          .map-element { height: 400px !important; width: 100% !important; display: block; }
          .map-wrapper { height: 400px !important; display: block; }
        `;
        doc.head.appendChild(style);
      }
    });

    // 2. Ejecutamos el montaje con una configuración válida para MountConfig
    return cy
      .mount(MapCaptureComponent, {
        imports: [BrowserAnimationsModule],
        componentProperties: {
          initialLocation: defaultLocation,
          ...props,
        },
      })
      .then((wrapper) => {
        // Espiamos los EventEmitters
        cy.spy(wrapper.component.locationSelected, 'emit').as(
          'locationSelectedSpy'
        );
        cy.spy(wrapper.component.requestCenter, 'emit').as('requestCenterSpy');

        // Guardamos la instancia
        cy.wrap(wrapper.component).as('componentInstance');
      });
  };

  describe('1. Renderizado Inicial y Estados de Lectura/Edición', () => {
    it('debe renderizar el mapa, los controles y el botón de GPS en modo edición (por defecto)', () => {
      mountComponent({ isReadOnly: false });

      // Verificamos el contenedor principal
      cy.get('ion-grid.map-container').should('exist');

      // Verificamos que Leaflet inyectó su estructura en el DOM
      cy.get('#leaflet-map.leaflet-container').should('exist');
      cy.get('.leaflet-control-zoom').should('exist');

      // Botón "Use My Location" debe estar visible
      cy.get('.gps-button').should('be.visible');

      // Los inputs manuales deben existir
      cy.get('ion-input[label="Latitude"]').should('exist');
      cy.get('ion-input[label="Longitude"]').should('exist');
    });

    it('debe ocultar los inputs manuales y el botón de GPS si isReadOnly es true', () => {
      mountComponent({ isReadOnly: true });

      // El mapa sigue existiendo
      cy.get('#leaflet-map.leaflet-container').should('exist');

      // Botón de GPS e inputs manuales NO deben existir
      cy.get('.gps-button').should('not.exist');
      cy.get('.manual-coords-input').should('not.exist');
    });

    it('debe mostrar las coordenadas iniciales renderizadas en el display inferior', () => {
      mountComponent({ initialLocation: { lat: 10.12345, lng: -20.98765 } });

      // Validamos el formato del pipe number : "1.5-5" aplicado en el HTML
      cy.get('.coordinates-display').should('contain.text', '10.12345');
      cy.get('.coordinates-display').should('contain.text', '-20.98765');
    });
  });

  describe('2. Validación de Inputs Manuales', () => {
    beforeEach(() => mountComponent());

    it('debe mostrar error si la latitud está fuera de rango (-90 a 90)', () => {
      // Ingresamos latitud inválida
      cy.get('ion-input[label="Latitude"]')
        .find('input') // Accedemos al input nativo dentro de ionic
        .type('{selectall}95', { force: true });

      // Forzamos el evento ionChange que dispara la validación
      cy.get('ion-input[label="Latitude"]').trigger('ionChange', {
        detail: { value: '95' },
      });

      // Verificamos la aparición del mensaje de error
      cy.get('.error-text').should(
        'contain.text',
        'Latitude must be between -90 and 90'
      );

      // Aseguramos que la instancia interna registre el error
      cy.get('@componentInstance').its('latitudeError').should('not.be.null');
    });

    it('debe mostrar error si la longitud está fuera de rango (-180 a 180)', () => {
      // Ingresamos longitud inválida
      cy.get('ion-input[label="Longitude"]').trigger('ionChange', {
        detail: { value: '-190' },
      });

      // Verificamos error
      cy.get('.error-text').should(
        'contain.text',
        'Longitude must be between -180 and 180'
      );
    });

    it('debe actualizar el mapa y emitir la nueva ubicación al ingresar coordenadas válidas', () => {
      // Valores válidos
      const newLat = 48.8584; // Paris
      const newLng = 2.2945;

      // Actualizamos inputs
      cy.get('ion-input[label="Latitude"]').trigger('ionChange', {
        detail: { value: newLat.toString() },
      });
      cy.get('ion-input[label="Longitude"]').trigger('ionChange', {
        detail: { value: newLng.toString() },
      });

      // No deben existir errores
      cy.get('.error-text').should('not.exist');

      // Verifica la emisión del output locationSelected
      cy.get('@locationSelectedSpy').should('have.been.calledWithMatch', {
        lat: newLat,
        lng: newLng,
      });

      // Verifica que el estado interno se actualizó correctamente
      cy.get('@componentInstance').then((instance: any) => {
        expect(instance.currentLocation.lat).to.equal(newLat);
        expect(instance.currentLocation.lng).to.equal(newLng);
      });
    });
  });

  describe('3. Interacciones con el Mapa y la API', () => {
    beforeEach(() => mountComponent());

    it('debe emitir el evento requestCenter al hacer clic en "Use My Location"', () => {
      cy.get('.gps-button').click();
      cy.get('@requestCenterSpy').should('have.been.calledOnce');
    });

    it('debe actualizar la ubicación al invocar la API pública flyToLocation()', () => {
      const targetLat = 35.6895; // Tokio
      const targetLng = 139.6917;

      cy.get('@componentInstance').then((instance: any) => {
        // Simulamos que el componente padre invoca el método expuesto
        instance.flyToLocation(targetLat, targetLng);
      });

      // El evento debe ser emitido
      cy.get('@locationSelectedSpy').should('have.been.calledWithMatch', {
        lat: targetLat,
        lng: targetLng,
      });

      // Los inputs manuales deben haberse sincronizado
      cy.get('@componentInstance')
        .its('manualLatitude')
        .should('equal', targetLat);
      cy.get('@componentInstance')
        .its('manualLongitude')
        .should('equal', targetLng);
    });
  });

  describe('4. Ciclo de Vida: ngOnChanges (Reactividad desde el Padre)', () => {
    it('debe mover el marcador en el mapa cuando el @Input initialLocation cambia dinámicamente', () => {
      mountComponent();

      const updatedLocation = { lat: 51.5074, lng: -0.1278 }; // London

      cy.get('@componentInstance').then((instance: any) => {
        // Simulamos un cambio de propiedad que viene desde el componente padre
        instance.initialLocation = updatedLocation;

        // Creamos manualmente el objeto de cambio (SimpleChange) tal como lo haría Angular
        instance.ngOnChanges({
          initialLocation: new SimpleChange(
            defaultLocation,
            updatedLocation,
            false // firstChange = false
          ),
        });
      });

      // Verificamos que el estado local y los inputs reflejen el cambio provocado por ngOnChanges
      cy.get('@componentInstance')
        .its('manualLatitude')
        .should('equal', updatedLocation.lat);
      cy.get('@componentInstance')
        .its('manualLongitude')
        .should('equal', updatedLocation.lng);

      // Verificamos la UI renderizada
      cy.get('.coordinates-display').should('contain.text', '51.5074');
    });
  });
});
