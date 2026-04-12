# Haunt

A faithful web port of John Laird's **Haunt** (1979-1983), one of the largest OPS5 programs ever written. The original is a text adventure with ~800 production rules, 14 treasures, ~35 locations, a madness timer, an oil-truck escape sequence, and a maximum score of 440.

This port runs entirely in the browser as a single-page app. No server, no build step, no dependencies.

## Play

Open `index.html` in any modern browser, or serve the folder:

```
node tools/devserver.mjs
# → http://localhost:8765
```

## How the port works

The central challenge: how do you faithfully port a 6,744-line OPS5 production system to JavaScript without hand-rewriting the game logic?

### Mechanical translation, not reimplementation

The game was not reverse-engineered or rewritten from walkthroughs. Instead, a build-time Node script (`tools/generate-rules.mjs`) parses the original OPS5 source (`haunt_game_source.txt`) and mechanically translates every production rule into a JavaScript object with structured conditions and an action closure. The output is `js/rules.generated.js` — 834 rules, ~8,700 lines of generated code that the browser loads directly as an ES module.

Each OPS5 rule like:

```
(p name90
 (x 30)
 (status)
 (input << quit halt stop >>)
 -->
 (remove 3)
 (modify 2 ^quit t)
 (write (crlf) |The party's over.|))
```

becomes a JavaScript object:

```js
{
    name: "name90",
    sourceIndex: 96,
    conditions: [
        { cls: "x", tests: [{ index: 0, op: "eq_const", value: 30 }] },
        { cls: "status", tests: [] },
        { cls: "input", tests: [{ index: 0, op: "in_set", set: ["quit","halt","stop"] }] }
    ],
    action: async (m, wm, term) => {
        rt.remove(m.$3);
        rt.modify(m.$2, { quit: "t" });
        rt.write("\n", "The party's over.");
    }
}
```

The generator handles the full OPS5 condition language: attribute tests, variable binding, negated conditions, disjunctive sets (`<< >>`), brace-group restrictions (`{< 50 > 21}`), bare comparisons (`^score < 20`), and the `<>` (not-equal) operator. On the action side it translates `make`, `modify`, `remove`, `write`, `compute`, `substr`, `accept`, `acceptline`, `bind`, and `halt`.

### An OPS5 engine in JavaScript

The generated rules need an engine to run them. `js/engine.js` implements a minimal OPS5-style production system:

**Working Memory** is sharded by WME class (e.g., `location`, `object`, `status`, `input`). Each WME has a monotonic `_id` and a `_stamp` that increments on creation or modification. The stamp drives the recency tiebreaks in conflict resolution.

**Matching** is backtracking depth-first over a rule's condition list. For each condition, candidates from the matching WME class are tested against the condition's field tests. Variable bindings propagate forward through conditions and are restored on backtrack. Negated conditions succeed when no candidate passes.

**Conflict resolution** follows OPS5's MEA (Means-Ends Analysis) strategy:

