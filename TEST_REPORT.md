# Test report — Saturday Legends 0.1.0

## Actually executed in the build environment

- Node syntax checks: server.js and all five application modules plus sim.js/career.js: PASS.
- node --test: 20 tests, 20 passed, 0 failed.
- Coverage: 68 team entries, requested rating samples, 22 players, season
  length, unique opponents, weekly exclusivity, touchdown/PAT, first down,
  turnover, incompletion, delay of game, false start, holding, safety,
  possession command gate, punt, quarter transition, finite simulation,
  balanced season records, postseason champion, bowl eligibility, token quest.
- ZIP contents verified after generation.

## Not executed; no claim of passing

Dependency installation, running the Express server, browser/WebGL rendering,
audio playback, touchscreen behavior, real network multiplayer, GitHub upload,
Render deployment, performance/compatibility and security/load testing.
Tests exercise core simulation and season logic, not full production quality.

## Manual acceptance checklist before public launch

1. npm install; npm test; npm start; check /health returns {"ok":true}.
2. Open Chrome/Firefox and verify no console errors, shadows and 22 athletes.
3. Click once to enable audio; change volume/brightness and reload settings.
4. Check recruit tier offers, appearance inputs and saved career resume.
5. Play run/pass plays, score, force fourth down, and wait for playclock flag.
6. Verify all three difficulties and all three lighting presets visually.
7. Complete or simulate 14 weeks; check conference title games, bowls, playoff.
8. Earn/spend tokens; verify promotions only between seasons after threshold.
9. Open two independent browsers, create/join room, play both sides, disconnect.
10. Repeat multiplayer across two devices on deployed HTTPS Render address.
11. Profile low-end hardware; tune pixel ratio, crowd count and shadow size.
12. Test narrow screens; touch passing currently targets only receiver 1.

## Raw automated test output

```text
TAP version 13
# Subtest: 68 colleges, original user star distribution
ok 1 - 68 colleges, original user star distribution
  ---
  duration_ms: 1.232573
  ...
# Subtest: 22 athletes on field
ok 2 - 22 athletes on field
  ---
  duration_ms: 0.452236
  ...
# Subtest: 12 games per school and two byes in 14 weeks
ok 3 - 12 games per school and two byes in 14 weeks
  ---
  duration_ms: 1.541705
  ...
# Subtest: no school appears twice in a week
ok 4 - no school appears twice in a week
  ---
  duration_ms: 1.374747
  ...
# Subtest: touchdown and automatic extra point
ok 5 - touchdown and automatic extra point
  ---
  duration_ms: 0.411516
  ...
# Subtest: first down updates line to gain
ok 6 - first down updates line to gain
  ---
  duration_ms: 0.156974
  ...
# Subtest: fourth down turnover reverses field
ok 7 - fourth down turnover reverses field
  ---
  duration_ms: 0.165088
  ...
# Subtest: incomplete pass returns to original spot
ok 8 - incomplete pass returns to original spot
  ---
  duration_ms: 0.136157
  ...
# Subtest: delay of game subtracts five yards
ok 9 - delay of game subtracts five yards
  ---
  duration_ms: 0.59425
  ...
# Subtest: false start is replay down
ok 10 - false start is replay down
  ---
  duration_ms: 0.273931
  ...
# Subtest: holding enforced
ok 11 - holding enforced
  ---
  duration_ms: 0.176509
  ...
# Subtest: safety awards defense two
ok 12 - safety awards defense two
  ---
  duration_ms: 0.206074
  ...
# Subtest: offensive commands require possession
ok 13 - offensive commands require possession
  ---
  duration_ms: 0.195461
  ...
# Subtest: punt changes possession
ok 14 - punt changes possession
  ---
  duration_ms: 0.227601
  ...
# Subtest: clock advances quarter after dead ball
ok 15 - clock advances quarter after dead ball
  ---
  duration_ms: 0.139734
  ...
# Subtest: AI and movement stay finite
ok 16 - AI and movement stay finite
  ---
  duration_ms: 1.589503
  ...
# Subtest: full regular season gives balanced league wins/losses
ok 17 - full regular season gives balanced league wins/losses
  ---
  duration_ms: 1.231762
  ...
# Subtest: postseason crowns champion and next year resets
ok 18 - postseason crowns champion and next year resets
  ---
  duration_ms: 1.129321
  ...
# Subtest: playoffs and bowls exclude losing teams
ok 19 - playoffs and bowls exclude losing teams
  ---
  duration_ms: 0.715263
  ...
# Subtest: played result earns tokens, one-time quest, and record
ok 20 - played result earns tokens, one-time quest, and record
  ---
  duration_ms: 0.436267
  ...
1..20
# tests 20
# suites 0
# pass 20
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 94.704552

```
