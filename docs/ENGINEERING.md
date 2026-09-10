# Engineering basis and next experiments

## Scope

The supplied conversation is concept history, not evidence that a mechanism works. This project implements the requested situation simulator. It does not execute earlier requests to contact investors, collect health data, download KFall or train AI.

Working hypothesis: a garment-scale system can reduce selected impact loads if it deploys on time, stays anchored and has enough deformation distance. A first demonstrator uses a dummy, not a human, and focuses on cranial/collar, back/torso and pelvis modules. Lower-limb lobes are displayed as an optional extension. The car scenario is a pedestrian scenario, not a vehicle occupant restraint.

## Equations and assumptions

- Gravity g = 9.81 m/s²; no drag.
- Building scenario uses prescribed vertical travel h to first contact: t = sqrt(2h/g), v = gt, E = mgh. The dummy starts in the selected contact posture. This is a pose-controlled drop beside a building, not a simulated trip over its roof edge.
- Pedestrian scene: the vehicle reaches first contact at 0.60 s, at which point an instantaneous, assumed horizontal dummy velocity is assigned: vx = vehicle speed / 3.6 × transfer fraction. Vertical travel is 0.55 × stature; initial vertical velocity is zero. This is a ballistic post-strike thought experiment. Vehicle motion is frozen at initial contact; crush, force history, hood/windshield interactions and subsequent collisions are absent.
- Inflation fraction f = clamp((time − event onset − command delay) / fill duration, 0, 1). Event onset is known by the simulation, not estimated from IMU data. This does not measure false positives or false negatives.
- Selected ground-contact region: back → torso, side → pelvis, feet → legs, head → cranial. This simplified mapping does not represent multi-region contact. Every enabled, healthy module receives the same command; selective control is future work.
- Available stroke s = maximum stroke × inflation fraction at impact. Constant effective gauge pressure P and area A give a screening work capacity W = PAs.
- Normal incident energy En = ½mvy²; residual = max(0, En − W). Horizontal pedestrian energy remains separate. Zero residual is not a safety pass. P is a constant assumed effective pressure during compression; pressure growth, venting, bottom-out force and peak loads are not solved.
- Torso puncture sets that module's fraction and work to zero without automatically crediting neighboring protection. IMU disagreement and power loss inhibit all inflation for comparison; this is not a recommended production fault policy.
- Nominal module volumes (7/6/20/12/16 L) are rough independent design budgets. They scale with stature³ and stroke/reference stroke. They are NOT integrated from the visible mesh. Free-air volume uses ideal-gas pressure scaling and does not size an inflator.
- The animation uses fixed inner tangents and outward-growing ellipsoidal lobes. It does not solve bladder self-contact or prove anatomical clearance. Root position is aligned to the selected pose's final contact envelope; local limb and chamber motion is prescribed.

Reference case: 75 kg, 2 m vertical drop gives 1471.5 J and approximately 0.639 s to contact. At an assumed 35 kPa, 0.08 m² effective contact area and 0.18 m stroke, constant-pressure work is only 504 J. This energy mismatch is why “inflated” must never be presented as “safe.”

## Physical architecture to investigate

Use a continuous shoulder/waist load path, non-stretch body-side panels, internal tethers, independent chambers, relief/vent design and removable hard modules. A helmet-mounted cranial anchor is a hypothesis requiring compatibility review, not permission to modify a certified helmet. Keep airway access visible; test head/collar as one system. No body location, including the lateral waist, is inherently safe for a hard battery under every impact orientation.

Candidate sensing: two BMI270-class structural IMUs for motion; separate high-g instrumentation such as ADXL375 for test logging; per-chamber gauge-pressure measurement selected from an appropriate ABP2 variant. A local STM32U5-class controller can host deterministic logic, diagnostics and logs. Candidate status does not imply suitability or qualification. Hard real-time guarantees, power architecture, actuation isolation and fault response remain engineering tasks.

No commercial inflator has been selected. Required mass-flow versus time, chamber pressure, textile seam loads, temperature, gas compatibility and servicing requirements must be measured before choosing a certified actuation supplier. Do not infer a workable gas cartridge from a visual lobe. Coated textile bladders, inextensible tethers and replaceable modules need actual material/seam coupons and life-cycle testing. Reuse would require inspection and replacement criteria; it is not guaranteed.

## Bounded development plan

1. **User constraints:** interview 10–15 workers and safety professionals, record current PPE, motion restrictions, acceptable bulk, dangerous accidental deployments and maintenance practices. Interview findings establish requirements; a broad opinion survey does not validate protection.
2. **Geometry rig:** dummy-only, externally supplied low-pressure deployment with lab-defined limits. Record inward displacement, module gaps/overlap, anchor migration, pack volume and don/doff time across agreed poses. A measured inward intrusion is a redesign trigger. Do not begin with an energetic inflator or human wear trial.
3. **Material/chamber characterization:** establish seam strength, leakage, repeat inflation geometry and pressure-time curves. Record force versus displacement at relevant loading rates. Numerically integrate measured force to replace the PAs approximation.
4. **Instrumented comparison:** matched drop conditions with/without the experimental module; capture actual contact timing, high-rate acceleration, force and pressure with synchronized acquisition. Define sample size and acceptance criteria with a biomechanics lab. Include puncture, slow fill, misplaced anchors and partial deployment.
5. **Detection baseline:** acquire KFall according to its access conditions, split by subject before tuning, compare simple thresholds with classical models. Report sensitivity, missed falls, false activations per exposure duration and lead-time distributions. Do not transfer same-level staged-fall accuracy to occupational falls or traffic.
6. **Higher fidelity:** calibrated nonlinear bladder/textile and articulated dummy models, validated against rig measurements. Study neck axial/bending loads, helmet/harness interaction and secondary contacts. Only then interpret injury criteria within the validation domain.

Initial funding evidence should be repeatable geometry, measured deployment latency and force-displacement data, a traceable failure log and a clear first worker use case. Do not claim a safe fall height, a prevention percentage or patent novelty from this demonstration.

## Further expansion

Personal fitting should select tested module patterns and anchors; software should not invent an unconstrained inflation shape. A shared module interface can expose ID, units, sample timestamp, calibration status, health and command acknowledgement. Logs should distinguish “command issued” from “pressure achieved.” Pressure loss should flag degraded protection; redistribution requires validated hardware and cannot be assumed in milliseconds.

AI can later estimate posture and detect anomalies from representative data. It should earn deployment relevance through held-out tests and fault injection. A separate assistant can explain recorded events without controlling the valve timing. Medical diagnosis, respiratory sealing, heat and chemical protection are independent research tracks.
