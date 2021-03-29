const packages = require("fs");
const path = require("path");
import {
  clone,
  Get_increase,
  Get_decrease,
  Difference,
  IsDefined,
  IsString,
  IsNumber,
  IsPointer,
  ReplaceGlobally,
  Upper_1st,
  Check_Array,
} from "./Other_Function.js";
import {
  split_TestScript_func,
  getTestGroup,
  getTestSubGroup,
  getAllKeyWords,
  getAllGroup_func,
} from "./Collect_TestScript_Information.js";
import {
  TestId,
  Test_Descr,
  Directive,
  Signal1,
  Signal2,
  Operand,
  Value,
  Options,
  Line,
  Testmatrix_args_template,
  StructTestMatrix_template,
  Testscript_split_region,
  Regression_region,
} from "./Config.js";

export {
  TestScript,
  Generate_TestScript,
  MainTestScript,
  Generate_MainTestScript,
  Update_Dict,
  Update_OverviewInfo,
};

String.prototype.ReplaceGlobally = ReplaceGlobally;
Number.prototype.Get_decrease = Get_decrease;

const { readFileSync, writeFile } = packages;

const testmatrix_default = {
  teststepsubsection: "",
  textwhenbppassed: "OK",
  textwhenbpfailed: "NOT ok",
  setbpfunction: "",
  setsourcetestpoint: "",
  sourcetestpointpos: "0",
  setbpline: "0",
  setbpfile: "",
  setnegativebpline: "0",
  setnegativebpfile: "",
  microstep_en: "en_MSCompleteTeststep",
};

const List_replace_keywords = [
  "%NAME%",
  "%REQUIREMENT%",
  "%TEST_DESCR%",
  "%TEST_DESIGN%",
  "%AUTHOR%",
  "%REPORT_PATH%",
  "%DATE%",
  "%RELEASE%",
  "%REGRESSION%",
  "%INCLUDES%",
  "%GLOBAL_VARS%",
  "%INTERNAL_VARS%",
  "%TEST_MATRIX%",
  "%TEST_REGION%",
];

const List_replace_mainTest_keywords = [
  "%INCLUDES%",
  "%COMP%",
  "%COMPONENT%",
  "%TEST_IDS%",
];

const List_Overview_Info = {
  Component: "",
  "Component Shortcut": "",
  Author: "",
  Output: "",
  Report: "",
  Date: "",
  Release: "",
};

let Dicts = [];
let Struct_Dict = [];
let Enum_Dict = [];
let Compare_Dict = [];

//#region INCLUDES GENERATOR
function includes_gen(data) {
  let includes = "";
  let err = "";
  for (var index in data) {
    let item = data[index];
    try {
      if (item[Directive].toLowerCase() === "include") {
        if (IsDefined(item[Value])) {
          includes += `\t#include ${item[Value]}\r\n`;
        } else {
          err += `Line ${item[Line]}: Please include your path when using "#include"\r\n`;
          continue;
        }
      } else {
        err += `Line ${item[Line]}: Please use Directive "include" when using "#include"\r\n`;
        continue;
      }
    } catch (e) {
      err += `Line ${item[Line]}: ${e.toString()}\r\n`;
    }
  }
  return [includes, err];
}

//#endregion

//#region DESCR GENERATOR
function testdescr_gen(data) {
  let testdescr = "";
  let err = "";
  if (data.length > 1)
    return [testdescr, "Testcase has to have only 1 test descr.\r\n"];
  for (var index in data) {
    let item = data[index];
    if (IsDefined(item[Test_Descr])) {
      testdescr += item[Test_Descr].replace(/\r\n/g, " ");
    } else {
      err += `Line ${item[Line]}: Please define Test descr in field 'Test Step Descriptions and Comments'\r\n`;
      continue;
    }
  }
  return [testdescr, err];
}
//#endregion

//#region TEST DESIGN GENERATOR
function testdesign_gen(data) {
  let testdesign = "";
  let err = "";
  if (data.length > 1)
    return [testdesign, "Testcase has to have only 1 test descr.\r\n"];
  for (var index in data) {
    let item = data[index];
    if (IsDefined(item[Test_Descr])) {
      testdesign += item[Test_Descr];
    } else {
      err += `Line ${item[Line]}: Please define Test design in field 'Test Step Descriptions and Comments'\r\n`;
      continue;
    }
  }
  return [testdesign, err];
}
//#endregion

