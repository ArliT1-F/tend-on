DEADZONE — MASTER GAME DEVELOPMENT SPECIFICATION

Persistent Global Zombie Survival, Military Strategy, Territorial Expansion & Real-Time Simulation

Project type: Browser-based real-time strategy / survival / military management simulation
Working title: DEADZONE
Subtitle: Urban Evacuation Protocol
Target platforms: Desktop browsers and mobile browsers
Primary development environment: Linux Mint
Hosting model: Self-hosted on the player’s laptop, accessible remotely through Tailscale
Primary inspiration: Zombies Aren’t Real, combined with real-world geographical simulation, military strategy, territorial management, and persistent survival mechanics.

⸻

0. PROJECT OBJECTIVE

Build a sophisticated, highly replayable, persistent zombie-apocalypse strategy simulation.

The player assumes the role of a military commander during a worldwide zombie outbreak.

Their responsibilities include:

* Rescuing civilians.
* Establishing and maintaining safe zones.
* Expanding into new geographical territories.
* Deploying and managing military personnel.
* Recovering incapacitated soldiers.
* Establishing hospitals and medical infrastructure.
* Building defensive installations.
* Establishing communications networks.
* Sending reconnaissance aircraft to distant locations.
* Organizing scavenging expeditions.
* Managing resources and supply lines.
* Investigating zombie infestations.
* Defending settlements against increasingly dangerous hordes.
* Establishing independent safe zones in different cities and countries.
* Eventually attempting to establish a global network of surviving settlements.

The game must feel like a living, persistent world rather than a sequence of disconnected missions.

The player should be able to start in a relatively small geographical area, such as Tirana, Albania, and gradually expand across Albania, Europe, and potentially the entire world.

There are NO conventional stages.

There is no requirement to finish one stage before starting another, no stage-based map reset, and no artificial campaign transitions.

The game operates continuously. Its difficulty, population, threats, territory, and available opportunities evolve over time.

The main design philosophy:

A persistent geographical world, autonomous agents, intelligent military AI, meaningful territorial expansion, and consequences that remain throughout the campaign.

Do not build this as a collection of disconnected menus or a visual prototype with simulated buttons. Every major interface must connect to an actual underlying gameplay system.

⸻

1. NON-NEGOTIABLE DESIGN PRINCIPLES

The following principles must guide the entire implementation.

1. The game must be genuinely playable, not just visually impressive.
2. The world must use real geographical data.
3. Buildings must use actual building footprints wherever available.
4. Buildings do not require textures or detailed interiors.
5. Military units, civilians, and zombies must have autonomous AI.
6. Units must navigate actual geographical roads and obstacles.
7. The player should issue strategic orders, not manually control every individual.
8. Multiple independent safe zones must be supported.
9. Territory must be expandable and destructible.
10. Radio towers are the primary mechanism for permanent territorial activation.
11. Reconnaissance and permanent territorial expansion must be separate systems.
12. The campaign must persist through saves and loading.
13. The simulation must remain efficient on relatively modest hardware.
14. Mobile browsers must be first-class supported clients.
15. The game must be self-hostable without requiring a cloud backend.
16. The game must support remote access through Tailscale using a simple IP address and port.
17. All important gameplay values must be configurable.
18. The game must remain playable with hundreds or thousands of simulated entities through appropriate optimization.

Do not sacrifice simulation correctness for visual effects.

Do not introduce unnecessary dependencies or infrastructure.

⸻

2. WORLD MAP AND GEOGRAPHICAL DATA

2.1 Real-world geographical map

The game must use real-world geographical data.

The player should be able to play on an actual map of their chosen location, including real cities, roads, streets, and building footprints.

Examples:

* Tirana, Albania.
* Durrës, Albania.
* Shkodër, Albania.
* Rome, Italy.
* Athens, Greece.
* Oslo, Norway.
* Other supported global locations.

The map system must support global geographical coordinates.

Use an appropriate mapping stack, preferably:

* MapLibre GL JS for geographical map rendering.
* OpenStreetMap-compatible geographical data.
* A suitable vector-tile provider or self-hosted geographical data.
* OSM building footprints and road data where available.

Evaluate the licensing, usage limits, performance, and pricing of map and geographical data providers before selecting a production configuration.

Do not assume that public OpenStreetMap tile servers are suitable for unlimited production use.

Create a provider abstraction so the mapping source can be changed without rewriting the simulation.

2.2 Building representation

Buildings should be represented as simple geometric structures.

Do not generate photorealistic building textures or interiors.

Each building should contain:

* Geographical footprint.
* Polygon geometry.
* Approximate height.
* Estimated floor count.
* Building classification.
* Building condition.
* Structural durability.
* Claimed/unclaimed status.
* Safe-zone membership.
* Garrison status.
* Relevant building-specific bonuses.

Use simple extruded polygons to create a subtle 2.5D city appearance.

Buildings should look like tactical geographical structures, not detailed architectural models.

The map should remain visually clear at different zoom levels.

2.3 Building classifications

Use available geographical metadata to classify buildings.

Potential classifications:

* Residential.
* Commercial.
* Office.
* Industrial.
* Warehouse.
* Hospital.
* Police station.
* Fire station.
* School.
* University.
* Hotel.
* Bank.
* Supermarket.
* Convenience store.
* Pharmacy.
* Fuel station.
* Hardware store.
* Electronics store.
* Military facility.
* Government building.
* Airport.
* Railway station.
* Religious building.
* Other/unknown.

Missing classifications must fall back to a generic building classification.

Allow manual classification and correction.

Do not assume every building has accurate metadata.

2.4 Building heights

Use available building height or floor metadata.

If height information is missing, estimate it using:

* Building classification.
* Floor count.
* Footprint size.
* Nearby building information.
* Configurable classification defaults.

Mark estimated heights internally so they are not confused with actual geographical measurements.

Building height must influence rooftop deployment and line-of-sight calculations.

2.5 Road network

Build a geographical road graph from actual road data.

The graph should contain:

* Road segments.
* Intersections.
* Road classification.
* Length.
* Traversal cost.
* Accessibility.
* Condition.
* Danger level.
* Blocked status.
* Congestion.
* Military accessibility.
* Vehicle accessibility where applicable.

Use A* or an equivalent pathfinding algorithm.

Implement route caching, hierarchical pathfinding, and dynamic route recalculation.

Units must be able to find alternative routes when roads become blocked or dangerous.

Do not make the simulation depend on a simplistic straight-line movement model.

2.6 Geographical abstraction

The map renderer and simulation engine must be separate systems.

Geographical rendering should not directly control entity AI.

The simulation should operate using world coordinates and geographical spatial data.

⸻

3. STARTING WORLD AND CAMPAIGN STRUCTURE

3.1 Initial unlocked region

At the beginning of a campaign, the player receives an already revealed geographical starting region.

Default example:

2 × 2 kilometres.

Alternative campaign settings can use 3 × 3 kilometres or other configurable dimensions.

The initial region:

* Has no fog of war.
* Is fully simulation-active.
* Contains the initial safe zone.
* Contains the initial command infrastructure.
* Allows normal military deployment.
* Allows construction and building claims.
* Allows scavenging and civilian evacuation.

The surrounding geographical map may exist as geographical data, but gameplay simulation remains inactive until the territory is revealed.

3.2 Persistent campaign

There are no conventional stages.

The player operates one continuous campaign.

Everything persists:

* Safe zones.
* Territory.
* Buildings.
* Military personnel.
* Veterans.
* Resources.
* Infestations.
* Civilian population.
* Infrastructure.
* Research.
* Technology.
* World events.
* Outbreak escalation.
* Casualties.
* Destroyed radio towers.
* Lost geographical territory.

3.3 Grace period

Introduce a configurable initial grace period.

During the grace period, the player can:

* Establish initial defenses.
* Organize military personnel.
* Establish garrisons.
* Prepare scavengers.
* Establish medical infrastructure.
* Configure their safe zone.
* Claim important buildings.
* Prepare defensive installations.

The grace period is not a stage.

It is simply the initial preparation window before the outbreak begins escalating.

Recommended default behavior:

The world already contains some zombies and infestations, but large-scale outbreak escalation and major horde activity are delayed.

This allows players to experience some early threats without being overwhelmed immediately.

The exact behavior must be configurable by difficulty.

⸻

4. FOG OF WAR AND SIMULATION ACTIVATION

The world must have a geographical fog-of-war system.

This is not merely a visual effect.

Fog of war controls whether geographical regions participate in the actual simulation.

4.1 Inactive territory

Inside inactive territory:

* Civilians are frozen.
* Zombies are frozen.
* Infested buildings do not generate zombies.
* Hordes do not move.
* Combat does not occur.
* Infection does not progress.
* Looting does not occur.
* Buildings do not deteriorate.
* Infrastructure does not simulate damage.
* No autonomous gameplay activity occurs.

The geographical map may still be available as static map data, but the region’s gameplay simulation must remain inactive.

4.2 Active territory

Once a geographical region is permanently activated:

* Zombies resume activity.
* Civilians resume activity.
* Infested buildings begin generating zombies.
* Military AI becomes operational.
* Looting becomes possible.
* Combat and infection systems operate.
* Environmental events can affect the region.

4.3 Three simulation levels

