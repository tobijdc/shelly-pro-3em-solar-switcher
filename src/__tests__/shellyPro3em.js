// Mocking API calls
global.Shelly = {
  call: jest.fn()
};
global.Timer = {
  set: jest.fn()
};
global.console = {
  log: jest.fn()
};

require('../shellyPro3em.js'); // Load the script file

describe("Shelly Pro 3EM energy management script", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    Shelly.call.mockClear();
    Timer.set.mockClear();
  });

  test("should switch relay ON when totalEnergy <= NEGATIVE_THRESHOLD and cooldown passed", () => {
    const totalEnergy = -600; // Example value below the threshold
    const currentTime = Date.now();
    lastRelaySwitchTime = currentTime - (RELAY_COOLDOWN + 1000); // Set last switch time to be more than cooldown

    controlRelay(totalEnergy, currentTime);

    expect(Shelly.call).toHaveBeenCalledWith("Switch.Set", { id: 0, on: true });
  });

  test("should switch relay OFF when totalEnergy >= POSITIVE_THRESHOLD and cooldown passed", () => {
    const totalEnergy = POSITIVE_THRESHOLD + 10; // Example value above the threshold
    const currentTime = Date.now();
    lastRelaySwitchTime = currentTime - (RELAY_COOLDOWN + 1000); // Set last switch time to be more than cooldown

    controlRelay(totalEnergy, currentTime);

    expect(Shelly.call).toHaveBeenCalledWith("Switch.Set", { id: 0, on: false });
  });

  test("should not switch relay if cooldown has not passed", () => {
    const totalEnergy = -600; // Example value below the threshold
    const currentTime = Date.now();
    lastRelaySwitchTime = currentTime - (RELAY_COOLDOWN - 1000); // Set last switch time to be less than cooldown

    controlRelay(totalEnergy, currentTime);

    expect(Shelly.call).not.toHaveBeenCalled();
  });

  test("should not switch relay ON if totalEnergy is above NEGATIVE_THRESHOLD", () => {
    const totalEnergy = -50; // Example value above the negative threshold
    const currentTime = Date.now();
    lastRelaySwitchTime = currentTime - (RELAY_COOLDOWN + 1000); // Set last switch time to be more than cooldown

    controlRelay(totalEnergy, currentTime);

    expect(Shelly.call).not.toHaveBeenCalled();
  });

  test("should not switch relay OFF if totalEnergy is below POSITIVE_THRESHOLD", () => {
    const totalEnergy = POSITIVE_THRESHOLD - 10; // Example value below the positive threshold
    const currentTime = Date.now();
    lastRelaySwitchTime = currentTime - (RELAY_COOLDOWN + 1000); // Set last switch time to be more than cooldown

    controlRelay(totalEnergy, currentTime);

    expect(Shelly.call).not.toHaveBeenCalled();
  });
});