//#region TESTMATRIX GENERATOR
function testmatrix_gen(data) {
  let testmatrix = "";
  let err = "";
  let testmatrix_st_array = [];
  let list_of_index_testmatrix = split_TestScript_func(getAllKeyWords, [
    data,
    Directive,
    true,
  ]);
  let testmatrix_args_template = Testmatrix_args_template;
  let testmatrix_struct_template = StructTestMatrix_template;
  list_of_index_testmatrix.sort(function (a, b) {
    return a - b;
  });
  for (var i in list_of_index_testmatrix) {
    if (list_of_index_testmatrix[i] != i) {
      err += `Missing index ${i} in Testmatrix\r\n`;
      break;
    }
    let tmp = [];
    data.forEach((item) => {
      if (item[Directive] === list_of_index_testmatrix[i]) {
        delete item[Directive];
        tmp.push(item);
      }
    });
    testmatrix_st_array.push(tmp);
  }

  for (var index in testmatrix_st_array) {
    let element = testmatrix_st_array[index];
    let str = testmatrix_args_template.replace("%index%", index);
    let list_args = split_TestScript_func(getAllKeyWords, [
      element,
      Signal1,
      false,
    ]);
    let remaining_default_args = Object.keys(testmatrix_default).filter(
      (item) => !list_args.includes(item)
    );

    if (list_args.length != element.length) {
      err += `Some duplicated agrs in testmatrix_X[${index}]\r\n`;
      continue;
    }
    list_args.forEach((item) => {
      if (item === "teststepsubsection") {
        str = str.replace(
          `%${item}%`,
          element.filter((signal1) => signal1[Signal1] === item)[0][Test_Descr]
        );
      } else {
        str = str.replace(
          `%${item}%`,
          element.filter((signal1) => signal1[Signal1] === item)[0][Value]
        );
      }
    });
    remaining_default_args.forEach((item) => {
      str = str.replace(`%${item}%`, testmatrix_default[item]);
    });
    testmatrix += str;
    if (
      element != testmatrix_st_array[testmatrix_st_array.length.Get_decrease()]
    )
      testmatrix += ",\r\n";
  }

  testmatrix = testmatrix_struct_template.ReplaceGlobally(
    ["%TESTMATRIX%", "%CNT%"],
    [testmatrix, testmatrix_st_array.length]
  );

  return [testmatrix, err];
}
//#endregion

//#region  TESTCASE_GENERATOR
function Find_match_dict(data) {
  let directiveinfo = [];
  let type = "";
  let _cntDefined = 0;
  Object.keys(Dicts).forEach((dict) => {
    let tmp_directiveinfo = Dicts[dict].filter(
      (item) => item[Directive].toLowerCase() === data[Directive].toLowerCase()
    );
    if (tmp_directiveinfo.length > 0) {
      type = dict;
      directiveinfo = tmp_directiveinfo;
      _cntDefined++;
    }
  });

  if (_cntDefined === 0) {
    return `Line ${data[Line]}: Directive "${data[Directive]}" NOT match with Help sheet`;
  }
  if (_cntDefined > 1) {
    return `Line ${data[Line]}: Redefinition of Directive "${data[Directive]}", please check Help sheet!!`;
  }

  for (var index in directiveinfo) {
    let element = directiveinfo[index];
    let require_fields = Object.keys(element).filter(
      (item) => item != Directive && item != "PATTERN" && item != "Comment"
    );
    let data_fields = Object.keys(data).filter(
      (item) => item != Directive && item != Test_Descr && item != Line
    );
    var is_match = true;
    if (data_fields.length != require_fields.length) {
      is_match = false;
      continue;
    }
    data_fields.forEach((e) => {
      if (!require_fields.includes(e)) is_match = false;
    });
    if (is_match) return [element, type];
  }
  return `Line ${data[Line]}: Directive "${data[Directive]}" NOT match with Help sheet`;
}
function generate_var(element, Dict, variables) {
  let global_variables = "";
  let internal_variables = "";
  if (!variables.includes(element[Signal1])) variables.push(element[Signal1]);
  else {
    return `Line ${element[Line]}: Variable "${element[Signal1]}" redefinition\r\n`;
  }
  let fields = Object.keys(element).filter((item) => item != Options);

  let variable_template = Dict["PATTERN"];
  fields.forEach((field) => {
    variable_template = variable_template
      .split("%" + field + "%")
      .join(element[field]).replace(/\r\n/g,"\r\t");
  });
  if (element[Options] === "global") {
    global_variables = `\t${variable_template}\r\n`;
  } else if (element[Options] === "internal") {
    internal_variables = `\t${variable_template}\r\n`;
  } else {
    return `Line ${element[Line]}: Please choose correct "Options" for Variable "${element[Signal1]}"\r\n`;
  }
  return [global_variables, internal_variables];
}

