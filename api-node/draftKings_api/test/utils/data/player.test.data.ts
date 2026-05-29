export interface PlayerCreateBody {
  name: string;
  firstName?: string;
  lastName?: string;
  age?: number;
  birthdate?: string;
  nationality?: string;
  height?: number;
  weight?: number;
  number?: number;
  team?: string;
  league?: string;
  position?: string;
  photoUrl?: string;
  latitude?: number;
  longitude?: number;
}

export interface PlayerUpdateBody {
  name?: string;
  firstName?: string;
  lastName?: string;
  age?: number;
  birthdate?: string | null;
  nationality?: string;
  height?: number;
  weight?: number;
  number?: number;
  team?: string;
  league?: string;
  position?: string;
  photoUrl?: string;
  latitude?: number;
  longitude?: number;
}

export interface PlayerImportBody {
  name: string;
  birthdate?: string;
  latitude: number;
  longitude: number;
  firstName?: string;
  lastName?: string;
  age?: number;
  team?: string;
  league?: string;
  position?: string;
  photoUrl?: string;
  nationality?: string;
  height?: number;
  weight?: number;
  number?: number;
}

export interface ExternalApiPlayerResponse {
  data: {
    response: Array<{
      player: {
        name: string;
        firstname?: string;
        lastname?: string;
        age?: number;
        birth?: { date?: string };
        nationality?: string;
        position?: string;
        photo?: string;
        height?: string;
        weight?: string;
        number?: number;
      };
    }>;
  };
}

export const validPlayerBody = {
  name: "Lionel Messi",
  latitude: 41.3809,
  longitude: 2.1228,
  team: "Inter Miami",
  age: 36,
} satisfies PlayerCreateBody;

export const playerWithoutCoordsBody = {
  name: "Jugador Sin Coordenadas",
} satisfies Partial<PlayerCreateBody>;

export const minimalPlayerBody = {
  name: "Jugador Incompleto",
} satisfies Partial<PlayerCreateBody>;

export const playerWithoutRequiredFieldsBody = {
  name: "Sin coordenadas",
} satisfies Partial<PlayerCreateBody>;

export const playerBodyWithBirthdate = {
  ...validPlayerBody,
  birthdate: "2001-10-30T00:00:00.000Z",
} satisfies PlayerCreateBody;

export const invalidPlayerAgeBody = {
  ...validPlayerBody,
  age: -1,
} satisfies PlayerCreateBody;

export const playerBirthdateBody = {
  ...validPlayerBody,
  birthdate: "2001-10-30T00:00:00.000Z",
} satisfies PlayerCreateBody;

export const fullPlayerBody = {
  name: "Completo",
  firstName: "Completo",
  lastName: "Jugador",
  age: 25,
  birthdate: "2000-01-01T00:00:00.000Z",
  nationality: "Spain",
  height: 180,
  weight: 75,
  number: 9,
  team: "Team A",
  league: "League A",
  position: "ST",
  photoUrl: "https://example.com/photo.jpg",
  latitude: 41.1,
  longitude: 2.2,
} satisfies PlayerCreateBody;

export const playerUpdateServiceBody = {
  name: "Jugador Nuevo",
} satisfies PlayerUpdateBody;

export const playerOriginalServiceBody = {
  name: "Jugador Viejo",
  age: 20,
  coords: { coordinates: [0, 0] },
} as const;

export const playerGpsServiceBody = {
  name: "Jugador GPS",
  latitude: 40.0,
  longitude: -3.0,
} satisfies PlayerCreateBody;

export const playerGps2ServiceBody = {
  name: "Jugador GPS 2",
  latitude: 12.34,
  longitude: 56.78,
} satisfies PlayerCreateBody;

export const playerToUpdateBody = {
  name: "Jugador Original",
  age: 20,
  team: "Equipo A",
} satisfies PlayerCreateBody;

export const playerNameOnlyBody = {
  name: "Jugador Nombre",
  firstName: "Viejo",
  lastName: "ApellidoViejo",
} satisfies PlayerCreateBody;

export const playerExtendedUpdateBody = {
  birthdate: "1990-05-05T00:00:00.000Z",
  nationality: "Old",
  height: 170,
  weight: 70,
} satisfies PlayerCreateBody;

export const playerSingleFieldUpdateBody = {
  age: 21,
  team: "Equipo B",
} satisfies PlayerUpdateBody;

export const playerNewNameUpdateBody = {
  firstName: "Nuevo",
  lastName: "ApellidoNuevo",
} satisfies PlayerUpdateBody;

export const playerLatitudeUpdateBody = {
  latitude: 45.0,
} satisfies PlayerUpdateBody;

export const playerLongitudeUpdateBody = {
  longitude: 99.99,
} satisfies PlayerUpdateBody;

export const playerFullUpdateBody = {
  birthdate: null,
  nationality: "NuevoPais",
  height: 175,
  weight: 72,
  photoUrl: "http://example.com/new.jpg",
  number: 11,
  position: "CM",
  league: "NewLeague",
} satisfies PlayerUpdateBody;

