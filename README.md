# Cocoon Lab

An interactive 3D research demonstrator for modular, outward-deploying protective clothing. It includes a test dummy, building drop scene, pedestrian/car scene, visible airbags, fault injection, parameter sweeps by hand, timing charts and experiment export.

**This is a first-order engineering screening tool, not a validated crash simulator or protective product.** It does not calculate injury probability, HIC, neck loads or survival. The articulated-looking dummy has a prescribed contact pose, not solved joint dynamics. No physical device is controlled.

## Run locally

Requires Python 3 to serve files. No package installation or build step is needed.

```sh
cd cocoon-lab
python3 -m http.server 8000
```

Open http://localhost:8000 in a modern browser. WebGL 2 is preferred; automatic CPU-rendered compatibility mode handles unavailable contexts, shader failures and context loss. Compatibility mode retains orbit, zoom and animation with simplified opaque shading. Use the “Compatibility view” button or add `?renderer=software` to the URL to force it. Do not open index.html directly with file://; browser module loading requires HTTP. All rendering dependencies are included locally; there is no runtime CDN, account, API key or tracking.

## Use

1. Choose Building fall or Pedestrian.
2. Set the dummy, contact posture, timing, pressure, stroke and assumed contact area.
3. Run, pause, scrub the timeline, orbit or zoom. Slow motion is the default.
4. Inject a torso puncture, IMU disagreement or controller power loss.
5. Export a JSON experiment containing assumptions, calculated results and CSV telemetry as a string.
6. Read Engineering notes for component candidates and the next evidence gates.

The readout describes the whole configured experiment, while chamber telemetry and the scene follow the playhead. A negative timing margin means the selected chamber cannot fully inflate by modeled ground contact. Positive timing alone does not establish protection.

## Deploy on GitHub Pages

1. Create a repository and put **the contents of this folder** at its root. Include the hidden `.github` directory. GitHub's browser upload may omit hidden files; Git is preferable.
2. Push to a branch called `main` (or change the workflow branch).
3. In Settings → Pages → Build and deployment, choose **GitHub Actions**.
4. Run “Test and deploy to GitHub Pages” from Actions, or push to main.
5. The workflow's deployment step reports the site URL. Relative paths support both repository and root Pages sites.

The workflow runs tests before publishing, and pull requests only test/package. No repository has been created or published on your behalf. No private conversation or user identity is included in this project.

## Tests

With Node.js 20 or newer:

```sh
npm test
# Equivalent without npm:
node --test tests/model.test.js
```

Tests check analytical free-fall results, timing, energy accounting, fault isolation, pedestrian trigger timing, invalid inputs and export columns. They validate implementation consistency, not biological realism.

## Project layout

- `src/model.js`: deterministic SI-unit screening equations, separate from rendering.
- `src/scene.js`: Three.js dummy, chamber geometry and scene.
- `src/app.js`: controls, timing display and export.
- `docs/DESIGN-REVISION.md`: latest requirements and evidence on prediction, posture, materials and coverage.
- `docs/ENGINEERING.md`: assumptions, architecture, experiment plan.
- `docs/SOURCES.md`: primary references and applicability.
- `vendor/`: pinned Three.js 0.180.0 and OrbitControls; upstream MIT license included.

The original project code is provided for review. No project-wide open-source license is selected; choose one intentionally before inviting external reuse. The third-party Three.js license applies to its vendor files.