function generate_func(element, Dict, variables_defined, tabs) {
  let internal_variables = "";
  let Testgen = "";
  if (IsDefined(element[Test_Descr])) {
    Testgen = `${tabs}func_testStepSubSection("${element[Test_Descr]}");\r\n`;
  }
  if (
    ["end", "endwihle", "endfor", "endif", "else", "elseif"].includes(
      element[Directive].toLowerCase()
    )
  )
    tabs = tabs.replace("\t", "");
  if (IsDefined(Dict["Comment"])) {
    let spl_str = Dict["Comment"].split("|");
    if (spl_str.length === 3) {
      if (!variables_defined.includes(element[Options])) {
        variables_defined.push(element[Options]);
        internal_variables = `\t${spl_str[1]} ${element[Options]};\r\n`;
      }
    } else if (spl_str.length === 4){
      if (!variables_defined.includes(spl_str[1])) {
        variables_defined.push(spl_str[1]);
        internal_variables = `\t${spl_str[2]} ${spl_str[1]};\r\n`;
      }
    }
  }
  let fields = Object.keys(element);
  let function_template = Dict["PATTERN"];
  fields.forEach((field) => {
    function_template = function_template.ReplaceGlobally(
      ["\r\n", `%${field}%`],
      ["\r" + tabs, element[field]]
    );
  });
  Testgen += tabs + function_template + "\r\n";
  if (
    ["while", "for", "if", "else", "elseif"].includes(
      element[Directive].toLowerCase()
    )
  )
    tabs += "\t";
  return [Testgen, internal_variables, tabs];
}

function generate_enum_array(variables_defined, enum_name) {
  let internal_variables = "";
  let err = "";
  if (!variables_defined.includes(enum_name + "_value")) {
    variables_defined.push(enum_name + "_value");
    let zero_el = "";
    let internal_variables_arr = [];
    internal_variables = `\tint ${enum_name}_value[${Enum_Dict[enum_name].length}] = {\r\n`;
    for (var index in Enum_Dict[enum_name]) {
      let el = Enum_Dict[enum_name][index];
      if (!IsDefined(el["Element"])) {
        err = `Please define enough elements in Enum "${enum_name}"\r\n`;
        return err;
      }
      if (!IsDefined(el["Value"])) {
        err = `Please define enough value in Enum "${enum_name}"\r\n`;
        return err;
      }
      if (el[Value] == 0) {
        zero_el = `\t\t0,\t//${el["Element"]}`;
        continue;
      }
      internal_variables_arr.push(`\t\t${el["Value"]},\t//${el["Element"]}`);
    }
    if (zero_el != "") internal_variables_arr.push(zero_el);
    internal_variables_arr[
      internal_variables_arr.length - 1
    ] = internal_variables_arr[internal_variables_arr.length - 1].replace(
      ",",
      " "
    );
    internal_variables += internal_variables_arr.join("\r\n") + "\r\n\t};\r\n";
  }
  return [internal_variables];
}

function handle_special_var(element, vars_type, variables_defined) {
  let result = "";
  let err = "";
  let data_type = "";
  if (element[Directive].toLowerCase() === "args") {
    data_type = "args";
  } else if (IsDefined(Struct_Dict[element[Options].toLowerCase()])) {
    data_type = "struct";
  } else if (IsDefined(Enum_Dict[element[Options].toLowerCase()])) {
    data_type = "enum";
  } else {
    let normal_datatype = Compare_Dict.find(
      (_var) =>
        _var["DataType"].toLowerCase() === element[Options].toLowerCase()
    );
    if (IsDefined(normal_datatype)) data_type = "var";
  }

  if (data_type === "") {
    err = `Line ${element[Line]}: Datatype "${element[Options]}" is NOT defined\r\n`;
    return err;
  }
  if (IsDefined(vars_type[element[Signal1]])) {
    err = `Line ${element[Line]}: Variable "${element[Signal1]}" redefinition\r\n`;
    return err;
  }

  vars_type[element[Signal1]] =
    element[Options].toLowerCase() + "|" + data_type;

  if (data_type === "enum") {
    result = generate_enum_array(
      variables_defined,
      element[Options].toLowerCase()
    );
  }
  return result;
}

