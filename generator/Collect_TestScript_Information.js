const { readFile, utils } = require("xlsx");

import {
  TestScript,
  Generate_TestScript,
  MainTestScript,
  Generate_MainTestScript,
  Update_Dict,
  Update_OverviewInfo,
} from "./Generator.js";
import {
  TestId,
  Test_Descr,
  Directive,
  Signal1,
  Signal2,
  Operand,
  Value,
  Options,
} from "./Config.js";
import {
  clone,
  Get_increase,
  Get_decrease,
  Difference,
  IsDefined,
  Is_OnlySpaces,
  SubStringBetween,
  xlstojson_custom,
} from "./Other_Function.js";
export {
  Get_TestScripts,
  split_TestScript_func,
  getTestGroup,
  getTestSubGroup,
  getAllKeyWords,
  getAllGroup_func,
  Get_OverviewInfo,
  GetTestIDs,
  GetStructEnumInfo,
  UpdateExcelInfo,
  ReadExcelInfo,
};

String.prototype.SubStringBetween = SubStringBetween;
Number.prototype.Get_decrease = Get_decrease;
Number.prototype.Get_increase = Get_increase;

let ExcelInfo = [];

function getAllKeyWords(args) {
  const [data, title, casesensitive] = args;
  let new_lst = [];
  data.forEach((item) => {
    if (!casesensitive) item[title] = item[title].toLowerCase();
    if (
      (new_lst.length === 0 || new_lst.indexOf(item[title]) === -1) &&
      !Is_OnlySpaces(item[title])
    ) {
      new_lst.push(item[title]);
    }
  });
  return new_lst;
}

function GetTestIDs(data) {
  let TestIDs_Region = data.SubStringBetween("Test ID,", "Comments");
  let TestIDs = TestIDs_Region.split(",");
  return TestIDs;
}

function getTestGroup(args) {
  const [data, value, field, lst_TestGroup] = args;
  let new_lst = [];
  let is_testRegion = false;
  data.forEach((element) => {
    if (IsDefined(element[field])) {
      if (is_testRegion) {
        if (
          lst_TestGroup.findIndex(
            (item) => item.toLowerCase() === element[field].toLowerCase()
          ) === -1
        )
          new_lst.push(element);
        else is_testRegion = false;
      }
      if (element[field].toLowerCase() === value.toLowerCase()) {
        is_testRegion = true;
      }
    }
  });
  return new_lst;
}

function getTestSubGroup(args) {
  const [data, value, field] = args;
  var tmplst = clone(data);
  let new_lst = [];
  tmplst.forEach((element) => {
    if (element[field].toLowerCase() === value.toLowerCase()) {
      delete element[field];
      new_lst.push(element);
    }
  });
  return new_lst;
}

function getAllGroup_func(args) {
  const [mode, data, list_keywords, field, startindex] = args;
  let new_lst = [];
  var invert_index = Difference(
    startindex,
    list_keywords.length.Get_decrease()
  );
  if (startindex < list_keywords.length.Get_decrease()) {
    new_lst = split_TestScript_func(getAllGroup_func, [
      mode,
      data,
      list_keywords,
      field,
      startindex.Get_increase(),
    ]);
  }
  new_lst[list_keywords[invert_index]] = split_TestScript_func(mode, [
    data,
    list_keywords[invert_index],
    field,
    list_keywords,
  ]);
  return new_lst;
}

function split_TestScript_func(func, args) {
  return func(args);
}

function Get_TestScripts(data, list_testcases) {
  let _testscripts_lst = [];
  _testscripts_lst = split_TestScript_func(getAllGroup_func, [
    getTestGroup,
    data,
    list_testcases,
    TestId,
    0,
  ]);
  return _testscripts_lst;
}