export const playerCreateServiceBody = {
  name: "Lamine Yamal",
  latitude: 41.3809,
  longitude: 2.1228,
  team: "FC Barcelona",
  age: 16,
} satisfies PlayerCreateBody;

export const completePlayerCreateServiceBody = {
  name: "Completo",
  firstName: "CompletoFirst",
  lastName: "CompletoLast",
  age: 25,
  birthdate: "2000-01-01T00:00:00.000Z",
  nationality: "Spain",
  height: 180,
  weight: 75,
  number: 9,
  team: "Equipo X",
  league: "League A",
  position: "ST",
  photoUrl: "https://example.com/photo.jpg",
  latitude: 10.1,
  longitude: 20.2,
} satisfies PlayerCreateBody;

export const updatePlayerBody = {
  team: "Selección Argentina",
  age: 37,
} satisfies PlayerUpdateBody;

export const basicPlayerUpdateBody = {
  age: 21,
  team: "Equipo B",
} satisfies PlayerUpdateBody;

export const nameUpdatePlayerBody = {
  firstName: "Nuevo",
  lastName: "ApellidoNuevo",
} satisfies PlayerUpdateBody;

export const latitudeUpdatePlayerBody = {
  latitude: 45.0,
} satisfies PlayerUpdateBody;

export const longitudeUpdatePlayerBody = {
  longitude: 99.99,
} satisfies PlayerUpdateBody;

export const fullUpdatePlayerBody = {
  birthdate: null,
  nationality: "NuevoPais",
  height: 175,
  weight: 72,
  photoUrl: "http://example.com/new.jpg",
  number: 11,
  position: "CM",
  league: "NewLeague",
} satisfies PlayerUpdateBody;

export const invalidImportPlayers = [
  { name: "Jugador Valido", latitude: 10, longitude: 20 },
  { name: "Jugador Invalido" },
];

export const validImportPlayers = [
  { name: "Jugador 1", latitude: 10, longitude: 20 },
];

export const multipleValidImportPlayers = [
  { name: "Jugador 1", latitude: 10, longitude: 20 },
  { name: "Jugador 2", latitude: 30, longitude: 40 },
];

export const playerImportNotArrayBody = {
  name: "NoArray",
  latitude: 1,
  longitude: 2,
};

export const playerImportInvalidElementBody = {
  name: "Jugador Malo",
};

export const playerImportSingleBody = {
  name: "Jugador 1",
  latitude: 10,
  longitude: 20,
};

export const playerImportBatchBody = [
  playerImportSingleBody,
  { name: "Jugador 2", latitude: 30, longitude: 40 },
];

export const integrationTestPlayerSeed = {
  name: "Jugador de Prueba",
  coords: { type: "Point" as const, coordinates: [0, 0] as [number, number] },
};

export const playerUpdatePayload = {
  team: "Selección Argentina",
  age: 37,
} satisfies PlayerUpdateBody;

export const playerCreateWithoutAuthBody = validPlayerBody;

export const externalPlayerApiResponse = {
  data: {
    response: [
      {
        player: {
          name: "Lamine Yamal",
          firstname: "Lamine",
          lastname: "Yamal",
          age: 17,
          birth: { date: "2007-07-13" },
          nationality: "Spain",
          position: "Attacker",
          photo: "https://example.com/photo.jpg",
          height: "180 cm",
          weight: "72 kg",
          number: 19,
        },
      },
    ],
  },
} satisfies ExternalApiPlayerResponse;

export const emptyExternalPlayerApiResponse = {
  data: { response: [] },
} satisfies ExternalApiPlayerResponse;

export const invalidExternalPlayerApiResponse = {
  data: { response: null },
} as unknown as ExternalApiPlayerResponse;

export const transformedExternalPlayers = [
  {
    name: "Lamine Yamal",
    firstName: "Lamine",
    lastName: "Yamal",
    age: 17,
    birthdate: "2007-07-13",
    nationality: "Spain",
    position: "Attacker",
    photoUrl: "https://example.com/photo.jpg",
    team: "API Football",
    league: "External",
    latitude: 0,
    longitude: 0,
    height: "180 cm",
    weight: "72 kg",
    number: 19,
  },
];

export const importedPlayerPayload = [
  {
    name: "Jugador 1",
    birthdate: "2000-01-01",
    latitude: 41.1,
    longitude: 2.2,
  },
];

export const importedPlayerPayloadWithOptionalFields = [
  {
    name: "Completo",
    firstName: "CompletoFirst",
    lastName: "CompletoLast",
    age: 25,
    team: "Equipo X",
    latitude: 10.1,
    longitude: 20.2,
    birthdate: "2000-01-02T00:00:00.000Z",
    nationality: "Pais",
    height: 180,
    weight: 75,
    number: 9,
    position: "ST",
    photoUrl: "http://example.com/photo.jpg",
    league: "Liga 1",
  },
];