function var_gen(
  varname,
  datatype,
  func,
  tabs,
  list_of_datatype,
  variables_defined,
  Isinit
) {
  let vars = "";
  let internal_variables = "";
  let value_compare = "";
  let index_level = (tabs.match(/\t/g) || []).length - 1;
  let find_result = Compare_Dict.find((item) => item["DataType"] === datatype);
  if (!IsDefined(find_result)) {
    return `  NOT defined Datatype "${datatype}" in Compare sheet and Struct-Enum sheet!!\r\n`;
  }
  if (!IsDefined(find_result[func])) {
    return `  NOT defined field "${func}" for Datatype "${datatype}"!! Please check Compare sheet!!\r\n`;
  }
  if (!IsDefined(find_result["Compare"])) {
    return `  NOT defined field "Compare" for Datatype "${datatype}"!! Please check Compare sheet!!\r\n`;
  }
  let Function = find_result[func];
  let regex = /%(?<cnt>[0-9])/g;
  let max_index = Number(regex.exec(find_result["Compare"]).groups.cnt);
  let _idx = "";
  if (!IsDefined(list_of_datatype[datatype])) list_of_datatype[datatype] = 0;
  if (list_of_datatype[datatype] === 0) {
    _idx = "%MAIN_IDX%";
  } else {
    _idx = `%MAIN_IDX%+${list_of_datatype[datatype]}`;
  }
  if (IsNumber(Isinit)) {
    value_compare = Isinit;
  } else {
    value_compare = find_result["Compare"].replace("%INDEX%", _idx);
  }
  list_of_datatype[datatype] = (list_of_datatype[datatype] + 1) % max_index;

  let [signal, array_cnt] = Check_Array(varname);
  let snprintf_args = signal;
  if (IsPointer(signal)) {
    snprintf_args = "(" + signal + ")";
  }
  if (array_cnt > 1) {
    if (!variables_defined.includes("arr_index_" + index_level)) {
      variables_defined.push("arr_index_" + index_level);
      internal_variables += `\tint arr_index_${index_level};\r\n`;
    }
    vars += `${tabs}for (arr_index_${index_level} = 0; arr_index_${index_level} < ${array_cnt}; arr_index_${index_level}++) {\r\n`;
    tabs += "\t";
    index_level++;
    snprintf_args += "[%d]";
  }
  snprintf_args = '"' + snprintf_args + '"';
  let cnt_index = (snprintf_args.match(/\[%d\]/g) || []).length;
  if (cnt_index > 0) {
    for (var i = cnt_index; i > 0; i--) {
      snprintf_args += `, arr_index_${index_level - i}`;
    }
    vars += `${tabs}snprintf(chTemp,1024,${snprintf_args});\r\n`;
    vars += `${tabs}${Function}(chTemp, ${value_compare});\r\n`;
    if (array_cnt > 1) {
      tabs = tabs.replace("\t", "");
      vars += `${tabs}}\r\n`;
      index_level--;
    }
  } else {
    vars += `${tabs}${Function}("${signal}", ${value_compare});\r\n`;
  }
  return [vars, internal_variables, max_index];
}

function enum_gen(
  varname,
  datatype,
  func,
  tabs,
  list_of_datatype,
  variables_defined,
  Isinit
) {
  let err = "";
  let enums = "";
  let internal_variables = "";
  let Function = "";
  let value_compare = "";
  let index_level = (tabs.match(/\t/g) || []).length - 1;
  let result = generate_enum_array(variables_defined, datatype);
  if (IsString(result)) {
    err = result;
    return `  ${err}`;
  }
  internal_variables += result[0];
  let _idx = "";
  if (!IsDefined(list_of_datatype[datatype])) list_of_datatype[datatype] = 0;
  if (list_of_datatype[datatype] === 0) {
    _idx = "%MAIN_IDX%";
  } else {
    _idx = `%MAIN_IDX%+${list_of_datatype[datatype]}`;
  }

  let max_index = Enum_Dict[datatype].length;

  if (func === "Check") Function = "funcIDE_ReadVariableAndCheck";
  else if (func === "Set") Function = "funcIDE_WriteVariable";

  if (IsNumber(Isinit)) {
    value_compare = Isinit;
  } else {
    value_compare = `${datatype}_value[(${_idx})%${max_index}]`;
  }
  list_of_datatype[datatype] = (list_of_datatype[datatype] + 1) % max_index;

  let [signal, array_cnt] = Check_Array(varname);
  let snprintf_args = signal;
  if (IsPointer(signal)) {
    snprintf_args = "(" + signal + ")";
  }
  if (array_cnt > 1) {
    if (!variables_defined.includes("arr_index_" + index_level)) {
      variables_defined.push("arr_index_" + index_level);
      internal_variables += `\tint arr_index_${index_level};\r\n`;
    }
    enums += `${tabs}for (arr_index_${index_level} = 0; arr_index_${index_level} < ${array_cnt}; arr_index_${index_level}++) {\r\n`;
    tabs += "\t";
    index_level++;
    snprintf_args += "[%d]";
  }
  snprintf_args = '"' + snprintf_args + '"';
  let cnt_index = (snprintf_args.match(/\[%d\]/g) || []).length;
  if (cnt_index > 0) {
    for (var i = cnt_index; i > 0; i--) {
      snprintf_args += `, arr_index_${index_level - i}`;
    }
    enums += `${tabs}snprintf(chTemp,1024,${snprintf_args});\r\n`;
    enums += `${tabs}${Function}(chTemp, ${value_compare});\r\n`;
    if (array_cnt > 1) {
      tabs = tabs.replace("\t", "");
      enums += `${tabs}}\r\n`;
      index_level--;
    }
  } else {
    enums += `${tabs}${Function}("${signal}", ${value_compare});\r\n`;
  }
  return [enums, internal_variables, max_index];
}

