# Weft-8 beside x86 and ARM — user guide

**Version 1.0.0 · PolyForm Noncommercial 1.0.0**

Five small jobs, written three times: for the **Weft-8** (the Loom's 8-bit machine), for **x86-64**,
and for **AArch64**. Put them side by side and "what is a computer, really?" stops being a question
you answer from memory.

Open the three columns: <https://drsamonline.github.io/weft8-compare/>

## The five jobs

| Job | What it shows |
|---|---|
| **Add two numbers** | the Weft-8 must move a literal into a register first; the other two add one straight in |
| **Sum 1 to 5** | x86 does it in two instructions, ARM in one, the Weft-8 in three — `SUB` sets flags but cannot branch |
| **The greater of two** | a compare, a conditional branch, two paths that converge. Identical shape on all three |
| **Remember, then recall** | the Weft-8 addresses memory with a literal byte; x86 and ARM compute an address from a frame or stack pointer |
| **Multiply by four** | two shifts here, one wide instruction there — the same idea in a wider instruction |

## Which column actually runs

**The Weft-8 column is executable.** The page runs it on the real machine, shows the registers
afterwards, and the test suite asserts the result of every one of the five jobs.

**The x86-64 and AArch64 columns are hand-written illustrations** — short, accurate in shape, and
labelled as illustrations in the page and in the data. They are not compiler output and do not claim
to be. A listing that pretended to be compiled when it was typed by hand would be exactly the sort of
thing this estate exists to avoid.

That distinction is the honest core of the project: you can watch one machine compute and read the
other two as diagrams.

## Licence

PolyForm Noncommercial 1.0.0. See [LICENSE](../LICENSE).
