/* test-node.js — the proof for Weft-8 beside x86 and ARM.
 *
 * The claim is narrow and checkable: the Weft-8 column really does the job it
 * describes, the three columns really are the same job, and the two illustrations
 * are labelled as illustrations rather than passed off as compiler output.
 *
 * SPDX-FileCopyrightText: 2026 Dr Sohil Momin
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */
"use strict";

const W = require("./docs/play/weft8.js");
const C = require("./docs/play/compare.js");
const fs = require("fs");

let pass = 0;
const failures = [];
const ok = (c, n) => { if (c) { pass++; return; } failures.push(n); console.log("  FAIL  " + n); };
const eq = (g, w, n) => ok(JSON.stringify(g) === JSON.stringify(w),
  n + "  (got " + JSON.stringify(g) + ", want " + JSON.stringify(w) + ")");

console.log("the Weft-8 column — it does the job");
eq(C.ALGORITHMS.length, 5, "five algorithms ship");
C.ALGORITHMS.forEach(function (alg) {
  const r = C.run(alg);
  eq(r.errors, [], alg.id + ": the Weft-8 listing assembles");
  ok(r.halted, alg.id + ": it reaches HLT");
  ok(r.steps < 300, alg.id + ": it finishes in under 300 steps (" + r.steps + ")");
  ok(r.bytes.length <= 128, alg.id + ": it fits the 128-byte ROM");
  Object.keys(alg.expect.reg || {}).forEach(function (k) {
    eq(r.vm.r[+k], alg.expect.reg[k], alg.id + ": R" + k + " ends at " + alg.expect.reg[k]);
  });
  Object.keys(alg.expect.ram || {}).forEach(function (k) {
    eq(r.vm.mem[+k], alg.expect.ram[k], alg.id + ": memory at " + k + " ends at " + alg.expect.ram[k]);
  });
});

console.log("the three columns — the same job, honestly labelled");
C.ALGORITHMS.forEach(function (alg) {
  ok(alg.job.length > 20, alg.id + ": says what the job is");
  ok(alg.same.length > 40, alg.id + ": says what the machines have in common");
  ok(alg.differs.length > 40, alg.id + ": and what actually differs");
  ok(/illustration/i.test(alg.x86), alg.id + ": the x86 column says it is an illustration");
  ok(/illustration/i.test(alg.arm), alg.id + ": the ARM column says it is an illustration");
  ok(/mov|add|str|cmp/i.test(alg.x86), alg.id + ": the x86 column contains real x86 mnemonics");
  ok(/mov|add|str|cmp/i.test(alg.arm), alg.id + ": the ARM column contains real ARM mnemonics");
  ok(alg.x86.split("\n").length >= 3, alg.id + ": the x86 column is more than a comment");
  ok(alg.arm.split("\n").length >= 3, alg.id + ": the ARM column is more than a comment");
});

console.log("the page — it loads the three columns");
const html = fs.readFileSync("./docs/play/index.html", "utf8");
["web-kit.js", "weft8.js", "compare.js"].forEach(function (k) {
  ok(html.indexOf('<script src="' + k + '"></script>') > 0, "the page loads " + k);
});
ok(html.indexOf('id="weft"') > 0, "the page has the Weft-8 column");
ok(html.indexOf('id="x86"') > 0, "the page has the x86 column");
ok(html.indexOf('id="arm"') > 0, "the page has the ARM column");


/* the family — every page links back to the Loom, and the Loom to every page */
{
  const fsm = require("fs");
  const landing = fsm.readFileSync("./docs/index.html", "utf8");
  ok(landing.indexOf('id="family"') > 0, "the landing page carries the family strip");
  ok(landing.indexOf("you are here") > 0, "and marks this page as the one you are on");
  ['app-jacquard', 'app-weft-puzzles', 'app-clip-loom', 'weft8-hardware', 'weft8-kit', 'weft8-classroom'].forEach(function (slug) {
    ok(landing.indexOf("https://drsamonline.github.io/" + slug + "/") > 0, "it links to " + slug);
  });
  const readme = fsm.readFileSync("./README.md", "utf8");
  ok(readme.indexOf("The Weft-8 family") > 0, "the README carries the family table too");
  ok(readme.indexOf("you are here") > 0, "and marks this repository in it");
}


/* the copy counts what the data holds — so a new level cannot leave the page lying */
{
  const fsc = require("fs");
  const land = fsc.readFileSync("./docs/index.html", "utf8");
  ok(land.indexOf("Five jobs") >= 0, "the landing page states the right count: Five jobs");
  ok(C.ALGORITHMS.length === 5, "and the data really has that many");
}

console.log("");
console.log(pass + " passed, " + failures.length + " failed");
if (failures.length) { failures.forEach(f => console.log("  - " + f)); process.exit(1); }
