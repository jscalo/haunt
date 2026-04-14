# Haunt

A faithful web port of John Laird's **Haunt** (1979-1983), one of the largest OPS5 programs ever written. The original is a text adventure with ~800 production rules, 14 treasures, ~35 locations, a madness timer, an oil-truck escape sequence, and a maximum score of 440.

This port runs entirely in the browser as a single-page app. No server, no build step, no dependencies.

## Background

I was 9 or 10 when I discovered Haunt on the DEC-10 mainframe that my dad used at the University of Texas @ Austin astronomy department. I was already obsessed with text adventure games like Zork and Colossal Cave Adventure, but Haunt was different. It was irreverent, morbid, and quirky in a way that I'd never seen in a game before and I was hooked.

Fast forward to a few years ago when I wondered if anyone had ever managed to port it to an app or a website. I somehow located the original OPS5 source code for the game but just couldn't figure how to get it ported to something like javascript and eventually gave up.

I hadn't given it much thought since then, but with the advent of agentic coding figured maybe it was worth another shot. Amazingly, with the help of Claude Code I was able to fully and (I _think_) faithfully port it over to javascript, complete with a fun Terminal UI, in about two hours!

## Play

If you just want to play Haunt, go to https://haunt.madebywindmill.com where you'll always find the latest version of the port. Alternatively if you've cloned this repo and want to fiddle with it on your own machine, just open `index.html` in any modern browser, or serve the folder:

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

The port includes a verification framework that runs seven walkthrough scripts through the JavaScript engine and checks the output for regressions. Each run is normalized (case, whitespace, nil display, interpreter boilerplate stripped) and compared against a captured reference.

```
node tests/verify.mjs
```

The pass/fail signal is a **regression check**: the JS output must match `tests/reference/*.js.txt`, the last-blessed snapshot of the port's own output. Additionally, when SBCL + sharplispers/ops5 is available (or `tests/reference/*.ops5.txt` exists as a fallback), the run reports an **OPS5 divergence** — the line count by which the JS output differs from the original interpreter's output. That number is informational, not a pass/fail criterion.

```
Running: full PASS [OPS5 divergence: 164]
```

After an intentional change (e.g. a patch rule that fixes a bug), re-bless the references:

```
node tests/verify.mjs --capture
```

OPS5 divergence is expected and has two sources:

- **Patch divergence**: Where our patches fix original bugs (e.g., the grave dig puzzle), the outputs intentionally differ.
- **Conflict-set tiebreak**: sharplispers falls back to pushdown (insertion) order for instantiations tied on recency and specificity; this engine uses rule source index. Within a single turn, ambient description lines may appear in a different order as a result — all the same text appears, just occasionally swapped.

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
