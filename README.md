# SATURDAY LEGENDS — College Gridiron

A source-included, stylized 3D browser football prototype. Version 0.1.0.
This is an original game, not an EA Sports product, not College Football 27,
and not a licensed college football simulation. Team names, conferences, and
star ratings reproduce the request rather than an official ranking.

## Run locally

Install Node.js 20 or newer. From the extracted project folder:

    npm install
    npm test
    npm start

Open http://localhost:3000 in a WebGL-capable browser. Do not double-click
index.html: the app uses a server, ES modules, local dependencies and sockets.
No API keys, paid assets, database, or external music downloads are required.
An optional Google Fonts stylesheet falls back to system fonts.

## Deploy through GitHub to Render

1. Extract this ZIP. Create a GitHub repository and upload the CONTENTS of
   the college-gridiron folder (package.json must be at the repository root).
2. In Render choose New > Web Service and connect that repository.
3. Runtime: Node. Build command: npm install. Start command: npm start.
4. Deploy and open the assigned HTTPS address. The supplied render.yaml is
   also usable as a Render Blueprint. PORT is read from the environment.
5. For online play both users visit the same deployment. One selects Online,
   chooses a team and creates a room. The other enters the six-character code.

Render official deployment reference:
https://render.com/docs/deploy-node-express-app

Use a WEB SERVICE, not a Static Site or GitHub Pages, for multiplayer. GitHub
stores the code; Render runs the Node process. Keep one server instance:
rooms are in memory, not shared across multiple instances. A restart clears
rooms. Deployment and hosted two-device tests were NOT performed here.

## What's implemented

- All 68 requested programs, five conference categories, exact requested stars.
- Animated low-poly 22-player football, procedural turf, field markings,
  uniforms, crowd instancing, goalposts, shadows, stadium lights, follow camera.
- Home screen; sound, brightness, difficulty and stadium-lighting settings.
- Three original procedural lobby music tracks, snap/whistle/scoring tones.
- Road to Glory: name, skin, hair, 65–82 inch height, QB/RB/WR/linebacker,
  three recruit tiers and restricted scholarship offers; saved progression.
- Coach Legacy: initial programs limited to <=3 stars, play selection,
  controllable athletes, upgrades, and between-season 4/5-star coaching offers
  after >=8 career games with >=65% wins.
- Private-room online head-to-head: server-run simulation at 30Hz,
  separate team selection, two human controls, validated command ownership.
- Exhibition against AI; running, four pass targets, defense, switching,
  downs, first downs, possession, tackles, out of bounds, touchdowns, safeties,
  automatic PATs, field goals, punts, quarters and game/play clocks.
- Delay of game, random false starts and random offensive holding penalties.
- Freshman / Varsity / Heisman adjust defensive pursuit speed.
- 14 regular-season weeks: 12 unique opponents, two league-wide bye weeks.
- Top 25 and conference records; conference championship games, 12-team playoff,
  first-round byes, quarterfinals, semifinals and national championship.
- Original named bowl matchups pair non-playoff teams with >=6 wins. If the
  eligible count is odd the last team has no pairing. Postseason is custom,
  not an exact reproduction of NCAA scheduling, bowl tie-ins or CFP rules.
- Tokens: wins 60, losses 25, first season win quest 75, season completion 100.
  Athlete/facility upgrades increase team strength in live and simulated games.
- Career and settings autosave in localStorage, scoped to browser and origin.

## Controls

W / Up: run upfield. S / Down: backpedal.
A / Left and D / Right: move laterally. Shift: sprint.
Space: snap. 1–4: throw to receiver 1–4. E: nearest defender.
Escape: pause/resume OFFLINE. Online cannot be paused.
Click play buttons before snap; offense selects run/pass, defense zone/blitz.
Punt/field goal buttons are available to the offense before snap.
On touch displays: directional controls and a snap/receiver-1-pass button.
Desktop keyboard is recommended; touch support is basic, not feature-complete.

## Important prototype boundaries

Graphics are original procedural low-poly art, not photorealistic athletes.
There is ONE stadium mesh with night/day/sunset atmosphere presets, not three
unique modeled stadiums. Team colors are illustrative; there are no official
logos, uniforms, player rosters, stadium reproductions or licensed songs.
Appearance is visible on the first controlled athlete under a helmet; hair
styles are simple geometry and curly/short are not individually detailed.
Road to Glory is a career progression layer over team gameplay, not strict
single-player position lock or a cinematic recruiting/academic simulator.
QB/RB/WR/linebacker set initial selection, but ballcarrier control takes over.
The rules are deliberately simplified: no kickoffs/returns, interceptions,
fumbles, full blocking physics, instant replay, injuries, substitutions,
complete penalty catalogue or authentic college overtime. PATs are automatic.
A tied fourth quarter adds 60-second periods until a period ends with a lead.
Every offense attacks the same world-space direction after possession resets.
Schedules use round-robin pairings, not conference-balanced real schedules;
all programs have the same bye weeks. Rankings are a simple record/star/point
formula; champions are prioritized in custom playoff seeding.
No accounts, public matchmaking, chat, cloud saves, reconnect, lag compensation,
advanced anti-cheat or production-scale infrastructure. Do not treat this as
production-ready or a finished commercial sports game. Private play only.
Simulation rewards also apply to simulated career games. Saves can be edited
locally and must not be used as a competitive server economy.

## Tests and project layout

    server.js             Express + Socket.IO host / private room lifecycle
    public/sim.js         shared live football rules and movement
    public/career.js      schedule, standings, careers and postseason
    public/view.js        procedural Three.js stadium and animated athletes
    public/app.js         menus, controls, saves and game integration
    public/audio.js       original procedural soundtrack and sound effects
    public/teams.json     requested team database
    tests/game.test.js    20 automated Node rule/season tests
    TEST_REPORT.md        executed checks and untested areas
    render.yaml           Render service configuration

Run npm test after changes. See TEST_REPORT.md for manual acceptance checklist.

## Rights

Original project code/procedural artwork may be used and modified under the
included MIT license. This grant covers only original project material, not
third-party trademarks or dependency assets. No affiliation or endorsement is
claimed. Review the rights for any branding/assets you add before publishing.
