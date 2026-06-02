import axios from "axios";
import Player from "../models/player";

interface TeamLeagueInfo {
  teamName: string | null;
  leagueName: string | null;
}

const API_BASE = "https://v3.football.api-sports.io";

export class ApiFootballService {
  private apiKey = process.env.API_FOOTBALL_KEY;

  private get headers() {
    return {
      "x-apisports-key": this.apiKey,
      "x-rapidapi-host": "v3.football.api-sports.io",
    };
  }

  async searchPlayers(search?: string): Promise<any[]> {
    const params: any = {};
    if (search) params.search = search;

    try {
      const response = await axios.get(`${API_BASE}/players/profiles`, {
        headers: this.headers,
        params,
      });

      const data = response.data;

      if (!data || !data.response || !Array.isArray(data.response)) return [];

      return data.response.map((item: any) => ({
        externalId: item.player.id,
        name: item.player.name,
        firstName: item.player.firstname || "",
        lastName: item.player.lastname || "",
        age: item.player.age || undefined,
        birthdate: item.player.birth?.date || undefined,
        nationality: item.player.nationality || "",
        position: item.player.position || "",
        photoUrl: item.player.photo || "",
        team: "API Football",
        league: "External",
        latitude: 0,
        longitude: 0,
        height: item.player.height || undefined,
        weight: item.player.weight || undefined,
        number: item.player.number || undefined,
      }));
    } catch (error) {
      console.error("Error fetching from API-Football:", error);
      throw new Error("Failed to fetch players from external API", {
        cause: error,
      });
    }
  }

  async resolveTeamAndLeague(
    playerId: number,
    nationality?: string,
  ): Promise<TeamLeagueInfo> {
    const currentYear = new Date().getFullYear();

    let teamsJson: any;
    try {
      teamsJson = await this.getPlayerTeams(playerId);
    } catch {
      return { teamName: null, leagueName: null };
    }

    const teamsResponse = teamsJson?.response;
    if (!teamsResponse || !Array.isArray(teamsResponse)) {
      return { teamName: null, leagueName: null };
    }

    let teamName: string | null = null;
    let teamId: number | null = null;
    const yearsToTry = [currentYear, currentYear - 1];

    for (const year of yearsToTry) {
      let foundInYear = false;
      for (const t of teamsResponse) {
        const team = t.team;
        const seasons = t.seasons;
        if (!team || !seasons) continue;

        const hasYear = seasons.includes(year);

        if (
          hasYear &&
          nationality &&
          !team.name?.includes(nationality)
        ) {
          teamName = team.name;
          teamId = team.id;
          foundInYear = true;
          break;
        }
      }
      if (foundInYear) break;
    }

    if (teamId === null) {
      return { teamName, leagueName: null };
    }

    let leaguesJson: any;
    try {
      leaguesJson = await this.getLeaguesByTeam(teamId);
    } catch {
      return { teamName, leagueName: null };
    }

    const leaguesResponse = leaguesJson?.response;
    if (!leaguesResponse || !Array.isArray(leaguesResponse)) {
      return { teamName, leagueName: null };
    }

    let leagueName: string | null = null;
    let maxDuration = -1;

    for (const l of leaguesResponse) {
      const league = l.league;
      if (!league || league.type !== "League") continue;

      const country = l.country;
      if (country?.name === "World") continue;

      for (const s of l.seasons) {
        const seasonYear = s.year;
        if (seasonYear === currentYear || seasonYear === currentYear - 1) {
          const start = this.parseDate(s.start);
          const end = this.parseDate(s.end);
          if (start && end) {
            const duration =
              (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
            if (duration > maxDuration) {
              maxDuration = duration;
              leagueName = league.name;
            }
          }
        }
      }
    }

    return { teamName, leagueName };
  }

  private async getPlayerTeams(playerId: number): Promise<any> {
    const response = await axios.get(`${API_BASE}/players/teams`, {
      headers: this.headers,
      params: { player: playerId },
    });
    return response.data;
  }

  private async getLeaguesByTeam(teamId: number): Promise<any> {
    const response = await axios.get(`${API_BASE}/leagues`, {
      headers: this.headers,
      params: { team: teamId },
    });
    return response.data;
  }

  private parseDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? null : d;
    } catch {
      return null;
    }
  }

  async importPlayers(players: any[]): Promise<void> {
    if (!players || players.length === 0) return;

    const enrichedPlayers = await Promise.all(
      players.map(async (player) => {
        let teamName = player.team || null;
        let leagueName = player.league || null;

        if (
          player.externalId &&
          teamName === "API Football" &&
          leagueName === "External"
        ) {
          const info = await this.resolveTeamAndLeague(
            player.externalId,
            player.nationality,
          );
          teamName = info.teamName || teamName;
          leagueName = info.leagueName || leagueName;
        }

        return {
          ...player,
          team: teamName,
          league: leagueName,
          birthdate: player.birthdate ? new Date(player.birthdate) : null,
          coords: {
            type: "Point",
            coordinates: [
              Number(player.longitude || 0),
              Number(player.latitude || 0),
            ],
          },
        };
      }),
    );

    await Player.insertMany(enrichedPlayers);
  }
}
