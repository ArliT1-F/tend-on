import { describe, expect, it } from 'vitest';
import type { FeatureCollection, LineString } from 'geojson';
import { buildRoadGraph, findRoute, nodeId } from '../roadGraph';

const roads: FeatureCollection<LineString> = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: { highway: 'primary' }, geometry: { type: 'LineString', coordinates: [[19.8, 41.3], [19.81, 41.3], [19.82, 41.3]] } },
    { type: 'Feature', properties: { highway: 'service', oneway: 'yes' }, geometry: { type: 'LineString', coordinates: [[19.81, 41.3], [19.81, 41.31]] } },
  ],
};

describe('road graph', () => {
  it('creates geographic nodes and directed edges from road geometry', () => {
    const graph = buildRoadGraph(roads);
    expect(graph.nodes).toHaveLength(4);
    expect(graph.edges).toHaveLength(5);
    expect(graph.nodes.get(nodeId([19.81, 41.3]))?.edges).toHaveLength(3);
  });

  it('finds a route and respects blocked segments', () => {
    const graph = buildRoadGraph(roads);
    const start = nodeId([19.8, 41.3]);
    const end = nodeId([19.82, 41.3]);
    expect(findRoute(graph, start, end)).toEqual([start, nodeId([19.81, 41.3]), end]);
    const outgoing = graph.nodes.get(start)!.edges[0];
    graph.edges.get(outgoing)!.blocked = true;
    expect(findRoute(graph, start, end)).toBeNull();
  });

  it('does not allow travel against a one-way road', () => {
    const graph = buildRoadGraph(roads);
    expect(findRoute(graph, nodeId([19.81, 41.31]), nodeId([19.81, 41.3]))).toBeNull();
  });
});
