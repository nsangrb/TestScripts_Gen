const path = require("path");
const url = require("url");

const customTitlebar = require("custom-electron-titlebar");

window.addEventListener("DOMContentLoaded", () => {
  new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex("#252526"),
    icon: url.format(path.join(__dirname, "/assets/img", "/icon.png")),
  });

  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const type of ["chrome", "node", "electron"]) {
    replaceText(`${type}-version`, process.versions[type]);
  }
});
