import { useCallback, useState } from 'react';
import { WorldMap } from './components/WorldMap';
import type { InspectedFeature } from './types/geo';
import { GAME_CONFIG } from './config/game';
import './styles.css';

type MapStatus = { state: 'loading' } | { state: 'ready' } | { state: 'error'; message: string };

export default function App() {
  const [selected, setSelected] = useState<InspectedFeature | null>(null);
  const [mapStatus, setMapStatus] = useState<MapStatus>({ state: 'loading' });
  const [mapAttempt, setMapAttempt] = useState(0);
  const [roadGraph, setRoadGraph] = useState({ nodes: 0, edges: 0 });
  const inspect = useCallback((value: InspectedFeature | null) => setSelected(value), []);
  const loaded = useCallback(() => setMapStatus({ state: 'ready' }), []);
  const failed = useCallback((message: string) => setMapStatus({ state: 'error', message }), []);
  const roadsLoaded = useCallback((nodes: number, edges: number) => setRoadGraph({ nodes, edges }), []);
  const retry = () => {
    setMapStatus({ state: 'loading' });
    setMapAttempt((attempt) => attempt + 1);
  };

  return <main className="shell">
    <header className="top"><div className="brand"><span className="hazard">DZ</span><div><b>DEADZONE</b><small>URBAN EVACUATION PROTOCOL</small></div></div><div className="metrics"><Stat k="REGION" v="TIRANA / AL-01"/><Stat k="SIMULATION" v="PAUSED" accent/><Stat k="THREAT" v="LOW"/></div><button className="icon" aria-label="Settings">⚙</button></header>
    <section className="viewport">
      <WorldMap key={mapAttempt} onInspect={inspect} onReady={loaded} onError={failed} onRoadGraph={roadsLoaded}/>
      {mapStatus.state === 'loading' && <div className="loading"><i/>ACQUIRING GEOGRAPHICAL DATA</div>}
      {mapStatus.state === 'error' && <div className="map-error" role="alert">
        <span className="error-code">GEOGRAPHICAL LINK FAILURE</span>
        <h1>MAP DATA UNAVAILABLE</h1>
        <p>{mapStatus.message}</p>
        <small>Check this device's internet connection and confirm WebGL is enabled, then retry.</small>
        <button className="primary" onClick={retry}>RETRY CONNECTION</button>
      </div>}
      <div className="map-title"><span>OPERATIONAL SECTOR</span><b>{GAME_CONFIG.startingLocation.name.toUpperCase()}</b><small>2 × 2 KM · LEVEL 3 SIMULATION</small></div><div className="legend"><span><i className="active"/>ACTIVE</span><span><i className="inactive"/>INACTIVE / FROZEN</span></div>
      <aside className="panel"><div className="panel-head"><span>INTELLIGENCE</span><b>{selected?'STRUCTURE // SELECTED':'SECTOR OVERVIEW'}</b></div>{selected?<div className="detail"><label>DESIGNATION</label><h2>{selected.name}</h2><div className="grid"><Stat k="CLASS" v={selected.classification.replace('_',' ').toUpperCase()}/><Stat k="HEIGHT" v={`${selected.height.toFixed(1)} M${selected.heightEstimated?' EST.':''}`}/><Stat k="STATUS" v="UNCLAIMED"/><Stat k="SIM" v="ACTIVE" accent/></div><button className="primary" onClick={()=>setSelected(null)}>CLEAR SELECTION</button></div>:<div className="empty"><div className="radar">⌖</div><h2>AWAITING SELECTION</h2><p>Select a mapped building to inspect real geographical metadata.</p><dl><div><dt>ACTIVE AREA</dt><dd>4.00 KM²</dd></div><div><dt>FOG STATUS</dt><dd>CONTAINED</dd></div><div><dt>DATA SOURCE</dt><dd>OPENSTREETMAP</dd></div><div><dt>ROAD GRAPH</dt><dd>{roadGraph.nodes ? `${roadGraph.nodes} N / ${roadGraph.edges} E` : 'SCANNING'}</dd></div></dl></div>}</aside>
    </section>
    <nav className="bottom"><button className="on">⌖<span>MAP</span></button><button disabled>♟<span>UNITS</span></button><button disabled>⬡<span>SAFE ZONES</span></button><button disabled>▦<span>BUILD</span></button><button disabled>⌁<span>INTEL</span></button><div className="phase">PHASE 01 <b>GEOGRAPHICAL FOUNDATION</b></div></nav>
  </main>;
}

function Stat({k,v,accent=false}:{k:string;v:string;accent?:boolean}){return <div className="stat"><small>{k}</small><strong className={accent?'green':''}>{v}</strong></div>}