Implement three levels of simulation detail.

Level 1: Inactive

Completely frozen.

Level 2: Active but distant

Use aggregated or simplified simulation:

* Population groups.
* Simplified zombie movement.
* Aggregated encounters.
* Reduced-frequency updates.
* Simplified resource and environmental calculations.

Level 3: Active and nearby

Full simulation:

* Individual AI.
* Detailed pathfinding.
* Combat.
* Infection.
* Civilian behavior.
* Scavenging.
* Military coordination.
* Interactions.

The simulation level must change dynamically according to geographical proximity, player visibility, active operations, and strategic importance.

Do not simulate thousands of individual agents at full detail when they are far from the player.

⸻

5. SAFE ZONES AND TERRITORIAL CONTROL

This is one of the game’s most important systems.

The player can establish multiple independent safe zones across the world.

A single safe zone must never be required to cover the entire map.

For example, a long-running campaign could eventually establish safe zones in:

* Tirana.
* Durrës.
* Shkodër.
* Rome.
* Athens.
* Other cities and countries.

Every safe zone has its own identity and operational infrastructure.

5.1 Three separate geographical concepts

Do not confuse the following concepts.

Active territory

Geographical territory where the simulation is running because it has been revealed and activated.

Controlled territory

Territory where the player has established sufficient military presence, infrastructure, and operational control.

Safe zone

A geographically defined settlement with protected infrastructure, command facilities, civilian support, and local military organization.

These concepts can overlap but are not interchangeable.

5.2 Safe-zone independence

Every safe zone must function independently.

Each safe zone can have:

* Its own command center.
* Local military personnel.
* Garrison buildings.
* Hospitals.
* Radio towers.
* Emergency broadcast stations.
* Turrets.
* Gates.
* Defensive structures.
* Civilian population.
* Storage.
* Supply depots.
* Local resource requirements.

A safe zone does not need to be geographically connected to another safe zone to exist or operate.

Communications and logistical connections provide strategic advantages, but must not be mandatory for basic local survival.

5.3 Safe-zone protection

Safe zones provide protection for their claimed buildings and infrastructure.

Garrison buildings inside an operational safe zone are protected from ordinary zombie structural destruction.

However, this must not make the safe zone invulnerable.

Zombies can breach gates, attack troops, threaten civilians, disable infrastructure, and overwhelm defenses.

Critical installations such as radio towers remain vulnerable to dedicated attacks and must be capable of being destroyed.

A safe zone is a protected settlement, not an invincible bubble.

5.4 Safe-zone boundary editor

Players must manually draw safe-zone boundaries on the geographical map.

Do not restrict safe zones to predefined circles, squares, or fixed-radius areas.

The player activates a dedicated Safe Zone tool.

They then place geographical control points on the map.

Consecutive points form a polygon.

The polygon can be:

* Circular-looking.
* Rectangular.
* Irregular.
* Corridor-shaped.
* Designed around specific buildings.
* Designed around roads.
* Designed around important infrastructure.

The player closes the polygon by selecting the first point or using a confirmation action.

Display a live preview.

Before confirmation, show:

* Enclosed area.
* Perimeter length.
* Included buildings.
* Excluded buildings.
* Existing safe-zone overlap.
* Important facilities.
* Known infestations.
* Potential threats.
* Estimated establishment costs.
* Estimated maintenance requirements.

Use actual geographical coordinates, not screen pixels.

5.5 Mobile boundary editing

Mobile interaction is a first-class requirement.

Controls:

* Tap map to place a point.
* Tap existing point to select it.
* Drag point to reposition.
* Tap first point to close polygon.
* Undo last point.
* Redo.
* Delete selected point.
* Confirm.
* Cancel.

Desktop controls:

* Left-click to place.
* Drag to reposition.
* Keyboard shortcuts.
* Undo/redo.
* Clear confirmation and cancellation.

Provide optional snap-to-road and snap-to-building-edge behavior.

This should help players create realistic urban perimeters.

Snapping must be optional.

5.6 Building inclusion

After drawing a safe-zone polygon, identify buildings inside it.

Use building footprint geometry.

Default membership rule: use the building footprint centroid.

Optionally support intersection-based inclusion through a configuration setting.

A building being inside a safe zone does not automatically mean it has been claimed.

The player must separately claim or assign buildings where required.

5.7 Safe-zone establishment

Drawing a boundary does not automatically secure the area.

Establishment should require configurable conditions:

* Operational command center.
* Sufficient military presence.
* Required supplies.
* Construction materials.
* Defensible access points.
* Appropriate infrastructure.
* Acceptable threat conditions.

Show missing requirements before the player confirms establishment.

5.8 Safe-zone maintenance

Maintenance should scale according to:

* Area enclosed.
* Perimeter length.
* Population.
* Infrastructure.
* Claimed buildings.
* Defensive installations.
* Operational facilities.

This prevents players from enclosing an entire city without sufficient infrastructure.

5.9 Safe-zone editing

Allow:

* Expansion.
* Reduction.
* Point movement.
* Point addition.
* Point removal.
* Merging adjacent zones.
* Splitting a zone into multiple zones.

Expansion into unsecured territory does not automatically protect all buildings.

The player must establish actual military and infrastructure control.

Removing territory from a safe zone can expose buildings and infrastructure to destruction and disable special facility functions if they are no longer covered.

Overlapping zones must not duplicate building membership or protection calculations.

Keep individual safe-zone identities unless the player explicitly merges them.

⸻

6. RADIO TOWERS AND PERMANENT TERRITORIAL EXPANSION

Radio towers are the primary mechanism for permanent geographical expansion.

6.1 Radio tower rules

A radio tower can only be claimed and activated if its building is inside an operational safe zone.

Its special territorial expansion function is disabled outside a safe zone.

When activated, a radio tower:

1. Establishes signal coverage.
2. Reveals territory within its effective radius.
3. Removes fog of war within coverage.
4. Activates the newly revealed geographical region.
5. Allows normal gameplay within that territory.

The tower must have configurable:

* Signal radius.
* Durability.
* Upgrade level.
* Signal strength.
* Detection capabilities.
* Power requirements, if enabled.

Multiple towers can create overlapping coverage.

6.2 Tower destruction

Radio towers are strategic assets and must be vulnerable.

When a tower is destroyed:

1. Remove its coverage.
2. Calculate which geographical cells lose all remaining coverage.
3. Check for other operational towers.
4. Immediately deactivate exclusively covered territory.
5. Identify infrastructure, claimed buildings, and safe zones inside the affected territory.
6. Calculate casualties and potential zombie conversions using actual infection and survival states.
7. Permanently remove affected player infrastructure according to the campaign’s loss rules.

If another tower maintains sufficient coverage, the territory remains active.

Do not deactivate territory unnecessarily.

The default campaign rule should preserve the user’s intended severe consequences: territory exclusively covered by a destroyed tower is lost, and player-built infrastructure there is permanently removed.

An optional difficulty setting may provide an emergency restoration window before permanent infrastructure loss.

Previously lost infrastructure must not automatically return when territory is activated again.

6.3 Population consequences

Do not automatically turn every civilian or soldier in lost territory into a zombie.

Use actual states:

* Healthy.
* Injured.
* Infected.
* Incapacitated.
* Dead.
* Evacuated.
* Missing.

When territory is lost, apply configured outbreak rules to the entities that were there.

Potential conversions should depend on infection, exposure, and survival state.

Lost regions may subsequently contain additional zombie populations and infestations.

⸻

7. GLOBAL RECONNAISSANCE SYSTEM

Permanent radio coverage and temporary reconnaissance are separate systems.

The player must be able to explore distant locations without automatically activating them.

7.1 Reconnaissance helicopters

Introduce reconnaissance helicopters through the intelligence and aviation technology tree.

The player can:

1. Open the global geographical map.
2. Select a destination anywhere within the supported geographical world.
3. Choose reconnaissance radius.
4. Dispatch an available helicopter.
5. Simulate aircraft travel.
6. Reveal the selected area after arrival.
7. Inspect geographical and intelligence information.
8. Receive a temporary visibility window.

Example destinations:

* Another city in Albania.
* Italy.
* Greece.
* Norway.
* Other supported locations worldwide.

The helicopter physically simulates travel.

The five-minute reconnaissance timer begins when the helicopter arrives, not when it departs.

Default observation duration: five minutes.

Make duration configurable and upgradeable.

7.2 Temporary reconnaissance visibility

During reconnaissance, players can:

* See roads.
* See building footprints.
* Inspect building classifications where data is available.
* Identify hospitals and strategic buildings.
* Identify possible safe-zone locations.
* View known infestations.
* Receive estimated zombie concentration information.
* Inspect potential deployment locations.
* Evaluate geographical conditions.

However, reconnaissance must not:

* Activate the region’s simulation.
* Permit ordinary military deployment.
* Permit construction.
* Activate frozen civilians or zombies.
* Establish a safe zone directly.

The region remains frozen until permanent activation.

7.3 Intelligence persistence

Separate live visibility from persistent discovered information.

After reconnaissance expires:

* Live visibility disappears.
* The area returns to fog of war.
* Its simulation remains inactive.
* Previously discovered geographical information remains in the intelligence archive.

Store:

