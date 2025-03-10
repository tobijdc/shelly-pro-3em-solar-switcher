// Mocking API calls
global.Shelly = {
  call: jest.fn(),
  getCurrentScriptId: jest.fn(() => "testingWorkaround"),
};
global.Timer = {
  set: jest.fn()
};
global.console = {
  log: jest.fn()
};

require('../switch-if-energy-avaliable-timer.js'); // Load the script file

describe("Shelly Pro 3EM energy management script", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    Shelly.call.mockClear();
    Timer.set.mockClear();
  });

  test("should switch relay ON when totalEnergy <= NEGATIVE_THRESHOLD and cooldown passed. From NO_EXCESS_ENERGY_OFF", () => {
    const totalEnergy = -600; // Example value below the threshold
    const currentTime = Date.now();

    globalThis.lastRelaySwitchTime = currentTime - (globalThis.RELAY_COOLDOWN + 1000); // Set last switch time to be more than cooldown
    globalThis.state = "NO_EXCESS_ENERGY_OFF";

    controlRelayStateMachine(totalEnergy, currentTime);

    expect(Shelly.call).toHaveBeenCalledWith("Switch.Set", { id: globalThis.SWITCH_ID, on: true });
    expect(globalThis.state).toEqual("HOLD_PHASE_ON");
  });

  test("should switch relay ON when totalEnergy <= NEGATIVE_THRESHOLD and cooldown passed. From HOLD_PHASE_OFF", () => {
    const totalEnergy = -600; // Example value below the threshold
    const currentTime = Date.now();
    globalThis.lastRelaySwitchTime = currentTime - (globalThis.RELAY_COOLDOWN + 1000); // Set last switch time to be more than cooldown
    globalThis.state = "HOLD_PHASE_OFF";

    controlRelayStateMachine(totalEnergy, currentTime);

    expect(Shelly.call).toHaveBeenCalledWith("Switch.Set", { id: globalThis.SWITCH_ID, on: true });
    expect(globalThis.state).toEqual("HOLD_PHASE_ON");
  });

  test("should switch relay OFF when totalEnergy >= POSITIVE_THRESHOLD and cooldown passed. From HOLD_PHASE_ON", () => {
    const totalEnergy = globalThis.POSITIVE_THRESHOLD + 10; // Example value above the threshold
    const currentTime = Date.now();
    globalThis.lastRelaySwitchTime = currentTime - (globalThis.RELAY_COOLDOWN + 1000); // Set last switch time to be more than cooldown
    globalThis.state = "HOLD_PHASE_ON";

    controlRelayStateMachine(totalEnergy, currentTime);

    expect(Shelly.call).toHaveBeenCalledWith("Switch.Set", { id: globalThis.SWITCH_ID, on: false });
    expect(globalThis.state).toEqual("HOLD_PHASE_OFF");
  });

  test("should switch relay OFF when totalEnergy >= POSITIVE_THRESHOLD and cooldown passed. From EXCESS_ENERGY_ON", () => {
    const totalEnergy = globalThis.POSITIVE_THRESHOLD + 10; // Example value above the threshold
    const currentTime = Date.now();
    globalThis.lastRelaySwitchTime = currentTime - (globalThis.RELAY_COOLDOWN + 1000); // Set last switch time to be more than cooldown
    globalThis.state = "EXCESS_ENERGY_ON";

    controlRelayStateMachine(totalEnergy, currentTime);

    expect(Shelly.call).toHaveBeenCalledWith("Switch.Set", { id: globalThis.SWITCH_ID, on: false });
    expect(globalThis.state).toEqual("HOLD_PHASE_OFF");
  });

  test("should not switch on relay if cooldown has not passed", () => {
    const totalEnergy = -600; // Example value below the threshold
    const currentTime = Date.now();
    globalThis.lastRelaySwitchTime = currentTime - (globalThis.RELAY_COOLDOWN - 1000); // Set last switch time to be less than cooldown
    globalThis.state = "HOLD_PHASE_OFF";

    controlRelayStateMachine(totalEnergy, currentTime);

    expect(Shelly.call).not.toHaveBeenCalled();
    expect(globalThis.state).toEqual("HOLD_PHASE_OFF");
  });

  test("should not switch off relay if cooldown has not passed", () => {
    const totalEnergy = 30000; // Example value above the threshold
    const currentTime = Date.now();
    globalThis.lastRelaySwitchTime = currentTime - (globalThis.RELAY_COOLDOWN - 1000); // Set last switch time to be less than cooldown
    globalThis.state = "HOLD_PHASE_ON";

    controlRelayStateMachine(totalEnergy, currentTime);

    expect(Shelly.call).not.toHaveBeenCalled();
    expect(globalThis.state).toEqual("HOLD_PHASE_ON");
  });

  test("should not switch relay ON if totalEnergy is above NEGATIVE_THRESHOLD. From NO_EXCESS_ENERGY_OFF", () => {
    const totalEnergy = -50; // Example value above the negative threshold
    const currentTime = Date.now();
    globalThis.lastRelaySwitchTime = currentTime - (globalThis.RELAY_COOLDOWN + 1000); // Set last switch time to be more than cooldown
    globalThis.state = "NO_EXCESS_ENERGY_OFF";

    controlRelayStateMachine(totalEnergy, currentTime);

    expect(Shelly.call).not.toHaveBeenCalled();
    expect(globalThis.state).toEqual("NO_EXCESS_ENERGY_OFF");
  });

  test("should not switch relay ON if totalEnergy is above NEGATIVE_THRESHOLD. From HOLD_PHASE_OFF", () => {
    const totalEnergy = -50; // Example value above the negative threshold
    const currentTime = Date.now();
    globalThis.lastRelaySwitchTime = currentTime - (globalThis.RELAY_COOLDOWN + 1000); // Set last switch time to be more than cooldown
    globalThis.state = "HOLD_PHASE_OFF";

    controlRelayStateMachine(totalEnergy, currentTime);

    expect(Shelly.call).not.toHaveBeenCalled();
    expect(globalThis.state).toEqual("NO_EXCESS_ENERGY_OFF");
  });

  test("should not switch relay OFF if totalEnergy is below POSITIVE_THRESHOLD. From EXCESS_ENERGY_ON", () => {
    const totalEnergy = globalThis.POSITIVE_THRESHOLD - 10; // Example value below the positive threshold
    const currentTime = Date.now();
    globalThis.lastRelaySwitchTime = currentTime - (globalThis.RELAY_COOLDOWN + 1000); // Set last switch time to be more than cooldown
    globalThis.state = "EXCESS_ENERGY_ON";

    controlRelayStateMachine(totalEnergy, currentTime);

    expect(Shelly.call).not.toHaveBeenCalled();
    expect(globalThis.state).toEqual("EXCESS_ENERGY_ON");
  });

  test("should not switch relay OFF if totalEnergy is below POSITIVE_THRESHOLD. From HOLD_PHASE_ON", () => {
    const totalEnergy = globalThis.POSITIVE_THRESHOLD - 10; // Example value below the positive threshold
    const currentTime = Date.now();
    globalThis.lastRelaySwitchTime = currentTime - (globalThis.RELAY_COOLDOWN + 1000); // Set last switch time to be more than cooldown
    globalThis.state = "HOLD_PHASE_ON";

    controlRelayStateMachine(totalEnergy, currentTime);

    expect(Shelly.call).not.toHaveBeenCalled();
    expect(globalThis.state).toEqual("EXCESS_ENERGY_ON");
  });
});
