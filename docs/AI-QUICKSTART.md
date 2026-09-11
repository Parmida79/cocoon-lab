# Prediction Lab — run and inspect

## What is implemented

A separate browser Prediction Lab runs a trained logistic model and a constant-velocity geometric baseline in a local Web Worker. It does not need WebGL, a cloud account or API keys. The first model is trained on generated trajectory sessions only. The evidence-based assistant explains results and links to project notes; it is deterministic, not an LLM.

The original 3D simulator remains a separate screening tool. No AI prediction is connected to its airbag timing or to hardware. In particular, its old post-strike pedestrian scene is not evidence that the new pre-impact requirement has been met.

## Open

From the project root:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000/ai/`, or choose **Prediction Lab** in the main project navigation. Try direct approach, passing, crossing, moving away, late detection, stale measurements and changing motion. Export a forecast to inspect the input, model version, timing and explanation together.

GitHub Pages includes the Prediction Lab and its artifacts after the normal workflow runs. This delivery has not been published to a repository or hosted endpoint. GitHub Pages serves a static demo, not a device control service.

## Reproduce training and tests

Requires Node.js 20+; no npm dependencies or GPU are needed.

```sh
npm run test:ai
npm run train:ai
# Or directly:
node --test ai/tests/*.test.js
node ai/train.mjs
```

Training uses seed 240911, whole-recording group splits, validation-only epoch/threshold selection, and untouched test windows. It saves `ai/artifacts/model.json` and `ai/artifacts/evaluation.json`. Training overwrites the bundled synthetic demonstration artifacts; keep them versioned before experiments.

## Single-track input

Upload JSON shaped like `ai/example-track.json`. All distances are meters and times seconds. The object center is relative to the wearer at each measurement time, but axes must retain a fixed world orientation over the entire observation window. The upstream tracker must compensate for wearer rotation and motion. Raw Doppler velocity alone is not a complete 2D motion vector.

Required fields: `frame` exactly `wearer_relative_world_axes_m`, `now`, `objectRadius`, `wearerRadius`, `positionSigma`, and `samples` containing `{t,x,y}`. At least six samples over 250 ms are needed for a non-abstaining forecast. The last 12 samples are used, with maximum permitted sampling gap 150 ms and age 150 ms. These limits are prototype settings, not validated requirements.

This prototype accepts previously tracked coordinates. It does not turn raw camera images or radar detections into tracks. `positionSigma` is caller-supplied quality information, not learned by this model. No upload leaves the browser.

## Train on supplied track recordings

A native nuScenes/PIE/KFall loader is not included. Use a verified upstream conversion to the canonical schema; avoid converting image coordinates to meters without calibration. For future paired track recordings:

```sh
node ai/train.mjs --dataset /path/to/corpus.json --out /path/to/new-artifacts
```

The corpus object must declare `domain` (`provided_recorded_tracks`), `provenance`, `license`, and `sessions`. Each session needs a unique `id`, a `groupId` shared across ALL tracks/windows from the same recording, plus aligned `points` (reference positions) and `observed` (tracker estimates). Both contain `{t,x,y}` arrays with matching timestamps. The current labeler uses a fixed 1.85 m combined circular envelope and a three-second future horizon. This must match the intended experiment; it is not a general vehicle-shape labeler. Minimum record counts are software preconditions only, not statistical qualification criteria.

Reference/future positions are used only to make labels. Input features use historical observed positions only. Future contact labels are sampled envelope overlaps, so timing precision is limited by reference sampling. All tracks sharing a recording group remain in one split. Each split must contain both positive and negative windows. External data writes to a separate output folder and cannot automatically replace the shipped model.

Dataset declarations are supplied by the operator. The pipeline cannot verify their legal provenance or sensor accuracy. No command authorizes deployment of real airbags, and all artifacts remain unqualified.
