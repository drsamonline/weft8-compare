/* tests/page-smoke.js — the three columns, driven. jsdom is test-only.
 * SPDX-FileCopyrightText: 2026 Dr Sohil Momin · PolyForm-Noncommercial-1.0.0 */
"use strict";
const fs = require("fs"), path = require("path");
let JSDOM;
try { ({ JSDOM } = require("jsdom")); } catch (e) { console.log("jsdom missing — npm install"); process.exit(2); }
const dir = path.join(__dirname, "..", "docs", "play");
let html = fs.readFileSync(path.join(dir, "index.html"), "utf8");
for (const k of ["web-kit.js", "weft8.js", "compare.js"])
  html = html.replace('<script src="' + k + '"></script>', "<script>" + fs.readFileSync(path.join(dir, k), "utf8") + "</script>");
const errors = [];
const dom = new JSDOM(html, { runScripts: "dangerously", pretendToBeVisual: true,
  beforeParse(w) { w.addEventListener("error", (e) => errors.push(e.message)); } });
const w = dom.window, d = w.document;
let pass = 0, fail = 0;
const ok = (n, c, x) => { if (c) { pass++; console.log("PASS  " + n); } else { fail++; console.log("FAIL  " + n + (x ? "  [" + x + "]" : "")); } };
const t = (id) => d.getElementById(id).textContent;

ok("the page boots without an error", errors.length === 0, errors.join("; "));
ok("four jobs are offered", d.querySelectorAll("#jobs button").length === 4);
ok("all three columns are filled", t("weft").length > 20 && t("x86").length > 10 && t("arm").length > 10);
ok("the Weft-8 column ran", /ran ·/.test(t("weftResult")), t("weftResult"));
ok("the x86 column is labelled an illustration", /illustration/.test(t("x86")) || /illustration/.test(d.querySelector(".col.x86 .f").textContent));
ok("the same/differs notes are filled", t("same").length > 40 && t("differs").length > 40);
ok("registers are drawn", d.querySelectorAll("#regs .reg").length === 16);

/* switch job: the sum loop should report R2 = 15 */
d.querySelectorAll("#jobs button")[1].dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
ok("switching job swaps all three columns", /JNZ|jnz|b\.ne/.test(t("weft") + t("x86") + t("arm")));
ok("the sum loop reports R2 = 15", /R2 = 15/.test(t("weftResult")), t("weftResult"));

console.log("");
console.log(pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
