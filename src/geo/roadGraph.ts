import type { Feature, FeatureCollection, LineString, MultiLineString } from 'geojson';

export interface RoadNode {
  id: string;
  coordinate: [number, number];
  edges: string[];
}

export interface RoadEdge {
  id: string;
  from: string;
  to: string;
  lengthMeters: number;
  traversalCost: number;
  roadClass: string;
  blocked: boolean;
}

export interface RoadGraph {
  nodes: Map<string, RoadNode>;
  edges: Map<string, RoadEdge>;
}

type RoadFeature = Feature<LineString | MultiLineString, Record<string, unknown>>;

const ROAD_COST: Record<string, number> = {
  motorway: 0.75,
  trunk: 0.8,
  primary: 0.9,
  secondary: 1,
  tertiary: 1.05,
  residential: 1.15,
  service: 1.35,
  path: 1.8,
  footway: 1.9,
};

export function buildRoadGraph(collection: FeatureCollection<LineString | MultiLineString>): RoadGraph {
  const graph: RoadGraph = { nodes: new Map(), edges: new Map() };
  let edgeSequence = 0;

  for (const feature of collection.features as RoadFeature[]) {
    const lines = feature.geometry.type === 'LineString'
      ? [feature.geometry.coordinates]
      : feature.geometry.coordinates;
    const roadClass = String(feature.properties?.highway ?? 'unclassified');
    const oneWay = isOneWay(feature.properties ?? {});

    for (const line of lines) {
      for (let index = 1; index < line.length; index += 1) {
        const from = toCoordinate(line[index - 1]);
        const to = toCoordinate(line[index]);
        if (from[0] === to[0] && from[1] === to[1]) continue;
        addDirectedEdge(graph, from, to, roadClass, edgeSequence++);
        if (!oneWay) addDirectedEdge(graph, to, from, roadClass, edgeSequence++);
      }
    }
  }
  return graph;
}

export function findRoute(graph: RoadGraph, startId: string, goalId: string): string[] | null {
  if (!graph.nodes.has(startId) || !graph.nodes.has(goalId)) return null;
  const open = new Set([startId]);
  const previous = new Map<string, string>();
  const cost = new Map<string, number>([[startId, 0]]);
  const estimate = new Map<string, number>([[startId, heuristic(graph, startId, goalId)]]);

  while (open.size > 0) {
    const current = [...open].reduce((best, candidate) =>
      (estimate.get(candidate) ?? Infinity) < (estimate.get(best) ?? Infinity) ? candidate : best,
    );
    if (current === goalId) return reconstruct(previous, current);
    open.delete(current);

    for (const edgeId of graph.nodes.get(current)?.edges ?? []) {
      const edge = graph.edges.get(edgeId);
      if (!edge || edge.blocked) continue;
      const candidateCost = (cost.get(current) ?? Infinity) + edge.traversalCost;
      if (candidateCost >= (cost.get(edge.to) ?? Infinity)) continue;
      previous.set(edge.to, current);
      cost.set(edge.to, candidateCost);
      estimate.set(edge.to, candidateCost + heuristic(graph, edge.to, goalId));
      open.add(edge.to);
    }
  }
  return null;
}

export function nodeId(coordinate: [number, number]) {
  return `${coordinate[0].toFixed(6)},${coordinate[1].toFixed(6)}`;
}

function addDirectedEdge(graph: RoadGraph, from: [number, number], to: [number, number], roadClass: string, sequence: number) {
  const fromId = ensureNode(graph, from);
  const toId = ensureNode(graph, to);
  const lengthMeters = haversineMeters(from, to);
  const id = `road-${sequence}`;
  graph.edges.set(id, {
    id,
    from: fromId,
    to: toId,
    lengthMeters,
    traversalCost: lengthMeters * (ROAD_COST[roadClass] ?? 1.25),
    roadClass,
    blocked: false,
  });
  graph.nodes.get(fromId)?.edges.push(id);
}

function ensureNode(graph: RoadGraph, coordinate: [number, number]) {
  const id = nodeId(coordinate);
  if (!graph.nodes.has(id)) graph.nodes.set(id, { id, coordinate, edges: [] });
  return id;
}

function heuristic(graph: RoadGraph, fromId: string, toId: string) {
  const from = graph.nodes.get(fromId)?.coordinate;
  const to = graph.nodes.get(toId)?.coordinate;
  return from && to ? haversineMeters(from, to) * 0.75 : Infinity;
}

function reconstruct(previous: Map<string, string>, current: string) {
  const route = [current];
  while (previous.has(current)) {
    current = previous.get(current)!;
    route.unshift(current);
  }
  return route;
}

function isOneWay(properties: Record<string, unknown>) {
  const value = String(properties.oneway ?? '').toLowerCase();
  return value === 'yes' || value === '1' || value === 'true';
}

function toCoordinate(value: number[]): [number, number] {
  return [value[0], value[1]];
}

function haversineMeters(a: [number, number], b: [number, number]) {
  const radians = Math.PI / 180;
  const dLat = (b[1] - a[1]) * radians;
  const dLon = (b[0] - a[0]) * radians;
  const latA = a[1] * radians;
  const latB = b[1] * radians;
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(latA) * Math.cos(latB) * Math.sin(dLon / 2) ** 2;
  return 6_371_000 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}
