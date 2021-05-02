export {
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
};

const TestId = "Test Class Id - Test Case - Method - Identifier";
const Test_Descr = "Test Step Descriptions and Comments";
const Directive = "Directive";
const Signal1 = "Signal1";
const Signal2 = "Signal2";
const Operand = "Operand";
const Value = "Value";
const Options = "Options";
const Line = "Line";

const Testmatrix_args_template = [
  "\t\t{//%index%",
  '\t\t\t"%teststepsubsection%",',
  '\t\t\t"%textwhenbppassed%",',
  '\t\t\t"%textwhenbpfailed%",',
  '\t\t\t"%setbpfunction%",',
  '\t\t\t"%setsourcetestpoint%",',
  "\t\t\t%sourcetestpointpos%,",
  "\t\t\t%setbpline%,",
  '\t\t\t"%setbpfile%",',
  "\t\t\t%setnegativebpline%,",
  '\t\t\t"%setnegativebpfile%",',
  "\t\t\t%microstep_en%}",
].join("\r\n");

const StructTestMatrix_template = [
  "\tstruct testmatrix_st testmatrix_X[%CNT%] = {",
  "%TESTMATRIX%",
  "\t};",
].join("\r\n");

const Testscript_split_region = [
  "",
  "/***********************************************************************************************************************************************",
  " * %CASE%",
  " ***********************************************************************************************************************************************/",
  "",
  "%TEST_SCRIPT%",
  "",
].join("\r\n");

const Regression_region = [
  "",
  "@regression",
  "@author     	%AUTHOR%",
  "@date      		%DATE%",
  "@version    	%VERSION%%NOTE%",
].join("\r\n");
