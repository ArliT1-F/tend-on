import { GAME_CONFIG } from '../config/game';
export interface MapProvider { id:string; styleUrl:string; attribution:string; productionReady:boolean; }
export const developmentProvider:MapProvider={id:'openfreemap',styleUrl:GAME_CONFIG.map.styleUrl,attribution:'© OpenStreetMap contributors · OpenFreeMap',productionReady:false};
