# What AI Is and Isn't: A Mental Model for Working with ChatGPT and Similar Tools

You've probably used ChatGPT, Claude, or a similar AI tool at this point. It answered your question, maybe wrote something for you, and it probably felt pretty smart.

But what actually happened? Understanding what's going on under the hood—at least roughly—helps you use these tools more effectively and avoid common pitfalls.

## How It Actually Works: Predicting the Next Word

Large language models (LLMs) like ChatGPT and Claude don't "think" the way humans do. They predict the most likely next word based on all the text they've seen during training.

When you type "The capital of France is ___", the model isn't looking up the answer in a database. It's calculating: "Given this sequence of words, what word most commonly comes next in the billions of documents I was trained on?"

The answer is "Paris" because that word followed "The capital of France is" countless times in the training data.

**This is the core mechanism.** Everything else—the conversational flow, the apparent reasoning, the helpfulness—emerges from predicting the next word really, really well across trillions of examples.

## Implication 1: Confident Doesn't Mean Correct

Because the model is predicting likely words (not looking up verified facts), it can confidently say things that are wrong. The industry calls this "hallucination."

**Why this happens:**
- The model produces plausible-sounding text, not verified truth
- It has no mechanism for knowing what it knows vs. doesn't know
- Confidence comes from word probability, not factual certainty

**Example:** Ask an AI for a specific research citation. It might give you an author name, paper title, journal, and year—all formatted perfectly like a real citation. But the paper might not exist. The citation *sounds* right because the model knows what citations look like, but it doesn't know whether this specific citation is real.

**What this means for you:**
- Verify facts that matter, especially names, dates, numbers, and citations
- The more specific and obscure the claim, the more likely it needs checking
- The AI won't tell you when it's making things up—it can't tell the difference

## Implication 2: It Produces the Average, Not the Exceptional

When you ask for "a good email" or "a marketing tagline," the AI produces the statistically average version—the most common patterns from its training data.

This is why AI output often feels... fine. Adequate. Generic. The model is giving you what most emails or taglines look like, not what makes a specific one exceptional.

**What this means for you:**
- First-draft AI output is a starting point, not an ending point
- "Make it better" rarely works—you need to specify *how* to make it better
- Your job is to push the output from average toward what you specifically need

## Implication 3: No Memory Between Conversations

Unless specifically designed otherwise, AI chat tools don't remember previous conversations. Each new chat starts fresh.

That conversation you had last week where you explained your project in detail? The AI doesn't remember it. You'll need to provide context again.

**What this means for you:**
- Important context needs to be restated in each conversation
- If you need the AI to "know" something, tell it in this conversation
- Some tools offer memory features, but they work differently than human memory

## Implication 4: It Learned from Everything, for Better and Worse

LLMs trained on internet text absorbed both excellent and terrible content. The model doesn't inherently know the difference.

**The good:** It's seen expert-level writing, accurate technical documentation, thoughtful analysis.

**The bad:** It's also seen misinformation, bad advice, and mediocre content. Lots of it.

When you ask a question, the model draws on all of it, weighted by how common different patterns are. Common patterns dominate—including common mistakes and common clichés.

**What this means for you:**
- Generic questions tend to produce generic answers
- Being specific about what you want helps activate better patterns
- The AI can be wrong in the same ways that many people on the internet are wrong

## Common Misconceptions

### "The AI understands me"

The AI doesn't understand in the human sense. It's very good at producing appropriate responses to text patterns. This can feel like understanding, but the mechanism is different.

### "The AI knows everything"

It was trained on a snapshot of text up to a certain date. It doesn't have real-time information, doesn't know about events after its training cutoff, and has gaps in obscure topics.

### "If the AI says it, it must be true"

The AI has no commitment to truth. It produces likely text. Sometimes likely text is true; sometimes it isn't. The AI can't tell the difference.

### "AI will replace thinking"

AI tools can draft, summarize, brainstorm, and accelerate—but they can't replace your judgment about whether the output is good, true, or appropriate. That's still your job.

## A More Useful Mental Model

Think of AI as a **very well-read assistant who sounds confident but doesn't always know what they're talking about**.

They've read millions of documents, so they can produce plausible text about almost anything. They can draft, summarize, explain, and brainstorm. They work fast and don't get tired.

But:
- They confidently make things up without realizing it
- They default to generic unless pushed for specifics
- They don't remember what you told them yesterday
- Their judgment isn't reliable—yours is still needed

**Use them for what they're good at. Verify when it matters. Don't abdicate your own thinking.**

## What AI Is Good At

- **First drafts**: Getting something on the page to react to
- **Brainstorming**: Generating options and ideas to consider
- **Reformatting**: Converting content from one format to another
- **Summarizing**: Condensing long content into shorter versions
- **Explaining**: Breaking down complex topics into simpler language
- **Variations**: Producing multiple versions of something

## What AI Is Risky For

- **Facts without verification**: It makes things up confidently
- **Final decisions**: It has no stake in the outcome; you do
- **Sensitive or confidential data**: See data privacy concerns
- **Anything where being wrong has serious consequences**: The AI doesn't care about the consequences

## Try This

Next time you use an AI tool, notice:

1. **Does this sound confident?** Confidence means nothing—check anything important.
2. **Is this generic?** If it could apply to anyone, it's the statistical average. Push for specifics.
3. **What am I trusting this for?** First draft? Fine. Final fact? Verify.

The tool works best when you know what it actually does—and doesn't do.

---

**Related:**
- [Basic Prompting](basic-prompting.md) - Simple patterns for better results
- [When to Use AI](when-to-use-ai.md) - What AI is good for, and what it isn't
- [Data and Privacy Basics](data-privacy-basics.md) - What's safe to share

**Going Deeper:**
- [Why AI Gives Mediocre Results](../layer-2-effective-use/why-ai-gives-mediocre-results.md) - The behavioral patterns behind average output