* Known buildings.
* Known roads.
* Building classifications.
* Potential facilities.
* Known infestations.
* Previously detected threats.
* Discovery timestamp.
* Intelligence freshness.

Dynamic information such as zombie population and infestation severity should become progressively outdated.

7.4 Reconnaissance upgrades

Include:

* Extended observation.
* Larger reconnaissance radius.
* Advanced optics.
* Thermal imaging.
* Urban scanning.
* Zombie concentration detection.
* Infrastructure identification.
* Weather resistance.
* Aircraft endurance.
* Long-range aviation.
* Persistent intelligence.
* Advanced intelligence processing.

7.5 Reconnaissance risks

As the outbreak escalates, aircraft may face:

* Adverse weather.
* Reduced visibility.
* Fuel limitations.
* Aircraft damage.
* Zombie attraction from aircraft noise.
* Special threats and rare mutations.
* Mission failure.

Do not make reconnaissance frustrating at the beginning.

⸻

8. FORWARD DEPLOYMENT AND REMOTE SAFE-ZONE ESTABLISHMENT

Reconnaissance identifies distant opportunities.

Permanent expansion requires actual military deployment.

The player must be able to establish a safe zone in a distant city or country without physically connecting it to the original safe zone.

8.1 Forward deployment

The player prepares an expedition containing:

* Military personnel.
* Engineers.
* Medical personnel.
* Supplies.
* Construction equipment.
* Communications infrastructure.
* Radio towers, if transport capacity allows.

Use appropriate transport:

* Helicopters.
* Military transport aircraft.
* Ground vehicles.
* Convoys.
* Other unlocked transport systems.

Transport must physically simulate travel.

8.2 Establishing a new safe zone

The process:

1. Reconnaissance identifies a suitable location.
2. The player selects a building or geographical site for a command center.
3. The player prepares a deployment operation.
4. Personnel and supplies are transported.
5. Military units secure the location.
6. Engineers establish the forward operating base.
7. The player draws a custom safe-zone polygon.
8. The required infrastructure and military conditions are satisfied.
9. The new independent safe zone becomes operational.
10. Its own radio towers can begin expanding geographical coverage.

A new safe zone does not require continuous geographical connection to the original one.

Remote deployments should account for:

* Distance.
* Transport capacity.
* Fuel.
* Personnel.
* Supplies.
* Deployment time.
* Regional threat intelligence.
* Landing conditions.
* Communications availability.

⸻

9. COMMAND HIERARCHY AND REGIONAL AUTONOMY

Introduce three levels of command.

Central headquarters

Responsible for:

* Global strategy.
* Campaign-wide coordination.
* Technology and research.
* Global intelligence.
* High-level military planning.

Regional headquarters

Responsible for:

* A group of nearby safe zones.
* Regional military coordination.
* Regional logistics.
* Reinforcement requests.
* Regional threat management.

Local command

Responsible for:

* Individual safe-zone military personnel.
* Garrisons.
* Local defenses.
* Civilian population.
* Hospitals.
* Local operations.

The player remains the overall commander.

Orders can be issued at any level.

Safe zones must retain local autonomy if disconnected from central headquarters.

If communication is lost:

* Local garrisons continue operating.
* Turrets continue firing.
* Military units continue following their last valid orders.
* Hospitals continue treating patients.
* Local broadcasts continue if their infrastructure is operational.
* Local radio towers continue functioning if independently powered and operational.

Disconnected zones lose selected global functions:

* Shared resource transfers.
* Centralized orders.
* Intelligence synchronization.
* Long-distance reinforcement coordination.

Do not make the entire world dependent on one command center.

⸻

10. EMERGENCY BROADCAST STATIONS

Broadcast stations attract and direct civilians.

They can be established by claiming suitable buildings inside a functioning safe zone.

Their special function is disabled outside safe zones.

They can:

* Broadcast evacuation instructions.
* Inform civilians of safe-zone locations.
* Attract distant civilians.
* Communicate evacuation routes.
* Coordinate isolated survivor groups.
* Broadcast emergency warnings.

Civilians must not automatically know safe-zone locations.

Broadcasts provide the information needed to update their objectives.

Civilians physically travel toward safe zones.

Do not teleport civilians.

Broadcast upgrades

* Transmission radius.
* Signal strength.
* Signal penetration.
* Multiple broadcast coverage.
* Civilian response speed.
* Distress signal reception.
* Regional communication.
* Survivor detection.

Broadcasts can also attract zombies because of their noise.

The player must balance civilian attraction against the risk of drawing hordes toward the station.

⸻

11. MILITARY UNITS AND TROOP ROSTER

Introduce a diverse military roster with meaningful tactical differences.

Units must have different attributes, behaviors, equipment, and strategic purposes.

11.1 Infantry

* Riflemen.
* Assault squads.
* Heavy infantry.
* Paratroopers.
* Combat engineers.
* Reconnaissance squads.
* Riot police.
* Military police.

11.2 Specialized combat personnel

* Snipers.
* Anti-materiel teams.
* Machine-gun teams.
* Grenadiers.
* Flamethrower teams.
* Mortar teams.
* Anti-vehicle specialists.
* Drone operators.

11.3 Support personnel

* Field medics.
* Medical evacuation teams.
* Field surgeons.
* Logistics personnel.
* Communications specialists.
* Rescue teams.
* Helicopter crews.
* Transport crews.

11.4 Scavengers

Scavengers are a specialized resource-recovery unit.

They are not conventional infantry.

Their job is to enter buildings, retrieve resources, and return them to safe zones.

Detailed scavenger behavior is specified in Section 18.

11.5 Unit statistics

Every troop type should have configurable:

* Health.
* Armor.
* Damage.
* Accuracy.
* Attack speed.
* Detection range.
* Movement speed.
* Engagement range.
* Ammunition capacity.
* Reload time.
* Morale.
* Stamina.
* Experience.
* Carry capacity where applicable.
* Special abilities.

Avoid making units differ only through health and damage.

Their AI and battlefield behavior should be distinct.

⸻

12. MILITARY AI AND AUTONOMOUS BEHAVIOR

The player should manage military operations rather than manually controlling individual soldiers.

12.1 Doctrine settings

Each squad should support configurable doctrine.

Aggression

* Defensive.
* Balanced.
* Aggressive.

Movement

* Hold position.
* Patrol.
* Advance.
* Escort.
* Retreat.
* Guard.
* Pursue.
* Roadblock.

Targeting

* Closest.
* Strongest.
* Highest threat.
* Closest to civilians.
* Closest to safe-zone entrance.
* Fastest.
* Special mutations.
* Manually designated targets.

Additional settings

* Retreat health threshold.
* Civilian protection priority.
* Ammunition conservation.
* Formation.
* Engagement range.
* Squad spacing.
* Reinforcement behavior.

12.2 Squad intelligence

Squads should:

* Avoid overlapping firing positions.
* Share threat information.
* Coordinate targets.
* Assist overwhelmed squads.
* Avoid unnecessary pursuit.
* Maintain formation where appropriate.
* Retreat when necessary.
* Request medical assistance.
* Request ammunition and reinforcements.

Commanders can provide bonuses to nearby units.

12.3 Paratrooper AI

Paratroopers can be deployed to:

* Road intersections.
* Chokepoints.
* Strategic buildings.
* Perimeter defense.
* Rescue operations.
* Reinforcement operations.

They should:

* Spread out.
* Establish firing coverage.
* Detect threats.
* Engage appropriately.
* Avoid encirclement.
* Request reinforcements.
* Retreat if survival probability becomes too low.
* Return to assigned objectives when safe.

12.4 Military hierarchy

Use a command hierarchy:

* Central HQ.
* Regional commanders.
* Squad leaders.
* Infantry and specialists.
* Medical and logistical personnel.

The player should be able to issue orders to squads and groups instead of controlling every soldier.

⸻

13. ROOFTOP DEPLOYMENT AND ELEVATION

Allow appropriate units and installations to occupy rooftops.

Buildings should use their actual or estimated height data.

Example elevation categories:

* Street level: 0 m.
* Low rooftop: approximately 8 m.
* Medium rooftop: approximately 20 m.
* High rooftop: approximately 45 m.
* Skyscraper rooftop: approximately 100 m.

These are example values and must remain configurable.

Elevation affects:

* Weapon range.
* Visibility.
* Line of sight.
* Firing angles.
* Accuracy.
* Target elevation.
* Obstruction by nearby buildings.

Do not implement arbitrary universal rooftop damage bonuses.

13.1 Snipers

Snipers can be deployed on suitable rooftops.

They remain stationary unless ordered otherwise.

Their elevation improves visibility and potential engagement range.

Ground zombies should not automatically be able to attack rooftop snipers.

However, suitable special threats, building destruction, or access routes may create exceptions.

Default sniper target priority:

* High-health zombies.
* Strongest zombie variants.
* Tanky mutations.
* High-threat enemies.

Additional targeting priorities:

* Closest to civilians.
* Closest to safe-zone entrances.
* Fastest.
* Special mutation.
* Manually designated targets.

Avoid wasting shots on enemies that are nearly dead when another high-threat target is available.

Implement target coordination between multiple sniper teams.

13.2 Other rooftop installations

