// Configuration variables set as global properties for test access
globalThis.NEGATIVE_THRESHOLD = -100; // Configurable negative threshold in Watts (e.g., -100W)
globalThis.DEVICE_ENERGY_USE = 800;   // Configurable estimated energy use in Watts for the relay-controlled device
globalThis.BUFFER = 200;              // Configurable buffer in Watts to prevent frequent switching
globalThis.MAIN_LOOP_INTERVAL = 30 * 1000; // Main loop interval in milliseconds (30 seconds)
globalThis.RELAY_COOLDOWN = 5 * 60 * 1000; // Relay cooldown time in milliseconds (5 minutes)

// Calculated positive threshold as global
globalThis.POSITIVE_THRESHOLD = DEVICE_ENERGY_USE + BUFFER;

// State variables
globalThis.lastRelaySwitchTime = 0; // Timestamp of the last relay switch

// Function to handle relay switching based on total energy
function controlRelay(totalEnergy, currentTime) {
  const timeSinceLastSwitch = currentTime - lastRelaySwitchTime;

  if (totalEnergy <= NEGATIVE_THRESHOLD && timeSinceLastSwitch >= RELAY_COOLDOWN) {
    Shelly.call("Switch.Set", { id: 0, on: true });
    lastRelaySwitchTime = currentTime;
    console.log(`Relay switched ON at ${new Date(currentTime).toISOString()}`);
  } else if (totalEnergy >= POSITIVE_THRESHOLD && timeSinceLastSwitch >= RELAY_COOLDOWN) {
    Shelly.call("Switch.Set", { id: 0, on: false });
    lastRelaySwitchTime = currentTime;
    console.log(`Relay switched OFF at ${new Date(currentTime).toISOString()}`);
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
    controlRelay(totalEnergy, Date.now());
  });
}

// Timer to run the main loop at a configured interval
Timer.set(MAIN_LOOP_INTERVAL, true, mainLoop);

// Attach controlRelay to globalThis for test access
globalThis.controlRelay = controlRelay;

console.log("Shelly Pro 3EM energy management script started.");
