# Coding Standards

**Owner:** PC3 and AI invoked for coding 
**Applies to:** All code produced by AI Agents for ANY codebase, repo — scripts, hooks, tests, and guides  
**Principle:** Consistency over cleverness. Read before writing. Follow what exists.

> **Scope note:** These standards are language-agnostic and are universally applicable. However, when the AI Agent works in an existing code repository, that repo's own coding standards and conventions take precedence — read the repo's `CONTRIBUTING.md`, `.editorconfig`, linter config, or equivalent before writing a single line.

---

## 1. Readability

Code is read far more often than it is written. A human engineer with no prior context should be able to follow the intent of any function without running it.

- Logical flow reads top-to-bottom — no surprising jumps, no deeply nested conditionals
- Prefer early returns over nested `if/else` pyramids — the happy path should be the last thing in a function, not buried inside layers of nesting
- Use intermediate variables with meaningful names over long chained expressions — clarity beats brevity
- Consistent formatting — indentation, spacing, bracket placement — matching the repo convention exactly
- No clever one-liners that sacrifice clarity for brevity; a readable three-liner is always preferable to an opaque one-liner
- No deeply nested callbacks, promise chains, or comprehensions without extraction into named functions

If a human engineer would need to pause and re-read a line to understand it, rewrite it.

---

## 2. Read existing patterns first

Before writing a single line, read the surrounding code. Identify:
- Naming conventions in use
- File and module structure
- Test framework and assertion style
- Error handling approach

Follow what exists. If the codebase uses a pattern you would design differently, follow it anyway — and flag the deviation explicitly if it matters. Introducing a new pattern requires justification stated upfront.

---

## 3. Naming

- Names are descriptive and intention-revealing — a reader should know what a function does from its name alone
- No single-letter variables outside loop counters
- No abbreviations unless the abbreviation is the universal term in the domain (e.g. `url`, `mcp`, `jwt`)
- No generic names: `data`, `temp`, `result`, `util`, `helper`, `manager` — name what the thing actually is
- Functions are named for what they do, not how they do it
- Booleans read as assertions: `isValid`, `hasPermission`, `shouldRetry` — not `valid`, `permission`, `retry`

---

## 4. Function and module size

- One responsibility per function or module. If you need a comment to explain what it does, it needs splitting.
- Functions that do two things should be two functions
- No functions that both compute a value and produce a side effect — separate them
- If a file is growing unwieldy, flag it — do not unilaterally restructure, but note it in the output

---

## 5. Error handling

- Handle errors only at system boundaries: user input, external APIs, file I/O, network calls
- Never swallow errors silently — if something fails, it must surface
- No defensive handling for scenarios that cannot happen — trust internal code and framework guarantees
- Error messages must say what failed and, where possible, why — not just that something went wrong

---

## 6. Comments

- Comment only where the logic is not self-evident — the *why*, not the *what*
- Never narrate what the code does: `// increment counter` above `count++` is noise
- Never leave dead commented-out code behind — delete it; git history preserves it
- TODO comments are permitted only with a ticket reference or a specific condition for resolution

---

## 7. Testing

- TDD gate from `06_VERIFICATION.md` applies: tests are written first and confirmed failing before implementation begins
- Tests document intent and behaviour — not implementation details
- Test names describe behaviour: `returns_empty_list_when_no_results`, not `test_getResults`
- One assertion per test where practical — multiple assertions are permitted if they collectively verify a single behaviour
- No tests that only verify the test framework works

---

## 8. No speculative code (YAGNI)

- YAGNI: You Aren't Gonna Need It
- No abstractions for a single use case
- No future-proofing scaffolding or configuration hooks for hypothetical requirements
- No helpers, utilities, or wrappers created on the basis of "we might need this later"
- When in doubt between building something now or later, build it later — the requirement will clarify or disappear

See §9 (DRY) for the related question of when duplication warrants an abstraction. YAGNI governs *whether* to build; DRY governs *when* duplication justifies extraction.

---

## 9. DRY — Don't Repeat Yourself

Every piece of knowledge has one authoritative representation in the codebase. Duplication of logic — not just text — is the problem.

- If the same logic appears in two places and one changes, the other will be wrong: that is the DRY violation
- The trigger for extraction is not "these lines look similar" — it is "if this rule changes, how many places must I update?" More than one is the signal
- Incidental similarity (two things that look alike but represent different concepts) should not be extracted — forcing DRY on unrelated concepts creates the wrong abstraction
- When two correct implementations exist and one is duplicated, extract only when the duplication represents shared *knowledge*, not shared *syntax*

> **YAGNI vs DRY:** YAGNI says don't build the abstraction yet. DRY says once the knowledge is genuinely duplicated, consolidate it. They are compatible — YAGNI defers, DRY acts when the pattern is proven.

---

## 10. KISS — Keep It Simple

When two correct solutions exist, choose the simpler one. Simplicity is a design decision, not a style preference.

- The simplest solution that correctly solves the stated problem is the right solution — not the most elegant, not the most extensible
- If you are about to introduce indirection (an interface, a factory, an abstraction layer), ask: does the current problem require this? If no, don't add it
- Complexity that is not required by the problem is a maintenance liability — every layer of indirection is a layer a future engineer must understand
- Over-engineered correct code is harder to debug than simple correct code — and harder to change when requirements shift

> **KISS as a tie-breaker:** faced with two correct designs, the simpler one is always the default choice. The more complex one requires an explicit justification grounded in a current, concrete requirement.

---

## 11. Low coupling, high cohesion

Modules and components should depend on as little as possible, and what they do should be tightly related.

- **Low coupling:** a module should not need to know the internal implementation of another; depend on interfaces or contracts, not concrete implementations
- **High cohesion:** everything inside a module should belong together — if two functions have nothing to do with each other, they should not be in the same file
- Pass dependencies in — do not instantiate them inside a function or module; instantiation couples the caller to a specific implementation
- No cross-layer direct references: a high-level module must not reach into the internals of a lower-level module to call a private function or read a private field
- If changing module A requires changing module B, they are too tightly coupled — flag this before implementing

---

## 12. Security

- No hardcoded secrets, tokens, credentials, or environment-specific values in code or config files
- Validate input only at system boundaries — not inside internal functions
- No unsafe string interpolation in shell commands — quote all variables
- No `eval`, dynamic `require`, or equivalent constructs without explicit justification
- No command injection vectors: user-controlled input must never reach a shell or exec call unescaped

---

## 13. Consistency over preference

When a pattern already exists in the codebase, follow it — even if you would design it differently. Personal preference is not a justification for introducing a new pattern.

The only valid reasons to introduce a new pattern:
- The existing pattern demonstrably does not work for the current case
- The existing pattern has a known defect being addressed
- A new pattern was explicitly requested

In all three cases: state the reason before introducing the change.

---

## Enforcement

These standards apply to every task any Agent executes. During self-review before handoff, the AI Agent checks each principle against the output and flags any deliberate deviation with a rationale. Deviations without rationale are defects.

When working in an existing code repository, the AI Agent reads and follows that repo's own standards. If there is conflict with one of these standards, surface to a human user and/or make a decision if it's minor.
