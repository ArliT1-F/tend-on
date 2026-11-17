import type {Feature, Polygon} from 'geojson';
export function squareRegion(center:[number,number], sizeMeters:number): Feature<Polygon> {
 const [lng,lat]=center; const half=sizeMeters/2; const dLat=half/111_320; const dLng=half/(111_320*Math.cos(lat*Math.PI/180));
 return {type:'Feature',properties:{simulationLevel:3},geometry:{type:'Polygon',coordinates:[[[lng-dLng,lat-dLat],[lng+dLng,lat-dLat],[lng+dLng,lat+dLat],[lng-dLng,lat+dLat],[lng-dLng,lat-dLat]]]}};
}
export function fogMask(region:Feature<Polygon>):Feature<Polygon>{
 const hole=[...region.geometry.coordinates[0]].reverse();
 return {type:'Feature',properties:{},geometry:{type:'Polygon',coordinates:[[[-180,-85],[180,-85],[180,85],[-180,85],[-180,-85]],hole]}};
}
