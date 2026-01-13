# AI Tool Introduction: Competency-Based Session Design

## How This Differs from the Vendor Approach

| Vendor approach | This approach |
|-----------------|---------------|
| Goal: Get people to use the tool | Goal: Get people to use the tool *effectively* |
| Success metric: Adoption rate | Success metric: Value delivered, errors avoided |
| Method: Feature tour + encouragement | Method: Demonstrated workflow + practice + verification |
| Covers many features shallowly | Covers one thing deeply |
| "Explore and experiment!" | "Here's exactly how to do this one thing well" |
| "Verify outputs" (no guidance) | Shows what verification looks like on real examples |
| "Don't share sensitive data" (no framework) | Provides decision framework with concrete examples |

---

## Session 1: First Effective Use

### Session Goal (Competency)

> After this session, participants can use [Tool] to summarize a long email thread or document, and can identify when the summary is incomplete or inaccurate.

One competency. Not a feature tour.

### Pre-Work (Optional)

> Find an email thread with 10+ messages that you needed to catch up on recently. Have it accessible during the session. (Don't worry about sensitivity — we'll address that first.)

---

### Agenda (45-60 minutes)

**1. Data Safety Framework (10 min)**

Before anyone touches the tool, establish the mental model for what's safe.

Not: "Don't share sensitive data"
Instead: Decision framework with examples.

**The Question to Ask:** "Would I be comfortable if this text appeared in a training dataset that other companies might benefit from?"

For approved internal deployments (like M365 Copilot in your tenant): Data stays within your organization's boundary. But still ask: "Does this contain information that shouldn't be accessible to everyone in the company who has Copilot?"

**Concrete Examples:**

| Scenario | Safe? | Why |
|----------|-------|-----|
| Email thread about project timeline with internal team | ✓ Yes | Internal business discussion, no external sensitivity |
| Document with client's proprietary financial data | ✗ No | Client data has contractual obligations beyond internal use |
| HR discussion about specific employee performance | ✗ No | Personnel information shouldn't be broadly accessible |
| Meeting notes from vendor negotiation with pricing | ⚠ Depends | Check: who has access to Copilot? Is this sensitive competitively? |
| Draft of public-facing blog post | ✓ Yes | Intended to be public anyway |
| Customer list with contact information | ✗ No | PII, likely has regulatory/contractual constraints |

**Key Point:** When in doubt, ask. We'd rather you check than guess wrong.

**Check for Understanding:** 
> "Your colleague wants to use Copilot to summarize notes from a client meeting that included their budget numbers for the project. What would you tell them?"

(Looking for: recognition that client financial data needs consideration, suggestion to check or err on side of caution, not a flat yes or no but demonstration of the decision framework)

---

**2. Live Demonstration (15 min)**

Not: "Here's what Copilot can do"
Instead: "Watch me do exactly this task, including when it goes wrong"

**Setup:** Share screen with a real (sanitized) email thread — 15+ messages, multiple participants, some back-and-forth.

**Demonstration Sequence:**

*First attempt — weak prompt:*
> "Summarize this thread"

Show the output. Point out what's missing:
- "Notice it gave me the general topic but missed [specific decision that was made]"
- "It didn't capture that [person] disagreed with the approach initially"
- "The action items aren't clear"

*Second attempt — better prompt:*
> "Summarize this email thread. Include: the main decision reached, any disagreements or concerns raised, and specific action items with who's responsible."

Show the improved output. Point out:
- "Now I can see [the decision]"
- "It captured [the disagreement]"
- "Action items are listed"

*Third step — verification:*
> "But how do I know this is accurate?"

Walk through checking:
- Scan thread for key names — are they represented?
- Look for words like "disagree," "concern," "but" — did those get captured?
- Check the last few messages — often where decisions land
- Look for anything that seems wrong or oversimplified

*Show a hallucination or error if possible:*
> "See here where it says [X]? Actually if I look at the thread, [Y] is what was said. This is the kind of error you're looking for."

**Key Point:** The prompt matters. Verification is non-optional. This isn't "AI did my work" — it's "AI gave me a draft I then checked."

---

**3. Guided Practice (15 min)**

Not: "Go explore!"
Instead: "Do this specific thing right now, and let's see what happens"

**Task:**
> Using the email thread you brought (or one we provide), use Copilot to generate a summary. Use a prompt that asks for decisions, concerns, and action items. Then verify the output against the original thread.

**While people work:**
- Circulate (if in person) or monitor chat (if virtual)
- Ask people to share interesting failures or surprises
- Note patterns for discussion

**Debrief questions:**
- "Who got a summary that missed something important? What was it?"
- "Who found something in the output that wasn't actually in the thread?"
- "What did you have to add to your prompt to get better results?"

This surfaces real learning, not performative "it's great!" feedback.

---

**4. Failure Modes and When Not to Use (5 min)**

Not: "AI can make mistakes" (vague)
Instead: Specific situations where this tool fails

**This works well for:**
- Catching up on threads you weren't part of
- Getting initial orientation on a long document
- Drafting a summary you'll edit and verify

**This works poorly for:**
- Threads with heavy subtext or political dynamics (it reads literally)
- Technical threads where precision matters (it may oversimplify)
- Anything where you won't verify (the errors will bite you)

