const { utils } = require("xlsx");
export {
  clone,
  Get_increase,
  Get_decrease,
  Difference,
  IsDefined,
  ReplaceGlobally,
  IsFunction,
  Is_OnlySpaces,
  SubStringBetween,
  Upper_1st,
  xlstojson_custom,
  IsString,
  Check_Array,
  checkForDuplicates,
  IsNumber,
  IsPointer,
};

function clone(obj) {
  var copy;

  // Handle the 3 simple types, and null or undefined
  if (null == obj || "object" != typeof obj) return obj;

  // Handle Date
  if (obj instanceof Date) {
    copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  }

  // Handle Array
  if (obj instanceof Array) {
    copy = [];
    for (var i = 0, len = obj.length; i < len; i++) {
      copy[i] = clone(obj[i]);
    }
    return copy;
  }

  // Handle Object
  if (obj instanceof Object) {
    copy = {};
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
    }
    return copy;
  }

  throw new Error("Unable to copy obj! Its type isn't supported.");
}

function Get_increase() {
  return this + 1;
}

function Get_decrease() {
  return this - 1;
}

function Difference(var1, var2) {
  return Math.abs(var1 - var2);
}

function Is_OnlySpaces(obj) {
  try {
    return obj.replace(/ /g, "") === "";
  } catch (e) {
    return false;
  }
}
function IsDefined(obj) {
  return typeof obj != "undefined";
}

function IsSameType(obj1, obj2) {
  return typeof obj1 === typeof obj2;
}

function IsFunction(x) {
  return Object.prototype.toString.call(x) == "[object Function]";
}

function IsString(obj) {
  return typeof obj === "string";
}

function IsNumber(obj) {
  return typeof obj === "number";
}

function IsPointer(obj) {
  return (obj.match(/^\*/) || []).length > 0;
}

function SubStringBetween(text1, text2) {
  return this.substring(
    this.indexOf(text1) + text1.length,
    this.indexOf(text2)
  );
}

function Upper_1st(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function Check_Array(arr) {
  let arr_regex = /(?<arr_name>.+)\[(?<length>[\w]+)\]$/g;
  var myArray = arr_regex.exec(arr);
  if (myArray === null) return [arr, 0];
  else return [myArray.groups.arr_name, myArray.groups.length];
}

function checkForDuplicates(array, keyValue) {
  return array.filter(item => item === keyValue).length > 1;
}

function ReplaceGlobally(searchTxt, replaceTxt) {
  var str = this;
  if (!IsSameType)
    throw "Argument searchTxt and replaceTxt must be same type!!";
  if (typeof searchTxt === "string") {
    return this.replace(RegExp(searchTxt, "g"), replaceTxt);
  }
  if (searchTxt.length != replaceTxt.length)
    throw "Argument searchTxt and replaceTxt must be same length";
  if (searchTxt.length > 1)
    str = this.ReplaceGlobally(
      searchTxt.slice(1, searchTxt.lengths),
      replaceTxt.slice(1, replaceTxt.lengths)
    );

  str = str.replace(RegExp(searchTxt[0], "g"), replaceTxt[0]);
  return str;
}

function xlstojson_custom(sheet, startline_csv, endline_csv) {
  let final_json = [];
  let new_csv = [];
  let csv = utils
    .sheet_to_csv(sheet, { FS: "♫", RS: "‼", blankrows: false })
    .split("‼");
  let is_Region = false;
  let headline = csv[0];

  for (var index in csv) {
    let el = csv[index];
    if (is_Region) {
      new_csv.push(el);
    }
    if (el.substring(0, startline_csv.length) === startline_csv) {
      is_Region = true;
    }
    if (endline_csv != undefined) {
      if (el.substring(0, endline_csv.length) === endline_csv) {
        break;
      }
    } else {
      if (index == csv.length - 2) {
        break;
      }
    }
  }

  if (new_csv.length > 0) {
    let headline_arr = headline.split("♫");
    new_csv.forEach((el) => {
      let json = [];
      for (var index in headline_arr) {
        let line_arr = el.split("♫");
        if (line_arr[index] != "") {
          if (headline_arr[index] === "PATTERN") {
            json[headline_arr[index]] = line_arr[index]
              .replace(/^\"/, "")
              .replace(/\"$/, "")
              .replace(/\"\"/g, '"');
          } else {
            json[headline_arr[index]] = line_arr[index];
          }
        }
      }
      final_json.push(json);
    });
  } else {
    throw "Please check your TestSpec again, some region have to empty!!";
  }

  return final_json;
}
