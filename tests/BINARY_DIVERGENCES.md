# Binary Divergences

Our OPS5 source is a partial OPS4→OPS5 port abandoned mid-way. The original OPS4 source is lost. Ground truth for the parts our source doesn't cover (and for comparison on parts it does) is the live PDP-10 binary on sdf.org.

Connection: `ssh twenex@sdf.org`, login `new`/`new`, run `haunt`.

Probe harness: `tests/remote_play.exp <cmd-file> <log-out>`. Input files mirror walkthrough format; pacing is 80ms/char + 250ms inter-command (faster speeds break the service).

Transcripts from each probe are in `tests/transcripts/`.

---

## Confirmed divergences

### Bus exit verb

- **Binary**: `out` is the only reliable exit verb from the bus. `exit bus`, `get off`, `disembark`, `get out` all fail with various error messages.
- **Our port**: `exit bus`, `get off`, `leave`, `depart`, `disembark`, `get out` all work; bare `out` did not (it normalizes to `exit` alone, which has no target).
- **Status**: Fixed in `patch_bus_out` — bare `out` in bus now modifies place to `lawn out 5,2` (matches name1026).
- **Test**: `tests/walkthrough_bus_out.txt`.

### Outer-lawn geometry

- **Binary**: Bus drops you at the south-wall midpoint, directly facing a *decorative, locked* south gate ("inoperable, won't be able to open it"). The real entry is the **east gate**, 3 tiles north of the SE corner. Walls are slick (no climb anywhere on perimeter).
- **Our port**: Grid-based outer lawn (east/north coords 1..8); entry point at east=8, north=5 (which is geometrically equivalent to the binary's "east gate 3 tiles north of SE corner"). Still has the ivy-wall balcony jump as an alternate entry path that the binary lacks.
- **Status**: Grid coordinates happen to match (confirmed via probe). Ivy-wall alt path remains — flagged but not reconciled; may be intended as a shortcut for players.

### Gate entry sequence

- **Binary**: From the east gate:
  1. `press button` × 4 (progressive snore/grumble/wake responses; 5th press teleports you back to bus stop as penalty).
  2. After 4th press, attendant asks *"How did you get here, on that stupid bus?"* → `yes`.
  3. *"Suppose you think you can survive in Chez Moose for a night...?"* → `yes`.
  4. *"So I guess you want to come in the gate, don't you?"* → `yes`.
  5. Three admission questions:
     - *"What is your name?"* → any answer.
     - *"Which sex... interests you sexually"* → any answer, produces *"Your mother would faint if she knew that."*
     - *"What was the first production system with more than 1500 productions?"* → **`haunt`** (self-referential trivia). Wrong answer → back to bus stop.
  6. Gate opens; attendant **confiscates your gold token**; you're on the driveway with the gate locked behind you.
- **Our port**: Full dialog + trivia + token-toll reproduced via `gateEntryPatches` in `js/game.js` (15 rules). The former `hi` shortcut at the gate is disabled (shows a hint to use the button).
- **Status**: Reconciled.
- **Test**: `tests/walkthrough_gate_entry.txt` exercises the full flow through to token confiscation.

### Starting inventory / token

- **Binary**: Starting inventory is `token` + `watch`. Token is lost to the gate attendant on entry.
- **Our port**: Token is now confiscated at entry (see `patch_gate_trivia_right` in `js/game.js`). Post-entry inventory = `watch` only, matching the binary.
- **Status**: Reconciled.

---

## Confirmed matches (no divergence found)

- **Intro text / bus boarding**: Identical to our port through the bus ride's "Va Vooooom!" narration.
- **Bus-stop `wait` / `board` mechanics**: Identical.
- **Max score (440)** and scoring rubric text: Identical.
- **Gate electrification**: Binary says *"upper part of the gate is electrified"* on `climb gate`; our port has this text too.

---

## Methodology

When probing the binary:

1. Build a command file in `tests/transcripts/<probe>.cmds` — one command per line, `#` for comments.
2. Run `tests/remote_play.exp <cmds> <log>`. Each session is a fresh game (no save state on the binary for `new` users).
3. Keep probes short (< 30 commands) — sdf.org shells get flaky on long sessions and pace-sensitive.
4. Save logs in `tests/transcripts/` with a descriptive name so later comparisons can cite them.

When reconciling a divergence:

1. Document the discrepancy in the "Confirmed divergences" section above, including cited transcript filenames.
2. Decide scope: a surgical patch (few rules, no walkthrough break) vs. a major rewrite (multiple rules, walkthrough updates).
3. For surgical changes, add a test in `tests/` using the `tests/harness.mjs` runner that exercises the new behavior.
4. For major rewrites, plan the full scope before editing (new WMEs, rule re-ordering, walkthrough updates, reference-file re-capture).
