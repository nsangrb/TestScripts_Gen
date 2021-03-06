//#region includes
import {
  UpdateExcelInfo,
  ReadExcelInfo,
} from "../generator/Collect_TestScript_Information.js";

import {
  checkForDuplicates,
} from "../generator/Other_Function.js";

const Split = require("split-grid");
const fs = require("fs");
const { dialog } = require("electron").remote;
const customTitlebar = require("custom-electron-titlebar");
const url = require("url");
const path = require("path");
//#endregion

//#region Declare variables

//Constant tempalates for generating some html elements
const pre_code_template = [
  '<div id="%ID%_tab" class="tabcontent">',
  '<div title="Reload"> <span onclick="%RELOAD_FUNC%(this.parentElement.parentElement.id)"' +
    " class=" +
    '"topleft"' +
    "></span> </div>",
  '<pre class="line-numbers language-C++">',
  '<code id="preview_%ID%">',
  "%CODE%",
  "</code>",
  "</pre>",
  "</div>",
].join("\r\n");

const button_tab_template = [
  "<button class=",
  "tablinks",
  " onclick=",
  "openTab(event, '%ID%_tab')",
  " id=",
  "btn_%ID%",
  ">%ID%</button>",
].join('"');

const dropbox_item_template = [
  "<div title='%VALUE%'>",
  "<div class='dropdown_container_item' onclick='select_dropboxItem(this.parentElement, this)'>%VALUE%</div>",
  "</div>\r\n",
].join("\r\n");

//Elements in html view
const gento_path = document.getElementById("gento_path_input");
const browsePathtoGen_btn = document.getElementById("browsePathtoGen_btn");
const GenTo_drd_btn = document.getElementById("GenTo_drd_btn");
const gento_path_container = document.getElementById("gento_path_container");
const excel_path = document.getElementById("excel_path_input");
const browseExcelPath_btn = document.getElementById("browseExcelPath_btn");
const ExcelPath_drd_btn = document.getElementById("ExcelPath_drd_btn");
const excel_path_container = document.getElementById("excel_path_container");
const list_testID = document.getElementById("list_testID");
const reload_btn = document.getElementById("reload_btn");
const removeall_btn = document.getElementById("removeall_btn");
const selectall_btn = document.getElementById("selectall_btn");
const generate_btn = document.getElementById("generate_btn");
const log_tb = document.getElementById("log_tb");
const tabs = document.getElementById("tabs");
const preview_btn = document.getElementById("preview_btn");
const preview = document.getElementById("preview");
const darkmode = document.getElementById("darkmode_toggle");

//Global variables for js
let list_testcases = [];
let Comp_Shortname = "";
let lst_items_excelPath_dropbox = [];
let lst_items_gentoPath_dropbox = [];
let IsInDropdown = false;
let titlebar = new customTitlebar.Titlebar({
  icon: "../assets/img/icon_2.ico",
  itemBackgroundColor: customTitlebar.Color.fromHex("#2195f3a9"),
});

//#endregion

//#region Onther functions

//Get absolute path (has '/' at the end)
function GetAbsPath(path) {
  return path.replace(/[\/\\]$/, "") + "\\";
}

function List_Contain(lst_items, itembechecked) {
  for (var index in lst_items) {
    if (lst_items[index].toLowerCase() === itembechecked.toLowerCase()) {
      return true;
    }
  }
  return false;
}

function Remove_AllChildNodes(div) {
  while (div.hasChildNodes()) {
    div.removeChild(div.firstChild);
  }
}

//Append input value to dropbox
function Iuclude_path_Dropbox(dropbox_container, lstItems, path) {
  let abs_path = GetAbsPath(path);
  let err = "";
  if (!fs.existsSync(path)) {
    err = `Path ${path} NOT exist!!\r\n`;
    return err;
  }
  if (!List_Contain(lstItems, abs_path)) {
    lstItems.push(abs_path);
    let dropbox_item = dropbox_item_template.replace(/%VALUE%/g, path);
    dropbox_container.innerHTML = dropbox_item + dropbox_container.innerHTML;
  }

  return err;
}

