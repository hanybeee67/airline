const { app, BrowserWindow, Menu, shell } = require("electron");
const path = require("node:path");

// Dev server URL when running against Vite; when unset we load the built files
// from disk so the packaged app runs completely offline.
const devServerUrl = process.env.ELECTRON_START_URL;

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 860,
    minWidth: 1024,
    minHeight: 680,
    backgroundColor: "#0a0e17",
    show: false,
    autoHideMenuBar: true,
    title: "Sky Airline Tycoon",
    icon: path.join(__dirname, "..", "build", "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // No application menu — this is a game.
  Menu.setApplicationMenu(null);

  if (devServerUrl) {
    win.loadURL(devServerUrl);
  } else {
    win.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }

  // Start maximised so the world map fills the screen from the first frame.
  win.once("ready-to-show", () => {
    win.maximize();
    win.show();
  });

  // Open any external links (none today) in the system browser, never in-app.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http")) shell.openExternal(url);
    return { action: "deny" };
  });

  // F11 toggles true fullscreen.
  win.webContents.on("before-input-event", (event, input) => {
    if (input.type === "keyDown" && input.key === "F11") {
      win.setFullScreen(!win.isFullScreen());
      event.preventDefault();
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
