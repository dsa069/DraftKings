import { Component, Prop, Event, EventEmitter, h } from '@stencil/core';

@Component({
  tag: 'player-detail',
  styleUrl: 'player-detail.css',
  shadow: true,
})
export class PlayerDetail {
  // Recibe la información completa del jugador desde el componente padre
  @Prop() player: any;

  // Evento para avisar al padre que el usuario quiere regresar a la lista
  @Event() backToList!: EventEmitter<void>;

  render() {
    if (!this.player) return <div>No hay datos del jugador.</div>;

    return (
      <div class="detail-container">
        <button class="back-btn" onClick={() => this.backToList.emit()}>
          ⬅️ Volver al listado
        </button>

        <div class="profile-header">
          <img src={this.player.photoUrl || 'https://via.placeholder.com/150'} alt={this.player.name} />
          <div class="header-info">
            <h1>
              {this.player.firstName} {this.player.lastName}
            </h1>
            <p class="badge">
              {this.player.position} #{this.player.number}
            </p>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-card">
            <h3>Datos Personales</h3>
            <p>
              <strong>Edad:</strong> {this.player.age} años
            </p>
            <p>
              <strong>Nacimiento:</strong> {this.player.birthdate}
            </p>
            <p>
              <strong>Nacionalidad:</strong> {this.player.nationality}
            </p>
            <p>
              <strong>Físico:</strong> {this.player.height}m / {this.player.weight}kg
            </p>
          </div>

          <div class="info-card">
            <h3>Club Actual</h3>
            <p>
              <strong>Equipo:</strong> {this.player.team}
            </p>
            <p>
              <strong>Liga:</strong> {this.player.league}
            </p>
          </div>

          <div class="info-card">
            <h3>Ubicación</h3>
            <p>
              <strong>Latitud:</strong> {this.player.latitude}
            </p>
            <p>
              <strong>Longitud:</strong> {this.player.longitude}
            </p>
          </div>
        </div>
      </div>
    );
  }
}
