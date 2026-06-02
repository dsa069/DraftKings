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
    if (!this.player) return <div class="loading-box">No hay datos del jugador.</div>;

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
              {this.player.position} #{this.player.number || 'N/A'}
            </p>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-card">
            <h3>Datos Personales</h3>
            <div class="info-row">
              <strong>Edad:</strong> <span>{this.player.age} años</span>
            </div>
            <div class="info-row">
              <strong>Nacimiento:</strong> <span>{this.player.birthdate}</span>
            </div>
            <div class="info-row">
              <strong>Nacionalidad:</strong> <span>{this.player.nationality}</span>
            </div>
            <div class="info-row">
              <strong>Físico:</strong>{' '}
              <span>
                {this.player.height}m / {this.player.weight}kg
              </span>
            </div>
          </div>

          <div class="info-card">
            <h3>Club Actual</h3>
            <div class="info-row">
              <strong>Equipo:</strong> <span>{this.player.team}</span>
            </div>
            <div class="info-row">
              <strong>Liga:</strong> <span>{this.player.league || 'No especificada'}</span>
            </div>
          </div>

          <div class="info-card">
            <h3>Ubicación</h3>
            <div class="info-row">
              <strong>Latitud:</strong> <span>{this.player.latitude}</span>
            </div>
            <div class="info-row">
              <strong>Longitud:</strong> <span>{this.player.longitude}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
