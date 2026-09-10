# Revised requirements: anticipation, layers and coverage

Status: research-backed design proposals, not validated mechanisms. These requirements supersede the earlier acceptance of post-strike pedestrian deployment as a primary success. The current pedestrian animation remains a post-strike baseline and FAILS the new pre-impact requirement. Neither predictive sensing nor active body reorientation has been implemented in the physics model.

## 1. Before first contact

Define success as reaching a measured protective pressure and geometry before the first harmful contact. A late deployment fails this requirement even if it might mitigate a later collision. Track missed detections, false deployments, sensor blind spots and the distribution of remaining time after inflation, not only recognition accuracy.

Candidate sensing architecture: outward-facing FMCW radar for range and radial relative velocity; IMUs to account for wearer motion; optional cameras/depth sensors for geometry and crossing trajectories. TI's IWRL6432 is an example research radar platform, not a qualified wearable collision detector. Track predicted swept-volume intersections with uncertainty. Closing speed alone cannot distinguish an approaching car on a collision course from one passing nearby. A body can occlude a sensor; all-around coverage needs placement and power-budget work.

For falling, measure distance to the relevant landing/impact surface and estimate velocity/orientation. Altitude above sea level is not ground clearance. IMUs do not directly measure absolute height. Unknown terrain, occlusion and late appearance impose real detection limits.

Illustrative timing calculation: at 30 km/h (8.33 m/s), a 0.20 s detection/actuation/fill budget uses 1.67 m of straight-line closing distance, before uncertainty margin. These are example assumptions, not sensor performance specifications.

## 2. Landing posture

There is no demonstrated universal minimum-injury pose across heights, surfaces, body sizes and collision directions. Feet-first does not eliminate injury: instrumented dummy experiments show substantial femur loading and height-dependent dynamics. An observational study in older adults found associations between rotation and reduced head injuries in some same-level falls; this cannot establish a target pose for roof falls or vehicle strikes.

The test objective should be constrained whole-body injury reduction: avoid direct head/neck loading while limiting chest, abdominal, pelvic and limb loads, rather than selecting one pose from an animation. No ranking is possible with the current energy-only model. A biomechanical model calibrated to physical tests is needed.

Changing shape can redistribute angular momentum; simply inflating one side does not guarantee rotation of the whole person. Controlled reorientation needs a demonstrated mechanism (for example articulated inertial motion or an external force), with measured torque, time and joint loads. Robotic inertial-tail experiments demonstrate a principle, not a wearable solution. A drop of 2 m from rest lasts about 0.64 s; there is no basis to assume a bulky human can be safely repositioned in the remaining time.

First investigate passive protection effective across orientations and outward cushion geometry that changes contact order. Active posture control remains a separate experimental program, not a V1 promise.

## 3. Four functional layers

- Skin-side liner and passive impact padding: breathable spacer textile plus selected viscoelastic polyurethane foam, with XRD as one candidate. Padding helps distribute contact; it cannot isolate organs from whole-body deceleration.
- Structural inner envelope: low-stretch textile panels, broad load paths and internal tethers, fitted to the wearer. Candidate woven polyester/nylon or aramid reinforcement must be screened for elongation, seam fatigue and pressure distribution. A fixed inner boundary limits geometric bulging, not all inward force; the body must still decelerate.
- Gas-retaining chamber: compare reinforced TPU-laminated textile for low-pressure welded geometry prototypes with airbag-grade coated PA66 for later dynamic tests. Covestro's inflatable vest demonstrates TPU fabrication, NOT crash protection. Qualification must include gas/inflator temperature and the complete seam construction.
- Replaceable protective cover: abrasion-resistant woven nylon with selective aramid reinforcement. DuPont identifies abrasion/puncture/tear-resistant applications for Kevlar textiles; it does not establish an untearable shell. Keep the cover loose enough to allow deployment and ensure it cannot obstruct vents.

The gas generator/valve is the inflator; the outer expanding envelope is the airbag. Favor controlled energy dissipation, venting and limited rebound over maximum bounce. A material can be durable without being excessively elastic. Material grades and thicknesses cannot be declared best without loading, pack-volume, sweat/ageing, abrasion, puncture and seam tests.

## 4. Whole-body priorities

Brain, cervical spinal cord, airway, chest, abdomen, pelvis and major vessels belong in the high-consequence protection assessment. Do not equate extremity injuries with harmless outcomes: severe limb injuries can involve major bleeding. Define allowed loads and deployment-induced risks with a biomechanics partner. An organ-ranking score must not permit a catastrophic load elsewhere.

## 5. Close the gaps

Replace circular rings with shaped, baffled, quilt-like chambers. Stagger neighboring seams, overlap external coverage, and use smaller independently sealed bridge chambers near transition zones. A continuous passive liner remains beneath joints and gaps. Joint articulation and airway access must remain functional.

Projected visual overlap is insufficient. Measure minimum available cushioning along possible impact directions for each relevant pose, including compressed neighboring cells, failed cells and changed fit. Prevent seam alignment from becoming a continuous weak path. Overlap introduces its own risks of interference, stiff folds and force transfer; it must be tested physically.

## Additional improvements

- Independent chambers and leak isolation so a single tear does not empty the suit.
- Calibrated venting and relief behavior with measured rebound; retain a defined budget for secondary impacts.
- Hazard warning before deployment when time permits; evaluate false deployment near machinery and road traffic.
- Defined readiness checks, service intervals and measured end-of-life criteria.
- A declared operating envelope, including what the suit cannot protect against.

## Primary references

- [TI IWRL6432 datasheet](https://www.ti.com/lit/ds/symlink/iwrl6432.pdf)
- [Femur Loading in Feet-First Fall Experiments using an Anthropomorphic Test Device](https://pmc.ncbi.nlm.nih.gov/articles/PMC6070421/)
- [Protective responses in real-life falls in long-term care](https://pmc.ncbi.nlm.nih.gov/articles/PMC9729006/)
- [Robotic inertial-tail reorientation research](https://arxiv.org/abs/2209.15337)
- [Rogers XRD impact materials](https://www.rogerscorp.com/elastomeric-material-solutions/xrd-impact)
- [Covestro inflatable TPU textile demonstrator](https://solutions.covestro.com/en/highlights/articles/stories/2024/tpu-films-for-textile-applications)
- [DuPont Kevlar textile applications](https://www.dupont.com/fabrics-fibers-and-nonwovens/consumer-products.html)
- [Coated airbag textile qualification research](https://thesis.unipd.it/handle/20.500.12608/94146)

Manufacturer sources support candidate material capabilities; none validates this layer stack or the proposed suit.
