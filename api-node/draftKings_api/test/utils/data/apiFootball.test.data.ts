import type {
  ExternalApiPlayerResponse,
  PlayerImportBody,
} from "./player.test.data";

export const emptyApiFootballResponse = {
  data: { response: [] },
} satisfies ExternalApiPlayerResponse;

export const searchApiFootballResponse = {
  data: {
    response: [
      {
        player: {
          id: 123,
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

export const teamsByPlayerResponse = {
  data: {
    response: [
      {
        team: { id: 541, name: "Real Madrid" },
        seasons: [2025, 2024],
      },
    ],
  },
};

const currentYear = new Date().getFullYear();

export const leaguesByTeamResponse = {
  data: {
    response: [
      {
        league: { id: 140, name: "La Liga", type: "League" },
        country: { name: "Spain" },
        seasons: [
          { year: currentYear, start: `${currentYear}-08-15`, end: `${currentYear + 1}-05-30` },
          { year: currentYear - 1, start: `${currentYear - 1}-08-15`, end: `${currentYear}-05-30` },
        ],
      },
    ],
  },
};

export const transformedExternalPlayersWithExternalId = [
  {
    externalId: 123,
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

export const transformedExternalPlayers = [
  {
    externalId: 123,
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

export const importPlayersApiPayload = [
  {
    name: "Jugador 1",
    birthdate: "2000-01-01",
    latitude: 41.1,
    longitude: 2.2,
  },
] satisfies PlayerImportBody[];

export const importPlayersApiPayloadWithOptionalFields = [
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
] satisfies PlayerImportBody[];
