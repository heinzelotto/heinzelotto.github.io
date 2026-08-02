# ArgMap authoring tutorial

Audience: a person who wants to read or write `.argmap` argument maps.
Format version: v0.2 (syntax frozen 2026-07-09; the v0.3 slash-pair
extension is noted where relevant). Semantics: ratified D36 defaults.

Agent-facing companion: the `argmap-author` skill
(`.claude/skills/argmap-author/SKILL.md`) compresses this tutorial into
the working loop; agents load it via the Skill tool, humans can read it
as the cheat-sheet-plus. Since 2026-07-27 the skill is meant to be
**sufficient on its own** for authoring (it carries the idiom catalog,
the label/gloss and nesting discipline, the limitations and the lint
codes in compressed form), so the division of labour is: skill = the
pattern, this tutorial = the rationale, the history, the reading
chapter, and the worked example in Appendix A. A third tier,
`examples/README.md`, indexes the example corpus by idiom for when you
want to see a pattern in a whole file rather than as a fragment.

This tutorial distills the project's design docs and the accumulated
authoring experience into one document. It never overrides them: on any
point of doubt, `FORMAT_DESIGN.md` (syntax), `GRAMMAR_DRAFT.md` (grammar),
`SOLVER_SEMANTICS.md` (semantics), and `GLOSSARY.md` (terminology) are
authoritative, and `DECISIONS.md` records why things are the way they are.
`MATH.md` is the readable account of the mathematics the semantics rests
on (what the numbers mean formally, what has been proved about them, and
what is still open), and is the right next stop after chapter 4.
`AUTHORING_NOTES.md` is the dated log this tutorial condenses; new
learnings continue to land there first.

Snippet convention: every `.argmap` block in this tutorial is either a
complete file that passes `tools/argmap-lint.py` as shown, marked
`(complete, lintable)`, or an illustrative fragment whose first line is
`# fragment - not standalone`.

Contents:

1. What ArgMap is
2. Reading argmaps (self-contained; you can stop after this chapter)
3. The format
4. What the numbers mean
5. From source text to map
6. Labels and glosses
7. Structural idioms
8. Writing large maps
9. Limitations
10. Checking your map
11. Appendix A: a complete worked example. Appendix B: cheat sheet.

## 1. What ArgMap is

ArgMap is a plain-text format plus an editor and viewer for making complex
arguments explorable. Instead of reading a linear essay, a reader navigates
the argument as a graph: the main claim and its support are visible at a
glance, and every reasoning step can be unfolded to the depth the reader
wants. The motivating use case is AI safety argumentation, where the
arguments are long, branching, and full of objections that attack specific
inference steps rather than conclusions. The flagship content is a
comprehensive map of the book "If Anyone Builds It, Everyone Dies"
(IABIED), deployed at p1graph.org.

An `.argmap` file describes a bipartite factor graph with two node kinds:

1. **Statements** (written with the `@` sigil) are variables: propositions
   that can be true or false, optionally annotated with the author's
   credence that they hold.
2. **Evidences** (written with the `$` sigil) are factors: reasoning steps
   that connect statements, optionally annotated with a reliability.

Roles such as premise, lemma, and conclusion are never declared; they are
derived from the graph topology (a statement nothing points into is a
premise, one nothing points out of is a conclusion). Attacks are not a
separate primitive either: an objection is an ordinary evidence whose
conclusion is a negated statement, and an attack on an inference (an
undercut) is an evidence that references the attacked evidence itself.
This uniformity is the core design idea: two node kinds and one reference
mechanism express support, opposition, rebuttal, undercut, and refinement.

The text file is the single source of truth. The editor renders it as an
outline and a graph, but everything those views show is derived from the
text, and everything you author happens in the text.

The v0.2 syntax is frozen (DECISIONS.md D25 to D33). Anything this
tutorial shows is stable; future syntax changes arrive as versioned format
changes (the first is the v0.3 slash pair, gated by an explicit
`argmap-version: 0.3` frontmatter declaration).

## 2. Reading argmaps

This chapter is for readers: people who explore existing maps in the
viewer or query them from the command line. It does not assume or require
anything from the authoring chapters.

### 2.1 The viewer

The editor/viewer at p1graph.org has three synchronized panes: the
text (the `.argmap` source), the outline (a collapsible tree of the same
content), and the graph. Reader and focus views present single nodes and
their neighborhoods in a more article-like form. The graph starts
collapsed: boxes with a fold control contain refinements, finer subgraphs
that replace a summary reasoning step when unfolded. Folding follows the
source structure, so what unfolds together is an authorial decision, not a
layout heuristic.

Conventions worth knowing when reading:

1. `@` nodes are claims; `$` nodes are reasoning steps between claims.
2. An evidence pointing at a claim supports it; an evidence pointing at a
   negated claim opposes it. An evidence that takes another evidence as an
   input attacks (or conditions on) that inference itself, not its
   conclusion.
3. A number on a claim is the author's asserted probability that it holds.
   A number on a reasoning step is its reliability: roughly, how likely
   the step is to actually carry when its inputs hold. A trailing `?`
   marks a number as estimated rather than deliberately asserted.
4. In the flagship map, numbers derive from the book authors' own
   confidence language through a fixed rubric (DECISIONS.md D39), so
   disagreements the display surfaces are audits of the source's
   coherence, not the map maker's opinions.

### 2.2 Solved values and tension

The viewer can compute what all the authored numbers jointly imply. Under
"Show solved values" (in the Controls popover; **on by default** since
D40, though an explicitly persisted opt-out still wins), an
in-browser solver treats every authored number as a constraint and finds
the maximum-entropy distribution that honors them. Each node then shows an
`authored -> solved` readout. The gap between the two is called tension,
and the display tints it: a large gap on a node means the map's stated
argument does not deliver the stated belief at that node. Some statements
carry a check credence (a displayed comparison value that does not
constrain the solve); the badge comparing it to the solved value has the
same meaning.

### 2.3 The headless readout

To query a map without a browser, use the CLI readout (from the repo):

```
cd experiments/solver-prototypes
python3 solve_map.py ../llm-extraction/iabied-comprehensive-en.argmap @shutdown '$link'
python3 solve_map.py ../llm-extraction/iabied-comprehensive-en.argmap --top 10
```

The first form prints, for each named node, the authored value and the
solved value. The second prints the ten largest gaps and tensions in the
whole map: the places where authored numbers and computed numbers disagree
most. `--band` adds the forced interval for a named statement (how far the
constraints actually pin it, as opposed to where the solver settled inside
the allowed range). Quote `$id` arguments so the shell does not expand
them. The solver needs python3 with numpy and scipy, and node on the PATH.

That is everything a reader needs. To write maps, continue.

## 3. The format

An `.argmap` file is plain text, UTF-8, with optional YAML frontmatter,
comment lines, node lines, and footnote definitions. Indentation is
spaces only; a tab is a parse error.

### 3.1 Statement lines

```
@id [short label] p: gloss
```

1. `@id` declares a statement. IDs use `[A-Za-z0-9_-]`, are case
   sensitive, and share one namespace with evidence IDs: `@x` and `$x`
   cannot coexist. Prefer mnemonic IDs (`@risk-unbounded`, not `@s17`).
2. `[short label]` is optional. For statements the label is the claim,
   phrased as a proposition. If no label is given, the gloss serves as
   the display label.
3. `p` is optional: the author's credence that the statement holds, a
   probability literal in [0,1]. A trailing `?` (as in `0.7?`) marks the
   value as estimated or unelicited rather than deliberately asserted.
4. Everything after the `:` is the gloss: one logical line of free text
   giving depth, sourcing, or qualifications.

