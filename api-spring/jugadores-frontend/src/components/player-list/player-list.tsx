import { Component, State, Event, EventEmitter, h } from '@stencil/core';

@Component({
  tag: 'player-list',
  styleUrl: 'player-list.css',
  shadow: true,
})
export class PlayerList {
  @State() players: any[] = [];
  @State() loading: boolean = true;

  // Guardamos parámetros básicos de paginación de tu Spring Boot
  @State() currentPage: number = 0;
  @State() totalPages: number = 1;

  // Evento para avisar al componente padre que se ha seleccionado un jugador
  @Event() playerSelected!: EventEmitter<number>;

  private apiUrl = 'http://localhost:8080/playerms/api/players';

  async componentWillLoad() {
    await this.fetchPlayers(this.currentPage);
  }

  async fetchPlayers(page: number) {
    this.loading = true;
    try {
      // Pasamos el query param 'page' tal como lo pide tu controlador
      const response = await fetch(`${this.apiUrl}?page=${page}&size=10`);
      if (response.ok) {
        const data = await response.json();
        this.players = data.content; // El array de jugadores vive en 'content'
        this.totalPages = data.totalPages;
        this.currentPage = page;
      }
    } catch (error) {
      console.error('Error cargando listado:', error);
    } finally {
      this.loading = false;
    }
  }

  render() {
    if (this.loading) return <div>Buscando jugadores en el sistema...</div>;

    return (
      <div class="list-container">
        <h2>Listado de Jugadores</h2>

        <div class="grid">
          {this.players.map(player => (
            // Al hacer click en la tarjeta, emitimos el id del jugador
            <div class="player-card" onClick={() => this.playerSelected.emit(player.id)}>
              <img src={player.photoUrl || 'https://via.placeholder.com/150'} alt={player.name} />
              <div class="card-body">
                <h3>{player.name}</h3>
                <p>
                  {player.team} - {player.position}
                </p>
                <span class="view-more">Ver detalles ➡️</span>
              </div>
            </div>
          ))}
        </div>

        {/* Paginación simple basada en la respuesta de tu backend */}
        <div class="pagination">
          <button disabled={this.currentPage === 0} onClick={() => this.fetchPlayers(this.currentPage - 1)}>
            Anterior
          </button>
          <span>
            Página {this.currentPage + 1} de {this.totalPages}
          </span>
          <button disabled={this.currentPage >= this.totalPages - 1} onClick={() => this.fetchPlayers(this.currentPage + 1)}>
            Siguiente
          </button>
        </div>
      </div>
    );
  }
}
