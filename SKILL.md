---
name: argmap-author
description: Recipe for reading and authoring .argmap (v0.3) maps: syntax crib incl. declared groups and source quote lines, the D36 number rules, label/gloss discipline, the structural-idiom catalog, nesting discipline, the extraction workflow, and the lint + solve verification loop.
---

# Authoring .argmap maps

This file is meant to be sufficient on its own: syntax, numbers, the
idiom catalog, nesting discipline, the workflow, and the checks. Open
the full tutorial only for depth: the rationale behind each rule, the
reading chapter, and a complete worked example with its solver readout
(`AUTHORING_TUTORIAL.md` Appendix A). Pointers below read `tut 7.4`
(= that tutorial's section 7.4). `examples/README.md` indexes the
example corpus by idiom, and is the place to read a whole real file.
`MATH.md` is the model underneath the numbers. Read it when a *why*
question about solved values or tension comes up; nothing here needs it.

Outside this repo: the canonical copies live in the **argmap** repo
checkout: `.claude/skills/argmap-author/SKILL.md` and
`AUTHORING_TUTORIAL.md` at its root; the user-level pointer skill in
`~/.claude/skills/` carries the local path to it. For machines without
the checkout, the deployed webapp serves the tutorial at
p1graph.org/AUTHORING_TUTORIAL.md and this skill card from
p1graph.org/authoring-tutorial.html (the "download SKILL.md" link:
the host renders raw `.md` with front matter to HTML, so the page
hands over the exact bytes as a download instead).

## Reading only

Maps render at p1graph.org (text / outline / graph panes; solved
values, "implied" in the UI, are on by default and the "Show what the
map implies" Controls toggle turns them off, `authored -> implied` with
the gap tinted). Headless query, from `experiments/solver-prototypes/` (needs
python3 + numpy + scipy + node):
`python3 solve_map.py FILE @node '$edge' --band` or `--top 10`.

## Syntax crib

The block below is a complete, lint-clean file (given
`argmap-version: 0.3` in the frontmatter, which the last two lines
need):

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
  @side [An unrelated topic in the same file] 0.4?: a claim of its own
    #[note: an annotation comment - free per file in the parity check]
    > a verbatim span from the source, attached to @side [^src]
[^src]: Author, "Title," venue, year, URL.
```

Rules: spaces-only indent (a tab is a parse error); IDs document-global,
forward refs legal, one namespace across `@`/`$`/`::`; `AND` linked /
`OR` convergent, parens to mix; `~$id` is banned (error E3), so write
an undercut instead; `?` = estimated; labels crop at 56 chars on
evidences (and group boxes), with W5 firing at 57 exactly.

`AND`/`OR` take any number of operands and any operand may be negated,
so a three-conjunct linked premise containing a `~` (`@a AND @b AND
~@c`) is ordinary and idiomatic; the neither-alone-suffices test scales
unchanged. A **premise-less** evidence (`$fact 0.9? @concl:`) is an
unconditional floor on its conclusion (no slab, nothing to be in force
against), and it accumulates with the other lines concluding there
under the same independence assumption as any convergent sibling.

**Indentation is sigil-keyed (D58/D59):** it always means "belongs to the
line above"; the PARENT's sigil says how. Under `@`/`$` = refinement.
Under `::` = membership in a declared group. Sigil-less prose folds into
the gloss; a `>` child is a quote line (below).

Optional YAML frontmatter carries `title`, `author`, `date`,
`description`, `source`, `scope` (which part of the source the map
claims to cover; state it, it is review checklist item 6),
`focus: [id, id]` (D57; declare only when topology misreads intent, e.g.
a goal guard), and `argmap-version`. Unknown keys are preserved, which
makes frontmatter the extension point for provenance notes. The version
gate covers **pairs and quote lines**: `0.3` is required if the file
writes slash pairs (`0.9/0.2`, E5/W10) or `>` quote lines (W19).
Declared groups are not gated, though a `::`-using file conventionally
declares 0.3.

Two-sided pairs (v0.3, D52/D53): `$e 0.9/0.2 @c | @a` adds an opposed
floor in the same slab; `@s 0.8/0.1` bounds P(s) to [0.8, 0.9] instead
of pinning a point. No whitespace around the slash, `?` binds per
member, an omitted second member is 0 (= the v0.2 reading). Ignore pairs
until you need "this cuts both ways" or an interval-shaped residual.

## Declared groups (`::`, v0.3/D58)

`::id [Label]: gloss` names a box drawn around the nodes indented under
it. Display only, by construction: **no credence** (a number on a `::`
line is an error), **never referenceable** (`::id` in any expression is
a parse error), and **transparent**: deleting every `::` line leaves
the graph, the roles and the solve identical.

Use it for a *topic*, where a wrapper evidence would be a lie: two
arguments sharing a file but no premise, or a shelf of background facts.
Before `::`, that could only be a `# ====` comment no tool could see.
The workhorse case in practice is the **objection battery inside a
box**: several answered attacks on the box's claim, grouped so they
read (and fold) as one unit. Keep the family's lines contiguous; put a
ground inside only if nothing outside the family consumes it; label
with a short reader question. Every group folds to a summarizing card
(non-closed ones bundle their boundary edges into dashed summaries,
D124), and a group nested in a refinement starts folded.

Lint checks the authored box against the derived block (connected
component). Silent: a group equal to one block, or spanning several
*whole* blocks. Warns: **W12** a group covering only PART of a connected
block (edges cross the boundary; its fold bundles them into summary
edges), **W13**
one block split across two groups (usually an accidental shared premise
merged two topics while your headings still claim they are separate,
which is the mistake worth catching), **W14** an empty group. Only
document-level groups are checked; nested ones subdivide their parent.
Membership does NOT suppress the isolate note I1. **I2** lists the
derived blocks for any multi-block file. Read it to confirm the split
you intended.

## Source quotes (`>`, v0.3/D59)

`> verbatim text [^locator]` under a node carries a **verbatim** span of
source material plus its footnote locator (tut 3.12). The gloss goes
back to being a claim a reader can parse cold; the quotes sit beneath it
as its evidence. Replaces the retired `~"…"` in-gloss convention, which
no tool could see.

```
@no-honor [Honor is a contingent evolved hack an AI won't carry] 0.9?: an
  evolutionarily contingent shortcut, not a convergent feature of minds
  #[de: ein seltsamer Hack, auf den die Menschheit gestossen ist]
  > a specific weird hack that humanity stumbled into [^supp-ch5]
  > quite skeptical that gradient descent will stumble across the same shortcut [^supp-ch5]
```

Rules: **verbatim, never paraphrased**; **always give a locator** (W15:
chapter, supplement page, or transcript timestamp, whatever the source
allows); **only a trailing `[^id]` is the locator**, anything else on the
line is verbatim text including a mid-line `[^…]` (W16); **no trailing
`#` comment**, the one line kind without one, because source text cannot
be reworded to dodge the splitter (W17 flags a ` # ` inside a quote);
**no wrapping**, one line however long; **placement is positional**: a
quote attaches to the node above and must sit in that node's *annotation
block*, the span before its first child, so a `>` at top level or after a
child node is E9, never a re-attachment outward; **gloss first, then
quotes** (W18, since the serializer rewrites to that order anyway);
declare `argmap-version: 0.3` (W19).

**Which spans become `>` lines: the three-way test.** *Is this the
node's own wording, or support for it?*

1. **Supporting quote** (most of them), evidence for the claim: lift to
   a `>` line.
2. **Load-bearing inline fragment**, a verbatim phrase that is a
   grammatical constituent of the gloss sentence (`Kelvin's "infinitely
   beyond…" fell to DNA`): keep it in the gloss in **plain quotation
   marks**, the node's own phrasing borrowing the source's words. Add an
   **echo** (a `>` line with the full verbatim sentence + locator, gloss
   fragment unchanged) when provenance matters.
3. **Quote-is-the-claim** (the gloss is nothing but the quote): the
   degenerate case of 2, with plain marks in the gloss and a `>` echo
   underneath.

**Quotes are never translated.** In a multilingual set the whole `>`
line is byte-identical across languages (`translation-parity.py` enforces
it); a translated "verbatim" quote is false and breaks the tie to the
source. The echo pattern is what makes case 2 honest across languages:
the translated gloss quotes ordinary prose, the `>` line stays in the
source language.

**Annotation comments.** Per-quote side data goes on a full-line
`#[key: …]` comment (no space between `#` and `[`) above the quote, at
its indent. An ordinary comment to the parser; **free per file** in the
parity check (every other comment must match byte-for-byte); and the
reserved surface for real attributes in a later version, so the
convention promotes without a rewrite. Current tenant: `#[de: …]`,
parking a quote's translation until quotes get a real translation field.

## Labels and glosses

Three slots, three different jobs (tut 6):

1. **Statement label** = the claim itself, a proposition, may be a full
   sentence. Not length-linted.
2. **Evidence label** = the headline warrant: *why* the premises bear on
   the conclusion, in a phrase. Crops at ~56 chars in the graph (W5), so
   distill. Not every evidence needs one. An obvious deductive
   connector is better unlabeled than filler-labeled (about half the
   flagship's evidences carry labels).
3. **Gloss** = the depth tier: full reasoning, qualifications, source
   voice, quotes. Never length-linted.

The three-job test for gloss text: content is either (a) a role tag
("undercut of ..."), derivable from topology, so delete it; (b) the
warrant, which belongs in the label; or (c) format-meta commentary,
which belongs in a `#` comment. What survives is the genuine depth
tier. Put the substantive point first even inside a gloss: displays
crop from the end.

Three conventions worth keeping: **plain-first, technical-nested** (write
the gloss plainly, move a technical restatement to a folded continuation
line starting "technical reading: ..."); **rubric provenance is not
reader content** (elicitation citations like "R-STEP S2: ..." go in a
trailing `#` comment, not the gloss, while reader-valuable quotes and
footnote refs stay); and in multi-speaker maps **prefix evidence labels
with a speaker tag** ("A:", "L:"), because IDs are invisible at graph
junctions.

## Numbers (D36, five rules)

1. Elicit strength as: assume the premises; how likely is the conclusion?
   It is a property of the rule; premise truth lives elsewhere. Do not
   discount a strength because you doubt the premises. The given bar is
   directional. Contraposition is a different claim, so preserve the
   direction the source asserts.
2. `?` on every rubric-derived value; bare numbers only where the source
   states a number. Fix the verbal->probability rubric BEFORE assigning;
   never move a number after the first solve.
3. Residual rule: frontier roots keep authored values; derived statements
   get `# check: p` trailing comments, never pins, because authoring
   both the support and the conclusion double-counts. Never both on one
   line: a pin + check pair on a concluded-into statement fights your
   own counter-evidence and contradicts itself, and the lint flags any
   head line carrying both as **W23**. This holds inside
   refinements too: a hinge with internal incoming lines takes a check;
   if the source also asserts it directly, add a premise-less attributed
   evidence at that register (the direct-assertion pattern), not a pin.
   The keeper sentence: a statement's own indented block *explicates* its
   number; sibling lines concluding into it *replace* it.
   Syntax of the check comment: it must sit on the node's **head line**.
   On a folded continuation line it is silently ignored, with no
   diagnostic and a `—` where the readout would show it. It may carry
   `?` and be followed by prose (`# check: 0.95?  (A2: restated)`); the
   reader stops at the number. In a source-faithful map the `?` belongs
   there, because the check is the source's register, not your belief.
4. No authored 0/1 marginals (world-killers); strength 1 is fine for
   deduction, strength 0 means "drop the number" (W11).
5. Unstrengthed lines are legal structure-only sketches; commit numbers
   later.

Four consequences that trip authors (tut 4.2, 4.4, 4.5):

1. **Drift tax.** Asserting `$imp 0.8 @c | @a` alone drags solved P(@a)
   to ~0.36. Two remedies, both ordinary authoring: author a value on
   `@a`; or, if the source asserts the converse, write the cross-slab
   pair `~@c | ~@a` (idiom 7 below). Do not confuse that with the
   same-slab pair (`@c | @a` opposed by `~@c | @a`), which compounds the
   drift instead of cancelling it.
   The tax follows the premise's **polarity**, in both directions: with
   `$e 0.9? @c | ~@a` the same mechanism pushes P(@a) *up* (0.5 → 0.651,
   the exact mirror of 0.349). Conditioning on a negated statement is
   therefore an implicit vote *for* it. Expect it, and check the sign
   before calling the result a bug.
   When the premise is itself **derived** (concluded into by other
   lines), rule 3 wins and the first remedy is off the table: do not pin
   it. Author the missing counter-evidence as its own named line at the
   source's register instead, the same move as the direct-assertion
   pattern (idiom 13). A pin would fight the very lines that conclude
   into it; a named line accumulates with them and stays criticizable.
2. **Independence is assumed**: separate lines accumulate noisy-OR, so
   convergent lines with overlapping grounds double-count. Three repairs
   in increasing order of structure: merge into one evidence; name the
   shared source as a statement and condition both on it; or partition
   with `AND ~@other-route`. Applies only to lines converging on the
   *same* conclusion. One statement feeding several different
   conclusions needs no declaration.
3. **Stacking to ~0.99 is not automatically an error.** Four genuinely
   independent 0.85 routes compound past 0.99; if the source really
   asserts four sufficient reasons, that is its own logic, and a lower
   `# check:` on the hub turns the difference into a visible audit
   finding. First check for an unnamed shared latent (repair 2), since
   several "distinct" failure modes of one mechanism usually have one.
4. **An undercut does NOT push its own conclusion.** Its strength is
   "granted the grounds, how often does the target inference fail?" Do
   not pre-discount it because a response exists (author the response as
   an undercut of the undercut). But an undercut-shaped line compiles as
   a pure **inhibitor** of its target: it carries no floor of its own
   (SOLVER_SEMANTICS §1.2, the factored-A compile), so the negated
   conclusion it names gets no independent push from it. Two measured
   consequences: an undercut whose target is unstrengthed moves nothing
   at all (0.500 → 0.500); and an undercut of a rebuttal reinstates the
   claim only *toward* the value it would have with the rebuttal absent,
   never past it (0.500 → 0.866 against a rebuttal-free 0.898).
   The authoring consequence, and it is easy to miss: when the source
   also asserts the **fact** the objection rests on, and you want that
   fact to bear on the conclusion, the undercut cannot carry it. Author
   the fact as an ordinary evidence line beside the undercut. The two do
   not double-count: the inhibitor acts on the inference, the plain
   line acts on the claim.

## Structural idioms

The patterns that carry the flagship map
(`experiments/llm-extraction/iabied-comprehensive-en.argmap`; each entry
names an anchor to grep for). Full prose in tut 7; whole readable files
in `examples/` (see its README).

1. **Objection/response triple** (tut 7.1, anchor `@c11-readthoughts`).
   The workhorse; FAQ-shaped sources map one row each. An objection
   statement, an objection evidence concluding against the target, and a
   response undercutting that evidence:
   `@hope 0.15?:` / `$hope-obj 0.2? ~@target | @hope:` /
   `$hope-resp [why the hope fails] 0.85? @target | @ground AND $hope-obj:`.
   The `-obj`/`-resp` suffixes are a mnemonic convention, not syntax.
2. **Undercut ladder** (tut 7.2, anchor `$uc-counting`): rebuttal,
   undercut, response and undercut-of-undercut are one schema applied
   repeatedly. `$uc-uc q @claim | @grounds AND $uc` reinstates `@claim`
   exactly to the extent the rescue in `$uc` fails.
3. **Linked vs convergent, side by side** (tut 7.3, anchor
   `$fragile-ev`). Write `$a 0.9? @hub | @x AND @y AND @z` beside
   `$b 0.7? @hub | @w`. Test for linked: *neither conjunct alone
   suffices* ("neither end alone shows disagreement; together they are
   the spread").
4. **Convergent siblings instead of a false AND** (tut 7.4, anchor
   `$adv-speed-ev`). When the source says "any one of these suffices",
   write separate evidences on the same conclusion, never one
   conjunction. The flagship had this wrong as a four-way AND; the
   repair note is still in the file.
5. **Coarse summary + refinement** (tut 7.5, anchor `$link `, grepped
   with the trailing space): one coarse line whose indented block holds
   the whole sub-argument. The coarse strength is not a solver input
   (the refinement replaces it); it is the evidence-side check. Author
   it as your holistic judgment *before* trusting the steps, and the
   comparison is a free audit. Special case, the **coarse hull**: when a
   region's linking evidence mixes one cross-region premise with
   region-local hubs, write the coarse line conditioning on just the
   cross-region premise (`$takeover-ev @takeover-doom | @unaligned-asi`
   in the He map) and put the fine conjunction plus the local clusters
   in the refinement: the spine edge survives folding, because a
   refinement folds to its visible coarse line where a statement block
   folds to nothing (spine test).
6. **Complementary partition, "even if"** (tut 7.6, anchor `$mwb-time`).
   Make two overlapping routes disjoint by conjoining the negation of
   the other: `$r2 0.9? @c | @route2-ground AND ~@route1-ground`. That
   `~` conjunct is the source's own "even if X were false".
7. **Balancing evidence** (tut 7.7, anchor `$no-doom-otherwise`): a
   conditional says nothing outside its slab. If the source asserts the
   converse, name it: `$conv 0.9? ~@c | ~@a`. Cancels the drift tax and
   keeps a contested claim on the map instead of hiding it in a prior.
8. **Conditioning on an inference** (tut 7.8, anchor `$shutdown-ev`), a
   policy that hangs on an implication, not on a fact:
   `$policy 0.93? @should-act | $link`. Conditioning on the implication's
   *conclusion* would be subtly wrong (unconditional doom would justify
   no ban). The rare positive evidence-as-premise; lint fires W1 by
   design, so say so in a comment.
9. **Shared latent conjunct** (tut 7.9, anchor `$hope-care`; the latent
   is `~@no-right-care`). When k objections express one underlying
   doubt, name the doubt as a statement and conjoin it into every
   member, eliciting its prior once, family-holistically. Prefer as the
   latent the statement the support side already denies, so attack and
   support quantify over the same worlds. The only structure of six
   probed that stayed stable as hopes were added.
10. **Epistemic-fact reification** (tut 7.10, anchor `@risk-unbounded`;
    wrong shapes in `examples/edge-cases/e15-reified-chance.argmap`):
    the solver cannot represent facts about credences, so reify the
    evidence-state as a first-order statement, state the norm as its own
    statement, and combine near-deductively:
    ```
    # fragment - not standalone
    @risk-unbounded [No one can bound the risk below the threshold]: about what has been demonstrated, not about anyone's opinion
    @no-gamble [Running an unbounded risk is impermissible] 0.93?: the norm, stated where it can be attacked
    $fine 0.9? @policy | @risk-unbounded AND @no-gamble:
    $escape 0.9? ~@policy | ~@risk-unbounded:
    ```
    `$escape` is the author naming the condition under which their own
    conclusion lapses, which is honest and persuasive.
11. **Rebuttal guards** (tut 7.11, comment anchor `risk-conditional
    rebuttal guards`). Ask of every response: *which epistemic state
    does this defeat presuppose?* If it only works while X is
    undemonstrated, conjoin the statement saying so, and the defeat
    lapses (objection revives) in the worlds where X is demonstrated.
    Structure only, no new numbers. Seven flagship responses carry it.
12. **Exclusive alternatives + authored abduction** (tut 7.12,
    `examples/09-exclusive-causes.argmap`):
    `$who 1.0 @alice OR @bob | @cake:` (the abductive step, stated as a
    contestable rule) plus `$notboth 1.0 ~@alice OR ~@bob:` (premise-less
    constraint). Abduction is authored, not free: pinning the effect
    gives the causes no diagnostic lift by itself.
13. **Direct assertion** (tut 7.13,
    `experiments/llm-extraction/debate-tang-shapira.argmap`). A flat
    spoken claim with no stated grounds becomes an attributed
    premise-less evidence: `$a-blur [A: attention is a blur] 0.9? @opaque: "…" [^t005008]`.
    Sixteen of these carried the debate map. A refusal to give a number
    needs no syntax: leave the marginal blank, and if the refusal is
    itself argued, map that as an undercut cluster against assignability.
14. **The parable at zero depth** (tut 7.14, anchor `a parable`):
    narrative goes in folded gloss continuation lines, not in nodes. A
    whole illustrative story attaches under one statement, costs no graph
    structure, and folds away. Use it for the source's most persuasive
    prose, which is usually exactly what does not decompose into premises.

## Nesting and large maps

First drafts come out flat, and the clusters are usually already visible
as `#` section-heading comments. **Section headings are nesting debt**: a
divider organizes the text file, only indentation organizes the reader's
view. Three tests turn debt into structure (tut 8):

1. **Fold-unit test**: would a reader want this sub-debate collapsed to
   one line? Give it a wrapper evidence whose refinement holds the
   cluster (idiom 5), and author the wrapper's coarse strength as your
   holistic judgment of the cluster's net force.
2. **Burial test**. Anything referenced from outside the cluster moves
   up out of it. A shared ground homed inside one cluster renders as a
   cross-reference burial and, worst case, a stranded node (W6,
   validator-only). Home shared nodes above every cluster that uses them,
   and annotate each reuse site with a comment naming its home region.
3. **Spine test**. The collapsed view must already show the argument's
   shape: a folded evidence contributes no edges, so a buried spine
   disappears from it (W21, which names the linking evidences to lift).
   But do not over-correct into lifting every sub-conclusion: that
   trades a wall of disconnected cards for a crowded one. Pick the top
   TIER deliberately and keep it coarse: headline, sinks, route hubs,
   and the shared grounds the burial test already forces up (~15-30
   cards on a large map); every single-region statement hub lives one
   fold down. "Nest clusters under their target" covers a cluster's
   INTERNAL traffic (grounds, caveats, objection pairs). The mechanics
   rest on a folding asymmetry: a STATEMENT block folds to nothing, an
   EVIDENCE refinement folds to a visible coarse line, edges intact. So
   an edge between two top-level statements never sinks into a statement
   block; it stays a top-level evidence (all premises top-level), or
   becomes a **coarse hull** (idiom 5) conditioning on just its
   cross-region premise, fine conjunction and local clusters in the
   refinement, solve on the fine line (D38). Quick checks:
   `grep -c '^\$'` = 0 on a multi-statement map means no spine at all
   (W21); a top rank past ~40 cards means the tier is set too fine. If
   the source draws its own overview (a section-2 diagram, an abstract's
   roadmap), the flat projection should BE that overview; a
   free-standing exhibit node or two beside a visible spine is fine (W21
   stays silent then).

When all three fail and the heading is still real, the section is a
*topic*, not a fold unit, and that is a declared group (`::`), not debt.

For maps past ~150 nodes: **width, not depth** (every new objection
cluster is a sibling under its target, never a deeper chain; when a
sub-debate wants an eighth level, promote the deep node to a shared
top-level node, so node count can triple while max depth stays flat); a
**manifest comment block** at the top with the coarse spine in ASCII,
every shared node listed with its home region and consumers, and the
region-prefix scheme stated (`@c5-trade`, `$c5-trade-obj`,
`$c5-trade-resp`); build in dependency order and lint after every region.
Smell figure: the flagship holds 431 nodes at depth 5. A hundred-node map
at depth 1 is under-nested even if every line is well-formed. Its reader
meets a wall of top-level nodes and the fold control does nothing.

## Workflow

1. Skeleton: structure only, no numbers - three sub-passes (tut 5.1),
   because the directions fail differently (top-down invents hubs the
   source never asserted, which solve near-tautologous; bottom-up buries
   the spine, W21, and double-counts shared grounds, gotcha 2):
   (a) SPINE top-down, transcribed from the source's own overview (a
   section-2 diagram, an abstract, a title conditional): top tier,
   `focus:`, region list + prefix scheme, the manifest comment. Genre
   flip: a debate asserts no overview up front - go bottom-up first and
   write the spine after the meta-shape emerges (the wrap-up); never
   fake a spine the source did not assert.
   (b) REGIONS bottom-up, in source order, each step citing its
   sentence: statement granularity (a label must be a proposition;
   meta-principles and framing stay glosses, not conjuncts), linked vs
   convergent (test in idiom 3), and per objection: which inference
   does this grant, and which does it deny? (undercut vs rebuttal, the
   most common first-pass error). Nest a cluster's internal traffic
   under its target.
   (c) RECONCILE: promote shared grounds discovered in (b) to the home
   the burial test picks (the nearest container covering every
   consumer, not blindly the document top); merge or partition
   overlapping lines; set the tier by the source's own disclosure order
   - headline, sinks, route hubs and burial-forced shared grounds on
   top, single-region hubs one fold down, cross-tier edges as top-level
   evidences or coarse hulls, never sunk in a statement block (spine
   test, W21). Then lint, and nest-audit for missed fold candidates.
2. Elicit blind by rubric. **Fix the rubric before assigning anything**:
   keep two tables, one for statement registers and one for
   inference-step language, plus **role defaults** for where the source
   is silent (an unhedged asserted step, an objection raised to deflect,
   …). You will need them. Convention: the rubric lives in a comment
   block immediately after the frontmatter. When hedges stack the
   outermost governs; when two readings are defensible author the weaker
   and log both, and likewise when the source asserts one proposition at
   two registers. A stated *rate* ("one accident per twenty million
   hours") is not a stated credence. Keep it in the gloss and derive
   from the assertion's register. In a source-faithful map a `# check:`
   carries the source's own register for that conclusion, `?` and all.
3. Review checklist: provenance traced; undercut targets typed; overlaps
   merged / shared-source factored / partitioned (`AND ~@other-route`) or
   declared independent in a comment; no dangling sub-conclusions
   (every non-headline statement feeds some evidence, though the
   headline itself is the one sink and is exempt); nesting present AND
   the spine surfaced at a coarse tier (top-level evidences exist, W21
   silent, top rank not a crowd; see the spine test's bounds);
   full-source coverage (summarizing from memory under-extracts); defeat
   presuppositions guarded (idiom 11); multi-voice overlaps deduplicated
   (full concurrence = one line at the weaker register; a subset relation
   = shared span plus a residual increment; an instance supports the
   shared ground, not the downstream conclusion). After the skeleton and
   after any restructuring pass, run `argmap-query nest-audit` (add
   `--rank` for the fold-as-detail vs coarse-hull call): it sizes the top
   tier against its genre (the ~40 bound is per group on an atlas map, per
   tier on a spine map), names the boxes whose opened view is a wide and
   deep wall, and lists cones ready to fold with the edges that block them,
   counting each cone by what still stands at the statement's own tier.
   Advice, not a check; declining a proposed fold is a normal outcome.
4. Mechanical smoke: lint, parse (editor), solve (below).

Quoting discipline: verbatim spans of at most one sentence (~25 words),
normally one per node; never alter a quote silently; never reproduce a
self-contained creative unit (a parable, a poem) whole, but retell and
compress. Whole-map budget from one work: low hundreds of words, and
proportionally less for a short source. Where the span goes is the
three-way test above: supporting quotes become `>` lines with a
`[^locator]`; a fragment that is grammatically part of the gloss sentence
stays inline in plain double quotes, optionally echoed by a `>` line. The
budget counts both.

## Gotchas

1. Undercut schema is exactly `$u q ~C | grounds AND $target`; dropping
   the `AND $target` silently makes it a rebuttal.
2. Convergent lines must not share grounds (independence is assumed);
   merge, name the shared source, or partition.
3. `AND` only if no conjunct alone suffices; overdetermined routes are
   separate convergent lines.
4. A sigil forgotten on a node line silently becomes gloss text, so heed
   lint W3. The **inverse has no diagnostic and cannot get one**: a gloss
   continuation line that *begins* `@`, `$`, `#`, `::` or `>` is consumed
   as that construct, because dispatch is a first-character switch and by
   then the parser has built a node with no idea prose was meant. Never
   start a continuation line with a sigil character. Begin with a word.
   (Quote lines cannot wrap, which is what keeps the exposure small.)
   A whitespace-preceded `#` inside a gloss starts a comment,
   and the split is **silent**: `…memory cell #2 is protected` parses as
   gloss `…memory cell` plus trailing comment `2 is protected`, losing
   the rest of the sentence from the display with no diagnostic. The
   escape is to delete the space: `cell#2` stays in the gloss whole.
   Reword or close the gap; never leave ` #` inside prose you meant to
   keep.
5. Asserting `@c | @a` alone drags P(@a) down (drift tax); author a value
   on `@a`, or map the source's converse `~@c | ~@a` if it asserts one.
6. Don't condition on a near-tautology premise (e.g. the OR of four of
   five partition members): the floor semantics constrain both slabs, the
   negated one is nearly empty, and the solve shows a large spurious
   tension. Condition on the informative complement, or drop the premise
   part.
7. `#` section-heading comments are nesting debt (see above); the
   exception is a *topic*, which is a declared group.

## Limitations

Known dead ends, with the standing workaround; none block parsing or
display, they bound what a solve can mean (tut 9):

1. **Scope conditionals** ("aligned now, degrades at superhuman scale")
   have no first-class form; nesting is a partial workaround, statement
   granularity is your burden.
2. **Undercut fan-out**: an undercut names one target, so class-level
   objections ("this is all unfalsifiable") are under-stated. Give the
   family a shared gate premise and rebut that once, or make the
   objection a shared ground feeding several undercuts.
3. **No statement re-opening** (D33): refinement is physical
   indentation, so declare nodes at their refinement site and
   forward-reference them (IDs are document-global).
4. **Binary statements only**: categorical or continuous claims enter
   through threshold-gate statements ("X exceeds T").
5. **Credal links are second-order**: nothing computes "if P(X) > t then
   Y", so use idiom 10 plus a `# gate: q($e) >= t => @c` comment audit.
6. **Statement-level provenance** has no in-format home beyond footnotes
   and ID prefixes; scope policing in multi-source maps is manual.
7. **Independence is assumed** and dependence must be authored; there is
   no correlation annotation.
8. **Solver cost grows with treewidth** (the corpus solves in seconds at
   treewidth ~7–9); width-not-depth authoring also keeps treewidth down.
9. **Comment-layer slots are conventions**: `# check:` and `# gate:` are
   invisible to tools other than the solver readouts.
10. **Cross-map ID reuse is unchecked**, so verify the propositions
    match before treating two maps' same-named nodes as the same claim.

## Verify

```bash
python3 tools/argmap-lint.py FILE          # repo; in a bundle: python3 argmap-lint.py FILE
cd experiments/solver-prototypes && python3 solve_map.py FILE --top 10   # bundle: cd solver/
python3 solve_map.py FILE @headline --band
```

Errors must be zero. Warnings need explanations, not suppression: the
discipline is not "zero warnings", it is "every warning has an
explanation you could put in a comment" (the flagship ships two
deliberate W1s).

| Code | Meaning | Author action |
|---|---|---|
| E1 | duplicate ID (one namespace) | rename |
| E2 | dangling reference | fix the ID |
| E3 | `~$id` | rewrite as an undercut |
| E4 | probability outside [0,1] | fix |
| E5 | v0.3 pair without `argmap-version: 0.3` | declare the version |
| E6 | malformed pair (`0.9/`, `/0.2`) | write both members |
| E7 | `::id` used in an expression | a group takes no part in inference; reference a member instead |
| E8 | a probability on a `::` line | groups have no credence slot; delete the number |
| E9 | `>` outside an annotation block | move it under its node, before that node's first child |
| E10 | `>` with no quote text | write the quote or delete the line |
| W1 | evidence-in-premise, not undercut-shaped | usually a polarity slip; legitimate only for idiom 8, then comment it |
| W2 | directed cycle | usually fine (mutual rebuttal); check it is not a zero-negation support cycle |
| W3 | prose line resembling a node | you lost a sigil |
| W4 | footnote used/defined mismatch | fix |
| W5 | evidence label past 56 chars | an exact threshold, not a guideline: it fires at 57. Distill the warrant; depth to the gloss |
| W6 | stranded node (validator only) | re-home it with its consumer |
| W7 | pair sums > 1 | declared two-sided conflict or infeasible residual; confirm intended |
| W8 | pair `0/0` | drop it |
| W9 | pair entangled with undercut shape | check what the opposed side asserts |
| W10 | pair syntax under a declared version < 0.3 (validator only) | declare `argmap-version: 0.3` |
| W11 | authored 0 strength | you probably mean an unstrengthed line |
| W12/W13/W14 | group vs block mismatch | see the groups section |
| W15 | quote line with no `[^locator]` | add it; provenance is the point |
| W16 | leftover `[^` inside quote text | only a trailing ref is the locator; fix the stray/doubled one |
| W17 | ` # ` inside quote text | quote lines have no trailing comment; move the note to `#[…]` |
| W18 | quotes before the end of the gloss prose | reorder: gloss first, then quotes |
| W19 | `>` under a declared version < 0.3 | declare `argmap-version: 0.3` |
| W20 | retired `~"…"` still in a gloss | migrate it (`>` line / plain marks / echo) |
| I1 | isolated statements | connect or delete |
| I2 | block inventory | read it; confirm the split you intended |

Three caveats. W6 and W10 live only in the TypeScript validator (visible
in the editor), not in this lint. On expression-valued conclusions
(`@a OR @b` left of the given bar) the lint skips the undercut-shape
family (W1/W9) by design, because the editor validator covers those.
And "zero errors" is a weaker gate than it sounds: the lint reports `ok`
on a file it finds no nodes in, so a truncated or mangled file passes
cleanly and then fails in the solver with a raw traceback rather than a
diagnostic. Read the reported counts, not just the exit code:
`0 statements, 0 evidences` on a file you know has nodes means the parse
went wrong. Without the editor, a successful `solve_map.py` run doubles
as the parse gate: it loads the file through the real parser.

Reading the solve: **statement gaps** (authored/check vs solved) mean the
mapped argument does not deliver the stated belief; **evidence tensions**
mean the constraint set cannot honor that strength (look for an
overlooked conflict with neighbouring lines); **spectator gaps** mean a
refinement delivers something different from its coarse summary (decide
which side is wrong, since both happen). Investigate any tension above
~0.15 before touching numbers, then fix structure or add named
evidence, never tune silently. Numbers never move to make badges
disappear; a badge that stays is a finding. That ~0.15 is a rule of
thumb for evidence tensions only; there is no ratified threshold for
statement or spectator gaps, so judge those by whether the gap would
change a reader's reading, and say in the log what you concluded.

The readout's own vocabulary: the header `NAME: 15+14 vars, width=4 |
0.1s, conv=True` reports statements + evidences as solver variables, the
junction-tree treewidth (cost grows with it), and whether the solve
converged. `conv=False` invalidates the numbers below it, so re-check
before reading anything. Each evidence yields **two** tension rows,
`P(E|phi)` and `P(E|~phi)`: the D36 floor is symmetric, so one authored
strength constrains both slabs (given the premises, and given their
negation). That is why conditioning on a near-tautology premise
misbehaves (gotcha 6). `--band` adds the **forced interval** for a named
statement: how far the constraints actually pin it, as against where
max-entropy settled inside that freedom. A wide band is not an error; it
says the exact point value is not load-bearing, so do not build an
argument on its third decimal. An EMPTY band is the real signal: the
constraint set is infeasible at that node.

For translated maps, `python3 tools/translation-parity.py BASE TR`
verifies the translation touches only free-text spans.
