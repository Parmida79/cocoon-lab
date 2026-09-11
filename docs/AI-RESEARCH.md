# MVP enhancements and AI dataset choices

Reviewed 2026-09-11. Proposed physical features are not manufactured or validated by this software update.

## Animal-inspired features to investigate

1. Pangolin-inspired staggered coverage: contoured overlapping chambers, smaller transition cells and seams offset from one another. Test minimum effective cushion depth over bending/twisting and under local compression. Visual overlap alone is not proof of protection. [Geometry precedent](https://www.nature.com/articles/s41467-023-38689-x).
2. Arapaima-inspired layered reinforcement: a tough flexible backing with localized puncture/abrasion-resistant outer material. Test the finished bladder-cover-seam assembly, including folding fatigue and puncture-induced leakage. Do not copy fish scales as hard tiles beside the neck. [Primary study](https://meyersgroup.ucsd.edu/papers/journals/Meyers%20468.pdf).
3. Ironclad-beetle-inspired joints: load-sharing module attachments and staged failure paths rather than one seam whose failure detaches an entire protector. Test pull-out, fatigue and forces transmitted to the wearer. [Primary study](https://www.nature.com/articles/s41586-020-2813-8).
4. Locust-inspired early threat sensing: compare looming-image expansion against metric motion tracking; reject harmless passing objects. The current code implements metric tracking and geometric prediction, not a locust neural circuit. [Primary study](https://www.nature.com/articles/nn.2259).
5. Pufferfish-inspired deployment geometry: reserve fold volume and physically limit unfolding with internal tethers. Inflation for predator deterrence is not evidence of impact attenuation. [Primary study](https://pubmed.ncbi.nlm.nih.gov/29865387/).

Defer gecko-like active reorientation (unproven torque/time/neck-load budget), mantis-shrimp-inspired specialized composites (manufacturing complexity), and cold/heat biochemical adaptations (different hazards). Test practical textiles and seams before investing in exotic materials.

## Dataset decisions

**nuScenes — selected for later metric trajectory and radar research.** Contains camera, radar, lidar and 3D annotations. Coordinate geometry is relevant, but the sensors are on vehicles, not a wearer's moving body. Keyframe labels are unsuitable as direct proof of millisecond-scale detection timing. Re-expressing trajectories around a pedestrian does not recreate that pedestrian's sensor occlusions or noise. Access and non-commercial/commercial conditions must be resolved before using the data for a product. Nothing from this dataset is bundled or used to fit the included model. [Official dataset](https://www.nuscenes.org/nuscenes).

**PIE — selected as supplementary behavior/context research.** Offers pedestrian annotations and ego-vehicle information. It measures behavior from a vehicle view. A crossing-intention label is not a collision label; image-space boxes are not metric ground truth. The repository's MIT code license must not be assumed to settle all video rights. No PIE data were downloaded. [Official repository](https://github.com/aras62/PIE), [original paper](https://openaccess.thecvf.com/content_ICCV_2019/papers/Rasouli_PIE_A_Large-Scale_Dataset_and_Models_for_Pedestrian_Intention_Estimation_ICCV_2019_paper.pdf).

**JAAD — secondary transfer benchmark, not first training choice.** It does not solve the wearer-view metric threat problem. PIE is the more useful initial context source because of its ego-vehicle information. See the comparison in the original PIE paper above.

**KFall — selected for a separate fall-detection branch.** Its pre-impact annotations support lead-time evaluation. It does not train vehicle approach detection and its staged same-level falls do not establish occupational-fall performance. No KFall data or fall model are included in this implementation. [Original dataset paper](https://www.frontiersin.org/journals/aging-neuroscience/articles/10.3389/fnagi.2021.692865/full).

**Wearer-mounted recordings — mandatory qualification data.** Collect synchronized radar/IMU and independent reference trajectories in controlled, dummy-based threat experiments, plus substantial benign exposure. Record blind spots, turns, near misses, suit movement, rain/clutter, sensor faults and actual command-to-pressure time. No human should be exposed to vehicle strikes to obtain data.

**Synthetic fixtures — included only to test the pipeline.** The model currently trains on generated metric tracks, with no pretense that these are real recordings or public benchmark results. Network downloads failed through the configured proxy during this run. Training infrastructure and the input contract work without downloaded libraries, but public dataset acquisition remains incomplete.

## Technologies

Implemented: JavaScript ES modules, Node.js for reproducible training, least-squares tracking, an analytic constant-velocity envelope baseline, regularized logistic regression, grouped evaluation, JSON artifacts and browser Web Workers for local inference. No cloud dependency, paid API, runtime CDN or heavyweight model is needed for this first tracked-coordinate milestone.

Next measured upgrade: a radar/IMU tracker supplying calibrated metric states, followed by a small temporal model only if it improves a frozen baseline on held-out recordings. Python/PyTorch for experiments and ONNX or a microcontroller inference runtime can be evaluated once the hardware and dataset are fixed; these are proposed next technologies, not installed components. Bound latency and memory on the actual target. The browser demo cannot establish MCU timing.

## Similar work and products

A particularly close research precedent is **An Edge-Executed ML-Enabled Wearable Pedestrian Collision Avoidance Radar**, WiSNeT 2026, DOI 10.1109/WiSNeT69500.2026.11408661. The publisher describes an onboard CNN analyzing Doppler data to detect cars approaching from behind and issue warnings. This is a research alerting device; it does not demonstrate our collision-envelope prediction or airbag integration. Its dataset is not included here and a public download was not verified. [IEEE publication](https://ieeexplore.ieee.org/document/11408661/).

For actual protective garments, D-Air lab WorkAir and motorcycle systems such as Alpinestars Tech-Air are relevant precedents. They are not evidence that our proposed wearable radar-triggered pedestrian suit works. [WorkAir](https://shop.dairlab.com/en/prodotto/workair-original/), [Tech-Air](https://www.alpinestars.com/pages/alpinestars-tech-air-autonomous-airbag-systems).

## What deployment means in this milestone

The runnable artifact is a static browser research lab. It is ready to be served locally or included in the project's GitHub Pages deployment. No public repository, cloud service or hardware controller has been deployed in this run. No externally trained, safety-qualified AI assistant has been delivered. Those outcomes require actual data access, measured evidence and a chosen deployment destination.
