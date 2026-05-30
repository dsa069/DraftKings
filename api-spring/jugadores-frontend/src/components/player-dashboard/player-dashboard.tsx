import { Component, State, h } from '@stencil/core';

@Component({
  tag: 'player-dashboard',
  shadow: true,
})
export class PlayerDashboard {
  // Si es null muestra la lista; si tiene un ID, muestra el detalle
  @State() selectedPlayerId: number | null = null;
  @State() detailedPlayer: any = null;
  @State() loadingDetail: boolean = false;

  private apiUrl = 'http://localhost:8080/playerms/api/players';

  // Función que se activa cuando el listado nos avisa que pincharon un jugador
  async handlePlayerSelected(event: CustomEvent<number>) {
    const id = event.detail;
    this.selectedPlayerId = id;
    this.loadingDetail = true;

    try {
      // Llamamos al endpoint de detalle individual: api/players/{id}
      const response = await fetch(`${this.apiUrl}/${id}`);
      if (response.ok) {
        this.detailedPlayer = await response.json();
      }
    } catch (error) {
      console.error('Error trayendo el detalle:', error);
    } finally {
      this.loadingDetail = false;
    }
  }

  // Función para limpiar los estados y regresar al listado
  handleBackToList() {
    this.selectedPlayerId = null;
    this.detailedPlayer = null;
  }

  render() {
    // Escenario 1: Cargando expediente
    if (this.loadingDetail) {
      return <div>Cargando expediente del jugador...</div>;
    }

    // Escenario 2: Ya tenemos los datos del jugador individual descargados
    // CAMBIA ESTA LÍNEA para pasar 'this.detailedPlayer.player' en lugar de 'this.detailedPlayer'
    if (this.selectedPlayerId && this.detailedPlayer) {
      return <player-detail player={this.detailedPlayer.player} onBackToList={() => this.handleBackToList()}></player-detail>;
    }

    // Escenario 3: Por defecto, mostrar lista completa
    return <player-list onPlayerSelected={this.handlePlayerSelected.bind(this)}></player-list>;
  }
}