function struct_gen(
  varname,
  datatype,
  func,
  tabs,
  list_of_datatype,
  variables_defined,
  Isinit
) {
  let err = "";
  let struct = "";
  let internal_variables = "";
  let struct_info = Struct_Dict[datatype];
  let [signal, array_cnt] = Check_Array(varname);
  let template_signal = signal;
  let max_index = 0;

  if (IsPointer(signal)) {
    template_signal = "(" + template_signal + ")";
  }
  let index_level = (tabs.match(/\t/g) || []).length - 1;
  if (array_cnt > 0) {
    let variable_index = `arr_index_${index_level}`;
    if (!variables_defined.includes(variable_index)) {
      variables_defined.push(variable_index);
      internal_variables = `\tint ${variable_index};\r\n`;
    }
    if (!variables_defined.includes("chTemp")) {
      variables_defined.push("chTemp");
      internal_variables += "\tchar chTemp[1024];\r\n";
    }
    struct = `${tabs}for (arr_index_${index_level} = 0; arr_index_${index_level} < ${array_cnt}; arr_index_${index_level}++) {\r\n`;
    tabs += "\t";
    index_level++;
    template_signal = `(${template_signal}[%d]).%STRUCT_EL%`;
  } else {
    template_signal = `${template_signal}.%STRUCT_EL%`;
  }
  split_TestScript_func(getAllKeyWords, [
    struct_info,
    "DataType",
    false,
  ]).forEach((el) => {
    if (!IsDefined(list_of_datatype[el])) list_of_datatype[el] = 0;
  });
  for (var index in struct_info) {
    let el = struct_info[index];
    if (!IsDefined(el["DataType"])) {
      err = `  Please define enough DataType in Struct "${datatype}"\r\n`;
      return err;
    }
    if (!IsDefined(el["Variable name"])) {
      err = `  Please define enough Variable name in Struct "${datatype}"\r\n`;
      return err;
    }
    let exec_func;
    if (IsDefined(Struct_Dict[el["DataType"]])) {
      exec_func = struct_gen;
    } else if (IsDefined(Enum_Dict[el["DataType"]])) {
      exec_func = enum_gen;
    } else {
      exec_func = var_gen;
    }
    let result = exec_func(
      template_signal.replace("%STRUCT_EL%", el["Variable name"]),
      el["DataType"],
      func,
      tabs,
      list_of_datatype,
      variables_defined,
      Isinit
    );

    if (IsString(result)) {
      err += result;
      continue;
    }

    let [tmp_struct, tmp_internal_variables, tmp_maxindex] = result;
    internal_variables += tmp_internal_variables;
    struct += tmp_struct;
    if (max_index < tmp_maxindex) max_index = tmp_maxindex;
  }
  struct += tabs.replace("\t", "");
  if (array_cnt > 0) struct += "}\r\n";
  else struct += "\r\n";
  if (err != "") return err;
  return [struct, internal_variables, max_index];
}

