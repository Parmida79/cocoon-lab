# Cocoon collision model v0.1

## Status

Experimental, synthetic-only model. Not qualified to trigger hardware, predict injury, diagnose health conditions, or claim field accuracy. Browser execution is implemented; it does not constitute physical deployment. The included explanations are deterministic project-specific responses, not a general AI chatbot.

## Task and components

Input: a short sequence of relative object-center positions in meters, stabilized in world-axis orientation, timestamps, approximate object/wearer radii and positional uncertainty.

A least-squares fit estimates relative velocity from up to 12 past observations. A constant-velocity forecast solves the quadratic intersection between an object-center trajectory and a combined circular envelope, within three seconds. It also checks an expanded envelope using an explicitly heuristic uncertainty allowance. This is geometric contact prediction, not merely approaching-car classification.

Separately, an L2-regularized logistic regression consumes range, closing speed, closest predicted separation, time to envelope intersection, fit residual and speed. Its numeric output is called an experimental score. It has not been calibrated as a probability on recorded wearable data. The score does not authorize actuation and is not used to gate the baseline's warning status.

The 320 ms demonstration budget combines placeholder processing/actuation/inflation/margin allowances. It is not a measured hardware specification. A positive timing margin establishes neither inflation success nor effective protection.

## States

- NO_PREDICTED_CONTACT: nominal and expanded envelopes do not intersect under the model. Not an all-clear.
- PREDICTED_CONFLICT: predicted intersection occurs after the assumed budget. Evaluation warning only.
- TOO_LATE: predicted contact is within the assumed budget; primary timing requirement fails.
- CONTACT_ALREADY: modeled envelopes already overlap.
- UNCERTAIN: stale/sparse/gapped observations, high supplied position uncertainty, poor fit, out-of-envelope speed, or expanded-envelope conflict without nominal conflict.

Hardware authorization is always false. Sensor disagreement and missed observations must never silently become a safe result. Handling unknown threats in a production actuator controller requires separate analysis and testing.

## Training and evaluation

900 generated sessions are split into 540 training, 180 validation and 180 test sessions. Group assignment is deterministic; no recording crosses splits. Windows are derived after splitting. Validation selects the best epoch and a diagnostic score threshold; the test set is not used for fitting or selection.

Generated scenarios include direct approaches, grazing paths, passing traffic, near misses, measurement noise and acceleration. Test labels come from future reference samples intersecting a fixed envelope. There are no actual sensor recordings. Because generator physics and forecast assumptions are related, the evaluation is optimistic and cannot estimate field performance.

The report includes learned-score confusion counts and Brier score, plus a SEPARATE geometric-baseline event evaluation: contacts missed before impact, insufficient lead time, median detected lead time and false-alert episodes normalized by negative exposure. Learned window metrics are not event-level deployment performance. Overlapping windows are correlated. The brief synthetic exposure makes an hourly normalized rate unstable; inspect absolute counts and exposure too. No confidence interval or safety threshold is claimed.

## Known gaps

No sensor detector/tracker, no object identity association, no calibration from pixels to meters, no measured end-to-end timing, no 3D obstacles/terrain, no multi-object fusion, no blind-spot model, no clinical injury model, no rotation policy, no pressure-feedback confirmation, no real-world calibration and no commercial qualification. A constant-velocity fit can remain confident just before an unseen turn or sudden acceleration. Circular envelopes simplify vehicle geometry. Radial-only radar cannot identify all crossing paths without additional angle/tracking information.

## Required evidence before advancement

Paired wearer-mounted sensor and independent reference recordings; a defined operating envelope; scene/person/location-separated splits; held-out exposure to occlusion, near misses, differing gait and weather; bounded measured inference and inflation latency; uncertainty calibration; a reviewed response to sensor failures; instrumented protective tests. A public automotive benchmark is useful pretraining evidence, not a substitute.

## Assistant boundary

The assistant explains the exact forecast fields and retrieves a small set of reviewed project answers with source links. It cannot send alerts, control valves or invent a diagnostic conclusion. A future LLM can paraphrase approved evidence outside the safety loop, after testing unsupported claims, numerical consistency, refusal on missing evidence and prompt-injection resistance. No model API or credentials have been configured.