* Observation posts.
* Machine-gun positions.
* Radio antennas.
* Surveillance systems.
* Other suitable defensive installations.

⸻

14. MOVEMENT AND SPEED SYSTEM

Use normalized movement speeds rather than unrealistic literal speeds.

Default relative movement:

Entity	Relative speed
Civilian	1.0x
Military / Paratrooper	2.0x
Scavenger	2.0x
Basic zombie	2.5x

These are initial balancing values.

Keep all actual movement speeds configurable.

Additional modifiers:

* Injuries.
* Age.
* Panic.
* Stamina.
* Equipment weight.
* Unit type.
* Terrain.
* Road condition.
* Congestion.
* Weather.
* Zombie mutation.

Civilians may temporarily run faster under panic but can become exhausted.

Military personnel should have stamina and equipment-dependent movement.

Heavy infantry should generally move slower than light infantry.

Different zombie types should have different movement speeds.

Vehicles must use separate movement models.

Movement must be geographically plausible and independent of rendering framerate.

⸻

15. ZOMBIE AI AND MUTATIONS

Zombies must operate autonomously.

They must not simply move toward the nearest visible entity.

Their behavior should consider:

* Noise.
* Visibility.
* Proximity.
* Smell or biological detection where appropriate.
* Nearby infected entities.
* Hordes.
* Street access.
* Obstacles.
* Military resistance.
* Civilian population.
* Safe-zone entrances.

15.1 Basic zombie types

* Walker.
* Runner.
* Brute.
* Screamer.
* Crawler.
* Mutated variants.

15.2 Advanced mutations

Potential mutations:

* Adrenaline.
* Armored skin.
* Regeneration.
* Berserker.
* Screamer.
* Juggernaut.
* Stalker.
* Spitter.
* Commander.
* Splintering mutation.

Mutations should change actual behavior, not simply increase health.

15.3 Horde behavior

Hordes must:

* Gather around noise.
* Migrate between geographical areas.
* Split into smaller groups.
* React to screamers.
* React to gunfire.
* Attack weak infrastructure.
* Attempt to overwhelm defensive positions.
* Change routes when blocked.

Killing a horde leader or specialized mutation may disrupt group coordination.

15.4 Zombie targeting

Zombie AI should evaluate threats.

Possible priorities:

* Civilians.
* Military personnel.
* Medical facilities.
* Radio towers.
* Broadcast stations.
* Defensive installations.
* Weak perimeter entrances.

The exact priority depends on zombie type and current behavior.

15.5 Boss encounters

Introduce rare major threats.

Examples:

* Juggernaut attacking a gate.
* Runner horde attacking multiple entrances.
* Screamer near a broadcast station.
* Mutated boss targeting a hospital.
* Large coordinated horde attacking a radio tower.

Bosses should have distinctive abilities, behavior, and weaknesses.

Do not implement bosses as ordinary zombies with enormous health pools.

⸻

16. CIVILIAN SIMULATION

Civilians must be autonomous entities.

Each civilian can have:

* Health.
* Fear.
* Infection status.
* Movement speed.
* Awareness.
* Group membership.
* Current objective.
* Personality.
* Inventory or supplies where appropriate.

16.1 Civilian behaviors

Civilians can:

* Avoid zombies.
* Flee from danger.
* Seek safety.
* Gather around military personnel.
* Follow evacuation instructions.
* Become separated from groups.
* Hide.
* Become injured.
* Become infected.
* Refuse evacuation.
* Become trapped inside buildings.
* Request assistance.

16.2 Civilian personalities

Examples:

* Calm.
* Panicked.
* Elderly.
* Injured.
* Group-oriented.
* Supplies carrier.
* Reluctant to leave buildings.

Personalities should affect actual decisions.

16.3 Infection progression

Possible states:

* Healthy.
* Exposed.
* Infected.
* Critical.
* Turned.

Medical technology can improve detection, treatment, and quarantine.

16.4 Civilian awareness

Civilians do not automatically know the locations of safe zones.

They learn about them through:

* Emergency broadcasts.
* Military communication.
* Reconnaissance.
* Nearby survivors.
* Direct military guidance.

When informed, civilians select a reachable safe zone with available capacity.

If one zone is full, they can seek another.

They physically navigate to the safe-zone perimeter and use an appropriate entry point.

16.5 Morale and panic

Morale is influenced by:

* Military presence.
* Nearby deaths.
* Gunfire.
* Zombie sightings.
* Safe-zone security.
* Food and supplies.
* Medical support.
* Broadcast information.

Panic may cause:

* Erratic movement.
* Running.
* Street congestion.
* Refusal to follow instructions.
* Separation from groups.

Military police can help restore order.

16.6 Evacuation methods

Potential evacuation methods:

* Walking to a safe zone.
* Military escort.
* Helicopter extraction.
* Convoy pickup.
* Refugee shelter.
* Hospital evacuation.
* Police station evacuation.
* Military base evacuation.

Each method has capacity, risk, speed, and resource requirements.

16.7 Civilian statistics

Display:

* Total population.
* Rescued.
* Remaining.
* Missing.
* Infected.
* Dead.
* Evacuating.
* Escorted.
* Sheltered.

⸻

17. HOSPITALS, FIELD MEDICS, AND MEDICAL EVACUATION

Medical recovery is a major gameplay system.

The player must be able to recover existing military personnel instead of always recruiting replacements.

17.1 Hospital rules

Hospitals can exist geographically without being claimed.

However, their special medical functionality only operates when they are inside an active safe zone.

Hospitals provide:

* Civilian treatment.
* Military treatment.
* Casualty recovery.
* Medical storage.
* Treatment queues.
* Medical research benefits.
* Medical capacity.

Hospitals must have configurable treatment capacity, treatment time, and supply consumption.

17.2 Casualty states

Troops must have distinct states:

* Healthy.
* Injured.
* Incapacitated.
* Dead.

Reaching zero health initially causes incapacitation rather than immediate death.

An incapacitated soldier:

* Cannot fight.
* Cannot move normally.
* Cannot carry out objectives.
* Has a configurable survival timer.
* Can be stabilized and recovered.

If the survival timer expires, the soldier becomes permanently dead.

17.3 Field medics

Field medics are deployable support units.

Eligible recovery targets:

* Paratroopers.
* Regular military personnel.
* Scavengers.

Medic behavior:

1. Detect incapacitated friendly troops.
2. Evaluate casualty priority.
3. Consider distance and route danger.
4. Travel to the casualty.
5. Stabilize the casualty.
6. Physically transport them toward an operational hospital.
7. Deliver them for treatment.
8. Return to their previous assignment or continue recovering casualties.

Medics must not teleport casualties.

They can:

* Request military escorts.
* Wait for a safer route.
* Abandon an impossible recovery attempt.
* Prioritize soldiers with the highest probability of survival.

17.4 Medical evacuation teams

Introduce dedicated medical evacuation teams and vehicles.

Examples:

* Ambulances.
* Medical transport vehicles.
* Helicopter evacuation teams, where unlocked.

These teams can transport multiple casualties or cover longer distances.

Account for:

* Vehicle capacity.
* Fuel.
* Route safety.
* Treatment urgency.
* Available medical personnel.

17.5 Hospital recovery

When a casualty reaches a hospital:

1. The hospital registers the patient.
2. The patient enters the treatment queue.
3. Medical supplies are consumed.
4. Treatment progresses.
5. The troop returns to full health when treatment is complete.
6. The troop is redeployed to their previous assignment.

Recovered troops retain:

* Experience.
* Veterancy.
* Specialization.
* Equipment.
* Squad association.
* Historical records.

Recovery must not cost recruitment currency.

The existing soldier is being recovered, not newly recruited.

Medical supplies and hospital capacity are still consumed.

If no operational hospital is available, medics should stabilize casualties and wait, request evacuation, or seek another operational hospital.

⸻

18. SCAVENGERS AND RESOURCE RECOVERY

Scavengers are a dedicated military support unit.

Their primary responsibility is retrieving resources from geographical buildings.

They are not designed for frontline combat.

18.1 Scavenger characteristics

* Same default movement speed as military/paratroopers: 2.0x civilian speed.
* Lower combat damage than regular military personnel.
* Lower combat effectiveness.
* Exceptional threat avoidance.
* Strong route planning.
* High situational awareness.
* Specialized looting capabilities.
* Configurable carrying capacity.

Scavengers should prioritize survival.

They should avoid combat whenever possible and defend themselves only when cornered or when no safe alternative exists.

18.2 Lootable buildings

Different building classifications provide different resources.

Building	Possible resources
Banks	Cash and valuables
Supermarkets	Food and general supplies
Convenience stores	Supplies
Pharmacies	Medicine
Hospitals	Medical supplies and equipment
Warehouses	Ammunition and equipment
Hardware stores	Tools and materials
Fuel stations	Fuel
Electronics shops	Components and batteries
Military facilities	Weapons and ammunition
Industrial buildings	Raw materials and machinery
Hotels	Food and general supplies

Loot must be randomized within configurable ranges.

Buildings have finite inventories.

Looting a building reduces its available resources.

Banks may require tools, additional time, and increased risk.

18.3 Resource categories

Primary resources:

* Cash.
* Supplies.
* Medicine.
* Fuel.
* Ammunition.

