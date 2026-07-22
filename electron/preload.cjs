// The game is fully self-contained and needs no privileged APIs, so the
// preload intentionally exposes nothing. It exists to keep contextIsolation
// on with a defined, empty bridge.
const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("desktop", {
  isDesktop: true,
  platform: process.platform,
});