function Get_OverviewInfo(data) {
  const List_Info = {
    Component: "",
    "Component Shortcut": "",
    Author: "",
    Output: "",
    Report: "",
    Date: "",
    Release: "",
  };
  if (data[data.length.Get_decrease()] === "\n")
    data = data.substring(0, data.length.Get_decrease());
  let Split_rows = data.split("\n");
  Split_rows.forEach((item) => {
    let Split_colums = item.split(",");
    List_Info[Split_colums[0]] = Split_colums[1];
  });
  return List_Info;
}

function GetStructEnumInfo(data) {
  let list_name = split_TestScript_func(getAllKeyWords, [data, "Name", false]);
  return split_TestScript_func(getAllGroup_func, [
    getTestSubGroup,
    data,
    list_name,
    "Name",
    0,
  ]);
}

function UpdateExcelInfo(file) {
  var wb = readFile(file);
  ExcelInfo["TestSpec"] = wb.Sheets["TestSpec"];
  ExcelInfo["Help"] = wb.Sheets["Help"];
  ExcelInfo["Struct-Enum"] = wb.Sheets["Struct-Enum"];
  ExcelInfo["Overview"] = wb.Sheets["Overview"];
  ExcelInfo["Requirements"] = wb.Sheets["Requirements"];
  ExcelInfo["Compare"] = wb.Sheets["Compare"];
}

function ReadExcelInfo(args) {
  const [func, func_args] = args;
  return eval(func)(func_args);
}

function GetListTestcase() {
  var data = utils.sheet_to_csv(ExcelInfo["Requirements"], {
    blankrows: false,
  });
  return GetTestIDs(data.split("\n")[0]).filter((testid) => testid != "");
}

function GetPathGenerateTo() {
  var old_ref = ExcelInfo["Overview"]["!ref"].split(":");
  ExcelInfo["Overview"]["!ref"] = "B3:C12";
  let lst = Get_OverviewInfo(
    utils.sheet_to_csv(ExcelInfo["Overview"], { blankrows: false })
  );
  ExcelInfo["Overview"]["!ref"] = old_ref.join(":");
  return lst["Output"];
}

function GetCompShortName() {
  var old_ref = ExcelInfo["Overview"]["!ref"].split(":");
  ExcelInfo["Overview"]["!ref"] = "B3:C12";
  let lst = Get_OverviewInfo(
    utils.sheet_to_csv(ExcelInfo["Overview"], { blankrows: false })
  );
  ExcelInfo["Overview"]["!ref"] = old_ref.join(":");
  return [lst["Component Shortcut"]];
}

function GetInfo(lst_testID) {
  let Grouped_TestID_Content = Get_TestScripts(
    utils.sheet_to_json(ExcelInfo["TestSpec"]),
    lst_testID
  );
  let old_ref_structenum = ExcelInfo["Struct-Enum"]["!ref"].split(":");
  ExcelInfo["Struct-Enum"]["!ref"] = [
    "A2",
    old_ref_structenum[1].replace("G", "C"),
  ].join(":");
  let _struct = GetStructEnumInfo(
    utils.sheet_to_json(ExcelInfo["Struct-Enum"])
  );

  ExcelInfo["Struct-Enum"]["!ref"] = ["E2", old_ref_structenum[1]].join(":");
  let _enum = GetStructEnumInfo(utils.sheet_to_json(ExcelInfo["Struct-Enum"]));
  ExcelInfo["Struct-Enum"]["!ref"] = old_ref_structenum.join(":");

  Update_Dict([
    xlstojson_custom(ExcelInfo["Help"], "Function Directive", "Gen tool func"),
    xlstojson_custom(
      ExcelInfo["Help"],
      "Datatype Directive",
      "Gen tool datatype"
    ),
    xlstojson_custom(ExcelInfo["Help"], "Gen tool func", "Datatype Directive"),
    xlstojson_custom(ExcelInfo["Help"], "Gen tool datatype"),
    _struct,
    _enum,
    utils.sheet_to_json(ExcelInfo["Compare"]),
  ]);

  let old_ref_overview = ExcelInfo["Overview"]["!ref"].split(":");
  ExcelInfo["Overview"]["!ref"] = "B3:C12";
  Update_OverviewInfo(
    Get_OverviewInfo(
      utils.sheet_to_csv(ExcelInfo["Overview"], { blankrows: false })
    )
  );

  ExcelInfo["Overview"]["!ref"] = ["A16", old_ref_overview[1]].join(":");
  let data_regression = utils.sheet_to_json(ExcelInfo["Overview"], {
    raw: false,
  });
  ExcelInfo["Overview"]["!ref"] = old_ref_overview.join(":");
  let data_requirement = utils.sheet_to_json(ExcelInfo["Requirements"]);
  return [Grouped_TestID_Content, data_regression, data_requirement];
}