1. Highest recency on the dominant matched WME (the first condition's WME for x-tier rules, or the max-stamp WME otherwise)
2. Higher specificity (more condition tests)
3. LEX on remaining matched WME stamps (descending)
4. Lower source index

**Refraction** prevents a rule from firing twice with the same set of matched WME identities and stamps. Modifying a WME bumps its stamp, invalidating old refraction keys and allowing the rule to re-fire with the updated state.

**Runtime helpers** (`js/runtime.js`) implement the OPS5 right-hand-side primitives: `write` buffers output and flushes on `(crlf)`, `compute` does arithmetic, `substr` does 1-indexed token slicing with `inf` support, and `make`/`modify`/`remove` delegate to Working Memory.

### Patch rules

The original OPS5 source contains several bugs that are masked or exposed by MEA's recency-based conflict resolution. For example, the grave-digging puzzle is broken in the original because a generic fallback rule always wins over the specific dig handler due to condition ordering. Several rooms have no exit rules, creating dead ends.

`js/game.js` exports a set of patch rules that are appended to the generated rule array. These fix dead-end rooms, the dig/lever sequence, truck entry/exit mechanics, and balcony jump safety. Each patch is a standard rule object with the same structure as generated rules — no special engine support needed.

The `look` command is also patched. In the original, `look` only works in rooms where `^visited` has already been set to `t` — which only happens as a side effect of certain exit rules, so many rooms respond to `look` with "What?" on the first visit. The patch makes `look` work universally by resetting `^visited` to nil regardless of its current value, causing the room description to reprint.

### The CRT terminal

`js/terminal.js` implements the I/O layer: a typewriter-speed character queue drained via `requestAnimationFrame`, an inline editable prompt with command history, and two promise-based input methods (`readToken` for OPS5 `accept`, `readLine` for `acceptline`).

`css/crt.css` creates the retro look: a bezel frame with power LED, a perspective-transformed screen, repeating scanlines, a slow horizontal band, flicker animation, and triple-layer phosphor text glow. Three themes are available — green P1 (default), amber P3, and white — switchable from the settings menu.

A BIOS-style boot sequence (`js/bootseq.js`) plays on first load: memory count, hardware checks, "LOADING HAUNT.OPS", then handoff to the engine.

## Verification

The port includes a verification framework that compares output from the JavaScript engine against the original OPS5 interpreter (SBCL + sharplispers/ops5 via Quicklisp) for identical command sequences.

```
node tests/verify.mjs
```

Six walkthrough scripts exercise different game paths. Output from both engines is normalized (case, whitespace, nil display, interpreter boilerplate stripped) and diffed line by line. When SBCL is not available, the framework falls back to stored reference outputs in `tests/reference/`.

Known differences fall into two categories:

- **Patch divergence**: Where our patches fix original bugs (e.g., the grave dig puzzle), the outputs intentionally differ.
- **Description ordering**: Within a single turn, ambient description lines may appear in a different order due to our modified MEA tiebreak. All the same text appears — just occasionally swapped.

The verification framework already caught and helped fix a code generation bug where bare comparisons like `^score < 20` (outside brace groups) were mistranslated as literal string equality.

## File structure

```
haunt_game_source.txt         Original 6,744-line OPS5 source (read-only)
index.html                    Single-page app shell
css/crt.css                   CRT bezel, scanlines, phosphor themes
js/
  main.js                     Boot orchestration, settings, save/restore
  terminal.js                 Typewriter output, prompt, input history
  engine.js                   WM + rule matcher + MEA conflict resolution
  runtime.js                  RHS helpers (write, compute, substr, make/modify/remove)
  rules.generated.js          834 translated rule closures (regenerate with tools/)
  game.js                     Patch rules, WM serialization, autosave
  bootseq.js                  BIOS-style boot animation
tools/
  generate-rules.mjs          OPS5 parser + code generator (Node)
  devserver.mjs               Zero-dependency dev server
ops5/
  haunt.ops5                  Patched OPS5 source for reference interpreter
tests/
  verify.mjs                  Verification runner (JS vs. OPS5 comparison)
  harness.mjs                 Headless engine runner for scripted input
  normalize.mjs               Output normalization for diffing
  js-runner.mjs               JS engine subprocess wrapper
  sbcl-runner.mjs             SBCL/OPS5 subprocess wrapper
  walkthrough_*.txt           Command scripts for verification
  reference/                  Stored normalized outputs for CI without SBCL
```

## Regenerating rules

If you modify the OPS5 source or the generator:

```
node tools/generate-rules.mjs
```

This reads `haunt_game_source.txt` and overwrites `js/rules.generated.js`. The browser loads the generated file directly — no further build step.

## Save system

Game state is automatically saved to `localStorage` after each turn. On reload, the game offers to resume. The save is a JSON snapshot of all Working Memory elements.

## Credits

- **Haunt** by John Laird (1979-1983). Original OPS5 source.
- OPS5 production system architecture by Charles Forgy.
- Reference interpreter: [sharplispers/ops5](https://github.com/sharplispers/ops5) on SBCL via Quicklisp.
