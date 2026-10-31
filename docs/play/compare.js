/* compare.js — one job, three machines.
 *
 * The Weft-8 column is executable and its result is asserted by the test suite.
 * The x86-64 and ARM64 columns are hand-written illustrations of the same job —
 * short enough to read, and labelled as illustrations rather than as compiled
 * output, because a listing that claims to be compiled and is not would be a lie.
 *
 * SPDX-FileCopyrightText: 2026 Dr Sohil Momin
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("./weft8.js"));
  else root.Compare = factory(root.Weft8);
})(typeof self !== "undefined" ? self : this, function (Weft8) {
  "use strict";

  var ALGORITHMS = [
    {
      id: "add-two",
      title: "Add two numbers",
      job: "Put 5 and 7 in two places and add them.",
      same: "Every machine has an add instruction, and every one of them takes two operands.",
      differs: "The Weft-8 has to move a literal into a register before it can add, because only the accumulator can be loaded. The other two add a literal straight in.",
      weft: [
        "; two registers, one add",
        "        LDI 5",
        "        MOV R1, R0",
        "        LDI 7",
        "        MOV R2, R0",
        "        ADD R1, R2       ; R1 = 12",
        "        HLT"
      ].join("\n"),
      x86: [
        "; x86-64 (AT&T) — illustration",
        "        movl    $5, %eax",
        "        addl    $7, %eax",
        "        ret"
      ].join("\n"),
      arm: [
        "; AArch64 — illustration",
        "        mov     w0, #5",
        "        add     w0, w0, #7",
        "        ret"
      ].join("\n"),
      expect: { reg: { 1: 12 } }
    },
    {
      id: "sum-loop",
      title: "Sum 1 to 5",
      job: "Add 5 + 4 + 3 + 2 + 1 with a loop that stops by itself.",
      same: "A loop is a counter, a decrement, and a branch that fires while the counter is not zero. All three machines build it from exactly those three things.",
      differs: "x86 subtracts and tests in two instructions (`decl`, `jnz`); ARM does it in one (`subs`, `b.ne`); the Weft-8 needs three, because `SUB` sets the flags but cannot branch by itself.",
      weft: [
        "; R2 = 5 + 4 + 3 + 2 + 1",
        "        LDI 5",
        "        MOV R1, R0       ; counter",
        "        LDI 0",
        "        MOV R2, R0       ; sum",
        "        LDI 1",
        "        MOV R3, R0       ; the constant 1",
        "loop:   ADD R2, R1",
        "        SUB R1, R3",
        "        JNZ loop",
        "        HLT"
      ].join("\n"),
      x86: [
        "; x86-64 (AT&T) — illustration",
        "        movl    $5, %ecx",
        "        xorl    %eax, %eax",
        "loop:   addl    %ecx, %eax",
        "        decl    %ecx",
        "        jnz     loop",
        "        ret"
      ].join("\n"),
      arm: [
        "; AArch64 — illustration",
        "        mov     w1, #5",
        "        mov     w0, #0",
        "loop:   add     w0, w0, w1",
        "        subs    w1, w1, #1",
        "        b.ne    loop",
        "        ret"
      ].join("\n"),
      expect: { reg: { 2: 15, 1: 0 } }
    },
    {
      id: "greater",
      title: "The greater of two",
      job: "Put the larger of two numbers in a third register.",
      same: "A compare, a conditional branch, and two paths that converge. The shape is identical on all three.",
      differs: "The Weft-8 compares into its own flags and branches with `JG`, which reads N and V — the signed pair. That is what makes -1 less than 1 even though 255 is greater.",
      weft: [
        "; R3 = the greater of R1 and R2",
        "        LDI 9",
        "        MOV R1, R0",
        "        LDI 4",
        "        MOV R2, R0",
        "        CMP R1, R2",
        "        JG  big",
        "        MOV R3, R2",
        "        HLT",
        "big:    MOV R3, R1",
        "        HLT"
      ].join("\n"),
      x86: [
        "; x86-64 (AT&T) — illustration",
        "        cmpl    %ebx, %eax",
        "        jg      .big",
        "        movl    %ebx, %ecx",
        "        jmp     .done",
        ".big:   movl    %eax, %ecx",
        ".done:  ret"
      ].join("\n"),
      arm: [
        "; AArch64 — illustration",
        "        cmp     w0, w1",
        "        b.gt    .big",
        "        mov     w2, w1",
        "        b       .done",
        ".big:   mov     w2, w0",
        ".done:  ret"
      ].join("\n"),
      expect: { reg: { 3: 9 } }
    },
    {
      id: "memory",
      title: "Remember, then recall",
      job: "Put 42 in memory, clear the working register, then read it back.",
      same: "Every machine separates registers from memory, and every one of them needs an address to reach it.",
      differs: "The Weft-8 has a fixed 256-byte address space, so the address is a literal byte. x86 and ARM compute addresses from a frame or stack pointer, which is what makes their memory model general — and their instructions longer.",
      weft: [
        "; store 42, clear R0, load it back",
        "        LDI 42",
        "        STORE 0x80       ; scratch RAM",
        "        LDI 0",
        "        LOAD 0x80",
        "        HLT"
      ].join("\n"),
      x86: [
        "; x86-64 (AT&T) — illustration",
        "        movl    $42, -4(%rbp)",
        "        movl    $0, %eax",
        "        movl    -4(%rbp), %eax",
        "        ret"
      ].join("\n"),
      arm: [
        "; AArch64 — illustration",
        "        mov     w0, #42",
        "        str     w0, [sp, #-16]!",
        "        mov     w0, #0",
        "        ldr     w0, [sp], #16",
        "        ret"
      ].join("\n"),
      expect: { reg: { 0: 42 }, ram: { 0x80: 42 } }
    }
  ];

  function byId(id) {
    for (var i = 0; i < ALGORITHMS.length; i++) if (ALGORITHMS[i].id === id) return ALGORITHMS[i];
    return null;
  }

  function run(alg, maxSteps) {
    var a = Weft8.assemble(alg.weft);
    if (a.errors.length) return { errors: a.errors };
    var out = [];
    var host = { output: out, "in": function () { return 0; }, out: function (p, v) { out.push(v); } };
    var vm = new Weft8.VM({ rom: a.bytes, peripherals: host });
    vm.run(maxSteps === undefined ? 5000 : maxSteps);
    return { errors: [], vm: vm, steps: vm.steps, halted: vm.halted, error: vm.error, bytes: a.all, out: out };
  }

  return { ALGORITHMS: ALGORITHMS, byId: byId, run: run };
});