Optional advanced resource:

* Rare technical components.

Cash is obtained through actual scavenging and other configured economic activities.

Zombie kills do not generate currency.

18.4 Looting behavior

Scavengers:

1. Identify possible loot locations.
2. Inspect available intelligence.
3. Evaluate threat.
4. Calculate route risk.
5. Select a target.
6. Travel to the building.
7. Loot for a configurable duration.
8. Monitor nearby threats.
9. Return to a safe zone.
10. Deposit recovered resources.

Looting time depends on:

* Squad size.
* Building size.
* Building classification.
* Technology.
* Equipment.
* Difficulty.
* Available tools.

Scavengers can retreat with resources already collected.

Only resources successfully returned and deposited enter the shared inventory.

18.5 Threat avoidance

Every road segment should have a dynamic danger score.

Scavenger route planning must consider:

* Zombie distance.
* Zombie density.
* Zombie movement direction.
* Detection radius.
* Road visibility.
* Nearby safe positions.
* Alternative paths.
* Travel time.
* Loot value.
* Squad condition.

The safest route may be longer than the shortest route.

If a road becomes blocked, scavengers should:

* Recalculate.
* Find an alternative.
* Wait in a safe location.
* Periodically reassess the situation.
* Abort if the route becomes unreasonable.

They must never blindly follow stale routes.

18.6 Expedition configuration

Allow the player to configure:

* Operational radius.
* Preferred building types.
* Minimum loot value.
* Maximum threat level.
* Maximum expedition duration.
* Minimum health before retreat.
* Carry-capacity threshold.
* Night operations.
* Military escort.
* Automatic return.
* Multi-building routes.

18.7 Scavenger specializations

Possible technology unlocks:

* Urban scavengers.
* Medical recovery.
* Technical recovery.
* Salvage engineers.
* Deep reconnaissance.

18.8 Intelligence from scavenging

Scavengers can discover:

* Unknown zombie clusters.
* Survivor groups.
* New loot locations.
* Missions.
* Damaged infrastructure.
* Potential military installations.
* Unknown building classifications.

18.9 Scavenger failure

Possible outcomes:

* Successful expedition.
* Partial recovery.
* Retreat.
* Injuries.
* Lost loot.
* Overwhelmed or lost squad.

Good intelligence and technology should reduce risk.

Failure must not be inevitable.

⸻

19. RECONNAISSANCE SQUADS AND RADAR

Reconnaissance teams complement scavengers and military operations.

They can:

* Reveal zombie concentrations.
* Identify blocked roads.
* Track hordes.
* Discover infestations.
* Identify survivor groups.
* Reveal strategic buildings.
* Monitor movement patterns.

Radar installations can:

* Detect large zombie concentrations.
* Track major moving groups.
* Generate threat warnings.
* Identify approaching hordes.

Radar information must be limited by:

* Coverage.
* Accuracy.
* Technology.
* Environmental interference.
* Infrastructure condition.

Do not provide magical global information.

Advanced radar technology can improve threat detection and scavenger route planning.

⸻

20. GARRISONS AND BUILDING SPECIALIZATIONS

Any suitable building can be converted into a garrison.

Building classification does not determine whether it can be used.

Instead, classification provides passive bonuses.

Examples:

Building	Possible passive bonus
Police station	Attack speed
Military facility	Damage
Hospital	Troop recovery
Hotel	Garrison capacity
School	Recruitment capacity
Office	Detection radius
Warehouse	Ammunition storage
Industrial building	Defensive durability
Residential building	Lower conversion cost
Government building	Command range
Fire station	Response speed

These are configurable balance examples.

Garrison capacity should depend on:

* Building footprint.
* Floor area.
* Floor count.
* Building classification.
* Upgrades.

Garrisons outside safe zones remain operational.

However, they have health and can be destroyed by zombies.

Garrisons inside safe zones receive the normal safe-zone structural protection rules.

⸻

21. GATES, BARRICADES, AND DEFENSIVE INSTALLATIONS

The player can deploy defenses throughout active territory.

Potential installations:

* Gates.
* Concrete barricades.
* Sandbags.
* Machine-gun nests.
* Automated turrets.
* Sniper observation posts.
* Searchlights.
* Radar stations.
* Radio towers.
* Medical tents.
* Ammunition depots.
* Supply beacons.
* Minefields.
* Electric fences.
* Watchtowers.
* Mortar positions.
* Helicopter landing pads.
* Decoy beacons.
* Drone stations.
* Generators.

21.1 Gates

Gates can be placed across road segments and safe-zone entrances.

Use a simple white line as the default visual representation.

Modes:

* Open.
* Controlled.
* Sealed.

Access rules:

* Zombies cannot pass through closed gates.
* Friendly military units can pass according to access settings.
* Civilians can pass according to evacuation rules.

Gates have:

* Health.
* Resistance.
* Opening time.
* Upgrade levels.
* Access rules.

Zombies can destroy gates.

The system should suggest useful gate positions where roads intersect the safe-zone perimeter.

21.2 Barricades

Barricades can be deployed on streets and chokepoints.

They have durability and can slow or block zombies.

21.3 Defensive installation behavior

Turrets, snipers, garrisons, and other defensive installations must work outside safe zones.

They do not require safe-zone membership.

⸻

22. POWER AND INFRASTRUCTURE

Introduce an optional power network.

Power-consuming installations can include:

* Electric fences.
* Searchlights.
* Radar.
* Automated defenses.
* Radio infrastructure.
* Broadcast infrastructure.
* Other advanced installations.

Generators provide electricity.

Power systems must support:

* Capacity.
* Consumption.
* Fuel.
* Network connections.
* Damage.
* Outages.
* Upgrades.

Generator failure should disable connected installations according to their configured backup behavior.

Keep the power system modular so that easier game modes can simplify or disable its management.

⸻

23. RESOURCE ECONOMY AND LOGISTICS

Resources should come from actual geographical activities, primarily scavenging.

Do not award currency for killing zombies.

23.1 Recruitment

Recruiting new personnel may require configurable resources.

Recovered soldiers do not require recruitment currency.

23.2 Supply lines

Introduce logistical connections between safe zones.

Garrisons consume ammunition.

Hospitals consume medicine.

Generators consume fuel.

Vehicles consume fuel.

Turrets consume ammunition.

Installations require supplies and maintenance where appropriate.

Scavengers transport recovered resources back to storage facilities.

23.3 Supply infrastructure

Possible installations:

* Supply depots.
* Ammunition storage.
* Fuel storage.
* Medical distribution centers.
* Forward logistics bases.
* Protected convoy routes.

23.4 Convoys

Convoys can transport:

* Ammunition.
* Medicine.
* Fuel.
* Supplies.
* Military personnel.
* Equipment.

They must navigate actual roads.

Routes can become dangerous due to zombie activity.

The player can assign escorts and establish protected logistical corridors.

A disconnected safe zone can continue operating using its local stockpiles, but cannot freely share resources with other zones.

⸻

24. TECHNOLOGY TREE AND RESEARCH

Implement a large branching technology tree.

Do not create a simple linear list of numerical upgrades.

Technology should unlock meaningful gameplay functions, new unit types, infrastructure, and operational capabilities.

24.1 Infantry doctrine

* Training.
* Marksmanship.
* Coordination.
* Armor.
* Veteran development.
* Elite doctrine.

24.2 Heavy weapons

* Machine guns.
* Grenade launchers.
* Anti-materiel weapons.
* Mortars.
* Advanced ammunition.
* Experimental weapons.

24.3 Infrastructure

* Advanced gates.
* Turrets.
* Safe-zone improvements.
* Generators.
* Perimeter defenses.
* Advanced construction.

24.4 Communications

* Emergency broadcasts.
* Extended signals.
* Civilian tracking.
* Radar.
* Satellite intelligence.
* Regional communications.
* Advanced radio networks.

24.5 Medical

* Advanced treatment.
* Infection detection.
* Quarantine.
* Hospital capacity.
* Field medicine.
* Medical evacuation.
* Improved casualty stabilization.

24.6 Logistics

* Production.
* Ammunition efficiency.
* Fuel management.
* Vehicle maintenance.
* Storage capacity.
* Supply optimization.
* Convoy protection.

24.7 Intelligence

* Detection.
* Mutation analysis.
* Horde tracking.
* Threat prediction.
* Reconnaissance.
* Advanced surveillance.

24.8 Aviation

* Helicopter reconnaissance.
* Paratrooper deployment.
* Medical evacuation.
* Transport helicopters.
* Strategic airlift.
* Armed helicopters.

24.9 Scavenger technology

* Lightweight equipment.
* Advanced backpacks.
* Silent movement.
* Threat awareness.
* Route optimization.
* Emergency extraction.
* Lockpicking.
* Advanced reconnaissance.
* Field medicine.
* Night operations.
* Squad coordination.
* Military communications.

Research should have:

* Prerequisites.
* Multiple levels.
* Costs.
* Meaningful trade-offs.
* Specialization choices.

Research points can be earned through operations, rescues, missions, discoveries, and other configured activities.

Avoid awarding research simply for killing large numbers of zombies.

⸻

25. PERKS AND LONG-TERM PROGRESSION

Introduce a perk system with different rarity levels:

