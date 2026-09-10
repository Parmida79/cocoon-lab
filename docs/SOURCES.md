# Sources and provenance

Reviewed 2026-09-10. Manufacturer specifications establish component capability, not suitability for a life-critical suit. None of the sources validates this simulator or its default pressure, dimensions, contact area or timing.

## Verified primary sources

- [Bosch BMI270 product specification](https://www.bosch-sensortec.com/en/products/motion-sensors/imus/bmi270): wearable IMU with programmable acceleration range up to ±16 g and gyroscope up to ±2000°/s. Supports a motion-sensing candidate, not unrestricted impact instrumentation.
- [Analog Devices ADXL375](https://www.analog.com/en/products/adxl375.html): ±200 g accelerometer candidate for separate high-g measurements. Bandwidth, mounting and calibration need evaluation.
- [ST STM32U575/585](https://www.st.com/en/microcontrollers-microprocessors/stm32u575-585.html): local low-power MCU family. Does not itself supply a certified safety-control architecture.
- [Honeywell ABP2 datasheet](https://prod-edam.honeywell.com/content/dam/honeywell-edam/sps/siot/en-us/products/sensors/pressure-sensors/board-mount-pressure-sensors/basic-abp2-series/documents/sps-siot-abp2-series-datasheet-32350268-en.pdf): pressure-sensor family; exact reference type, range, response and compatible media must be selected for the real chamber.
- [KFall original research, 2021](https://www.frontiersin.org/journals/aging-neuroscience/articles/10.3389/fnagi.2021.692865/full): pre-impact dataset from 32 young male participants, with staged falls and ordinary activities. Its population and scenarios limit transfer to workers at height. This project neither bundles the dataset nor reproduces published detector results.
- [OSHA 1926.501](https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.501): U.S. construction fall-protection requirements. Relevant as an example of existing primary protective measures, not a statement of requirements in Iran or a substitute for local review.

## Relevant papers for follow-up; not calibration data

- [Virtual Assessment of a Representative Torso Airbag under the Fall from Height Impact Conditions, 2023](https://www.mdpi.com/2313-576X/9/3/53): publisher indexing confirms this study; full text was not retrieved in this session. No numerical result from it was used to calibrate this app.
- [Design and Performance Research of a Wearable Airbag for the Human Body, 2023](https://www.mdpi.com/2076-3417/13/6/3628): publisher summary describes pedestrian-airbag finite-element work. Full text was not retrieved; no injury-reduction figure is reused.

## Software

- [Three.js documentation](https://threejs.org/docs/): renderer and orbit controls. Vendored version 0.180.0; MIT license in `vendor/THREE-LICENSE`. Procedural geometry is original; no external human or car asset licenses are required.
- [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages): basis for the included deployment workflow.

The source conversation inspired the architecture. Its optimistic or unverified claims are not treated as validated engineering conclusions.