**Don't use this when:**
- The content falls outside our data safety guidelines
- You need to be 100% accurate with no verification time
- The thread is short enough to just read (overhead isn't worth it)

---

**5. Commitment and Follow-Up (5 min)**

Not: "Use Copilot!"
Instead: Specific assignment with reporting back

**Your task before next session:**
> Use Copilot to summarize at least 3 email threads or documents this week. For each one:
> - Note what prompt you used
> - Note whether you found any errors during verification
> - Rate how useful it was (saved time / neutral / wasted time)

**Bring to next session:**
- One example where it worked well
- One example where it failed or wasn't useful
- Questions that came up

**Why this matters:** We learn from your real experience, not from you telling us you used it.

---

**6. Quick Reference Card**

Leave them with something concrete.

```
SUMMARIZING THREADS/DOCUMENTS WITH COPILOT

Before you start:
□ Is this content appropriate for Copilot? (See data safety framework)

Prompt template:
"Summarize this [thread/document]. Include:
- The main decision or conclusion
- Any disagreements or concerns raised  
- Specific action items with owners
- Key dates or deadlines mentioned"

After you get output:
□ Scan original for key names — are they represented?
□ Check for disagreements — were they captured?
□ Verify action items against original
□ Look for anything that seems off or oversimplified
□ Check numbers, dates, and specifics — these often hallucinate

Remember: This is a draft, not a finished product.
```

---

## Session 2: Second Use Case + Judgment Building

### Session Goal (Competency)

> After this session, participants can use [Tool] for [second use case, e.g., drafting replies] AND can identify tasks that seem like good Copilot candidates but actually aren't.

### Structure

Same pattern:
1. Build on data safety framework (new scenarios relevant to this use case)
2. Live demonstration with failure modes
3. Guided practice with specific task
4. Explicit "don't use for this" guidance
5. Assignment with structured feedback

**Additional element for Session 2:**

**"Looks like it should work but doesn't" examples:**

| Task | Why it seems good for AI | Why it actually isn't |
|------|--------------------------|----------------------|
| Writing a sensitive client email | "Draft communication" is a known capability | Tone and nuance matter too much; editing takes longer than writing |
| Summarizing a thread you were deeply involved in | Same as Session 1 task | You already know it; AI adds nothing, might miss context you have |
| Creating a proposal for a new client | "Generate document" capability exists | Requires your judgment about positioning, relationship, strategy |
| Analyzing data in a spreadsheet | Excel Copilot exists for this | Often misinterprets what you want; formula errors can cascade |

**Practice:** Give participants 5 tasks. Have them categorize: "Good Copilot task / Bad Copilot task / Depends (explain what it depends on)"

This builds judgment, not just feature knowledge.

---

## Session 3+: Progressive Capability Building

Each session adds ONE competency, following same structure:

| Session | Competency | Builds on |
|---------|------------|-----------|
| 1 | Summarize and verify | — |
| 2 | Draft replies + judgment about when not to use | Session 1 verification skills |
| 3 | Create documents from reference material | Sessions 1-2 verification + judgment |
| 4 | Use in [domain-specific application] | All previous |
| 5 | Troubleshoot when it's not working | All previous |

**Session 5 is critical:** Most training never covers "what to do when it fails." This is where TC-2 (Limitation diagnosis) and TC-3 (Patient iteration) get taught explicitly.

---

## Feedback Collection That Actually Works

### Don't Ask

- "Are you using Copilot?" (vanity metric)
- "How satisfied are you?" (doesn't surface useful information)
- "Would you recommend it?" (irrelevant)

### Do Ask

- "What task did you try this week that worked?" (success pattern)
- "What task did you try that failed or wasn't worth it?" (failure pattern)  
- "What are you still doing manually that you wish worked better?" (opportunity)
- "What question do you have that we haven't answered?" (gap)

### Analyze For

- Clusters of similar failures → training gap or tool limitation?
- Tasks people don't think to try → awareness gap
- Tasks people try that consistently fail → need "don't use for this" guidance
- Questions about data safety → framework isn't clear enough

Feed findings back into subsequent sessions.

---

## What This Looks Like Scaled

**For a 90-day program (like the one in the transcript):**

| Week | Content | Competency Added |
|------|---------|------------------|
| 1 | Session 1: First effective use | Summarize + verify |
| 2 | Async practice with feedback collection | — |
| 3 | Session 2: Second use + judgment | Draft + when not to use |
| 4 | Async practice | — |
| 5 | Session 3: Domain-specific application | [Varies by role] |
| 6 | Async practice | — |
| 7 | Session 4: Troubleshooting | Diagnose and fix failures |
| 8 | Open office hours (address collected questions) | — |
| ... | Continue pattern | Progressive capability |
| 12 | Capstone: Share what's working | Peer learning, identify champions |

**Between sessions:**
- Viva Engage (or whatever channel) for sharing prompts that work
- Structured feedback collection
- Office hours for stuck people

**Champion identification:**
People who consistently share useful findings become resources for their teams. Not "power users" (feature knowledge) but "effective users" (judgment + technique).

---

## Adapting to Your Context

This template assumes M365 Copilot but the structure applies to any AI tool:

**Customize:**
- Data safety framework for your specific tool/deployment
- Use cases relevant to your organization's work
- "Don't use for" guidance based on your tool's actual limitations
- Verification methods appropriate to your context

**Keep constant:**
- One competency per session
- Live demonstration with failure modes
- Practice with specific task (not "explore")
- Verification as non-optional
- Structured feedback that surfaces real patterns
- Progressive building, not feature tour