//Get list Testcase ID exist in Excel file
function GetListTestID() {
  let err = "";
  list_testcases = ReadExcelInfo(["GetListTestcase"]);
  Comp_Shortname = ReadExcelInfo(["GetCompShortName"]);
  let list_existed_testID = [];
  let Comp_Shortname_testID = "";
  if (Comp_Shortname != "" && document.getElementById(Comp_Shortname) != null && document.getElementById(Comp_Shortname).checked) Comp_Shortname_testID = Comp_Shortname;
  list_testcases.forEach(new_testcase => {
    if (checkForDuplicates(list_testcases, new_testcase))
    if (!err.includes(`Test ID: ${new_testcase} is duplicated.\r\n`)) err += `Test ID: ${new_testcase} is duplicated.\r\n`;
    if (document.getElementById(new_testcase) != null && document.getElementById(new_testcase).checked) list_existed_testID.push(new_testcase);
  });
  Remove_AllChildNodes(list_testID);
  if (Comp_Shortname != "") {
    let is_checked = Comp_Shortname_testID != "";
    list_testID.appendChild(CreateTestID_Element(Comp_Shortname, is_checked));
  }
  list_testcases.forEach((item) => {
    let is_checked = list_existed_testID.includes(item);
    list_testID.appendChild(CreateTestID_Element(item, is_checked));
  });
  return err;
}

function CreateTestID_Element(item, is_checked) {
  let label = document.createElement("label");
  label.classList.add("togglebutton_type2");
  label.textContent = item;
  let input = document.createElement("input");
  input.type = "checkbox";
  input.checked = is_checked;
  input.id = item;
  let span = document.createElement("span");
  span.classList.add("checkmark_type2");
  label.appendChild(input);
  label.appendChild(span);
  return label;
}

function preview_TestScripts() {
  Remove_AllChildNodes(tabs);
  Remove_AllChildNodes(preview);
  if (document.getElementById("preview_toggle").checked === true) {
    let [lst_testscriptsText, err] = ReadExcelInfo([
      "GetAllTestScriptText",
      list_testcases,
    ]);
    log_tb.innerHTML += err;
    list_testcases.forEach((item) => {
      tabs.innerHTML += button_tab_template.replace(/%ID%/g, item) + "\r\n";
      preview.innerHTML += pre_code_template
        .replace(/%RELOAD_FUNC%/, "reload_OneTestScript")
        .replace(/%ID%/g, item)
        .replace("%CODE%", lst_testscriptsText[item].replace(/</g, "&lt;"));
      const preview_tb = document.getElementById("preview_" + item);
      Prism.highlightElement(preview_tb);
    });

    if (Comp_Shortname != "") {
      let list_selected_TestID = [];
      list_testcases.forEach((test) => {
        if (document.getElementById(test).checked) {
          list_selected_TestID.push(test);
        }
      });
      let [MaintestscriptText, err] = ReadExcelInfo([
        "GetMainTestScriptText",
        [Comp_Shortname, list_selected_TestID],
      ]);
      log_tb.innerHTML += err;
      tabs.innerHTML +=
        button_tab_template.replace(/%ID%/g, Comp_Shortname) + "\r\n";
      preview.innerHTML += pre_code_template
        .replace(/%RELOAD_FUNC%/, "reload_MainTestScript")
        .replace(/%ID%/g, Comp_Shortname)
        .replace("%CODE%", MaintestscriptText.replace(/</g, "&lt;"));
      const preview_tb = document.getElementById("preview_" + Comp_Shortname);
      Prism.highlightElement(preview_tb);
    }
    if (list_testcases.length > 0) {
      document.getElementById("btn_" + list_testcases[0]).click();
    } else if (Comp_Shortname != "") {
      document.getElementById("btn_" + Comp_Shortname).click();
    }
  }
}
//#endregion

//#region Event functions
Split({
  columnGutters: [
    {
      track: 1,
      element: document.querySelector(".column_splitter"),
    },
  ],
  columnMinSizes: [300],
  rowMinSize: 50,
  rowGutters: [
    {
      track: 1,
      element: document.querySelector(".row_splitter"),
    },
  ],
});

ExcelPath_drd_btn.addEventListener("click", () => {
  if (excel_path_container.style.display != "block") {
    excel_path_container.style.display = "block";
  } else {
    excel_path_container.style.display = "none";
  }
});

ExcelPath_drd_btn.addEventListener("focusout", () => {
  if (IsInDropdown) return;
  excel_path_container.style.display = "none";
});