* Common.
* Uncommon.
* Rare.
* Epic.
* Legendary.

Perks can improve:

* Military effectiveness.
* Medical operations.
* Scavenging.
* Communications.
* Civilian evacuation.
* Defensive infrastructure.
* Intelligence.
* Logistics.

Some perks should have prerequisites.

Some should synergize with particular technology branches.

Campaigns should develop differently depending on the player’s decisions.

For example:

* Sniper-focused military doctrine.
* Heavy defensive infrastructure.
* Advanced reconnaissance.
* Medical-focused survival.
* Logistics-focused expansion.
* Aggressive military expansion.
* Scavenger-focused resource recovery.

Do not force a single optimal build.

⸻

26. PERSISTENT SOLDIER IDENTITIES AND VETERANCY

Military personnel should feel like persistent individuals, not interchangeable markers.

Track:

* Identity.
* Experience.
* Rank.
* Squad assignment.
* Specialization.
* Equipment.
* Injury history.
* Kill records.
* Survival history.
* Missions completed.
* Veterancy.

Veteran soldiers can become squad leaders.

Squads can gain collective experience.

Loss of experienced personnel should have meaningful consequences.

The medic system should allow the player to recover valuable veterans rather than automatically losing them at zero health.

⸻

27. DYNAMIC OUTBREAK DIRECTOR

Because the game has no stages, introduce a dynamic Outbreak Director.

This background system manages world escalation and difficulty.

It should monitor:

* Time since outbreak activation.
* Active geographical territory.
* Number of safe zones.
* Number of operational radio towers.
* Civilian population.
* Military strength.
* Zombie population.
* Infestation count.
* Player expansion speed.
* Infrastructure.
* Available resources.
* Regional conditions.

It adjusts the world dynamically.

Examples:

Player/world condition	Possible response
Rapid territorial expansion	New distant zombie concentrations become active
Extensive defensive infrastructure	Larger hordes test defenses
Many active radio towers	Increased zombie activity around communication infrastructure
Neglected infestation	Infestation expands
Weak logistics	Supply shortages become more consequential
Large civilian population	Greater demand for food and medical supplies
Remote isolated safe zones	Increased logistical and communications challenges

The director must create opportunities and threats, not simply punish the player for doing well.

Keep the escalation system configurable.

Difficulty should feel organic rather than like an arbitrary global multiplier.

⸻

28. RANDOM EVENTS AND WORLD ATMOSPHERE

Introduce dynamic world events.

Examples:

* Day/night cycles.
* Rain.
* Fog.
* Power outages.
* Bridge collapse.
* Supply convoy arrival.
* Hospital overwhelmed.
* Communication failure.
* Horde migration.
* Mass panic.
* Helicopter extraction.
* Survivor distress calls.
* Reinforcements.
* Vehicle breakdown.
* Road obstruction.
* Major infestation discovery.
* Radio tower attack.
* Environmental hazards.

Events should create actual gameplay opportunities and complications.

Night reduces visibility.

Rain and fog can affect detection and movement.

Events should be geographically relevant.

Do not generate arbitrary notifications that have no effect on gameplay.

⸻

29. SPECIAL BUILDING MISSIONS AND OPTIONAL OBJECTIVES

Some buildings can generate optional missions.

Examples:

Hospital

* Rescue patients.
* Recover medical supplies.
* Rescue medical personnel.

Police station

* Rescue officers.
* Recover equipment.
* Secure weapons and supplies.

School

* Evacuate children.
* Rescue teachers and staff.

Hotel

* Rescue trapped groups.

Airport

* Secure extraction facilities.

Military facility

* Recover equipment.
* Recruit surviving personnel.
* Secure advanced supplies.

Warehouse

* Recover resources.

Fire station

* Recruit surviving responders.

Hospitals must not be mandatory mission objectives.

A hospital can function as a geographical hospital without the player being required to complete a quest there.

Missions can be:

* Timed.
* Optional.
* Persistent until lost.
* Randomly generated.
* Triggered by world events.

Rewards can include:

* Personnel.
* Research.
* Supplies.
* Equipment.
* Intelligence.
* Infrastructure.
* Special bonuses.

⸻

30. OPTIONAL LONG-TERM STRATEGIC OBJECTIVES

Removing stages must not remove all long-term direction.

Introduce optional objectives such as:

* Establish a regional command network.
* Secure a major hospital.
* Establish multiple connected safe zones.
* Rescue a certain number of civilians.
* Eliminate a major infestation.
* Recover military equipment.
* Establish a global supply network.
* Survive a major horde attack.
* Establish a safe zone in another country.

These objectives can be completed at any time.

They are not stages.

The player can ignore them and continue playing indefinitely.

⸻

31. GAME MODES

Provide:

Campaign

Persistent world with grace period, territorial expansion, progression, and continuous outbreak escalation.

Endless Containment

An ongoing survival challenge with increasing pressure.

Challenge Operations

Special configurations and objectives.

Sandbox

Configurable world simulation:

* Starting region.
* Grace period.
* Zombie population.
* Mutation frequency.
* Resource abundance.
* Safe-zone requirements.
* Simulation speed.
* Technology availability.

⸻

32. GAMEPLAY STATISTICS AND REPORTING

Provide detailed campaign statistics.

Track:

* Civilians rescued.
* Civilians lost.
* Civilian infections.
* Military casualties.
* Recovered soldiers.
* Zombies killed.
* Hordes defeated.
* Infestations cleared.
* Safe zones established.
* Safe zones lost.
* Territory activated.
* Territory permanently lost.
* Buildings claimed.
* Scavenging operations.
* Resources recovered.
* Missions completed.
* Veterans.
* Infrastructure destroyed.
* Radio towers lost.

Provide operational reports after major events.

Include map replays and heatmaps showing:

* Military routes.
* Civilian evacuation routes.
* Zombie movement.
* Combat locations.
* Dangerous roads.
* Lost territory.
* Infestation activity.

⸻

33. VISUAL DESIGN AND GAME INTERFACE

33.1 Overall art direction

Use a dark tactical command-center aesthetic.

Visual direction:

* Charcoal and near-black backgrounds.
* Muted military green.
* Emergency red.
* Civilian blue.
* Amber warnings.
* Crisp technical typography.
* Subtle grid patterns.
* Clear tactical overlays.

Avoid excessive visual effects.

The map must remain the primary focus.

33.2 Map representation

Use simple geometric representations.

Recommended visual language:

Entity	Visual
Civilians	Blue dots
Military	Green dots
Zombies	Red dots
Elite zombies	Dark red markers
Safe zones	Translucent green polygons
Garrison buildings	Green outline
Ordinary buildings	Grey polygons
Radio towers	Distinct communications marker
Broadcast stations	Yellow building/marker
Hospitals	Medical cross
Headquarters	Green command marker
Gates	White lines
Barricades	Brown lines
Minefields	Orange areas
Missions	Yellow markers
Infestations	Red/orange building indicators

Do not rely on text labels for every entity.

Use zoom-level-dependent rendering.

33.3 Desktop interface

Target map occupancy: approximately 70–80% of the screen.

Suggested layout:

Top HUD

* Current date/time.
* Simulation speed.
* Population.
* Rescued civilians.
* Resources.
* Threat level.
* Active safe zone.

Left panel

* Military roster.
* Deployment.
* Unit selection.
* Orders.
* Doctrine.

Right panel

* Intelligence.
* Civilian statistics.
* Zombie statistics.
* Events.
* Selected entity information.

Bottom panel

* Construction.
* Technology.
* Deployables.
* Safe-zone tools.
* Tactical controls.
* Pause and speed controls.

Panels must be collapsible.

33.4 Mobile interface

Mobile must be a first-class design target.

Use:

* Full-screen geographical map.
* Compact top status bar.
* Collapsible information panels.
* Bottom navigation.
* Touch-friendly controls.
* Long-press/context actions.
* Mobile-friendly building selection.
* Polygon editing.
* Zoom and pan.
* Clear tactical overlays.

Avoid placing desktop-sized panels over the map.

Allow players to manage the campaign without needing a desktop interface.

⸻

34. TECHNICAL ARCHITECTURE

The architecture must separate rendering, simulation, geographical data, networking, and persistence.

Recommended initial stack:

Frontend

* React.
* TypeScript.
* Vite.
* Tailwind CSS.

Mapping

* MapLibre GL JS.
* OSM-compatible geographical data.
* Vector tiles.

Simulation

* TypeScript simulation engine.
* Fixed simulation timestep.
* Web Workers where appropriate.
* Spatial partitioning.
* A* pathfinding.
* Hierarchical pathfinding.
* Cached routes.
* Deterministic simulation where practical.

Rendering

* Canvas or WebGL for entities.
* Efficient geographical layers.
* Batched rendering.
* Instanced drawing where appropriate.
* Zoom-level LOD.

State management

* Zustand or an equivalent lightweight state solution.

Persistence

* IndexedDB for browser-side cache and client preferences.
* Server-side local persistence for the authoritative campaign.
* Versioned save format.
* Automatic backups.

Networking

* WebSockets for real-time synchronization.
* HTTP API for campaign initialization, saves, settings, and static resources.

Avoid introducing a database server unless genuinely necessary.

