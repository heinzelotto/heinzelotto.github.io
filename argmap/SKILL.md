---
name: argmap-author
description: Recipe for reading and authoring .argmap (v0.3) maps — syntax crib incl. declared groups, the D36 number rules, the extraction workflow, and the lint + solve verification loop.
---

# Authoring .argmap maps

Full treatment: `AUTHORING_TUTORIAL.md` (repo root; in a standalone bundle
it sits next to this file). Read its chapter 7 for structural idioms and
chapter 9 for limitations; this skill is the compressed loop.

Outside this repo: the canonical copies live in the **argmap** repo checkout —
`.claude/skills/argmap-author/SKILL.md` and `AUTHORING_TUTORIAL.md` at its
root; the user-level pointer skill in `~/.claude/skills/` carries the local
path to it. For machines without the checkout, the deployed webapp serves the
tutorial at p1graph.org/argmap/AUTHORING_TUTORIAL.md and this skill card from
p1graph.org/argmap/authoring-tutorial.html (the "download SKILL.md" link —
the host renders raw `.md` with front matter to HTML, so the page hands over
the exact bytes as a download instead).

## Reading only

Maps render at p1graph.org/argmap (text / outline / graph panes; solved
values behind the Controls toggle, `authored -> solved` with the gap
tinted). Headless query, from `experiments/solver-prototypes/` (needs
python3 + numpy + scipy + node):
`python3 solve_map.py FILE @node '$edge' --band` or `--top 10`.

## Syntax crib

The block below is a complete, lint-clean file:

```
@prem1 [First premise] 0.9?: gloss; a deeper-indented prose line folds in [^src]
@prem2 [Second premise] 0.8?:
@ground [The objection's ground] 0.5?:
@root [A root fact] 0.9?:
@concl [The claim, as a proposition]: derived, so check not pin  # check: 0.8
$id [headline warrant, <=56 chars] 0.8? @concl | @prem1 AND @prem2: depth here
$rebut 0.3? ~@concl | @ground:            # rebuttal: attacks the claim
$uc 0.6? ~@concl | @ground AND $id:       # undercut: attacks the inference $id
$fact 0.9? @concl:                        # premise-less constraint factor
$step 0.7? @concl | @root: coarse summary; the indented block replaces it unfolded
  @mid [Intermediate claim] 0.8?:
  $fine 0.8? @concl | @root AND @mid:
::topic [A named box]: v0.3 declared group; its block is MEMBERSHIP, not refinement
  @side [An unrelated topic in the same file] 0.4?:
[^src]: Author, "Title," venue, year, URL.
```

Rules: spaces-only indent; IDs document-global, forward refs legal, one
namespace across `@`/`$`/`::`; `AND` linked / `OR` convergent, parens to
mix; `~$id` is banned (error E3) — write an undercut instead; `?` =
estimated; labels crop at ~56 chars on evidences (and group boxes).

**Indentation is sigil-keyed (D58):** it always means "belongs to the line
above"; the PARENT's sigil says how. Under `@`/`$` = refinement. Under
`::` = membership in a declared group.

## Declared groups (`::`, v0.3/D58)

`::id [Label]: gloss` names a box drawn around the nodes indented under
it. Display only, by construction: **no credence** (a number on a `::`
line is an error), **never referenceable** (`::id` in any expression is a
parse error), and **transparent** — deleting every `::` line leaves the
graph, the roles and the solve identical.

Use it for a *topic*, where a wrapper evidence would be a lie: two
arguments sharing a file but no premise, or a shelf of background facts.
Before `::`, that could only be a `# ====` comment no tool could see.

Lint checks the authored box against the derived block (connected
component). Silent: a group equal to one block, or spanning several
*whole* blocks. Warns: **W12** a group covering only PART of a connected
block (edges cross the boundary — the box also cannot fold), **W13** one
block split across two groups (usually an accidental shared premise
merged two topics while your headings still claim they are separate —
the mistake worth catching), **W14** an empty group. Only document-level
groups are checked; nested ones subdivide their parent. Membership does
NOT suppress the isolate note I1. **I2** lists the derived blocks for any
multi-block file — read it to confirm the split you intended.

## Numbers (D36, five rules)

1. Elicit strength as: assume the premises; how likely is the conclusion?
   It is a property of the rule; premise truth lives elsewhere. The given
   bar is directional (contraposition is a different claim).
2. `?` on every rubric-derived value; bare numbers only where the source
   states a number. Fix the verbal->probability rubric BEFORE assigning;
   never move a number after the first solve.
3. Residual rule: frontier roots keep authored values; derived statements
   get `# check: p` trailing comments, never pins — authoring both the
   support and the conclusion double-counts. Never both on one line: a
   pin + check pair on a concluded-into statement fights your own
   counter-evidence and contradicts itself. This holds inside
   refinements too: a hinge with internal incoming lines takes a check;
   if the source also asserts it directly, add a premise-less attributed
   evidence at that register (the direct-assertion pattern), not a pin.
4. No authored 0/1 marginals (world-killers); strength 1 is fine for
   deduction, strength 0 means "drop the number" (W11).
5. Unstrengthed lines are legal structure-only sketches; commit numbers
   later.

## Workflow

1. Skeleton: structure only, no numbers. Per objection ask: which
   inference does this grant, and which does it deny? (undercut vs
   rebuttal). Nest clusters under their target; shared grounds top-level.
2. Elicit blind by rubric (see rule 2).
3. Review checklist: provenance traced; undercut targets typed; overlaps
   merged / shared-source factored / partitioned (`AND ~@other-route`) or
   declared independent in a comment; no dangling sub-conclusions; nesting
   present; full-source coverage; defeat presuppositions guarded (which
   epistemic state does this response presuppose?); multi-voice overlaps
   deduplicated.
4. Mechanical smoke: lint, parse (editor), solve (below).

## Gotchas

1. Undercut schema is exactly `$u q ~C | grounds AND $target`; dropping
   the `AND $target` silently makes it a rebuttal.
2. Convergent lines must not share grounds (independence is assumed);
   merge, name the shared source, or partition.
3. `AND` only if no conjunct alone suffices; overdetermined routes are
   separate convergent lines.
4. A sigil forgotten on a node line silently becomes gloss text — heed
   lint W3. A whitespace-preceded `#` inside a gloss starts a comment.
5. Asserting `@c | @a` alone drags P(@a) down (drift tax); author a value
   on `@a`, or map the source's converse `~@c | ~@a` if it asserts one.
6. `#` section-heading comments are nesting debt: each divider marks a
   cluster that should fold — wrap it (wrapper evidence + refinement) or
   nest it under its target; shared grounds move above every cluster
   that uses them; the spine never nests. EXCEPT when the section is a
   *topic* rather than a fold unit (no inference to summarize): that is
   a declared group `::id [Label]`, not debt. Don't condition on
   near-tautology premises (the negated slab is empty; condition on the
   informative complement).

## Verify

```bash
python3 tools/argmap-lint.py FILE          # repo; in a bundle: python3 argmap-lint.py FILE
cd experiments/solver-prototypes && python3 solve_map.py FILE --top 10   # bundle: cd solver/
python3 solve_map.py FILE @headline --band
```

Errors must be zero. Warnings need explanations, not suppression: W1 is
legitimate only for deliberate conditioning-on-an-inference (say so in a
comment). Investigate any tension above ~0.15 before touching numbers,
and then fix structure or add named evidence — never tune silently. On
expression-valued conclusions the lint skips the undercut-shape checks
(W1/W9) by design; the editor validator covers those.