function args_gen(
  vars_type,
  lst_varnames,
  func,
  tabs,
  list_of_datatype,
  variables_defined,
  Isinit
) {
  let testgen = "";
  let internal_variables = "";
  let max_idx = 0;
  let err = "";
  for (var index in lst_varnames) {
    let varname = lst_varnames[index];
    let VarName = Object.keys(vars_type).find(
      (el) => el.toLowerCase() === varname
    );
    if (!IsDefined(VarName)) {
      err += `"${varname}" is not declared!!\r\n`;
      continue;
    }
    let var_info = vars_type[VarName].split("|");
    let result = eval(`${var_info[1]}_gen`)(
      VarName,
      var_info[0],
      func,
      tabs,
      list_of_datatype,
      variables_defined,
      Isinit
    );
    if (IsString(result)) err += result;
    let [tmp_testgen, tmp_internal_variables, tmp_max_idx] = result;
    testgen += tmp_testgen;
    internal_variables += tmp_internal_variables;
    if (max_idx < tmp_max_idx) max_idx = tmp_max_idx;
  }
  if (err != "") return err;
  return [testgen, internal_variables, max_idx];
}

function special_directive(
  behavior,
  type,
  element,
  vars_type,
  tabs,
  variables_defined,
  mainIDX
) {
  let arg1, arg2;
  if (!IsDefined(vars_type[element[Signal1]])) {
    return `Line ${element[Line]}: "${element[Signal1]}" is not declared!!\r\n`;
  }
  let var_info = vars_type[element[Signal1]].split("|");
  if (var_info[1] != type) {
    return `Line ${element[Line]}: "${element[Signal1]}" is "${var_info[1]}", Not "${type}"!!\r\n`;
  }
  if (type === "args") {
    arg1 = vars_type;
    arg2 = var_info[0].split(",");
  } else {
    arg1 = element[Signal1];
    arg2 = var_info[0];
  }
  let result = eval(`${var_info[1]}_gen`)(
    arg1,
    arg2,
    Upper_1st(behavior),
    tabs,
    [],
    variables_defined,
    element[Value]
  );
  if (IsString(result)) return `Line ${element[Line]}:\r\n${result}`;
  let [testgen, internal_variables, max_idx] = result;
  testgen = testgen.replace(/%MAIN_IDX%/g, mainIDX);
  return [testgen, internal_variables, max_idx];
}

function testcase_gen(data, key, variables_defined) {
  var tabs = "\t";
  var Testgen = "";
  var SpecialTestgen = "";
  var global_variables = "";
  var internal_variables = "";
  let err = "";
  let vars_type = [];
  let MaxIDX = 0;
  let mainIDX = "i";
  for (var index in data[key]) {
    let element = data[key][index];
    if (!IsDefined(element[Directive])) {
      if (Object.keys(element).length > 1)
        err += `Line ${element[Line]}: Please define "Directive"\r\n`;
      else
        Testgen += `\r\n`;
      continue;
    }
    if (element[Directive].toLowerCase() === "comment") {
      if (SpecialTestgen != "") {
        SpecialTestgen += `${tabs}/*${element[Test_Descr]}*/\r\n`;
      } else {
        Testgen += `${tabs}/*${element[Test_Descr]}*/\r\n`;
      }
      continue;
    }
    if (element[Directive].toLowerCase() === "teststepsubsection") {
      if (SpecialTestgen != "") {
        SpecialTestgen += `${tabs}func_testStepSubSection("${element[Test_Descr]}");\r\n`;
      } else {
        Testgen += `${tabs}func_testStepSubSection("${element[Test_Descr]}");\r\n`;
      }
      continue;
    }

    let Dict_Result = [];
    let type = "";
    let Find_Result = Find_match_dict(element);
    if (typeof Find_Result == "string") {
      err += `${Find_Result} in "${key}"\r\n`;
      continue;
    }
    [Dict_Result, type] = Find_Result;
    if (type === "Vars") {
      let Var_result = generate_var(element, Dict_Result, variables_defined);
      if (IsString(Var_result)) {
        err += Var_result;
        continue;
      }
      global_variables += Var_result[0];
      internal_variables += Var_result[1];
    } else if (type === "Funcs") {
      let [tmp_Testcase, tmp_internal, tmp_tabs] = generate_func(
        element,
        Dict_Result,
        variables_defined,
        tabs
      );
      tabs = tmp_tabs;
      if (SpecialTestgen != "") {
        SpecialTestgen += tmp_Testcase;
      } else {
        Testgen += tmp_Testcase;
      }
      internal_variables += tmp_internal;
    } else if (type === "Vars_special") {
      let tmp_result = handle_special_var(
        element,
        vars_type,
        variables_defined
      );
      if (IsString(tmp_result)) {
        err += tmp_result;
        continue;
      }
      internal_variables += tmp_result[0];
    } else {
      if (IsDefined(element[Test_Descr])) {
        SpecialTestgen += `${tabs}func_testStepSubSection("${element[Test_Descr]}");\r\n`;
      }
      if (element[Directive].toLowerCase() == "forstructenum") {
        SpecialTestgen += `${tabs}${Dict_Result["PATTERN"].replace(
          /%Value%/g,
          element[Value]
        )}\r\n`;
        tabs += "\t";
        if (!variables_defined.includes(element[Value])) {
          variables_defined.push(element[Value]);
          internal_variables += `\tint ${element[Value]};\r\n`;
        }
        mainIDX = element[Value];
        continue;
      }
      if (element[Directive].toLowerCase() == "endforstructenum") {
        tabs = tabs.replace("\t", "");
        mainIDX = "i";
        Testgen += `${SpecialTestgen.replace("%MAXIDX%", MaxIDX)}${tabs}}\r\n`;
        MaxIDX = 0;
        SpecialTestgen = "";
        continue;
      }
      let regex = /(?<behavior>\w+)(default|value)(?<type>\w+)/;
      let split_directive = regex.exec(element[Directive].toLowerCase());
      if (split_directive) {
        let tmp_result = special_directive(
          split_directive.groups.behavior,
          split_directive.groups.type,
          element,
          vars_type,
          tabs,
          variables_defined,
          mainIDX
        );

        if (IsString(tmp_result)) {
          err += tmp_result;
          continue;
        }
        let [tmp_Testcase, tmp_internal, tmp_maxIDX] = tmp_result;
        if (tmp_maxIDX > MaxIDX) MaxIDX = tmp_maxIDX;
        SpecialTestgen += tmp_Testcase;

        internal_variables += tmp_internal;
      }
    }
  }
  return [Testgen, global_variables, internal_variables, err];
}
//#endregion

