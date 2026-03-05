const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const CODE_FOLDER = "./temp";

/* ======================
CREATE TEMP FOLDER
====================== */

if (!fs.existsSync(CODE_FOLDER)) {
fs.mkdirSync(CODE_FOLDER);
}

/* ======================
WRITE FILE
====================== */

function writeCode(file, code) {
fs.writeFileSync(file, code);
}

/* ======================
RUN PROGRAM
====================== */

function runProgram(cmd, args, input) {

return new Promise((resolve) => {

let output = "";

let process;

try {

process = spawn(cmd, args);

} catch (err) {

resolve("Runtime Error: " + err.message);
return;

}

/* INPUT */

if (input) {
process.stdin.write(input);
process.stdin.end();
}

/* STDOUT */

process.stdout.on("data", (data) => {
output += data.toString();
});

/* STDERR */

process.stderr.on("data", (data) => {
output += data.toString();
});

/* ERROR EVENT */

process.on("error", (err) => {
resolve("Execution Error: " + err.message);
});

/* CLOSE */

process.on("close", () => {
resolve(output || "Program executed with no output");
});

});

}

/* ======================
PYTHON
====================== */

exports.runPython = async (code, input) => {

const file = path.join(CODE_FOLDER, "main.py");

writeCode(file, code);

return await runProgram("python3", [file], input);

};

/* ======================
C
====================== */

exports.runC = async (code, input) => {

const file = path.join(CODE_FOLDER, "main.c");
const exe = path.join(CODE_FOLDER, "main_c");

writeCode(file, code);

return new Promise((resolve) => {

let error = "";

const compile = spawn("gcc", [file, "-o", exe]);

compile.stderr.on("data", (d) => {
error += d.toString();
});

compile.on("error", () => {
resolve("C compiler not installed on server.");
});

compile.on("close", (status) => {

if (status !== 0) {
resolve(error);
return;
}

runProgram(exe, [], input).then(resolve);

});

});

};

/* ======================
CPP
====================== */

exports.runCPP = async (code, input) => {

const file = path.join(CODE_FOLDER, "main.cpp");
const exe = path.join(CODE_FOLDER, "main_cpp");

writeCode(file, code);

return new Promise((resolve) => {

let error = "";

const compile = spawn("g++", [file, "-o", exe]);

compile.stderr.on("data", (d) => {
error += d.toString();
});

compile.on("error", () => {
resolve("C++ compiler not installed on server.");
});

compile.on("close", (status) => {

if (status !== 0) {
resolve(error);
return;
}

runProgram(exe, [], input).then(resolve);

});

});

};

/* ======================
JAVA
====================== */

exports.runJava = async (code, input) => {

const match = code.match(/public\s+class\s+([A-Za-z0-9_]+)/);

if (!match) {
return "Error: Public class not found";
}

const className = match[1];

const file = path.join(CODE_FOLDER, `${className}.java`);

writeCode(file, code);

return new Promise((resolve) => {

let error = "";

const compile = spawn("javac", [file]);

compile.stderr.on("data", (d) => {
error += d.toString();
});

compile.on("error", () => {
resolve("Java compiler not installed on server.");
});

compile.on("close", (status) => {

if (status !== 0) {
resolve(error);
return;
}

runProgram("java", ["-cp", CODE_FOLDER, className], input)
.then(resolve);

});

});

};