SQLite is an appropriate initial persistent database if relational storage is needed.

The application must work without an external account system or cloud backend.

⸻

35. SELF-HOSTING AND REMOTE MOBILE ACCESS THROUGH TAILSCALE

This is a mandatory project requirement.

The player must be able to run the game on their Linux Mint laptop and connect to the same running campaign from their iPhone or another device.

The laptop is the host.

The phone is a remote browser client.

The game simulation runs authoritatively on the laptop.

The phone must not need to run the full simulation independently.

35.1 Hosting model

The architecture must support:

Linux Mint laptop

* Runs the web application.
* Runs the authoritative simulation.
* Stores campaign saves.
* Manages world state.
* Handles AI and pathfinding.
* Broadcasts updates to connected clients.

Remote phone

* Opens the game’s browser URL.
* Connects to the laptop through Tailscale.
* Receives real-time game state.
* Sends player input and commands.
* Renders the map and interface locally.

Both devices must see the same campaign state.

The laptop remains authoritative.

Do not create separate independent campaigns for the desktop and phone.

35.2 Simple network configuration

The player already uses Tailscale.

The intended workflow must be extremely simple:

1. Start the game server on the laptop.
2. Find the laptop’s Tailscale IP address.
3. Open the mobile browser.
4. Enter the Tailscale IP and application port.
5. Play.

Example address:

http://100.x.x.x:PORT

Use the actual Tailscale IP at runtime.

Do not hardcode an IP address.

The application must bind to 0.0.0.0 or an appropriately configurable network interface so remote devices can connect.

Do not bind only to 127.0.0.1.

Do not require:

* Public IP addresses.
* Router port forwarding.
* Reverse proxies.
* Cloud hosting.
* Domain registration.
* Complex network configuration.
* Manual DNS setup.
* External tunneling services.

Tailscale already provides the private network connection.

Do not add unnecessary networking infrastructure.

35.3 Development and production hosting

Support two configurations.

Development

Use the development server with network access enabled.

Configure the development server and hot-module-reload WebSocket correctly for access through the Tailscale IP.

Do not assume that the default localhost-only development configuration is remotely accessible.

Local production

Provide a simple build and start command.

The production server must serve the application and authoritative simulation through one clearly documented local port where practical.

The user should not need to run multiple complicated commands or manually configure separate services.

If separate processes are technically necessary, provide one launcher command that starts and manages them.

35.4 Remote synchronization

Use WebSockets for:

* Game state updates.
* Player commands.
* Selected entity information.
* Simulation status.
* Events.
* Notifications.
* Tactical operations.

The server must validate all incoming commands.

Do not trust the mobile client to modify authoritative game state directly.

Support:

* Reconnection.
* Connection loss.
* State resynchronization.
* Multiple browser clients.
* Duplicate command protection.
* Clear connection status.

If the phone disconnects, the simulation should continue according to the configured pause/background policy.

On reconnection, the phone should recover the latest authoritative campaign state.

35.5 Security

The default deployment is intended for the player’s private Tailscale network.

Still:

* Validate commands.
* Avoid exposing arbitrary filesystem operations.
* Do not allow clients to modify save files directly.
* Use an optional access token or pairing mechanism.
* Provide a clear way to disable remote access.
* Never expose development-only controls unintentionally in production.
* Avoid binding unnecessary administrative services to all interfaces.

Do not require a complicated authentication platform for a private single-player deployment.

35.6 Connection quality

The application must tolerate ordinary home-network latency.

Use:

* Interpolation.
* Snapshot synchronization.
* Efficient state deltas.
* Reasonable update rates.
* Command acknowledgement.
* Reconnection handling.

Do not transmit every entity’s full state every frame.

The client should render smooth movement from compact authoritative updates.

⸻

36. PERFORMANCE AND HARDWARE OPTIMIZATION

This is a critical requirement, not a final polish task.

The game must be designed for modest hardware.

The initial target environment is a Linux Mint laptop with:

* Intel Core i5-4300U.
* Two physical cores and four threads.
* Approximately 8 GB RAM.
* Intel HD 4400 integrated graphics.
* Linux Mint Cinnamon.
* Firefox as the preferred browser.

The player also needs to connect from an iPhone through Tailscale.

Do not assume a discrete GPU or large amounts of RAM.

36.1 Performance philosophy

Prioritize:

1. Simulation correctness.
2. Stable frame rate.
3. Low memory consumption.
4. Efficient geographical rendering.
5. Responsive controls.
6. Adaptive quality.

Avoid unnecessary CPU-intensive effects.

Avoid rendering thousands of individual DOM nodes.

Use Canvas/WebGL for agents.

36.2 Simulation optimization

Implement:

* Fixed simulation timestep.
* Separate rendering and simulation loops.
* Spatial grids or quadtrees.
* Entity activation regions.
* Simulation LOD.
* Pathfinding caching.
* Hierarchical pathfinding.
* Incremental path recalculation.
* Batched AI updates.
* Distance-based update frequency.
* Event-driven systems where appropriate.
* Efficient entity storage.
* Object pooling where beneficial.

Do not recalculate every entity’s full path every frame.

Do not run every AI decision at the same frequency.

Distant entities should use simplified simulation.

36.3 Rendering optimization

Use:

* Batched drawing.
* WebGL or efficient Canvas rendering.
* Instanced geometry where suitable.
* Level of detail.
* Viewport culling.
* Efficient polygon rendering.
* Cached static building geometry.
* Reduced animation complexity at low quality.
* Adaptive entity density.

Buildings should not be individually redrawn unnecessarily.

Avoid excessive shadows, lighting, particles, and post-processing.

36.4 Memory optimization

The game must remain stable with limited memory.

Use:

* Efficient data structures.
* Bounded caches.
* Lazy loading.
* Geographical data caching.
* Entity pooling.
* Save compression where beneficial.
* Cleanup of obsolete resources.
* Controlled asset loading.

Do not load detailed geographical datasets for the entire world into memory at startup.

Load geographical data progressively as required.

36.5 Adaptive quality settings

Provide:

* Low.
* Medium.
* High.
* Custom.

Automatically reduce expensive rendering effects when performance drops.

Allow separate settings for:

* Entity rendering density.
* Building detail.
* Map detail.
* Shadows.
* Effects.
* Animation.
* Update frequency.
* Simulation detail.

The simulation must remain logically correct when visual quality is reduced.

36.6 Simulation controls

Provide:

* Pause.
* 1x.
* 2x.
* 3x.
* Optional 4x.

Simulation speed must not depend on rendering framerate.

When the browser tab is hidden or the phone screen is locked, use a deliberate server-side background simulation policy.

Do not rely on mobile browser timers to keep the authoritative simulation running.

36.7 Performance targets

Establish measurable performance benchmarks.

Initial targets on the reference laptop:

* Stable desktop gameplay at 30 FPS under normal operating conditions.
* Prefer 60 FPS when the active scene is lightweight.
* Responsive mobile interface under ordinary home-network conditions.
* No uncontrolled memory growth.
* No full-world entity simulation.
* No UI freezing during routine pathfinding.
* Graceful quality reduction when the CPU or GPU becomes overloaded.

Stress-test hundreds and eventually thousands of entities using different simulation LOD levels.

Do not promise a fixed entity count without benchmarking.

Profile actual CPU, memory, rendering, and network behavior.

⸻

37. SAVE SYSTEM AND CAMPAIGN PERSISTENCE

The save system is essential.

Save:

* Campaign configuration.
* Current simulation time.
* Grace period status.
* Outbreak escalation state.
* Geographical activation state.
* Safe-zone polygons.
* Safe-zone identities.
* Command centers.
* Radio towers.
* Communications network.
* Claimed buildings.
* Garrison assignments.
* Military identities.
* Veterancy.
* Injuries.
* Incapacitated troops.
* Medic assignments.
* Hospital queues.
* Civilians.
* Zombie populations.
* Infestations.
* Looted buildings.
* Resources.
* Scavenging operations.
* Research.
* Technology.
* Perks.
* Events.
* Weather.
* Lost territory.
* Intelligence archives.
* Forward deployments.
* Supply routes.

Use a versioned save format.

Provide:

* Manual save.
* Automatic save.
* Backup saves.
* Save recovery.
* Corruption detection.
* Migration between save versions.

The campaign must survive application restarts and laptop reboots.

The game should not depend on an active internet connection for already downloaded geographical data and saved campaign simulation.

⸻

38. DEVELOPMENT PHASES

Do not attempt to implement the entire game simultaneously.

Build it incrementally, but maintain the architecture required for the complete vision.

Every phase must produce a playable, testable result.

Phase 1 — Foundation and geographical rendering

Implement:

* React and TypeScript application.
* MapLibre integration.
* Real geographical map.
* Building footprints.
* Building classifications.
* 2.5D building rendering.
* Road graph.
* Map interaction.
* Initial 2 × 2 km region.
* Basic fog of war.

Deliverable: A playable geographical map with building and road data.

Phase 2 — Simulation engine

Implement:

* Fixed timestep.
* Entity management.
* Civilians.
* Zombies.
* Military units.
* Movement.
* Pathfinding.
* Basic combat.
* Basic infection.
* Simulation activation regions.
* Simulation LOD.

Deliverable: Autonomous entities moving and interacting on the actual map.

