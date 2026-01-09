# Data and Privacy Basics: What's Safe to Share with AI

When you type something into an AI chat tool, where does it go? Who might see it? Could it end up somewhere it shouldn't?

These questions matter. Here's what you need to know.

## The Core Concern: Your Input Might Be Used

When you use a free or consumer AI tool, your inputs might be:

1. **Stored on the provider's servers**
2. **Reviewed by the provider's staff** (for safety, quality, or training purposes)
3. **Used to train future AI models**

This means confidential information you type could, in theory, surface in other users' outputs later—or at minimum, be seen by people outside your organization.

**The exact policies vary by tool and tier.** Paid enterprise versions often have stronger privacy protections than free consumer versions. But you need to know what you're using.

## Quick Decision Framework

Before typing something into an AI tool, ask:

### 1. Is This Public Information?

If the information is already publicly available (published reports, general knowledge, information on your public website), it's generally fine.

### 2. Is This About a Specific, Identifiable Person?

Personal information about real people—names, contact info, performance details, health information, financial data—is risky. Even if it seems innocuous.

**Don't type:**
- Customer names and details
- Employee information
- Personal data about specific individuals
- Anything covered by privacy regulations (HIPAA, GDPR, etc.)

### 3. Is This Confidential Business Information?

Information your company would not want shared publicly or with competitors.

**Think twice about:**
- Financial data not yet public
- Strategic plans
- Unreleased product information
- Pricing and deal terms
- Internal research or analysis
- Client-specific information

### 4. Is This Covered by an Agreement?

NDAs, client contracts, and regulations often restrict where information can go.

**Don't use consumer AI for:**
- Information covered by NDAs
- Client data you've promised to protect
- Anything subject to regulatory requirements

## What's Generally Okay

| Type of Input | Risk Level | Notes |
|---------------|------------|-------|
| **Publicly available information** | Low | Published content, general knowledge |
| **Generic questions** | Low | "How do I format a spreadsheet?" |
| **Your own creative writing** | Low | Unless it contains client/company info |
| **Hypothetical scenarios** | Low | "How might a company approach..." |
| **Rewriting generic text** | Low | "Make this more concise: [generic text]" |

## What's Risky or Off-Limits

| Type of Input | Risk Level | Notes |
|---------------|------------|-------|
| **Customer/client data** | High | Names, accounts, details |
| **Employee information** | High | Performance, personal details |
| **Confidential business data** | High | Financial, strategic, unreleased |
| **Proprietary code or IP** | High | Unless approved for AI use |
| **Anything under NDA** | High | Contract prohibits sharing |
| **Regulated data** | High | Health, financial, personal data |

## Public vs. Approved Tools

Many organizations have **approved AI tools** that are configured with stronger privacy protections—data retention limits, no training on inputs, enterprise agreements.

**Public/consumer tools** (free ChatGPT, personal accounts) typically have weaker protections.

**The rule:** Use approved tools for anything work-related. Use public tools only for generic, non-sensitive requests.

If you're not sure what tools are approved, ask. Using unapproved tools for company data might violate policy.

## Why This Matters

### Training Data Risk

If an AI is trained on your inputs, patterns from your data could influence its outputs. While your exact text probably won't appear verbatim, the concern is real enough that enterprises pay extra for "no training" guarantees.

### Data Residency

Some data legally must stay in certain geographic regions. AI tools might process data in data centers anywhere in the world. For regulated industries, this matters.

### Breach of Confidence

If you share a client's confidential information with a third-party AI service, you may have violated your agreement with that client—even if nothing bad happens with the data.

### Personal Liability

Depending on your role and industry, mishandling data through AI tools could have personal professional consequences.

## Practical Tips

### Strip Identifying Information

If you need AI help with something that contains sensitive details, anonymize it first.

**Instead of:**
> "Write a response to John Smith at Acme Corp about their overdue invoice of $45,000"

**Try:**
> "Write a response to a client about an overdue invoice"

Then add the specific details yourself.

### Keep It Generic

Ask questions in ways that don't require revealing sensitive specifics.

**Instead of:**
> "Analyze this revenue data: [actual numbers]"

**Try:**
> "What are best practices for presenting revenue growth to a board?"

### Use Hypotheticals

Frame requests as hypothetical scenarios rather than actual situations.

**Instead of:**
> "Draft a termination letter for Sarah in Accounting"

**Try:**
> "Draft a template for a respectful employee termination letter"

### When in Doubt, Don't

If you're uncertain whether something is safe to share, don't share it. Ask IT, Legal, or your manager first.

## Questions to Ask About Any AI Tool

Before using an AI tool for work, find out:

1. **Is this an approved tool?** Check your organization's policies.
2. **Does my input train the model?** Enterprise tiers often opt out of training.
3. **Where is data processed and stored?** Matters for regulated industries.
4. **How long is data retained?** Some tools delete quickly; others keep inputs longer.
5. **Who can access my inputs?** The provider's staff? Under what circumstances?

If you can't answer these questions, be conservative about what you share.

## Summary: The Safe Default

**When using AI tools for work:**

✅ **Do:**
- Use approved tools for work-related tasks
- Anonymize sensitive details when possible
- Keep requests generic when they don't need specifics
- Verify your organization's policies

❌ **Don't:**
- Put confidential business data in consumer AI tools
- Share personal information about customers or employees
- Type anything covered by an NDA or regulation
- Assume a tool is safe without checking

**When in doubt, leave it out.**

## Try This

Before your next AI interaction:

1. **Classify the data:** Public? Internal? Confidential? Personal?
2. **Check the tool:** Approved enterprise version or public consumer tool?
3. **Match appropriately:** Sensitive data → approved tools only (or don't use AI)

Building this habit takes seconds and prevents problems.

---

**Related:**
- [What AI Is and Isn't](what-ai-is-and-isnt.md) - How these tools actually work
- [Basic Prompting](basic-prompting.md) - Simple patterns for better results
- [When to Use AI](when-to-use-ai.md) - What AI is good for, and what it isn't