import {describe,expect,it} from 'vitest'; import {squareRegion,fogMask} from '../region';
it('creates a closed geographic region and inverse fog hole',()=>{const r=squareRegion([19.8,41.3],2000);expect(r.geometry.coordinates[0][0]).toEqual(r.geometry.coordinates[0][4]);expect(fogMask(r).geometry.coordinates).toHaveLength(2)});