function GetAllTestScriptText(lst_testID) {
  let lst_testscripts = [];
  let err = "";
  let [Grouped_TestID_Content, data_regression, data_requirement] = GetInfo(
    lst_testID
  );
  lst_testID.forEach((el) => {
    let [testscript, tmp_err] = TestScript(
      el,
      Grouped_TestID_Content,
      data_regression,
      data_requirement
    );
    lst_testscripts[el] = testscript;
    if (tmp_err != "") {
      console.log(`${el}: \r\n${tmp_err}`);
      err += `${el}: \r\n${tmp_err}\r\n`;
    }
  });

  return [lst_testscripts, err];
}

function GetOneTestScriptText(args) {
  const [lst_testID, testID_gen] = args;
  let err = "";
  let [Grouped_TestID_Content, data_regression, data_requirement] = GetInfo(
    lst_testID
  );
  let [testscript, tmp_err] = TestScript(
    testID_gen,
    Grouped_TestID_Content,
    data_regression,
    data_requirement
  );
  if (tmp_err != "") {
    console.log(`${testID_gen}: \r\n${tmp_err}`);
    err = `${testID_gen}: \r\n${tmp_err}\r\n`;
  }

  return [testscript, err];
}

function GenerateTestscripts(args) {
  const [lst_testID, lsi_testID_gen, Output] = args;
  let err = "";
  let [Grouped_TestID_Content, data_regression, data_requirement] = GetInfo(
    lst_testID
  );
  lsi_testID_gen.forEach((el) => {
    let tmp_err = Generate_TestScript(
      el,
      Grouped_TestID_Content,
      data_regression,
      data_requirement,
      Output
    );
    if (tmp_err != "") {
      console.log(`${el}: \r\n${tmp_err}`);
      err += `${el}: \r\n${tmp_err}\r\n`;
    }
  });

  return err;
}

function GetMainTestScriptText(args) {
  const [comp_shortname, testIDs_gen] = args;
  let err = "";

  let old_ref_overview = ExcelInfo["Overview"]["!ref"].split(":");
  ExcelInfo["Overview"]["!ref"] = "B3:C12";
  Update_OverviewInfo(
    Get_OverviewInfo(
      utils.sheet_to_csv(ExcelInfo["Overview"], { blankrows: false })
    )
  );

  ExcelInfo["Overview"]["!ref"] = old_ref_overview.join(":");
  let [maintestscript, tmp_err] = MainTestScript(testIDs_gen);
  if (tmp_err != "") {
    console.log(`${comp_shortname}: \r\n${tmp_err}`);
    err = `${comp_shortname}: \r\n${tmp_err}\r\n`;
  }

  return [maintestscript, err];
}

function GenerateMainTestscript(args) {
  const [lsi_testID_gen, Output] = args;
  let err = "";
  let old_ref_overview = ExcelInfo["Overview"]["!ref"].split(":");
  ExcelInfo["Overview"]["!ref"] = "B3:C12";
  Update_OverviewInfo(
    Get_OverviewInfo(
      utils.sheet_to_csv(ExcelInfo["Overview"], { blankrows: false })
    )
  );
  ExcelInfo["Overview"]["!ref"] = old_ref_overview.join(":");

  err = Generate_MainTestScript(lsi_testID_gen, Output);
  if (err != "") {
    console.log(`${el}: \r\n${err}`);
  }

  return err;
}