A statement is a variable, so its label must be a proposition, something
that can be true or false. "Anyone builds it" is a statement; "the
question of whether anyone builds it" is not. Conditionality lives in
evidences, never in statement labels. Normative propositions ("X should
happen", "doing Y is impermissible") are legal and ordinary statements;
what chapter 9's fact/norm caution forbids is not norms but future-fact
nodes that would feed back onto their own antecedents.

### 3.2 Evidence lines

```
$id [label] strength <conclusion-expr> | <premise-expr>: gloss
```

1. `$id` declares an evidence: a reasoning step asserting that its
   premises bear on its conclusion.
2. `[label]` is optional and carries the headline warrant: why the
   premises support the conclusion, in a phrase (chapter 6).
3. `strength` is optional: a bare probability literal, the evidence's
   reliability (chapter 4 explains precisely what it means). `?` works
   as on statements.
4. The `|` is the given bar and reads "given": `$e @c | @a` is evidence
   about `@c` given `@a`. The conclusion side is a full expression, not
   just a single reference.
5. The `| <premise-expr>` part may be omitted entirely. A premise-less
   evidence is an unconditional constraint factor: it asserts its
   conclusion expression with the given reliability, unconditionally.
   Example from the spec: `$rivals ~@hyp-fluke OR ~@hyp-filter: rival
   explanations can't both hold`.

### 3.3 Expressions

Premise and conclusion sides use the same grammar:

1. References: `@id` for a statement, `$id` for an evidence (see 3.6),
   each optionally negated with `~` (`~@id`). Negating an evidence
   reference (`~$id`) is forbidden: it parses, but the validator rejects
   it (error E3). To challenge an inference, write an undercut (3.6).
2. `AND` joins linked premises: the step needs all of them.
3. `OR` joins convergent premises: any one suffices.
4. Mixing AND and OR requires parentheses: `(@a AND @b) OR @c`.
   Unparenthesized mixing is a parse error; there is no silent
   precedence.
5. Unicode `∧ ∨ ¬` are accepted as input aliases; the canonical form is
   ASCII. `&` is not a connective (the `|` character is taken by the
   given bar, so `OR` cannot be written `|` either).

Note the graph-level route to convergence: two separate evidence lines
with the same conclusion are independent factors, which is usually the
right way to say "two independent reasons" (see 4.6 for when it is not).

### 3.4 Refinement (nesting)

Indentation always means **"belongs to the line above"**. What *belongs*
means is read off the parent line's sigil: under `@` and `$` it is
**refinement** (this section); under `::` it is **membership** in a
declared group (3.10). Everything below is the `@`/`$` case.

An indented block under an evidence is a refinement: a finer-grained
subgraph that models the same reasoning step at higher resolution. When a
reader unfolds the evidence, the block replaces it; folded, the outer line
serves as the coarse summary. One consistent indentation increase per
level (two spaces recommended).

```
# fragment - not standalone
$syllogism @socrates-mortal | @socrates-human AND @humans-mortal: surface form
  @intermediate [Socrates inherits mortality property] 0.99:
  $inherit-1 @intermediate | @socrates-human AND @humans-mortal-property:
  $inherit-2 @socrates-mortal | @intermediate:
```

A statement may also carry an indented block; that refines the implicit
factor asserting the statement's own marginal, and the statement itself
remains.

IDs are document-global: a node declared inside a refinement can be
referenced from anywhere, and forward references (using an ID before its
declaration) are legal. Where you nest is a real authoring decision, not
formatting: nesting determines what folds away together in every view
(DECISIONS.md D22).

### 3.5 Glosses and continuation lines

A gloss is one logical line, but it can be hard-wrapped: any
deeper-indented line that does not begin with `@`, `$`, or `#` folds into
the gloss of the nearest preceding node line, joined with a space. This
is also how longer narrative passages attach to a node without costing
graph structure:

```
# fragment - not standalone
@human-precedent [Human intelligence transformed the planet] 0.9?: Nobels to humans, none to chimps
  a parable: a council of beast-"gods" laugh at the Ape-god's newest
  creature, frail and clawless. The Ape-god says only, quietly, "and yet."
```

The hazard: if you forget a sigil on a node line, the line silently
becomes gloss text of the node above. The lint warns when a prose line
looks like a node declaration (W3); take that warning seriously.

**The inverse hazard has no warning, and cannot get one.** A continuation
line that *begins* with `@`, `$`, `#`, `::` or `>` is read as that
construct, not as prose, because line dispatch is a first-character
switch, and by the time anything could complain, the parser has built a
node and has no idea prose was intended. So never start a continuation
line with a sigil character: begin with a word, or rephrase. The exposure
is small because quote lines (3.12) cannot wrap and the corpus barely
uses continuation lines at all, but when it bites there is no
diagnostic: you find it by reading the rendered gloss.

Two lexical restrictions: a gloss cannot contain a `#` preceded by
whitespace (that always starts a trailing comment), and a label cannot
contain square brackets.

### 3.6 Evidences as premises: conditioning and undercuts

An evidence named in another evidence's premise expression denotes that
evidence's activation ("this inference is in force"), not its conclusion.
There are two uses.

The positive use is conditioning on an inference: `$policy @act | $link`
makes a conclusion depend on an implication holding, rather than on a
fact. This is rare and legal; the lint flags it (W1) because the same
shape is usually a polarity mistake, so when you do it deliberately, say
so in a comment.

The common use is the undercut. To attack the inference `$E C | P`
(rather than its conclusion), write:

```
# fragment - not standalone
$E-undercut ~C | <grounds> AND $E: why the inference fails
```

The conclusion negates `$E`'s conclusion; the premises conjoin the
grounds with `$E` itself. Conditioning on `$E` is exactly what makes this
an undercut rather than a rebuttal: if `$E` is itself disabled or
undercut elsewhere, the undercut lapses with it. Dropping the `AND $E`
turns it into a plain rebuttal, which fires regardless. Undercuts of
undercuts (reinstatement) are the same schema applied again.

### 3.7 Comments and comment-layer conventions

A line beginning with `#` is a comment; a whitespace-preceded `#` starts
a trailing comment. Comments are preserved by the parser and serializer.
Section headings in large maps are full-line comments by convention. Use
one when the heading is only for a human reading the source. When you want
the heading to be *checked and drawn*, a named box around those nodes,
use a declared group instead (3.11): no tool can see a comment.

Two trailing-comment conventions carry meaning to the solver tooling
without being syntax:

1. `# check: p` on a statement line records the author's
   all-things-considered credence for display against the computed value.
   It never constrains the solve. Chapter 4 explains when to use it
   instead of an authored marginal. A check value may carry the `?`
   marker like any other value (`# check: 0.9?`), and in a
   source-faithful map it should: there the check is the source's own
   stated register for that conclusion (the D39 practice), not the
   extractor's belief.
2. `# gate: q($id) >= 0.10 => @conclusion` records a threshold audit:
   after a solve, if the left side clears, the named conclusion is
   expected to hold, and the display reports agreement or disagreement.

Both are conventions, not grammar; tools other than the solver readouts
will treat them as ordinary comments.

### 3.8 Citations

Attach citations as Markdown-style footnotes: `[^ref]` in a gloss, and a
definition line anywhere at top level:

```
# fragment - not standalone
@p1 [Capabilities advance rapidly] 0.9: doubling times keep shrinking [^epoch2025]
[^epoch2025]: Epoch AI, "Trends in Machine Learning," 2025.
```

Footnote text is free text: author, title, venue, year, plain URL.
Viewers autolink URLs; there is no inline link syntax. The lint checks
that every used footnote is defined and every defined footnote is used
(W4).

### 3.9 Frontmatter and file layout

Optional YAML frontmatter between `---` fences carries metadata: `title`,
`author`, `date`, `description`, `source`, `scope` (what part of the
source the map claims to cover, checklist item 6), and `argmap-version`
(declare `0.3` if the file uses slash pairs or quote lines). Unknown keys
are preserved, which makes frontmatter the extension point for
provenance notes.

One key is tooling-visible: `focus: [id, id]` (D57) declares the map's
focus nodes, the statements influence readouts measure deltas on. Omit
it and the tooling derives them from topology (statements concluded by
top-level evidence and premised by none). Declare it only when topology
misreads your intent: the known case is a goal guard, a world-layer
conjunct like `... AND @shutdown` on strategy-advice lines, which makes
the goal premise-referenced without arguing from it. The list is
complete, not additive.

Top-level order is free; the graph defines the structure. Convention:
put the document's headline claim first, then work down its support.

### 3.10 v0.3: two-sided pairs (brief)

Since D52/D53 a file declaring `argmap-version: 0.3` may write two-sided
values: on an evidence, `$e 0.9/0.2 @c | @a` adds an opposed floor toward
the negated conclusion in the same slab; on a statement, `@s 0.8/0.1`
bounds P(s) to [0.8, 0.9] instead of pinning a point. No whitespace
around the slash; `?` binds per member; an omitted second member is 0 and
means exactly the v0.2 reading. New maps can ignore pairs until they need
to express "this consideration cuts both ways" or an interval-shaped
residual; details in FORMAT_DESIGN §3.1/§3.2 and SOLVER_SEMANTICS §1.9.

### 3.11 v0.3: declared groups (`::`)

A third sigil declares a **group**: a named box drawn around nodes.

```
::timelines [Capability timelines]: when transformative AI arrives
  @agi-soon [Transformative AI within a decade] 0.4:
  @compute-grows 0.9: frontier training compute keeps growing
  $scaling 0.7 @agi-soon | @compute-grows: the trend argument
```

Its indented block is **membership**, not refinement (the one place the
indentation rule is keyed on the parent's sigil, 3.4). Otherwise the head
reads exactly like a node line: required id, optional `[label]`, optional
gloss, and the same continuation-line folding.

Three properties define it:

1. **No credence.** There is no probability slot on a `::` line, now or
   later. A number there is an error.
2. **Not referenceable.** `::id` in any expression is a parse error. A
   group takes no part in inference: you cannot argue from it or
   against it.
3. **Transparent.** Deleting every `::` line changes nothing about the
   map: same graph, same roles, same solve. A group is display only.

Use one to say "these nodes are one topic". Before `::`, the only way to
say that was a `# ====` banner comment, which no tool could see, check,
or draw.

**Groups and blocks.** A *block* is derived: a connected component of the
graph, a set of nodes that reach each other. A group is authored. They
usually coincide, and the validator checks the relationship: a group equal
to one block, or spanning several *whole* blocks ("two topics under one
heading"), is silent. Two shapes warn, because your claim and the graph
disagree:

- a group covering only **part** of a connected block (W12): edges cross
  its boundary, so the layout distorts and the box cannot fold;
- one block **split across** two groups (W13): usually an accidental
  cross-topic premise silently merged two topics while your headings still
  assert they are separate. This is the mistake worth catching.

Only *document-level* groups are checked. A group nested inside another
group, or inside a refinement, is subdividing its parent, not claiming a
block.

**Folding.** A **closed** group, one where no edge crosses its boundary,
folds to a card showing its label and member counts. A non-closed group does not
fold; the control stays visible but disabled, with the reason. (Folding it
would mean redrawing the crossing edges as summary edges, at which point
the box starts standing in for its members, which is what refinement
does, with none of the authored meaning that makes refinement safe.)

Groups are allowed anywhere: any depth, inside each other, inside
refinements. Membership does **not** suppress the isolated-statement note: a context
shelf of standalone facts still reports each one as isolated.

### 3.12 v0.3: source quote lines (`>`)

A line beginning `>` under a node carries a **verbatim** span from your
source, plus the footnote locator it came from:

```
# fragment - not standalone
@no-honor [Honor is a contingent evolved hack an AI won't carry] 0.9?: honor is
  an evolutionarily contingent shortcut, not a convergent feature of minds
  > a specific weird hack that humanity stumbled into [^supp-ch5]
  > quite skeptical that gradient descent will happen to stumble across the
```

(the last line is shown truncated only for the page width, see "no
wrapping" below.)

The gloss goes back to being a claim a reader can parse cold; the quotes
sit under it as its evidence. Before `>`, a quote could only live inside
the gloss, where no tool could see it. That meant no display affordance,
and, in a translated map, nothing stopping a *paraphrase* from being
presented as verbatim.

**Rules, all short:**

1. **The text is verbatim.** Never paraphrase it, never silently repair
   it. If you need to trim, trim at the ends.
2. **Always give a locator.** `[^ref]` at the end of the line, defined at
   top level like any footnote (3.8). A quote without provenance is
   almost always an authoring slip, and the lint says so (W15). Locators
   are as coarse or fine as your source allows: a chapter
   (`[^epub-ch7]`), a supplement page (`[^supp-ch5-promises]`), a
   transcript timestamp (`[^t001734]`).
3. **Only a locator at the very end of the line counts.** Everything else
   on the line is verbatim text, including a `[^…]` in the middle of it
   (W16 flags that as a probable stray or doubled ref).
4. **No trailing `#` comment**, the one line kind that has none. Source
   text cannot be reworded to dodge the comment splitter, so a real ` # `
   in a quote would be silently truncated; instead the whole line is
   verbatim and the lint warns if it spots ` # ` inside one (W17). Put
   per-quote notes on an annotation comment instead (below).
5. **No wrapping.** A quote is exactly one line, however long; the editor
   soft-wraps it.
6. **Placement is positional.** A quote attaches to the node above it and
   must be indented deeper. It has to sit in that node's *annotation
   block*, the span before the node's first child. A `>` at top level,
   or after a child node, is an error (E9), not a re-attachment to some
   outer node. Order quotes after the gloss prose; interleaving parses,
   but the lint prefers the canonical order (W18) and the serializer
   rewrites to it anyway.
7. **Declare `argmap-version: 0.3`** in a file that uses `>` (W19).

**Which quotes become `>` lines: the three-way test.** Ask: *is this the
node's own wording, or support for it?*

1. **Supporting quote**: a fragment stacked next to the claim as
   evidence for it. Lift it to a `>` line. This is most of them.
2. **Load-bearing inline fragment**: a verbatim phrase that is a
   grammatical constituent of the gloss sentence (`Kelvin's "infinitely
   beyond…" fell to DNA`). Leave it in the gloss, in plain quotation
   marks: it is the node's own phrasing, borrowing the source's words.
   When the provenance is worth keeping, add an **echo**, a `>` line
   carrying the full verbatim sentence and its locator, while the gloss
   keeps its fragment.
3. **The quote *is* the claim**: the gloss is nothing but the quote.
   Degenerate case of 2: write the gloss in plain marks and echo the
   verbatim on a `>` line.

The echo pattern also keeps translations honest: a translated gloss
renders the fragment as ordinary quoted prose (claiming nothing about
verbatimness), while the `>` line stays in the source language.

**Quotes are never translated.** In a multilingual map set the whole `>`
line (sigil, indent, text, locator) is byte-identical across all
language versions, and `tools/translation-parity.py` enforces that. A
translated "verbatim" quote is false on its face and destroys the tie
back to the source.

**Annotation comments (`#[…]`).** Per-quote side data goes on a full-line
comment of the form `#[key: …]` (no space between `#` and `[`) on the
line above the quote, at the same indent:

```
# fragment - not standalone
  #[de: schwer, der Schlussfolgerung zu entgehen]
  > hard to avoid the conclusion [^supp-ch5]
```

To the parser this is an ordinary comment. Two things make the form
worth using rather than a plain `#`: the parity tool treats `#[…]` lines
as free per file (every other comment must match byte-for-byte across
translations), and it is the reserved surface for real attributes in a
later format version, so today's convention promotes without a rewrite.
Its current tenant is the parked translation of a quote, waiting for a
real translation field.

## 4. What the numbers mean

The numbers are the part of the format most worth getting right and the
part where intuition most often misleads. The ratified semantics
(DECISIONS.md D36, full treatment in SOLVER_SEMANTICS.md) reduce to a
small set of rules an author can hold in their head.

This chapter gives those rules operationally: what to write, and why it
behaves as it does. If you want the model underneath them (what the map
compiles to, why the solve is a maximum-entropy problem, and which of
these rules are theorems rather than conventions), that is `MATH.md`,
published as *The mathematics behind ArgMap*. Nothing here depends on
reading it.

### 4.1 Evidence strength

Elicit an evidence's strength by asking: **assume the premises hold; how
likely is the conclusion?** That prompt is the whole elicitation
procedure. Formally the number is the unconditional in-force rate of the
rule (how often this kind of inference actually carries), a property of
the rule itself, independent of whether its premises happen to be true.
The two readings coincide numerically by construction, so you can elicit
with the conditional prompt and reason with either picture.

Practical consequences:

1. The strength isolates the inference. Whether the premises are true is
   carried by the premises' own numbers, elsewhere in the map. Do not
   discount a strength because you doubt the premises.
2. **Contraposition is not a rewrite.** `$e 0.8 @c | @a` and
   `$e2 0.8 ~@a | ~@c` are different claims; the given bar is
   directional. When extracting or translating, preserve the direction
   the source actually asserts.
3. A strength of 1 is legitimate for deductive steps: the line becomes a
   pure constraint ("a proved implication has no reliability
   coordinate"). A strength of 0 is almost never what you want; the
   unstrengthed line is the exact "structure only" form (the lint
   suggests this, W11).
4. An evidence with no strength at all contributes structure to the
   display but nothing to the solve. This is a deliberate, useful state:
   sketch the shape of the argument first, commit numbers later.
5. Do not condition on a near-certain premise. The floor semantics
   constrain both slabs (given the premise, and given its negation), so
   when the premise expression is nearly a tautology (for example the OR
   of four of five partition members), the negated slab is almost empty
   and the constraint cannot be honored there; the solve shows a large
   spurious tension on that line. Condition on the informative
   complement instead (in the partition case, on the negation of the one
   remaining member), or drop the premise part entirely.

### 4.2 The drift tax, and when to counter it

Asserting a conditional lowers its antecedent. If the only line in a map
is `$imp 0.8 @c | @a`, the solved P(@a) comes out near 0.36, not 0.5.
This is principled (a rule that mostly holds makes worlds where its
premise holds and its conclusion fails rare), but it surprises authors.

Two remedies, both ordinary authoring:

1. Author a value on the antecedent. Any authored value on `@a` restores
   the intuitive reading exactly (the slab lemma: asserting P(a) pins the
   antecedent without touching the conditional).
2. If the source itself asserts the converse ("no build, no doom"), write
   it as a second evidence in the other slab: `~@c | ~@a`. This
   cross-slab converse pair cancels the drift and, more importantly,
   keeps the claim on the map where it can be attacked. The flagship
   map's `$no-doom-otherwise` is the worked example.

Do not confuse that with the same-slab pair (`@c | @a` opposed by
`~@c | @a`, or the v0.3 slash pair), which expresses two-sided evidence
inside one slab and compounds the drift rather than canceling it.

### 4.3 Statement values and the residual authoring rule

A statement's authored value is a floor-style constraint, and the single
most important discipline in the whole system applies to it:

**Author only the evidence for or against a statement that is not
already contained in the rest of the map.**

1. **Frontier roots** (statements with no incoming evidence in the map)
   keep their authored values. Their number is the map's interface to
   everything unmapped; that is what roots are for.
2. **Derived statements** (concluded into by mapped evidence) should
   normally carry no authored value. Their probability is the output of
   the solve. If you author one anyway, you are counting the mapped
   support twice.
3. If you disagree with what the solve delivers for a derived statement,
   you have three honest moves, in order: fix the argument (structure or
   strengths); add the missing evidence as a new, named line (a
   premise-less evidence is fine, but it must say what the evidence is);
   or record your number as a check credence, `# check: p`, and let the
   displayed badge show the disagreement.

The check credence is the designated home for "all things considered I
believe 0.85 even though the mapped argument delivers 0.48". It is
displayed, compared, and never constrains the solve. Wanting to force a
derived statement to a number is precisely the situation the rule
exists to catch.

One explicit anti-pattern: a statement line carrying both an authored
value and a `# check:` comment. On a concluded-into statement the pin
double-counts the mapped support and, worse, fights the very evidence
you authored against it (the pin holds the solved value where the
counter-evidence should have moved it), while the check silently
disagrees with the pin. Concluded-into statements take a check or
nothing; only frontier roots take pins.

The rule is topological and does not change inside refinement boxes. A
hinge statement that sibling lines inside a refinement conclude into is
a concluded-into statement like any other: check, not pin, even when
the source asserts it at a clear register and the mapped internal
support delivers less. That under-delivery is an audit finding about
the source, not a display problem to pin away. When the source asserts
the hinge directly, over and above the arguments it gives for it, that
assertion is itself evidence and has a named home: a premise-less,
attributed evidence line at the source's register (the direct-assertion
pattern, 7.13). It accumulates with the argued routes instead of
clamping over them, and it is visible and criticizable in a way a pin
never is. Under v0.3, a floor pair is the interval-shaped variant.

The distinction that keeps this straight: a statement's **own indented
block explicates its number** (the block refines the implicit factor
asserting the marginal, and the statement keeps it, 3.4); **sibling
lines concluding into the statement replace it** (the value becomes the
solve's output, and the author's number moves to a check).

Also: inference through the map is not evidence you authored. If an
evidence about `@a -> @c` moves the solved P(@a) (drift, modus tollens),
do not "correct" `@a`'s authored value for it; that effect is already
contained in the map.

### 4.4 Independence, and what to do when it fails

Separate evidence lines are treated as independent mechanisms; their
premise-less masses accumulate like independent reasons (noisy-OR). That
is what makes two convergent lines mean "two independent reasons". When
the grounds actually overlap, independence double-counts. Three repairs,
in increasing order of structure:

1. **Merge** the lines into one evidence if they are really one argument.
2. **Name the shared source** as a statement and condition both lines on
   it; the dependence is then authored in the world layer where it
   belongs.
3. **Complementary partition**: make an "even if" explicit by conjoining
   the negation of the other route, as in `$mwb-time ... |
   @wont-solve-in-time AND ~@align-hard` (the two routes then partition
   the worlds instead of overlapping).

Two boundary clarifications. First, the discipline applies to lines
converging on the **same** conclusion; one statement legitimately feeds
premises of several different conclusions, and that needs no
declaration. Second, genuinely independent routes stacking a hub high
(noisy-OR takes four 0.85 routes past 0.99) is not by itself an error:
if the source really asserts four independent sufficient reasons, the
high number is what the source's own logic delivers, and a lower check
credence on the hub turns the difference into a visible audit finding
(the source claims less than its own arguments compound to). Before
accepting that reading, check whether the routes share an unnamed
latent (repair 2); several "distinct" failure modes of one mechanism
usually do.

### 4.5 Undercut strength

An undercut (3.6) carries the defeater's operative rate: **granted the
grounds, how often does the targeted inference actually fail?** The
grounds' own plausibility is carried by the guard statements, so do not
pre-discount the undercut for it. Likewise, do not pre-discount a
defeater because a response to it exists; author the response as its own
undercut of the undercut and let the graph do the discounting. q' = 0 is
inert, q' = 1 eliminates the target in context, values between
interpolate.

An undercut does **not**, however, push its own conclusion. This
paragraph said the opposite until 2026-07-27, when the skill-only
sufficiency eval authored a cluster on the strength of it and produced a
0.61 statement gap; the claim is wrong and the correction matters for
authoring. An undercut-shaped line compiles as a pure **inhibitor** of
its target: per the factored-A compile (SOLVER_SEMANTICS §1.2),
"inhibitors carry no zero-set of their own", so the negated conclusion
the line names receives no independent floor from it. Measured on the
ratified defaults: an undercut whose target is unstrengthed leaves its
conclusion at 0.500, exactly as if the line were absent; and an undercut
of a rebuttal recovers the claim monotonically toward the value it would
hold with the rebuttal absent (0.500 → 0.866 against a rebuttal-free
0.898), never past it, which is what T13's "recovers monotonically to
≈p" records.

The authoring consequence: when the source both raises an objection to
an inference *and* asserts the fact that objection rests on, the
undercut carries only the first. If you want the fact to bear on the
claim as well, give it its own ordinary evidence line beside the
undercut. That is not double-counting (the inhibitor acts on the
inference, the plain line acts on the claim), and without it the fact
the source actually reports is silently absent from the solve.

### 4.6 Solved values, tension, and 0/1 pins

The display is computed-first: the solved value is the primary number,
authored values remain the constraint set, and tension is the per-line
gap between them. Since D36 a tension badge means "your stated argument
does not deliver your stated belief", which is information about the
argument, not an error to be tuned away. The flagship map deliberately
keeps several badges because they are audit findings about the source.

Authored 0 and 1 on statements delete possible worlds outright
("world-killers", SOLVER_SEMANTICS P3) and are a smell; if you mean
"very confident", write 0.97, or give an interval with a v0.3 pair. The
honest wide statement is cheap; the false point is not.

## 5. From source text to map

This chapter is the workflow that produced the flagship map, distilled
from the re-authoring passes logged in AUTHORING_NOTES.md (2026-07-16
through 2026-07-24). It assumes you are extracting an argument from a
source (a book, an essay, a debate); mapping your own argument works the
same way with yourself as the source.

### 5.1 Pass 1: skeleton

Extract structure only. Statements, evidences, refinement nesting,
labels, glosses, citations; no numbers (unstrengthed lines are legal and
compile-inert). Decisions you are making in this pass, and should make
deliberately:

1. Statement granularity: what gets to be a claim. A statement label
   must be a proposition. If a source item is not a premise-to-conclusion
   step (a meta-principle, a design artifact, pure framing), keep it as a
   folded gloss or one node with a comment, not as a conjunct in the
   inference chain.
2. Linked vs convergent: `AND` only where the step genuinely needs all
   conjuncts (test: does the inference fail if this conjunct alone is
   false?). Independent routes are separate evidence lines. If a comment
   says "independent paths" and the factor says `AND`, one of them is
   wrong.
3. What each objection targets. For every objection ask: **which
   inference does this grant, and which does it deny?** An objection to
   an inference is an undercut conditioning on that `$id`; an objection
   to a claim is a rebuttal concluding `~@id`. Mis-typing this is the
   most common structural error in first passes.
4. Nesting: fold objection/response clusters as refinements under their
   target; keep shared grounds at an outer level so they do not fold
   away with one cluster (see chapter 8).

### 5.2 Pass 2: numbers, blind, by rubric

The numbers should reflect the source's confidence, not your own and not
what makes the map solve nicely. The discipline that keeps this honest
(pre-registered for the flagship map as D39):

1. **Fix a verbal-to-probability rubric before assigning anything**: a
   table from the source's confidence language to values. The flagship
   rubrics (AUTHORING_NOTES 2026-07-19) map, for example, categorical
   repeated assertions to 0.93, flat unhedged entailments to 0.9,
   "by default" claims to 0.85, "could well" to 0.7; grants of an
   opposing point take the conceder's register. Keep two tables, one
   for statement registers and one for inference-step language (the
   flagship's statement classes vs R-STEP), even if the values happen
   to coincide. Where the source is silent, a **role default** applies:
   a value your rubric assigns to a structural role rather than to any
   phrase (a default for an unhedged asserted step, one for an
   objection the source raises to deflect, and so on); define these in
   the rubric itself, because you will need them. Convention: the
   rubric lives in a comment block immediately after the frontmatter.
2. **Assign all values before the first solve, and do not move them
   afterwards.** If the solve surprises you, the finding is about the
   argument (or the rubric), and it should be recorded, not tuned away.
3. **Mark provenance.** Every rubric-derived number carries `?`. A bare
   number is reserved for values the source states as a credence or
   probability ("ten to twenty-five percent extinction odds"). A stated
   *frequency or rate* ("below one fatal accident per twenty million
   flight hours") is not a credence: keep it in the gloss and derive the
   statement's value from the assertion's register as usual. A stated
   number on a derived statement goes in a trailing `# check:` comment,
   never a pin (rule 4.3.2).
4. The composition rule when hedges stack: the outermost hedge governs.
   When two readings are defensible, author the weaker and log both.
   The same rule covers a source that asserts one proposition in two
   places at two registers: author the weaker register, note the
   stronger in the gloss or log.

### 5.3 Pass 3: review

The seven correction classes that were actually needed, in review-
checklist form (every one was discovered as a correction, not foreseen;
AUTHORING_NOTES 2026-07-19):

1. **Strength provenance.** Does every strength trace to source
   confidence language through the rubric? Is `?` on everything
   rubric-derived?
2. **Undercut target typing.** Per objection: which inference does this
   grant, and which does it deny? (Policy objections wearing
   implication-undercut shape were the flagship's most instructive
   mis-typing.)
3. **Overlap double-counting.** For every same-polarity convergent pair:
   merge, factor out the shared span, reroute an instance-of to the
   shared ground, or leave independent and say so in a comment (silence
   is indistinguishable from an unaudited pair).
4. **Connectivity.** Every non-headline statement should feed some
   evidence. Dangling sub-conclusions are usually missed links. A norm
   the source argues for should not stand unargued in the map.
5. **Nesting.** First passes come out flat. Fold clusters under their
   local conclusion; keep cross-cluster shared ground at top level.
6. **Coverage.** Do a full-source pass before calling the map faithful;
   record the source's scope in the frontmatter. Summarizing from memory
   under-extracts.
7. **Mechanical smoke.** Run the lint, the real parser (open the file in
   the editor), and a headless solve (chapter 10) before calling it
   done.

Two additions from later passes:

8. **Defeat presupposition.** For every response/rebuttal: which
   epistemic state does its ground presuppose? If a response only works
   while X is undemonstrated, conjoin the statement that says so
   (a guard), so the defeat lapses in worlds where X is demonstrated.
9. **Multi-voice overlap.** When two speakers concur non-diametrically,
   do not give them independent convergent lines. Full concurrence is
   one line at the weaker register; a subset relation is the shared span
   plus a residual increment elicited conditional on it; an instance
   supports the shared ground, not the downstream conclusion; genuinely
   disjoint mechanisms stay independent with a comment saying so.

### 5.4 Quoting and citation discipline

Keep verbatim spans to at most one sentence, roughly 25 words, normally
one per node; never alter a quote silently; never reproduce a
self-contained creative unit (a parable, a poem) whole; retell and
compress instead. Whole-map verbatim budget from any single work: low
hundreds of words, and for a short source proportionally less (a
tenth of the source is far too much regardless of the absolute count).

Where the span goes is the 3.12 test. A quote that *supports* the claim
belongs on its own `>` line with a `[^ref]` locator; a verbatim phrase
that is a grammatical part of the gloss sentence stays in the gloss in
plain double quotes, optionally echoed by a `>` line carrying the full
sentence. The budget above counts both. (The older convention of marking
in-gloss quotes `~"…"` is retired, and W20 flags any survivors.)

## 6. Labels and glosses

Statement labels and evidence labels do different jobs.

1. A **statement label** is the claim itself, a proposition, and may be a
   full sentence. Statement labels are not length-linted.
2. An **evidence label** is the headline warrant: why the premises bear
   on the conclusion, in a phrase. Evidence labels crop at about 56
   characters in the graph (lint W5), so distill; the depth goes in the
   gloss. Not every evidence needs a label: structural connectors
   (an obvious deductive step) are better left unlabeled than given a
   filler label. In the flagship corpus about half the evidences carry
   labels.
3. The **gloss** is the depth tier: the full reasoning, qualifications,
   asides, source voice, quotes. Glosses are never length-linted.

The three-job test for evidence gloss text, from the corpus survey that
motivated evidence labels (AUTHORING_NOTES 2026-06-12): gloss content is
either (a) a role tag ("undercut of ..."), which is derivable from
topology and should be deleted; (b) the warrant, which belongs in the
label; or (c) format-meta commentary, which belongs in a `#` comment.
What remains after the test is the genuine depth tier. Job order matters
even inside a gloss: put the substantive point first, because displays
crop from the end.

Two further conventions from the accessibility passes:

1. **Plain-first, technical-nested**: write the gloss in plain language;
   move a technical restatement to a folded continuation line beginning
   "technical reading: ...".
2. **Rubric provenance is not reader content.** Elicitation citations
   ("R-STEP S2: ...") go in a trailing `#` comment on the node line, not
   in the gloss. Reader-valuable quotes and footnote refs stay in the
   gloss.
3. In multi-speaker maps, prefix evidence labels with a speaker tag
   ("A:", "L:", "AL:"); IDs are invisible at graph junctions, so the
   label carries attribution.

## 7. Structural idioms

The patterns below carry most of the flagship map
(`experiments/llm-extraction/iabied-comprehensive-en.argmap`; line
numbers are as of 2026-07-25 and may drift, so each entry also names the
anchor to search for). Excerpts are trimmed; open the real file for the
full context. All excerpts are fragments, not standalone files.

The same catalog appears in compressed form in the skill's
`## Structural idioms` section, numbered to match these subsections
(7.1 = idiom 1, and so on). For a pattern in a complete small file
rather than as a fragment, `examples/README.md` maps each example to the
idioms it demonstrates.

### 7.1 The objection/response triple

The workhorse. An objection statement (the hope or doubt), an objection
evidence concluding against the target, and a response undercutting the
objection evidence:

```
# fragment - not standalone (flagship ~line 628, anchor "@c11-readthoughts")
@c11-readthoughts [We'll read the AI's thoughts and catch bad plans] 0.15?:
$c11-readthoughts-obj 0.2? ~@wont-solve-in-time | @c11-readthoughts:
$c11-readthoughts-resp [punishing visible bad thoughts hides them] 0.85? @wont-solve-in-time | @steering-finds-subversion AND $c11-readthoughts-obj: training against legible bad thoughts selects for concealment, not for good ones
```

FAQ-shaped sources map one-to-one onto rows of these. The `-obj`/`-resp`
ID suffixes are a mnemonic convention, not syntax.

### 7.2 The undercut ladder, including second-order undercuts

Rebuttal, undercut, response, and undercut-of-undercut are one schema
applied repeatedly (flagship ~line 283, anchor "$uc-counting"):

```
# fragment - not standalone
$uc-counting [this argument form fails in ML contexts] 0.3? ~@fragile | @nn-generalize AND @sgd-bias AND $fragile-count:
$uc-uc-counting [the ML rescue may not transfer to alignment] 0.7? @fragile | @gen-not-values AND $uc-counting:
```

The second line reinstates `@fragile` exactly to the extent the first
line's rescue fails.

### 7.3 Linked and convergent, side by side

One hub with both shapes (flagship ~line 269, anchor "$fragile-ev"):

```
# fragment - not standalone
$fragile-ev 0.9? @fragile | @orth AND @contingent AND @fragility:
$fragile-count 0.7? @fragile | @counting: lottery-ticket prior over goal-space
```

The first is a linked three-conjunct rule (all needed); the second is an
independent convergent sibling on the same conclusion. The test for
linked: neither conjunct alone suffices. The flagship's cleanest
statement of that test (anchor "$spread-ev"): "neither end alone shows
disagreement; together they are the spread".

### 7.4 Convergent siblings instead of a false AND

When a source presents overdetermined routes ("any one of these
suffices"), write separate evidences, not one conjunction (flagship
~line 170, anchor "$adv-speed-ev"):

```
# fragment - not standalone
$adv-speed-ev [speed alone breaks the human range] 0.9? @ai-advantages | @adv-speed:
$adv-copy-ev [copyability alone breaks the human range] 0.9? @ai-advantages | @adv-copy:
$adv-selfimp-ev [self-improvement alone breaks the human range] 0.75? @ai-advantages | @adv-selfimp:
```

The flagship originally had these as a four-way AND; the repair note in
the file records why that was wrong (the book is explicit that no single
advantage is necessary).

### 7.5 Coarse summary plus refinement

The whole book's case is one coarse line whose refinement holds
everything (flagship ~line 261, anchor "$link "):

```
# fragment - not standalone
$link [the book's claim as one coarse implication] 0.93? @everyone-dies | @if-built: unfolds below into the full case
```

The coarse strength on a refined line is not a solver input (the
refinement replaces it); it is the evidence-side check, displayed
against what the refinement delivers. Recommended practice: author the
coarse strength as your holistic judgment of the whole implication
before trusting the steps; the comparison is a free audit.

### 7.6 The complementary partition ("even if")

Two routes that would overlap are made disjoint by conjoining the
negation of the other route (flagship ~line 638, anchor "$mwb-time"):

```
# fragment - not standalone
$mwb-hard [the hardness route] 0.9? @misaligned-when-built | @align-hard:
$mwb-time [the timing route, in the solvable worlds] 0.9? @misaligned-when-built | @wont-solve-in-time AND ~@align-hard:
```

The `~@align-hard` conjunct is the source's own "even if alignment were
solvable" made explicit; without it the two routes double-count.

### 7.7 The balancing evidence

A conditional is vacuous outside its slab, so a map whose every evidence
on `@c` conditions on `@a` says nothing about the `~@a` worlds. If the
source asserts the converse, name it (flagship ~line 254, anchor
"$no-doom-otherwise"):

```
# fragment - not standalone
$no-doom-otherwise [no build, no doom] 0.9? ~@everyone-dies | ~@if-built: the book's own converse of the title conditional
```

This is the cross-slab converse pair of 4.2: it cancels the drift tax
and keeps a contested base-rate claim on the map, right of a given bar,
instead of hiding it in a prior.

### 7.8 Conditioning on an inference (the designed W1)

A policy conclusion that hangs on an implication, not on a fact
(flagship ~line 770, anchor "$shutdown-ev"):

```
# fragment - not standalone
$shutdown-ev [if built means everyone dies, no one may build] 0.93? @shutdown | $link:
```

Conditioning on `@everyone-dies` instead would be subtly wrong: doom
that were unconditional would justify no ban. This is the rare positive
evidence-as-premise; the lint fires W1 by design, and the file says so
in a comment.

### 7.9 The shared latent conjunct (one doubt, many hopes)

When k objections are expressions of one underlying doubt, name the
doubt as a statement and conjoin it into every member; elicit its prior
once, family-holistically (flagship ~line 435 onward, anchor
"$hope-care"; the shared conjunct is `~@no-right-care`):

```
# fragment - not standalone
$obj-cheap 0.7? ~@not-preserved | @cheap-keep AND ~@no-right-care: a sliver of care plus a negligible bill would get paid
$resp-cheap [it would need a reason to pay ours] 0.9? @not-preserved | @needs-motive AND $obj-cheap:
```

Prefer as the latent the statement the support side already denies, so
attack and support quantify over the same worlds. This was the only
structure (of six probed) that stayed stable as hopes were added.

### 7.10 The epistemic-fact reification (norms and credal thresholds)

"A risk no one can bound justifies a ban" is a threshold argument over a
credence, which the solver cannot represent directly (facts about
credences are not world facts). The pattern: reify the evidence-state as
a first-order statement, state the norm as its own statement, and let a
near-deductive step combine them (flagship ~line 793, anchor
"@risk-unbounded"):

```
# fragment - not standalone
@risk-unbounded [No one can currently bound the extinction risk below the actionable threshold]: a fact about what has been demonstrated, not about anyone's opinion
@no-gamble [Running a risk no one can bound below the threshold is impermissible] 0.93?: the norm, stated where it can be attacked
$shutdown-fine [unbounded risk + the norm license "don't build"] 0.9? @shutdown | @risk-unbounded AND @no-gamble:
$bounded-escape [a demonstrated bound would dissolve the case] 0.9? ~@shutdown | ~@risk-unbounded:
```

Note `$bounded-escape`: the author naming the condition under which
their own conclusion lapses. A self-declared off-ramp is both honest and
persuasive. The wrong shapes (conditioning on the chance itself, an OR
over world-types) are documented as fixture
`examples/edge-cases/e15-reified-chance.argmap`.

### 7.11 Rebuttal guards (which epistemic state does the defeat presuppose?)

Seven flagship responses only work while the risk is undemonstrated, so
each carries the guard conjunct `@risk-unbounded AND ...` (flagship
~line 688, comment anchor "risk-conditional rebuttal guards"). Structure
only, no new numbers: in worlds where the risk is demonstrated bounded,
the defeats lapse and the objections revive. Ask this of every response
you author (checklist item 8).

### 7.12 Exclusive alternatives and authored abduction

Rival explanations that cannot both hold are a premise-less constraint
factor plus an authored abductive step
(`examples/09-exclusive-causes.argmap`, the pattern catalog):

```
# fragment - not standalone
$who [an eaten cake means one of the two ate it] 1.0 @alice OR @bob | @cake: the abductive step, stated as a contestable rule
$notboth [they would not both have eaten it] 1.0 ~@alice OR ~@bob: premise-less unconditional constraint factor
```

The lesson recorded there: abduction is authored, not free. Pinning the
effect gives the causes no diagnostic lift by itself; "it must have been
one of them" is a premise, and making it a visible, attackable node is
the point.

### 7.13 The direct-assertion pattern (spoken and debate sources)

A flat spoken assertion with no stated grounds becomes an attributed
premise-less evidence (`experiments/llm-extraction/debate-tang-shapira.argmap`):

```
# fragment - not standalone
$a-blur [A: attention is a blur of what causes what] 0.9? @opaque: the quadratic self-attention transformer "literally is a blur of what causes what" [^t005008]
```

Sixteen of these carried the debate map. Related: a refusal to give a
number ("P(doom) is not assignable") needs no special syntax; leave the
marginal blank and, if the refusal is itself argued, map that argument
as an undercut cluster against assignability.

### 7.14 The parable at zero depth

Narrative belongs in folded gloss continuation lines, not in nodes
(flagship ~line 165, anchor "a parable"): a whole illustrative story
attaches under one statement, costs no graph structure, and folds away.
Use this for the source's most persuasive prose, which is usually
exactly the material that does not decompose into premises.

## 8. Writing large maps

The flagship map holds roughly 200 statements and 270 evidences at
depth 5. The disciplines that made that possible (AUTHORING_NOTES
2026-06-18 onward):

1. **Width, not depth.** Every new objection cluster is a sibling under
   its target, never a deeper chain. When a sub-debate wants an eighth
   level, promote the deep node to a shared top-level node instead.
   Node count can triple while max depth stays flat.
2. **A manifest comment block at the top, past about 150 nodes**: the
   coarse spine drawn in ASCII, every shared node listed with its home
   region and consumers, and the region-prefix scheme stated
   (`@c5-trade`, `$c5-trade-obj`, `$c5-trade-resp`). Build in dependency
   order; lint after every region.
3. **Reuse shared grounds aggressively, and annotate each reuse site**
   with a comment naming the home region; otherwise later editors bury
   cross-references. A handful of high-traffic shared nodes is what
   keeps maximal coverage finite.
4. **Home shared nodes above the clusters that use them.** An evidence
   folded inside a refinement contributes no edges while folded, so the
   spine and shared grounds must not be buried inside clusters. A node
   declared inside a cluster whose every edge leaves it is a "stranded
   node" (validator W6); re-home it with its consumer.
5. **Folding is a source-structure decision.** Where you nest is where
   readers' fold boundaries are. Author clusters as refinements under
   their target; keep shared material outside.

### Nesting discipline

Nesting looks like an art but is mostly a mechanical review pass. Real
arguments cluster on their own; first drafts nevertheless come out flat
(checklist item 5), typically with the clusters already visible as `#`
section-heading comments. Treat that as the diagnostic: **section
headings are nesting debt**. A divider comment organizes the text file;
only indentation organizes the reader's view. If you felt the need for a
`# ----` divider, the argument just told you where a fold boundary is.

Three tests turn the debt into structure:

1. **Fold-unit test.** Would a reader want to collapse this sub-debate
   to one line? Then give it a wrapper evidence whose refinement holds
   the cluster (7.9's hope-battery shape), and author the wrapper's
   coarse strength as your holistic judgment of the cluster's net force;
   the refinement-vs-coarse comparison then audits you for free (7.5).
   Smaller version: a statement's grounds and their evidences nest under
   the statement.
2. **Burial test.** Anything referenced from outside the cluster moves
   up out of it. A shared ground homed inside one cluster still works,
   but it renders as a cross-reference burial and, in the worst case, a
   stranded node (W6). Home shared nodes above every cluster that uses
   them.
3. **Spine test.** The headline claims and their direct evidences stay
   top-level, always: a folded evidence contributes no edges, so a
   buried spine disappears from the collapsed view.

Sometimes all three tests fail and the heading is still real. That
happens when the section is a **topic**, not a fold unit: two arguments
that share a file but not a single premise, or a shelf of background
facts. Nesting them under a wrapper evidence would be a lie: there is
no inference there to summarize. That is what a declared group is for
(3.11): write `::id [Label]` and indent them under it. The heading stops
being debt and becomes a checked, drawn box, and the validator will tell
you if the topics you claim are separate have quietly grown a shared
premise.

A useful smell figure: the flagship map holds 431 nodes at depth 5. A
hundred-node map at depth 1 is under-nested even if every individual
line is well-formed; its reader meets a wall of top-level nodes and the
fold control does nothing.

## 9. Limitations

What the format and semantics currently cannot express, with the
standing workarounds. None of these block parsing or display; they bound
what a solve can mean.

1. **Scope conditionals** (FORMAT_DESIGN Q8). "Aligned in the current
   regime, degrades at superhuman scale" has no first-class form.
   Marginals capture partial truth, not the conditioning scope; nesting
   is a partial workaround whose limits fixture `e06` documents. The
   intended direction (D14) is partitioning statements into
   substatements; undesigned. Until then, statement granularity is the
   author's burden.
2. **Undercut fan-out.** An undercut names one target. Class-level
   methodological objections ("this is all unfalsifiable") attack a
   family of inferences and end up structurally under-stated as one
   representative undercut. Mitigations: give the family a shared gate
   premise and rebut that once; or make the objection a shared Tier-1
   ground feeding several undercuts.
3. **No statement re-opening** (D33). You cannot declare a statement and
   attach its refinement later in the file; refinement is physical
   indentation. Workaround: declare nodes at their refinement site and
   forward-reference them (IDs are document-global).
4. **Statement-level provenance.** `?` marks numbers as estimated, but
   who asserts a claim has no in-format home beyond footnotes and ID
   prefixes. In multi-source maps this makes scope policing ("does this
   node belong to this map's source?") a manual discipline.
5. **Binary statements only** (S8). Categorical or continuous claims
   must enter through threshold-gate statements ("X exceeds T").
6. **Credal links are second-order** (S12). Nothing computes "if the
   probability of X exceeds t then Y"; the epistemic-fact reification
   (7.10) plus a `# gate:` comment audit is the pattern.
7. **Facts, norms, and future scenarios mix by convention only** (S13).
   The flagship keeps policy conclusions as "should" statements and has
   no "will X happen" node whose truth would feed back onto its own
   antecedents. If you add scenario nodes, index them explicitly or the
   map becomes self-referential.
8. **Independence is assumed** (P2) and dependence must be authored
   (4.4). There is no correlation annotation.
9. **Solver cost grows with treewidth** (P5). The corpus solves in
   seconds at treewidth about 7 to 9; a much more entangled map may not.
   Width-not-depth authoring also keeps treewidth down.
10. **Comment-layer slots are conventions.** `# check:` and `# gate:`
    are invisible to tools other than the solver readouts, and nothing
    validates them structurally.
11. **Cross-map ID reuse is unchecked.** Reusing an ID across maps is
    string coincidence; verify the propositions match before treating
    them as the same claim (a debate's "prepare an off-button" is weaker
    than the book's `@shutdown`).
12. **Authoring cost is real** (RISKS §2). Mapping is slower than prose.
    The mitigations that exist today are LLM extraction with human
    steering, and the rubric discipline that keeps the numbers honest
    (RISKS §4); neither removes the labor, they redistribute it toward
    review.

## 10. Checking your map

Three mechanical gates, in order: lint, parse, solve.

### 10.1 The lint

```
python3 tools/argmap-lint.py path/to/your.argmap
```

Zero errors is mandatory. The codes (full table in `tools/README.md`):

| Code | Meaning | Author action |
|---|---|---|
| E1 | duplicate ID (one namespace across `@`/`$`) | rename |
| E2 | dangling reference | fix the ID |
| E3 | `~$id` | rewrite as an undercut (3.6) |
| E4 | probability outside [0,1] | fix |
| E5 | v0.3 pair without `argmap-version: 0.3` | declare the version |
| E6 | malformed pair (`0.9/`, `/0.2`) | write both members |
| E7 | `::id` in an expression (3.11) | a group takes no part in inference; reference a member |
| E8 | a probability on a `::` line (3.11) | groups have no credence slot; delete the number |
| E9 | `>` outside an annotation block (3.12) | move the quote under its node, before that node's first child |
| E10 | `>` with no quote text | write the quote or delete the line |
| W1 | evidence-in-premise, not undercut-shaped | usually a polarity slip; legitimate only for deliberate conditioning-on-an-inference (7.8), then say so in a comment |
| W2 | directed cycle | usually fine (mutual rebuttal); check it is not a zero-negation support cycle |
| W3 | prose line resembling a node | you lost a sigil; fix it |
| W4 | footnote used/defined mismatch | fix |
| W5 | evidence label past ~56 chars | distill the warrant; depth to the gloss |
| W7 | pair sums > 1 | declared two-sided conflict or infeasible residual; confirm intended |
| W8 | pair `0/0` | drop it |
| W9 | pair entangled with undercut shape | check what the opposed side actually asserts |
| W11 | authored 0 strength | you probably mean an unstrengthed line |
| W15 | quote line with no `[^locator]` (3.12) | add the locator; provenance is the point |
| W16 | leftover `[^` inside quote text (3.12) | only a trailing ref is the locator; fix the stray or doubled one |
| W17 | ` # ` inside quote text (3.12) | quote lines have no trailing comment; move the note to a `#[…]` line |
| W18 | quotes before the end of the gloss prose (3.12) | reorder: gloss first, then quotes |
| W19 | `>` under a declared version below 0.3 | declare `argmap-version: 0.3` |
| W20 | retired `~"…"` still in a gloss (3.12) | migrate it: `>` line, plain marks, or the echo pattern |
| I1 | stats; isolated statements | connect or delete isolates |

Two caveats: the stranded-node check (W6) lives only in the TypeScript
validator (visible in the editor), not in this lint; and on
expression-valued conclusions (`@a OR @b` left of the given bar) the
lint's undercut-shape family (W1/W9 and same-slab W7) deliberately stays
single-ref, so near-misses there are the editor validator's job (see
`tools/README.md`, update 2026-07-25).

Warnings are advisory and some are load markers on purpose: the flagship
map ships with two deliberate W1s. The discipline is not "zero
warnings"; it is "every warning has an explanation you could put in a
comment".

### 10.2 The parser

Open the file in the editor (or run the parser test suite if you work in
the repo). The editor shows diagnostics inline, including the
validator-only warnings (W6 stranded node, W10 version gate). Without
the editor (a standalone tool bundle), a successful `solve_map.py` run
doubles as the parse gate: it loads the file through the real parser.

### 10.3 The solve

```
cd experiments/solver-prototypes
python3 solve_map.py path/to/your.argmap --top 10
```

Read the three sections: statement gaps (authored or check value vs
solved), evidence tensions (authored strength vs achieved), spectator
gaps (coarse summaries vs what their refinements deliver). Then query
the nodes you care about, with the forced interval:

```
python3 solve_map.py path/to/your.argmap @headline '$main-step' --band
```

(`--band` needs the optional `band_probe.py` next to `solve_map.py`, and
`--influence` needs `influence_probe.py`; the plain readout needs
neither.)

Interpreting what you see:

1. A large statement gap: the mapped argument does not deliver the
   authored or checked belief. Revise structure or strengths if the
   argument is misstated; add named missing evidence if real support is
   unmapped; otherwise keep the badge, it is a finding.
2. A large evidence tension: the constraint set cannot honor that
   authored strength; look for an overlooked conflict with neighboring
   lines.
3. A spectator gap: the refinement delivers something different from
   its coarse summary ("steps outrun summaries", or the reverse at the
   spine). Decide which side is wrong; both states occur in practice.
4. Numbers never move to make badges disappear (5.2.2). Structure moves,
   named evidence is added, or the badge stays and means something.

The solver needs numpy, scipy, and node. If it is unavailable, lint plus
parse still validate everything structural.

For translated maps, `python3 tools/translation-parity.py BASE TR`
verifies the translation touches only free-text spans.

## Appendix A: a complete worked example

The file below is complete and lints clean as shown (zero errors, zero
warnings). It exercises: convergent
routes, a linked conjunction, a refinement with an evidence-side check,
an undercut, a reinstating undercut-of-the-undercut, a rebuttal, check
credences, `?` discipline, and a footnote.

```
---
argmap-version: 0.2
title: "Protected bike lanes and cyclist safety"
description: "AUTHORING_TUTORIAL.md Appendix A: worked example."
date: 2026-07-25
---

# Headline first (convention). Derived statement: no authored marginal,
# a check credence instead (residual authoring rule).
@lanes-safer [Protected lanes reduce cyclist injuries per trip]: the headline claim  # check: 0.8

# Route 1: observational. The coarse line refines into the per-trip
# reading; its 0.7? is the evidence-side check against the refinement.
@study-drop [Injury rates fell after protected-lane installation] 0.9?: city-level before/after counts [^lusk]
$obs-route [before/after data carries the claim] 0.7? @lanes-safer | @study-drop: unfolds into the per-trip reading below
  @exposure-ok [The drop is not explained by reduced cycling] 0.8?: ridership rose over the same period, so per-trip risk fell
  $obs-fine [per-trip injuries fell while ridership rose] 0.8? @lanes-safer | @study-drop AND @exposure-ok: linked - both facts are needed for the per-trip reading

# Route 2: mechanism. Convergent sibling of $obs-route (independent
# routes, so separate lines, not an AND). Independence audited: the
# mechanism does not rest on the before/after data.
@separation [Physical separation removes the main collision type] 0.9?: most serious urban cycling injuries involve motor vehicles
$mech-route [the design removes the dominant injury mechanism] 0.75? @lanes-safer | @separation:

# The objection: grants the data, denies the inference from it
# (an undercut of $obs-route, not a rebuttal of the claim).
@confound [Cities add lanes where cycling is already safest] 0.5?: selection: lanes go where streets are calmest
$uc-obs [selection could explain the before/after drop] 0.6? ~@lanes-safer | @confound AND $obs-route:

# The response: an undercut of the undercut (reinstatement). The
# selection story predicts no drop at quasi-random sites.
@natural-exp [Some installations were sited quasi-randomly] 0.7?: construction-driven and court-ordered sitings
$resp-uc [quasi-random sites show the same drop] 0.8? @lanes-safer | @natural-exp AND $uc-obs:

# A rebuttal (attacks the claim itself, so no $-conjunct).
@risk-comp [Riders take more risks when they feel protected] 0.4?: the risk-compensation hypothesis
$rebut [risk compensation could offset the design gain] 0.3? ~@lanes-safer | @risk-comp:

[^lusk]: Lusk et al., "Risk of injury for bicycling on cycle tracks versus in the street," Injury Prevention 17, 2011.
```

What to notice:

1. `@lanes-safer` is derived, so it carries `# check: 0.8` and no
   authored marginal.
2. Frontier roots (`@study-drop`, `@separation`, `@confound`, ...) keep
   authored values, all `?`-marked as estimates.
3. `$uc-obs` conditions on `$obs-route` (undercut); `$resp-uc`
   conditions on `$uc-obs` (reinstatement); `$rebut` conditions on
   neither (rebuttal).
4. The refinement under `$obs-route` makes its 0.7? a displayed check
   against what `$obs-fine` delivers, and `$uc-obs` re-aims onto the
   refinement's delivery line when unfolded.

The actual solver readout for this file (solve_map.py, D36 defaults,
2026-07-25), abridged:

```
appendix-a.argmap: 7+5 vars, width=3 | 0.0s, conv=True
  largest statement gaps (authored/check -> solved):
    @lanes-safer                0.80 -> 0.818  |d|=0.018
    @separation                 0.90 -> 0.893  |d|=0.007
    ...
  largest spectator gaps (authored coarse ~> delivered by refinement):
    $obs-route:delivered-by-refinement    p=0.70 ~> q=0.837 |gap|=0.137
```

Reading it: the check credence 0.8 on the headline is nearly met by the
mapped argument (solved 0.818), so the map delivers the stated belief.
The sub-0.01 gaps on the roots are ridge softness, not tension. The one
real finding is the spectator row: the refinement of `$obs-route`
delivers 0.837 where the coarse line was authored 0.7, a miniature
"steps outrun summaries". The honest responses are to accept the
refinement's number (the coarse 0.7 was too conservative) or to notice a
missing qualifier in the fine model; nothing is tuned silently either
way.

## Appendix B: cheat sheet

```
@id [label] p?: gloss                     statement; p optional, ? = estimated
$id [label] s? CONCL | PREM: gloss        evidence; s optional; | optional
$id s ~@x OR ~@y: gloss                   premise-less constraint factor
~@id                                      negation (never ~$id: E3)
AND / OR                                  linked / convergent; parens to mix
::id [label]: gloss                       declared group; no credence, never in an expr
  indented node lines                     under @/$: refinement (replaces parent unfolded)
                                          under ::: membership in the group
  indented prose                          folds into the gloss above
  > verbatim text [^locator]              quote line; one line, no trailing comment
# comment                                 full-line or trailing
#[key: ...]                               annotation comment (per-file free in parity)
# check: p                                display-only credence (derived stmts)
# gate: q($e) >= t => @c                  threshold audit (comment layer)
[^ref] ... [^ref]: source                 footnote citation
---: argmap-version: 0.3                  required for slash pairs (s+/s-, p+/p-) and > lines
```

Number rules: elicit as "assume the premises; how likely is the
conclusion?"; `?` on rubric-derived values, bare only for source-stated
numbers; derived statements get checks, not pins; no authored 0/1; fix
arguments, not numbers, after the first solve.

Undercut schema: `$u q ~C | grounds AND $target`. Ask: which inference
does this objection grant, and which does it deny?

Review checklist, one line each: provenance traced; undercut targets
typed; overlaps merged/factored/partitioned or declared; no dangling
sub-conclusions; clusters nested, shared grounds top-level; full-source
coverage pass; lint + parse + solve smoke; defeat presuppositions
guarded; multi-voice overlaps deduplicated.

Check: `python3 tools/argmap-lint.py FILE`, then
`cd experiments/solver-prototypes && python3 solve_map.py FILE --top 10`.