browseExcelPath_btn.addEventListener("click", () => {
  let error = "";
  log_tb.innerHTML = "";
  dialog
    .showOpenDialog({
      properties: ["openFile"],
      defaultPath: excel_path.value,
      filters:
      [
        {
          name: "All",
          extensions: ["*"]
        },
        {
          name: "Excel file",
          extensions: ["xls", "xlsx", "xlsm"]
        }
      ]
    })
    .then((result) => {
      if (result && result.canceled === false) {
        excel_path.value = result.filePaths;
        UpdateExcelInfo(excel_path.value);
        let gento = ReadExcelInfo(["GetPathGenerateTo"]);
        gento_path.value = gento;
        error += GetListTestID();
        preview_TestScripts();

        error += Iuclude_path_Dropbox(
          excel_path_container,
          lst_items_excelPath_dropbox,
          result.filePaths.toString()
        );
        error += Iuclude_path_Dropbox(
          gento_path_container,
          lst_items_gentoPath_dropbox,
          gento
        );

        log_tb.innerHTML += error;
      }
    })
    .catch((err) => {
      console.log(err);
      log_tb.innerHTML += err.stack;
    });
});

GenTo_drd_btn.addEventListener("click", () => {
  if (gento_path_container.style.display != "block") {
    gento_path_container.style.display = "block";
  } else {
    gento_path_container.style.display = "none";
  }
});

GenTo_drd_btn.addEventListener("focusout", () => {
  if (IsInDropdown) return;
  gento_path_container.style.display = "none";
});

browsePathtoGen_btn.addEventListener("click", () => {
  let error = "";
  log_tb.innerHTML = "";
  dialog
    .showOpenDialog({
      properties: ["openDirectory"],
      defaultPath: gento_path.value,
    })
    .then((result) => {
      if (result && result.canceled === false) {
        gento_path.value = result.filePaths;
        error += Iuclude_path_Dropbox(
          gento_path_container,
          lst_items_gentoPath_dropbox,
          result.filePaths.toString()
        );
        log_tb.innerHTML += error;
      }
    })
    .catch((err) => {
      console.log(err);
      log_tb.innerHTML += err.stack;
    });
});

preview_btn.addEventListener("click", () => {
  let error = "";
  log_tb.innerHTML = "";
  try {
    error += Iuclude_path_Dropbox(
      excel_path_container,
      lst_items_excelPath_dropbox,
      excel_path.value.toString()
    );
    error += Iuclude_path_Dropbox(
      gento_path_container,
      lst_items_gentoPath_dropbox,
      gento_path.value.toString()
    );

    log_tb.innerHTML += error;
    preview_TestScripts();
  } catch (e) {
    console.log(e.stack);
    log_tb.innerHTML += e.stack.toString();
  }
});

generate_btn.addEventListener("click", () => {
  let err = "";
  let is_mainTest_exist = false;
  try {
    let list_selected_TestID = [];

    err += Iuclude_path_Dropbox(
      excel_path_container,
      lst_items_excelPath_dropbox,
      excel_path.value.toString()
    );
    err += Iuclude_path_Dropbox(
      gento_path_container,
      lst_items_gentoPath_dropbox,
      gento_path.value.toString()
    );
    if (Comp_Shortname != "" && document.getElementById(Comp_Shortname).checked)
      is_mainTest_exist = true;
    list_testcases.forEach((test) => {
      if (document.getElementById(test).checked) {
        list_selected_TestID.push(test);
      }
    });
    if (list_selected_TestID.length === 0) {
      err += "Please select atleast 1 test ID for generating!!\r\n";
      log_tb.innerHTML = err;
      return;
    }
    err += ReadExcelInfo([
      "GenerateTestscripts",
      [list_testcases, list_selected_TestID, gento_path.value],
    ]);
    if (is_mainTest_exist) {
      err += ReadExcelInfo([
        "GenerateMainTestscript",
        [list_selected_TestID, gento_path.value],
      ]);
    }
    log_tb.innerHTML = "Generated in " + gento_path.value + "\r\n";
    console.log(err);
    log_tb.innerHTML += err;
  } catch (e) {
    console.log(e.stack);
    log_tb.innerHTML += e.stack.toString();
  }
});

reload_btn.addEventListener("click", () => {
  let error = "";
  log_tb.innerHTML = "";
  try {
    error += Iuclude_path_Dropbox(
      excel_path_container,
      lst_items_excelPath_dropbox,
      excel_path.value.toString()
    );
    error += Iuclude_path_Dropbox(
      gento_path_container,
      lst_items_gentoPath_dropbox,
      gento_path.value.toString()
    );
    log_tb.innerHTML += error;

    UpdateExcelInfo(excel_path.value);
    error += GetListTestID();
    preview_TestScripts();
  } catch (e) {
    console.log(e.stack);
    log_tb.innerHTML += e.stack.toString();
  }
});