Phase 3 — Safe zones and military infrastructure

Implement:

* Custom safe-zone polygon editor.
* Multiple independent safe zones.
* Building claims.
* Garrisons.
* Gates.
* Barricades.
* Turrets.
* Snipers.
* Military commands.
* Safe-zone protection.
* Radio towers.
* Permanent territory activation.
* Tower destruction and territorial loss.

Deliverable: A working territorial control and defense simulation.

Phase 4 — Civilian and medical systems

Implement:

* Civilian evacuation.
* Broadcast stations.
* Civilian awareness.
* Panic and morale.
* Hospitals.
* Field medics.
* Incapacitated state.
* Casualty recovery.
* Hospital treatment queues.
* Medical supplies.
* Medical evacuation teams.

Deliverable: A working rescue and medical recovery simulation.

Phase 5 — Economy and scavenging

Implement:

* Resource system.
* Building loot tables.
* Scavenger AI.
* Threat-aware routing.
* Recon squads.
* Radar.
* Resource storage.
* Supply depots.
* Logistics.
* Convoys.

Deliverable: A functioning resource economy based on geographical exploration and recovery.

Phase 6 — Advanced combat and progression

Implement:

* Zombie mutations.
* Horde behavior.
* Boss encounters.
* Rooftop deployment.
* Elevation calculations.
* Technology tree.
* Perks.
* Soldier veterancy.
* Outbreak Director.
* Dynamic events.

Deliverable: A deep and replayable continuous campaign.

Phase 7 — Global expansion

Implement:

* Global geographical map.
* Reconnaissance helicopters.
* Temporary reconnaissance windows.
* Persistent intelligence archive.
* Forward deployment.
* Independent remote safe zones.
* Regional command.
* Global communications.
* Strategic airlift.

Deliverable: A campaign that can expand across cities and countries.

Phase 8 — Interface and mobile experience

Implement:

* Desktop command interface.
* Mobile command interface.
* Touch controls.
* Polygon editing on mobile.
* Mobile unit selection.
* Responsive panels.
* Browser connection state.
* Real-time synchronization.

Deliverable: A fully usable desktop and mobile experience.

Phase 9 — Self-hosting and optimization

Implement:

* Local production server.
* Tailscale accessibility.
* WebSocket synchronization.
* Automatic saves.
* Reconnection.
* Adaptive quality.
* Performance profiling.
* Memory optimization.
* Stress testing.
* Browser compatibility.

Deliverable: A stable game running on the laptop and remotely accessible from the phone.

⸻

39. DEVELOPMENT AND IMPLEMENTATION RULES FOR THE CODING AGENT

The agent must follow these rules throughout development.

Architecture

* Use modular, maintainable code.
* Separate gameplay systems.
* Keep rendering independent of simulation.
* Keep geographical providers replaceable.
* Avoid giant monolithic components.
* Use clear TypeScript types.
* Centralize gameplay configuration.
* Avoid unnecessary abstractions that do not solve real problems.

Gameplay configuration

Create centralized configuration files for:

* Movement.
* Health.
* Damage.
* Detection.
* Loot.
* Resources.
* Recruitment.
* Research costs.
* Building bonuses.
* Construction.
* Radio coverage.
* Safe-zone maintenance.
* Outbreak escalation.
* Zombie spawning.
* Infection.
* Medical treatment.
* Scavenger behavior.
* Simulation LOD.

Do not scatter balancing constants throughout the codebase.

Implementation integrity

* Do not use placeholder buttons that do nothing.
* Do not fake simulation results.
* Do not simulate global territory using arbitrary screen coordinates.
* Do not teleport units where physical movement is required.
* Do not make all zombies behave identically.
* Do not make every building a generic rectangle if actual footprint data is available.
* Do not make the entire world active at once.
* Do not assume every building has complete geographical metadata.
* Do not require every safe zone to be connected.
* Do not introduce stages.
* Do not award currency for zombie kills.
* Do not charge recruitment currency to recover an existing soldier.
* Do not make hospitals, broadcast stations, or radio towers operational outside safe zones.
* Do not incorrectly apply those three restrictions to ordinary garrisons, turrets, snipers, or military units.

Testing

Every major system must have actual gameplay tests.

Test:

* AI behavior.
* Pathfinding.
* Building classification.
* Safe-zone polygon geometry.
* Overlapping coverage.
* Radio tower destruction.
* Territory activation.
* Territory loss.
* Medical recovery.
* Scavenger routing.
* Resource accounting.
* Save/load.
* Remote synchronization.
* Mobile input.
* Performance.

Create test scenarios that can be reproduced.

When a feature is implemented, verify its actual behavior rather than relying on a successful build.

Documentation

Maintain:

* README.
* Installation instructions.
* Development instructions.
* Local hosting instructions.
* Tailscale connection instructions.
* Architecture documentation.
* Configuration documentation.
* Gameplay system documentation.
* Known limitations.
* Performance benchmarks.

Provide one simple command to start the local game wherever technically possible.

⸻

40. ACCEPTANCE CRITERIA — COMPLETE GAME

The game is not considered complete merely because the interface looks finished.

The following must work.

Geography

* Real-world map data.
* Building footprints.
* Building classifications.
* Road graph.
* Geographical pathfinding.
* Building heights and rooftop calculations.

World simulation

* Initial unlocked region.
* Grace period.
* Continuous campaign.
* Fog of war.
* Inactive territory.
* Simulation activation.
* Simulation LOD.

Territory

* Custom safe-zone polygons.
* Mobile polygon editing.
* Multiple independent safe zones.
* Safe-zone maintenance.
* Building inclusion.
* Radio tower expansion.
* Radio tower destruction.
* Permanent territorial loss.
* Overlapping coverage.

Reconnaissance

* Helicopter deployment.
* Global destination selection.
* Travel simulation.
* Temporary visibility.
* Five-minute default window.
* Persistent intelligence archive.
* Remote forward deployment.

Military

* Multiple troop types.
* Autonomous AI.
* Squad doctrine.
* Paratrooper behavior.
* Snipers.
* Rooftop deployment.
* Soldier identities.
* Veterancy.

Medical

* Incapacitated state.
* Field medic deployment.
* Casualty detection.
* Physical casualty transport.
* Hospital treatment.
* Automatic troop recovery.
* Medical supply consumption.
* Medical evacuation teams.

Civilian systems

* Autonomous movement.
* Panic.
* Infection.
* Broadcast awareness.
* Evacuation.
* Safe-zone entry.
* Civilian statistics.

Economy

* Scavenger deployment.
* Building loot.
* Threat-aware routing.
* Resource return.
* Resource storage.
* Supply lines.
* Convoys.
* No zombie-kill currency rewards.

Zombies

* Multiple zombie types.
* Mutations.
* Horde behavior.
* Infestations.
* Boss encounters.
* Dynamic outbreak escalation.

Infrastructure

* Garrisons.
* Gates.
* Barricades.
* Turrets.
* Hospitals.
* Broadcast stations.
* Radio towers.
* Power systems.
* Defensive installations.

Progression

* Technology tree.
* Perks.
* Research.
* Specializations.
* Strategic objectives.
* Campaign statistics.

Hosting

* Linux Mint support.
* Local production hosting.
* Tailscale access.
* Remote browser client.
* Real-time synchronization.
* Reconnection.
* Persistent campaign saves.

Performance

* Stable simulation.
* Efficient rendering.
* Low memory consumption.
* Adaptive quality.
* Mobile usability.
* Stress testing.

⸻

41. FINAL DEVELOPMENT PRIORITIES

When implementation decisions compete, prioritize in this order:

1. Correct and persistent simulation architecture.
2. Real geographical data and movement.
3. Safe-zone and territorial systems.
4. Autonomous civilian, zombie, and military AI.
5. Medical recovery and scavenging.
6. Resource and logistical systems.
7. Global reconnaissance and expansion.
8. Progression and replayability.
9. Desktop and mobile usability.
10. Visual refinement and additional effects.

Do not attempt to create every advanced feature before the foundational simulation works.

Build the game as a sequence of working, integrated systems.

At every milestone, the application must remain runnable.

Do not replace working gameplay systems with mock interfaces during later development.

FINAL VISION

DEADZONE should feel like a persistent military survival simulation operating on a real geographical world.

The player begins with a small operational region, establishes their first safe zone, and gradually expands their influence.

They rescue civilians, deploy military units, recover wounded soldiers, scavenge abandoned buildings, establish hospitals, build defensive infrastructure, and investigate infestations.

They can draw realistic safe-zone boundaries around actual geographical locations, establish multiple independent settlements, and develop regional command networks.

They can use radio towers to permanently activate territory, or reconnaissance helicopters to temporarily inspect distant cities and countries before committing resources to expansion.

Their decisions have lasting consequences.

A lost radio tower can mean losing an entire region and everything built there. A rescued veteran can return to their squad. A neglected infestation can become a major threat. A disconnected safe zone can continue surviving independently. A successful scavenging operation can provide the ammunition and medicine needed to survive another attack.

There are no artificial stages and no predetermined geographical endpoint.

The world is the campaign.

The player’s objective is to preserve, expand, and defend humanity for as long as possible.

Build a complete simulation, not just a game interface.