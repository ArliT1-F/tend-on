export const GAME_CONFIG = {
  startingLocation: { name: 'Tirana, Albania', center: [19.8187, 41.3275] as [number, number] },
  initialRegionSizeMeters: 2_000,
  initialZoom: 15.2,
  building: { fallbackHeight: 10, floorHeight: 3.1, minExtrusionZoom: 14 },
  // OpenFreeMap publishes named styles such as Liberty; `dark` is not a valid style endpoint.
  map: { styleUrl: 'https://tiles.openfreemap.org/styles/liberty' },
} as const;
