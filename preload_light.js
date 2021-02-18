const path = require("path");
const url = require("url");

const customTitlebar = require("custom-electron-titlebar");

window.addEventListener("DOMContentLoaded", () => {
  new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex("#ffffff"),
    icon: url.format(path.join(__dirname, "/assets/img", "/icon.png")),
    shadow: true,
    itemBackgroundColor: customTitlebar.Color.fromHex("#2195f3a9"),
  });

  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const type of ["chrome", "node", "electron"]) {
    replaceText(`${type}-version`, process.versions[type]);
  }
});
