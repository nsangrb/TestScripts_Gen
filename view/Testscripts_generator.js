import {
  split_TestScript_func,
  getTestGroup,
  Get_TestScripts,
  Get_OverviewInfo,
  GetTestIDs,
  GetStructEnumInfo,
  UpdateExcelInfo,
  ReadExcelInfo,
} from "../generator/Collect_TestScript_Information.js";

var Split = require("split-grid");

const { dialog } = require("electron").remote;

const pre_code_template = [
  '<div id="%ID%_tab" class="tabcontent">',
  '<span onclick="reload_OneTestScript(this.parentElement.id)"' +
    " class=" +
    '"topleft"' +
    "></span>",
  '<pre class="line-numbers language-C++">',
  '<code id="preview_%ID%">',
  "%CODE%",
  "</code>",
  "</pre>",
  "</div>",
].join("\r\n");

const button_tab = [
  "<button class=",
  "tablinks",
  " onclick=",
  "openTab(event, '%ID%_tab')",
  " id=",
  "btn_%ID%",
  ">%ID%</button>",
].join('"');

const gento_path = document.getElementById("gento_path");
const browsePathtoGen_btn = document.getElementById("browsePathtoGen_btn");
const excel_path = document.getElementById("excel_path");
const browseExcelPath_btn = document.getElementById("browseExcelPath_btn");
const list_testID = document.getElementById("list_testID");
const reload_btn = document.getElementById("reload_btn");
const removeall_btn = document.getElementById("removeall_btn");
const selectall_btn = document.getElementById("selectall_btn");
const generate_btn = document.getElementById("generate_btn");
const log_tb = document.getElementById("log_tb");
const tabs = document.getElementById("tabs");
const preview_btn = document.getElementById("preview_btn");
const preview = document.getElementById("preview");

let list_testcases = [];

function GetListTestID() {
  list_testcases = ReadExcelInfo(["GetListTestcase"]);
  let gento = ReadExcelInfo(["GetPathGenerateTo"]);

  while (list_testID.hasChildNodes()) {
    list_testID.removeChild(list_testID.firstChild);
  }
  list_testcases.forEach((item) => {
    let label = document.createElement("label");
    label.classList.add("togglebutton_type2");
    label.textContent = item;
    let input = document.createElement("input");
    input.type = "checkbox";
    input.checked = true;
    input.id = item;
    let span = document.createElement("span");
    span.classList.add("checkmark_type2");
    label.appendChild(input);
    label.appendChild(span);
    list_testID.appendChild(label);
  });
}

function reload_OneTestScript(tabcontent_ID) {
  let TestID = tabcontent_ID.replace("_tab", "");
  let code_id = "preview_" + TestID;
  const codeEl = document.getElementById(code_id);
  UpdateExcelInfo(excel_path.value);
  let [lst_testscriptsText, err] = ReadExcelInfo([
    "GetOneTestScriptText",
    [list_testcases, TestID],
  ]);
  codeEl.innerHTML = lst_testscriptsText;
  Prism.highlightElement(codeEl);
  log_tb.innerHTML = err;
}

function preview_TestScripts() {
  if (document.getElementById("preview_toggle").checked === true) {
    while (tabs.hasChildNodes()) {
      tabs.removeChild(tabs.firstChild);
    }
    while (preview.hasChildNodes()) {
      preview.removeChild(preview.firstChild);
    }
    let [lst_testscriptsText, err] = ReadExcelInfo([
      "GetAllTestScriptText",
      list_testcases,
    ]);
    log_tb.innerHTML = err;
    list_testcases.forEach((item) => {
      tabs.innerHTML += button_tab.replace(/%ID%/g, item) + "\r\n";
      preview.innerHTML += pre_code_template
        .replace(/%ID%/g, item)
        .replace("%CODE%", lst_testscriptsText[item]);
      const preview_tb = document.getElementById("preview_" + item);
      Prism.highlightElement(preview_tb);
    });
    if (list_testcases.length > 0) {
      document.getElementById("btn_" + list_testcases[0]).click();
    }
  } else {
    while (tabs.hasChildNodes()) {
      tabs.removeChild(tabs.firstChild);
    }
    while (preview.hasChildNodes()) {
      preview.removeChild(preview.firstChild);
    }
  }
}
browseExcelPath_btn.addEventListener("click", () => {
  dialog
    .showOpenDialog({
      properties: ["openFile"],
      defaultPath: excel_path.value,
    })
    .then((result) => {
      if (result && result.canceled === false) {
        excel_path.value = result.filePaths;
        UpdateExcelInfo(excel_path.value);
        let gento = ReadExcelInfo(["GetPathGenerateTo"]);
        gento_path.value = gento;
        GetListTestID();
        preview_TestScripts();
      }
    })
    .catch((err) => {
      console.log(err);
      log_tb.innerHTML += err.stack;
    });
});

browsePathtoGen_btn.addEventListener("click", () => {
  dialog
    .showOpenDialog({
      properties: ["openDirectory"],
      defaultPath: gento_path.value,
    })
    .then((result) => {
      if (result && result.canceled === false) {
        gento_path.value = result.filePaths;
      }
    })
    .catch((err) => {
      console.log(err);
      log_tb.innerHTML = err.stack;
    });
});

preview_btn.addEventListener("click", () => {
  try {
    preview_TestScripts();
  } catch (e) {
    console.log(e.stack);
    log_tb.innerHTML = e.stack.toString();
  }
});

generate_btn.addEventListener("click", () => {
  let err = "";
  try {
    let list_selected_TestID = [];
    list_testcases.forEach((test) => {
      if (document.getElementById(test).checked) {
        list_selected_TestID.push(test);
      }
    });
    if (list_selected_TestID.length === 0) {
      log_tb.innerHTML = "Please select atleast 1 test ID for generating!!\r\n";
      return;
    }
    err = ReadExcelInfo([
      "GenerateTestscripts",
      [list_testcases, list_selected_TestID, gento_path.value],
    ]);
    console.log(err);
    log_tb.innerHTML = err;
  } catch (e) {
    console.log(e.stack);
    log_tb.innerHTML = e.stack.toString();
  }
});

reload_btn.addEventListener("click", () => {
  try {
    UpdateExcelInfo(excel_path.value);
    GetListTestID();
    preview_TestScripts();
  } catch (e) {
    console.log(e.stack);
    log_tb.innerHTML = e.stack.toString();
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

window.Resize = Resize;
window.openTab = openTab;
window.reload_OneTestScript = reload_OneTestScript;
