const { app, BrowserWindow, Menu } = require("electron");
const shell = require("electron").shell;
const path = require("path");

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    //frame: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile("view/Testscripts_generator.html");

  //Open the DevTools.
  win.webContents.openDevTools();

  var menu = Menu.buildFromTemplate([
    {
      label: "Menu",
      submenu: [
        { label: "Theme", submenu: [{ label: "Dark" }, { label: "Lght" }] },
        {
          label: "About",
          click() {
            shell.openPath("C:\\");
          },
        },
        {
          label: "Exit",
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
