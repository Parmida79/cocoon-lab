# Validation record — 2026-09-10

- Nine numerical/model tests passed using Node.js 24.5.0.
- Application and scene JavaScript syntax checks passed.
- All relative JavaScript module imports resolve; no empty project files.
- Browser rendering and interaction were not verified: this execution environment prohibited local server sockets, and Chromium exited with a socket permission error. This is an environment limitation, not a passing browser check.
- GitHub Actions/Pages deployment has not been run. The project is prepared for upload; no repository was published.
- No hardware, human, biomechanical or laboratory validation has been performed.

Before presenting the scene publicly, run the local server from the README and check both scenarios, orbit/zoom, playback/scrubbing, faults, mobile layout and experiment download in a WebGL2-capable browser. Match the reference 75 kg / 2 m readout to 1471.5 J incident energy and 504 J assumed cushion capacity.

## Rendering compatibility fix

Five additional regression tests passed for unavailable GPU contexts, shader failure, context loss, CPU projection drawing and forced compatibility mode. Nine existing physics/model tests still pass. Tests use stub Canvas drawing calls; actual browser pixels and interaction remain unverified in this environment. The renderer now falls back to CPU triangle projection with simplified opaque shading, and the original failure reason appears in the renderer-status tooltip. GPU shadows and antialiasing are disabled to reduce driver demands.