//#region COLLECT DATA AND GENERRATE FOR EACH SHEET
function generate_with_testSpec_data(testID, data, List_gen) {
  let err = "";
  let variables_defined = [];
  variables_defined.push("i");
  const List_gen_funcs = {
    includes: includes_gen,
    testdescr: testdescr_gen,
    testdesign: testdesign_gen,
    testmatrix_st: testmatrix_gen,
    testcase: testcase_gen,
  };
  let list_of_testscript_keywords = split_TestScript_func(getAllKeyWords, [
    data[testID],
    TestId,
    false,
  ]);
  let split_testscript_by_keywords = split_TestScript_func(getAllGroup_func, [
    getTestSubGroup,
    data[testID],
    list_of_testscript_keywords,
    TestId,
    0,
  ]);

  list_of_testscript_keywords.forEach((element) => {
    let tmp_internal_variables = "";
    let tmp_global_variables = "";
    let tmp_generated = "";
    let tmp_error = "";
    if (Object.keys(List_gen_funcs).includes(element)) {
      [tmp_generated, tmp_error] = List_gen_funcs[element](
        split_testscript_by_keywords[element]
      );
      List_gen[element] += tmp_generated;
    } else {
      [
        tmp_generated,
        tmp_global_variables,
        tmp_internal_variables,
        tmp_error,
      ] = List_gen_funcs["testcase"](
        split_testscript_by_keywords,
        element,
        variables_defined
      );
      tmp_generated = Testscript_split_region.ReplaceGlobally(
        ["%CASE%", "%TEST_SCRIPT%"],
        [element.toUpperCase(), tmp_generated]
      );
      List_gen["testscript"] += tmp_generated;
    }
    List_gen["global_variables"] += tmp_global_variables;
    List_gen["internal_variables"] += tmp_internal_variables;
    err += tmp_error;
  });
  return err;
}
function generate_with_regression_data(testID, data, List_gen) {
  let err = "";
  const List_replace_keywords = ["%AUTHOR%", "%DATE%", "%VERSION%", "%NOTE%"];
  data.forEach((element) => {
    if (IsDefined(element["TestID"])) {
      if (element["TestID"].toLowerCase() === testID.toLowerCase()) {
        let version = "";
        let author = "";
        let date = "";
        let note = "";
        if (IsDefined(element["Version"])) version = element["Version"];
        if (IsDefined(element["Author"])) author = element["Author"];
        if (IsDefined(element["Date"])) date = element["Date"];
        if (IsDefined(element["Note"])) note = " => Note: " + element["Note"];
        List_gen["regression"] +=
          Regression_region.ReplaceGlobally(List_replace_keywords, [
            author,
            date,
            version,
            note,
          ]) + "\r\n";
      }
    }
  });
  return err;
}
function generate_with_requirement_data(testID, data, List_gen) {
  let err = "";
  let filter_data = data.filter((item) => IsDefined(item[testID]));
  if (filter_data.length === 0)
    return testID + " NOT mark with any Requirement!\r\n";
  for (var index in filter_data) {
    let element = filter_data[index];
    if (!IsDefined(element["Requirement Id"])) {
      err += `${testID} marks with no Requirement ID!\r\n`;
      continue;
    }
    if (!IsDefined(element["Requirement Text"])) {
      err += `${testID} marks with no Requirement Text!\r\n`;
      continue;
    }
    List_gen[
      "requirements"
    ] += `\r\n[${element["Requirement Id"]}]:\r\n${element["Requirement Text"]}\r\n`;
  }
  return err;
}
//#endregion

