# Framework-First Prompting: Getting Quality Output Instead of Average Output

Here's a simple technique that dramatically improves AI output quality: before asking AI to do something, ask it what "good" looks like.

## The Pattern

Instead of:
> "Write me an email declining this meeting."

Do this:
> "What makes a meeting decline email effective?"

Then:
> "Now write one that exhibits those characteristics."

That's it. Two steps instead of one. The difference in output quality is substantial.

## Why This Works

When you ask AI directly for an email, it generates the statistically average email—the gravitational center of all the emails it's seen. Competent, generic, forgettable.

When you first ask what makes an email *effective*, you force the model to articulate quality criteria. Now it has specific targets to hit, not just "produce plausible email." The output becomes intentional rather than default.

**You're making the implicit explicit.** Everyone has some sense of what makes a good email, but that knowledge is implicit. Framework-first prompting surfaces it, then uses it.

## A Complete Example

### Step 1: Request the Framework

**You:** "Before we write anything, what are the characteristics of an effective email that declines a meeting politely?"

**AI might respond:**
1. **Clarity** - Unambiguous that you're declining
2. **Brevity** - Respects the recipient's time
3. **Warmth** - Maintains relationship despite the no
4. **Reason (optional)** - Brief explanation if appropriate, not defensive
5. **Alternative offered** - Suggests what instead (if applicable)
6. **Future orientation** - Leaves door open for future engagement

**Anti-patterns:**
- Over-apologizing (weakens the decline)
- Vague "maybe" (creates uncertainty)
- Detailed justification (invites negotiation)

### Step 2: Add Your Context

**You:** "Good. For my situation, I also need to consider that this is a recurring meeting I've attended for months, and the organizer is a peer I work with frequently."

The AI refines: "Given that context, warmth and future orientation become more important. You might acknowledge the value the meeting has provided before declining."

### Step 3: Generate Using the Framework

**You:** "Now write the email, exhibiting these characteristics."

The output will be noticeably better—more intentional, more appropriate to your specific situation, less generic.

### Step 4: Evaluate Against the Framework

**You:** "How well does this email exhibit each characteristic? Where could it improve?"

Now you have a structured way to iterate, not just "make it better somehow."

## The Framework Becomes Reusable

Here's the bonus: you now have a "meeting decline email" micro-framework. Save it. Next time you need to decline a meeting, you don't start from scratch—you have criteria.

Over time, you build a library of these micro-frameworks:
- What makes a good project update email
- What makes a good bug report
- What makes a good interview question
- What makes a good presentation opening

Each one makes the next similar task faster and better.

## Example: The "Summarize" Trap

"Summarize this" is one of the most common AI requests—and one of the most underspecified. "Summarize" can mean at least a dozen different things:

| What You Might Mean | What to Ask For |
|---------------------|-----------------|
| Just the main point | "What's the single key takeaway?" (gisting) |
| All the key points | "Extract the main claims or findings" (key point extraction) |
| Shorter but complete | "Compress this to half the length while preserving all information" (compression) |
| Decision-ready | "Create an executive summary: problem, recommendation, key evidence, next steps" |
| For research | "Write an abstract covering purpose, methods, findings, and limitations" |
| For quick scanning | "TLDR in one sentence" |
| Across multiple sources | "Synthesize the common themes and contradictions across these documents" |
| With evaluation | "Summarize the claims and assess the quality of evidence for each" (critical summary) |
| For action | "What are the implications and recommended next steps?" (actionable summary) |

**The vague request:**
> "Summarize this report."

You'll get a generic summary—probably fine, probably not what you actually needed.

**The precise request:**
> "I need to brief my manager in 2 minutes. Give me the 3 most important findings and what action we should take."

Now the AI knows exactly what kind of summary serves your purpose.

**Framework-first approach:**
> "What are the different ways to summarize a document, and when is each appropriate?"

Then select the type that matches your actual need.

This principle applies beyond summarization. Any time you find yourself using a vague verb—"analyze," "review," "improve," "explain"—ask yourself: what do I actually mean? The more precise your request, the more useful the output.

## When to Use This

Framework-first works especially well for:

| Task Type | Framework Question |
|-----------|-------------------|
| **Writing** | What makes a good [document type] for [audience]? |
| **Communication** | What are the characteristics of effective [message type]? |
| **Decisions** | What criteria should inform [decision type]? |
| **Analysis** | What should a thorough [analysis type] examine? |
| **Planning** | What elements make a [plan type] actionable? |
| **Code** | What makes [code type] maintainable? |

## When to Skip It

For simple, low-stakes tasks, going direct is fine:
- "Extract the 3 main findings as bullets" (note: more precise than "summarize")
- "Convert this to a bulleted list"
- "Fix the grammar in this paragraph"

The pattern adds value when quality matters and "average" isn't good enough.

## Variations

### The Evaluation Flip

Have a draft already? Use framework-first in reverse:

**You:** "What makes a [X] effective?"
**Then:** "Here's my draft. Rate it against each characteristic."

Now you know exactly where to improve.

### The Coaching Mode

Want to understand, not just produce?

**You:** "What makes a [X] effective?"
**Then:** "Why does [characteristic 3] matter? What happens when it's missing?"

The same framework that guides generation can guide learning.

### The Competitive Analysis

Looking at existing work?

**You:** "What makes a [X] effective?"
**Then:** "Here's [competitor's X]. Which characteristics does it demonstrate well?"

## The Deeper Principle

Framework-first prompting works because it separates *understanding what good looks like* from *producing the thing*.

When you ask for both at once, AI shortcuts the understanding to get to the production. It's trying to complete the task, and the task looks like "produce an email."

When you ask for understanding first, understanding becomes the task. The AI does it thoroughly because it's the only thing being asked to do.

Then, armed with that understanding, production has something to aim for.

This separation—understanding before execution—is a general principle that improves many AI interactions. Framework-first is one application of it. [Multi-Step Work with AI](multi-step-work.md) covers the broader principle.

## Try This

Pick something you need to write this week—an email, a document, a message. Before generating:

1. Ask: "What makes a good [X] for [context]?"
2. Review the characteristics. Add any specific to your situation.
3. Then generate, referencing those characteristics.
4. Evaluate the output against the criteria.

Notice how different the process feels. The output isn't a mystery to be accepted or rejected—it's a design being measured against explicit criteria.

That shift from "hope it's good" to "evaluate against criteria" is where the real value lies.

---

**Related:**
- [Why AI Gives Mediocre Results](why-ai-gives-mediocre-results.md) - The underlying cause framework-first addresses
- [Multi-Step Work with AI](multi-step-work.md) - The broader principle of separating phases
- [Beyond Good Enough](beyond-good-enough.md) - Iteration after framework-first
