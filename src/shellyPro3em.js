// Configuration variables set as global properties for test access
globalThis.NEGATIVE_THRESHOLD = -100; // Configurable negative threshold in Watts (e.g., -100W)
globalThis.DEVICE_ENERGY_USE = 800;   // Configurable estimated energy use in Watts for the relay-controlled device
globalThis.BUFFER = 200;              // Configurable buffer in Watts to prevent frequent switching
globalThis.MAIN_LOOP_INTERVAL = 30 * 1000; // Main loop interval in milliseconds (30 seconds)
globalThis.RELAY_COOLDOWN = 5 * 60 * 1000; // Relay cooldown time in milliseconds (5 minutes)

// Calculated positive threshold as global
globalThis.POSITIVE_THRESHOLD = DEVICE_ENERGY_USE + BUFFER;

// State variables
globalThis.lastRelaySwitchTime = 0;      // Timestamp of the last relay switch
globalThis.lastStateTransitionTime = 0;  // Timestamp of the last state transition
globalThis.state = "NO_EXCESS_ENERGY_OFF"; // Initial state

// Method to transition to a new state, logging the transition and updating the transition time
function transitionToState(newState) {
  const currentTime = Date.now();
  globalThis.lastStateTransitionTime = currentTime;
  globalThis.state = newState;
  console.log(`Transition to ${newState} at ${new Date(currentTime).toISOString()}`);
}

// Method to switch the relay on or off and update the last relay switch time
function switchRelay(isOn) {
  const currentTime = Date.now();
  Shelly.call("Switch.Set", { id: 0, on: isOn });
  globalThis.lastRelaySwitchTime = currentTime;
  console.log(`Relay switched ${isOn ? "ON" : "OFF"} at ${new Date(currentTime).toISOString()}`);
}

// State machine to control the relay
function controlRelayStateMachine(totalEnergy, currentTime) {
  const timeSinceLastSwitch = currentTime - lastRelaySwitchTime;

  switch (state) {
    case "EXCESS_ENERGY_ON":
      if (totalEnergy >= POSITIVE_THRESHOLD) {
        // No excess energy, switch off and enter cooldown
        switchRelay(false);
        transitionToState("HOLD_PHASE_OFF");
      }
      break;

    case "NO_EXCESS_ENERGY_OFF":
      if (totalEnergy <= NEGATIVE_THRESHOLD) {
        // Excess energy detected, switch on and enter cooldown
        switchRelay(true);
        transitionToState("HOLD_PHASE_ON");
      }
      break;

    case "HOLD_PHASE_ON":
      if (timeSinceLastSwitch >= RELAY_COOLDOWN) {
        if (totalEnergy >= POSITIVE_THRESHOLD) {
          // Cooldown over, no excess energy, go back to OFF state
          switchRelay(false);
          transitionToState("HOLD_PHASE_OFF");
        } else {
          // Cooldown over, and excess energy still available, switch to ON
          transitionToState("EXCESS_ENERGY_ON");
        }
      }
      break;

    case "HOLD_PHASE_OFF":
      if (timeSinceLastSwitch >= RELAY_COOLDOWN) {
        if (totalEnergy <= NEGATIVE_THRESHOLD) {
          // Cooldown over, excess energy detected again, switch back to ON
          switchRelay(true);
          transitionToState("HOLD_PHASE_ON");
        } else {
          // Cooldown over, still no excess energy, remain OFF
          transitionToState("NO_EXCESS_ENERGY_OFF");
        }
      }
      break;
  }
}

// Main loop function
function mainLoop() {
  Shelly.call("Emeter.GetStatus", { id: 0 }, (result, error) => {
    if (error) {
      console.error("Error fetching energy data:", error);
      return;
    }
    const totalEnergy = result.total_energy;
    console.log(`Total energy: ${totalEnergy}`);
    controlRelayStateMachine(totalEnergy, Date.now());
  });
}

// Timer to run the main loop at a configured interval
Timer.set(MAIN_LOOP_INTERVAL, true, mainLoop);

// Attach controlRelay to globalThis for test access
globalThis.controlRelay = controlRelayStateMachine;

console.log("Shelly Pro 3EM energy management script started.");