//#region MAIN_FUNCS
function Update_Dict(args) {
  const [
    _dict_normal,
    _variable_normal,
    _dict_special,
    _variable_special,
    _struct,
    _enum,
    _compare,
  ] = args;
  Dicts["Funcs"] = _dict_normal;
  Dicts["Vars"] = _variable_normal;
  Dicts["Funcs_special"] = _dict_special;
  Dicts["Vars_special"] = _variable_special;
  Struct_Dict = _struct;
  Enum_Dict = _enum;
  Compare_Dict = _compare;
}

function Update_OverviewInfo(lst) {
  Object.keys(List_Overview_Info).forEach((item) => {
    List_Overview_Info[item] = lst[item];
  });
}

function TestScript(testID, TestSpec_data, Regression_data, Req_data) {
  let err = "";
  const List_gen = {
    testID: testID,
    requirements: "",
    testdescr: "",
    testdesign: "",
    author: List_Overview_Info["Author"],
    reportpath: path
      .join(List_Overview_Info["Report"], testID)
      .replace(/\\/g, "\\\\"),
    date: List_Overview_Info["Date"],
    release: List_Overview_Info["Release"],
    regression: "",
    includes: "",
    global_variables: "",
    internal_variables: "",
    testmatrix_st: "",
    testscript: "",
  };
  err += generate_with_testSpec_data(testID, TestSpec_data, List_gen);
  err += generate_with_regression_data(testID, Regression_data, List_gen);
  err += generate_with_requirement_data(testID, Req_data, List_gen);
  try {
    var TestScripts_FULL = readFileSync("./TestScripts_Template.can", "utf8");
  } catch (e) {
    err += e.stack + "\r\n";
  }
  TestScripts_FULL = TestScripts_FULL.ReplaceGlobally(
    List_replace_keywords,
    Object.values(List_gen)
  );
  return [TestScripts_FULL, err];
}

function Generate_TestScript(
  testID,
  TestSpec_data,
  Regression_data,
  Req_data,
  Output
) {
  let [TestScripts_FULL, err] = TestScript(
    testID,
    TestSpec_data,
    Regression_data,
    Req_data
  );
  let gen_path = "";
  if (IsDefined(Output)) {
    gen_path = Output;
  } else {
    gen_path = List_Overview_Info["Output"];
  }
  writeFile(
    path.join(gen_path, testID + ".can"),
    TestScripts_FULL,
    function (error) {
      if (error) err += error.stack + "\r\n";
    }
  );

  return err;
}

function MainTestScript(lsi_testID_gen) {
  let err = "";
  const List_gen = {
    includes: "",
    Comp: List_Overview_Info["Component Shortcut"],
    Component: List_Overview_Info["Component"],
    testids: "",
  };

  lsi_testID_gen.forEach((el) => {
    List_gen["includes"] += `\t#include "${el}.can"\r\n`;
    List_gen["testids"] += `\t${el}();\r\n`;
  });
  try {
    var mainTestScript = readFileSync(
      "./TestScripts_main_Template.can",
      "utf8"
    );
  } catch (e) {
    err += e.stack + "\r\n";
  }
  mainTestScript = mainTestScript.ReplaceGlobally(
    List_replace_mainTest_keywords,
    Object.values(List_gen)
  );
  return [mainTestScript, err];
}
function Generate_MainTestScript(lsi_testID_gen, Output) {
  let [mainTestScript, err] = MainTestScript(lsi_testID_gen);
  let gen_path = "";
  if (IsDefined(Output)) {
    gen_path = Output;
  } else {
    gen_path = List_Overview_Info["Output"];
  }
  writeFile(
    path.join(gen_path, List_Overview_Info["Component Shortcut"] + ".can"),
    mainTestScript,
    function (error) {
      if (error) err += error.stack + "\r\n";
    }
  );

  return err;
}
//#endregion
