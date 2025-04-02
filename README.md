# Shelly Pro 3EM Solar Switcher

Work in progress.

## Idea

If Solar Panels produce more energy than can be used, switch the boiler on to use the energy.

## Devices :electric_plug:

- [Shelly Pro 3 EM](https://www.shelly.com/de/products/shelly-pro-3em-x1)
  - Measures Energy, runs script
- [Shelly Pro 3EM Switch Add-on](https://www.shelly.com/de/products/shelly-pro-3em-switch-add-on)
  - Does the switching
- Likely also a [Contactor](https://en.wikipedia.org/wiki/Contactor) as the relay of the switch add-on is quite weak 

## Progress

Runs on actual device!
(but no guarantee it fully works)

### Done :heavy_check_mark:

- [x] Refactor everything to be more state machine like (for easier reasoning)
- [x] Make the script more configurable
- [x] Script can be used unmodified on device and for testing

### Todo :clipboard:

- [ ] Create event based version (power change) and compare to timer based approach :watch:
- [ ] Allow for time based overrides (always on during / do not run script during) :moon:
- [ ] Access the history of measurements to switch only if value was reached for more than one interval
- [ ] Read Switch state on script start and set starting state accordingly
- [ ] Allow Threshold to be a function, based on time of day

### Possible extensions

- [ ] Add Weather/Solar-production forecast (via for example [forecast.solar](https://forecast.solar/)) :sunny:
  - On a rainy day, we might be happy over every free Watt we can get. While on a sunny day the threshold should be higher.
- [ ] Add Telegram Bot for alarms/daily summaries etc. :robot:
- [ ] Add [Influxdb Cloud](https://www.influxdata.com/products/influxdb-cloud/) sync :cloud:
- [ ] Create Events when Relay is switched
- [ ] Actually emulate script with [espruino](https://www.espruino.com/) :coffee: for more confidence in testing

## Made with AI support

I have relied on AI a significant amount for this project.