removeall_btn.addEventListener("click", () => {
  let list_testid = list_testID.childNodes;
  try {
    list_testid.forEach((item) => {
      document.getElementById(item.childNodes[1].id).checked = false;
    });
  } catch (e) {}
});

selectall_btn.addEventListener("click", () => {
  let list_testid = list_testID.childNodes;
  try {
    list_testid.forEach((item) => {
      document.getElementById(item.childNodes[1].id).checked = true;
    });
  } catch (e) {}
});

darkmode.addEventListener("change", () => {
  if (darkmode.checked) {
    setTheme("theme-dark");
  } else {
    setTheme("theme-light");
  }
});

function reload_OneTestScript(tabcontent_ID) {
  let TestID = tabcontent_ID.replace("_tab", "");
  let code_id = "preview_" + TestID;
  const codeEl = document.getElementById(code_id);
  UpdateExcelInfo(excel_path.value);
  list_testcases = ReadExcelInfo(["GetListTestcase"]);
  let [lst_testscriptsText, err] = ReadExcelInfo([
    "GetOneTestScriptText",
    [list_testcases, TestID],
  ]);
  codeEl.innerHTML = lst_testscriptsText.replace(/</g, "&lt;");
  Prism.highlightElement(codeEl);
  log_tb.innerHTML = "Reload " + TestID + " Done!!\r\n";
  log_tb.innerHTML += err;
}

function reload_MainTestScript(tabcontent_ID) {
  let TestID = tabcontent_ID.replace("_tab", "");
  let code_id = "preview_" + TestID;
  const codeEl = document.getElementById(code_id);
  let list_selected_TestID = [];
  list_testcases.forEach((test) => {
    if (document.getElementById(test).checked) {
      list_selected_TestID.push(test);
    }
  });
  let [MaintestscriptText, err] = ReadExcelInfo([
    "GetMainTestScriptText",
    [Comp_Shortname, list_selected_TestID],
  ]);
  codeEl.innerHTML = MaintestscriptText.replace(/</g, "&lt;");
  Prism.highlightElement(codeEl);
  log_tb.innerHTML = "Reload " + TestID + " Done!!\r\n";
  log_tb.innerHTML += err;
}

function Resize() {
  let body_contain = document.getElementById("body_contain");
  let display = document.getElementById("display");
  let control = document.getElementById("control");
  let test_id = document.getElementById("test_id");

  body_contain.style.height = (window.innerHeight - 30).toString() + "px";
  display.style.height = (window.innerHeight - 30).toString() + "px";
  control.style.height = (window.innerHeight - 30 - 5).toString() + "px";
  test_id.style.height =
    (window.innerHeight - 136 - 36.5 - 20 - 30).toString() + "px";
}

function openTab(evt, tabName) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}

function select_dropboxItem(item_title, selecteditem) {
  let dropdown_container = item_title.parentElement;
  dropdown_container.style.display = "none";
  document.getElementById(
    dropdown_container.id.replace("_container", "_input")
  ).value = selecteditem.textContent;
  dropdown_container.removeChild(item_title);
  dropdown_container.prepend(item_title);
}

function CheckHover_Dropdowncontainer(Isin) {
  IsInDropdown = Isin;
}

function setTheme(themeName) {
  localStorage.setItem("theme", themeName);
  document.documentElement.className = themeName;
  if (themeName === "theme-light")
    titlebar.updateBackground(customTitlebar.Color.fromHex("#ffffff"));
  else titlebar.updateBackground(customTitlebar.Color.fromHex("#252526"));
}

// function to toggle between light and dark theme
function initTheme() {
  if (localStorage.getItem("theme") === "theme-dark") {
    setTheme("theme-dark");
    darkmode.checked = true;
  } else {
    setTheme("theme-light");
    darkmode.checked = false;
  }
}

// Immediately invoked function on initial load
Resize();
initTheme();

//Subcribes for using funcs in html view
window.Resize = Resize;
window.openTab = openTab;
window.reload_OneTestScript = reload_OneTestScript;
window.reload_MainTestScript = reload_MainTestScript;
window.select_dropboxItem = select_dropboxItem;
window.CheckHover_Dropdowncontainer = CheckHover_Dropdowncontainer;

//#endregion
