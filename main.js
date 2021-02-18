const { app, BrowserWindow, Menu } = require("electron");
const shell = require("electron").shell;
const path = require("path");

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      preload: path.join(__dirname, "preload_dark.js"),
    },
  });

  win.loadFile("view/Main_view.html");

  //Open the DevTools.
  // win.webContents.openDevTools();

  var menu = Menu.buildFromTemplate([
    {
      label: "Menu",
      submenu: [
        // { label: "Theme", submenu: [{ label: "Dark" }, { label: "Light" }] },
        {
          label: "Toggle DevTools",
          accelerator: "Alt+Ctrl+D",
          click() {
            BrowserWindow.getFocusedWindow().toggleDevTools();
          },
        },
        {
          label: "About",
          click() {
            const about = new BrowserWindow({
              width: 300,
              height: 140,
              title: "About",
              parent: win,
              resizable: false,
            });
            about.removeMenu();
            about.loadFile("view/About_view.html");
          },
        },
        {
          type: "separator",
        },
        {
          label: "Exit",
          accelerator: "Alt+F4",
          click() {
            app.quit();
          },
        },
      ],
    },
  ]);

  Menu.setApplicationMenu(menu);

  win.on("closed", function () {
    win = null;
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
