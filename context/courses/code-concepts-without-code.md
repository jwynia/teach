# Course Design: Thinking Like a Programmer - Code Concepts Without Code

## Course Overview

**Course Title:** Thinking Like a Programmer: Code Concepts Without Code

**Target Audience:** Business professionals (managers, analysts, product owners) who work with developers

**Primary Outcomes:**
1. Whiteboard communication - describe algorithms and data flow on a whiteboard, discuss technical concepts with developers
2. Technical literacy - understand technical discussions, documentation, and architectural decisions
3. Problem decomposition - break down problems into algorithmic steps

**Format:** Explanation and analogy-based (minimal hands-on activities initially, expandable later)

**Approach:** Breadth-first overview with emphasis on mental models

---

## Meet Norm: The Course Mascot

### Character Overview

**Norm** is the personified mental model that runs throughout this course. He represents how computers execute programs - not because computers have personalities, but because giving this abstract concept a face makes it memorable and relatable.

### Visual Description (for illustrations)

- **Appearance:** A friendly, earnest-looking office worker in business casual attire
- **Expression:** Eager to help but often slightly puzzled - eyebrows raised in concentration
- **Props:** Always carries a clipboard and pen, ready to follow instructions precisely
- **Workspace:** Surrounded by neatly labeled filing boxes (variables) and checklists
- **Style:** Simple, clean line art suitable for slides and handouts; approachable but not cartoonish

### Personality Traits

| Trait | Description | Course Connection |
|-------|-------------|-------------------|
| **Literal-minded** | Takes every instruction exactly as written | Why precision matters in requirements |
| **Eager to help** | Genuinely wants to do the right thing | Computers aren't malicious, just literal |
| **Methodical** | One step at a time, never skips ahead | Sequential execution |
| **Meticulous** | Keeps detailed notes on everything | Variables and state |
| **Tireless** | Will repeat the same task forever until told to stop | Loops |
| **Rule-follower** | Only makes decisions based on explicit criteria | Conditionals |
| **Compartmentalized** | Keeps department info separate from company info | Scope |

### Sample Dialogue Patterns

Use these patterns when writing lesson content:

- **When instructions are ambiguous:** "Norm would stop here and ask: 'But what if the customer has two addresses?'"
- **When something is missing:** "Classic Norm - he did exactly what you asked, not what you meant."
- **When explaining loops:** "Norm will keep processing invoices forever unless you tell him when to stop."
- **When explaining variables:** "Norm writes the customer name on a sticky note and puts it in the box labeled 'currentCustomer'."
- **When explaining scope:** "Norm can see everything on his desk, but he can't see what's in the Finance department's filing cabinet."

### Recurring Scenarios

Throughout the course, Norm appears in these business contexts:

1. **The Mailroom** - Processing incoming documents (loops, conditionals)
2. **The Filing Cabinet** - Storing and retrieving information (variables, state)
3. **The Approval Workflow** - Making decisions based on rules (conditionals)
4. **The Service Desk** - Taking requests with specific inputs and outputs (functions)
5. **The Org Chart** - Understanding who can see what (scope)

---

## The Notional Machine: Norm's Mental Model

All concepts build on this foundational mental model. Based on research from Sorva's work on notional machines, learners need an explicit mental model of how programs execute. Norm embodies this model.

### How Norm Works

> Norm is a very literal-minded process worker who:
> - Follows instructions exactly as written, one step at a time
> - Has a workspace (memory) with labeled containers (variables)
> - Reads each instruction, acts on it, then moves to the next
> - Cannot make assumptions or fill in gaps
> - Will repeat tasks endlessly if told to
> - Makes decisions only based on explicit conditions

This model emphasizes:
1. **Sequential execution** - Norm handles one instruction at a time
2. **Literal interpretation** - Norm makes no assumptions or inferences
3. **State changes** - Norm's workspace changes as instructions execute
4. **Stored memory** - Values in Norm's boxes persist until explicitly changed

**Why this matters:** Research shows that novice programmers often lack clear understanding of program runtime dynamics. Making the mental model explicit (and personified!) addresses this gap.

---

## Detailed Unit and Lesson Design

### Unit 1: How Computers Follow Instructions
**Theme:** The foundation - meeting Norm and understanding sequential execution

#### Lesson 1.1: Meet Norm: The Literal-Minded Process Worker

**Key Concept:** Computers execute instructions exactly as written, one step at a time

**Primary Analogy:** Introducing Norm - a very literal-minded coworker who will follow instructions exactly. If you forget to tell Norm to turn off the oven, he will not turn it off. Not because he's trying to burn your kitchen down, but because you didn't tell him to.

**Supporting Analogy:** Assembly line where each station does exactly one thing before passing to the next

**Whiteboard Skill:** Drawing a sequence of numbered steps with arrows showing flow

**Why Before What:** Understanding literal execution prevents the #1 communication failure - assuming computers "understand" context. This is why developers ask so many clarifying questions.

**Business Context:** When developers ask "What should happen if X?" they're not being difficult - they're channeling their inner Norm, trying to account for every case the literal system will encounter.

**Norm Moment:** "Imagine handing Norm a to-do list. He reads item 1, does it, then moves to item 2. He won't skip ahead, won't combine steps, and won't assume what you meant. If you wrote 'Put the milk in the fridge' but the fridge door is closed, Norm will stand there holding the milk, waiting for instructions on how to open the door."

---

#### Lesson 1.2: The Program as Recipe

**Key Concept:** Programs are ordered sequences of precise instructions

**Primary Analogy:** Recipe for someone who has never cooked - must specify every action, quantity, and timing

**Supporting Analogy:** IKEA assembly instructions - visual, sequential, unambiguous

**Whiteboard Skill:** Converting a business process into a numbered instruction sequence

**Why Before What:** This grounds all future concepts in the reality that code is fundamentally "instructions to follow"

**Teaching Note:** The PB&J exercise (writing instructions to make a sandwich, then following them literally) reveals how imprecise human communication is. Even without doing the exercise, describing it illustrates the point.

---

### Unit 2: Storing and Naming Information (Variables and State)
**Theme:** How programs remember things and why naming matters

#### Lesson 2.1: Labeled Boxes - Storing Information

**Key Concept:** Variables are named containers that hold values

**Primary Analogy:** Labeled storage boxes in an office

Based on Khan Academy's research on teaching variables, labeled boxes/drawers work best because:
- Drawers are naturally labeled for contents
- Maps to physical computer memory
- Extends to arrays (rows of drawers) and objects (filing cabinets)
- Box size introduces typing concepts

**Supporting Analogy:** Spreadsheet cells - column A row 1 contains a value, and you can reference it by name

**Whiteboard Skill:** Drawing boxes with labels and values; showing value changes over time

**Why Before What:** Without understanding storage, learners cannot understand how programs "remember" or track things

**Teaching Note:** The "tentacles" metaphor from Eloquent JavaScript (variables grasp values rather than contain them; two variables can refer to the same value) is useful for later understanding of references vs values, but may be too advanced for initial teaching.

---

#### Lesson 2.2: State - The Current Snapshot

**Key Concept:** The collection of all current variable values is the program's "state"

**Primary Analogy:** Snapshot of all the boxes at any moment in time - like taking a photo of your desk to show what you're working on right now

**Supporting Analogy:** The current state of a board game - all piece positions at this moment

**Whiteboard Skill:** Drawing "before" and "after" state diagrams; showing how state changes through operations

**Why Before What:** State is the bridge to understanding debugging conversations ("What was the value at that point?")

**Business Context:** When developers say "the application got into a bad state," they mean the combination of values at some point was unexpected or invalid.

---

#### Lesson 2.3: Why Names Matter

**Key Concept:** Variable naming communicates intent to humans

**Primary Analogy:** The difference between filing cabinets labeled "Cabinet 1, Cabinet 2" vs. "Customer Invoices, Vendor Contracts"

**Business Context:** Code review conversations about "readable" vs "cryptic" code

**Whiteboard Skill:** Renaming boxes to show how good names make diagrams self-documenting

**Why Before What:** Bridges to communication - when developers say "name this better," this is what they mean. Also explains why legacy systems are hard to maintain.

---

### Unit 3: Working With Information (Expressions and Operations)
**Theme:** How programs calculate, combine, and transform data

#### Lesson 3.1: Expressions - Calculating Results

**Key Concept:** Expressions combine values and operations to produce new values

**Primary Analogy:** Spreadsheet formulas - `=A1+B1` takes two cell values and produces a result

**Supporting Analogy:** Calculator that shows each step - enter values, enter operation, get result

**Whiteboard Skill:** Writing expressions in plain language; showing how complex expressions break into steps

**Why Before What:** Expressions are the "verbs" that make data useful - without them, stored data just sits there

**Teaching Note:** Emphasize that the result of an expression can be stored in a variable, used in another expression, or used to make a decision.

---

#### Lesson 3.2: Operations Beyond Math

**Key Concept:** Operations work on text, dates, true/false values, not just numbers

**Primary Analogy:** Different departments handle different types of work - accounting handles numbers, legal handles documents, logistics handles schedules

**Supporting Analogy:** Excel functions - CONCATENATE for text, DATEDIFF for dates, AND/OR for true/false

**Whiteboard Skill:** Showing different operation types with their inputs and outputs

**Why Before What:** Prevents the misconception that programming is "just math"

**Teaching Note:** True/false (Boolean) operations are particularly important as they connect directly to conditionals.

---

#### Lesson 3.3: Chaining Operations

**Key Concept:** Operations can be combined, with one's output becoming another's input

**Primary Analogy:** Assembly line where each station transforms the product - raw material becomes component becomes assembly becomes finished product

**Supporting Analogy:** Nested spreadsheet formulas: `=ROUND(AVERAGE(A1:A10), 2)`

**Whiteboard Skill:** Drawing operation chains with intermediate results labeled

**Why Before What:** Most real operations are chains - understanding this prepares learners for functions and data pipelines

---

### Unit 4: Making Decisions (Conditionals)
**Theme:** How programs choose between different paths based on conditions

#### Lesson 4.1: The If-Then Choice

**Key Concept:** Conditionals let programs take different actions based on conditions

**Primary Analogy:** Decision tree / workflow decision points - "If approved, proceed to next step; if rejected, return to requester"

**Supporting Analogy:** Email rules - "If subject contains 'urgent', move to priority folder"

**Business Context:** Decision flowcharts are already common in business - this connects to existing knowledge

**Whiteboard Skill:** Drawing decision diamonds with condition labels and paths

**Why Before What:** Business professionals already use decision trees - this lesson validates existing knowledge while adding precision

---

#### Lesson 4.2: Complex Conditions - And, Or, Not

**Key Concept:** Conditions can be combined with logical operators

**Primary Analogy:** Approval rules - "If amount > $10,000 AND requester is not C-level, require VP approval"

**Supporting Analogy:** Database filters - checking multiple criteria at once

**Whiteboard Skill:** Drawing conditions with logical operators; truth tables for compound conditions

**Why Before What:** Real business rules are rarely simple - this bridges to the complexity they actually encounter

**Teaching Note:** Brief introduction to truth tables helps with complex conditions but don't dwell on formal logic.

---

#### Lesson 4.3: Nested Decisions and Else-If Chains

**Key Concept:** Decisions can be sequenced and nested for complex logic

**Primary Analogy:** Multi-tier approval workflows - first check amount, then check department, then check requestor level

**Supporting Analogy:** Tax brackets - check each threshold in order until one applies

**Whiteboard Skill:** Drawing nested decision trees; converting to flat if-else-if chains and back

**Why Before What:** This is where "edge cases" live - the source of many bugs and requirement misunderstandings

---

#### Lesson 4.4: When Conditionals Go Wrong

**Key Concept:** Common conditional bugs: missing cases, overlapping conditions, order dependencies

**Primary Analogy:** Policy loopholes - cases that fall through the cracks or could be argued multiple ways

**Business Context:** Why developers ask "What should happen if X AND Y AND Z?" - they're looking for the missing conditions

**Whiteboard Skill:** Testing decision diagrams by tracing multiple scenarios; finding gaps

**Why Before What:** This is where communication breaks down - when business says "obviously that case" and code handles it differently

**Teaching Note:** This lesson directly improves requirements conversations.

---

### Unit 5: Doing Things Repeatedly (Loops)
**Theme:** How programs automate repetition

#### Lesson 5.1: The Basic Loop - Do Until Done

**Key Concept:** Loops repeat instructions until a condition is met

**Primary Analogy:** Processing a stack of invoices - "For each invoice in the stack: review it, approve or reject it, move to processed pile. Stop when stack is empty."

**Supporting Analogy:** Picking apples - continue until basket is full or tree is empty

**Whiteboard Skill:** Drawing a loop with start condition, repeated actions, and exit condition

**Why Before What:** Automation is fundamentally about repetition - this is why we use computers for high-volume tasks

---

#### Lesson 5.2: For Each - Processing Collections

**Key Concept:** For-each loops process every item in a collection the same way

**Primary Analogy:** Mail merge - apply the same template to every record in the list

**Supporting Analogy:** Payroll run - calculate pay for each employee using the same rules

**Whiteboard Skill:** Drawing a collection, showing one item highlighted as "current," showing the action

**Why Before What:** Most business operations are "do this for every X" - the most common loop pattern

---

#### Lesson 5.3: Loop Gotchas - Infinite Loops and Off-By-One

**Key Concept:** Loops can fail to terminate or process the wrong number of items

**Primary Analogy:** Policy that says "keep escalating until resolved" without defining resolution criteria - creates infinite escalation

**Business Context:** Why developers ask "What stops this?" and "Does this include the boundary?"

**Whiteboard Skill:** Tracing a loop with counts; identifying missing exit conditions

**Why Before What:** These bugs are common and frustrating - understanding them improves requirement conversations

---

#### Lesson 5.4: Loops and Decisions Together

**Key Concept:** Loops often contain conditionals to handle different cases

**Primary Analogy:** Processing applications - "For each application: if complete, process it; if incomplete, send request for more info; if withdrawn, archive it"

**Whiteboard Skill:** Drawing combined loop-and-decision diagrams

**Why Before What:** Real processes combine both - this shows how concepts build on each other

---

### Unit 6: Organizing Instructions (Functions and Encapsulation)
**Theme:** How programs organize reusable chunks of logic

#### Lesson 6.1: Functions - Reusable Recipes

**Key Concept:** Functions are named, reusable blocks of instructions

**Primary Analogy:** A recipe you can reference by name - "Make sauce (see page 47)" - defined once, used many times

**Supporting Analogy:** Spreadsheet named functions - `=TAX_RATE(income, state)` hides the complexity

**Whiteboard Skill:** Drawing a function as a labeled box with inputs (arrows in) and outputs (arrows out)

**Why Before What:** Functions are how developers organize complexity - understanding them enables understanding system diagrams

---

#### Lesson 6.2: Inputs and Outputs - The Contract

**Key Concept:** Functions have defined inputs (parameters) and outputs (return values)

**Primary Analogy:** Service desk request form - specific inputs required, specific deliverable promised

**Supporting Analogy:** API documentation - "Send us X, Y, Z; we'll send back W"

**Whiteboard Skill:** Drawing function signatures; specifying what goes in and what comes out

**Why Before What:** This is the language of integration - "What does it need? What does it return?"

---

#### Lesson 6.3: Scope - What Can See What

**Key Concept:** Variables inside functions are isolated from outside variables

**Primary Analogy:** Department-level information vs. company-wide information - the finance team has internal data that other departments can't see directly

**Supporting Analogy:** Meeting scope - discussions in this meeting stay in this meeting unless formally communicated out

**Whiteboard Skill:** Drawing nested boxes to show what variables are visible where

**Why Before What:** Scope confusion causes "it works on my machine" problems - understanding isolation helps

---

#### Lesson 6.4: Encapsulation - Hiding the Details

**Key Concept:** Functions hide implementation details, exposing only the interface

**Primary Analogy:** Using a coffee machine vs. building one - you press "espresso," you get espresso; you don't need to know the pressure, temperature, or timing

**Supporting Analogy:** Ordering from a vendor - you specify what you want, not how to make it

**Business Context:** Why developers resist "just a quick change" - the visible interface hides complex internals

**Whiteboard Skill:** Drawing "black box" diagrams showing interface vs. implementation

**Why Before What:** This explains why scope changes are hard and why "small" changes have big impacts

---

### Unit 7: Organizing Data (Data Structures)
**Theme:** How programs organize collections of related information

#### Lesson 7.1: Lists - Ordered Collections

**Key Concept:** Lists store multiple items in a specific order

**Primary Analogy:** Numbered task list - items have positions (1st, 2nd, 3rd...), can be added, removed, or reordered

**Supporting Analogy:** Spreadsheet column - cells in order, can reference by position

**Whiteboard Skill:** Drawing lists with indices; showing add/remove/access operations

**Why Before What:** Most business data is collections - customer lists, transaction lists, inventory lists

**Teaching Note:** Zero-based indexing is a common source of confusion - mention it but don't dwell on it.

---

#### Lesson 7.2: Objects/Records - Structured Data

**Key Concept:** Objects group related named values together

**Primary Analogy:** A contact card - has fields like name, phone, email, address; each field has a label and value

**Supporting Analogy:** Spreadsheet row - multiple columns of data about one entity

**Whiteboard Skill:** Drawing objects as boxes with labeled fields; showing field access

**Why Before What:** This is how databases, APIs, and forms represent entities - essential for data conversations

---

#### Lesson 7.3: Lists of Objects - Real-World Data

**Key Concept:** Most real data is lists of structured records

**Primary Analogy:** Database table / spreadsheet - rows are records, columns are fields

**Supporting Analogy:** Filing cabinet with standardized forms - each form has the same fields, cabinet holds many forms

**Whiteboard Skill:** Drawing data models; showing how to "loop through records" and "access fields"

**Why Before What:** This is the shape of almost all business data - understanding it unlocks data model discussions

---

#### Lesson 7.4: Nesting - Data Within Data

**Key Concept:** Objects can contain lists; lists can contain objects; both can be nested

**Primary Analogy:** Customer with multiple orders, each order with multiple line items

**Supporting Analogy:** Org chart - departments contain teams, teams contain people

**Whiteboard Skill:** Drawing nested data structures; tracing paths through nested data

**Why Before What:** Real data is nested - invoices have line items, orders have shipping addresses, users have permissions

---

### Unit 8: Putting It All Together
**Theme:** Combining concepts to describe and communicate real systems

#### Lesson 8.1: Reading System Diagrams

**Key Concept:** Technical diagrams use all these concepts together

**Activity:** Given sample architecture diagrams, identify the variables, functions, data structures, and flows

**Whiteboard Skill:** Annotating existing diagrams with questions and clarifications

**Why Before What:** Passive comprehension comes before active production

---

#### Lesson 8.2: Describing Processes on a Whiteboard

**Key Concept:** Using learned concepts to communicate requirements and understand proposals

**Activity:** Given a business scenario, create a whiteboard diagram showing the process

**Whiteboard Skill:** Full whiteboard communication - drawing state, decisions, loops, functions, and data

**Why Before What:** This is the capstone skill - active production of technical communication

---

#### Lesson 8.3: Speaking Developer - Translation Practice

**Key Concept:** Converting between business language and technical concepts

**Activity:** Translation exercises both directions

**Whiteboard Skill:** Labeling diagrams with both business and technical terminology

**Why Before What:** The goal is bidirectional communication, not just comprehension

---

#### Lesson 8.4: Common Patterns and When to Use Them

**Key Concept:** Recognizing common patterns: validation, transformation, aggregation, filtering, etc.

**Primary Analogy:** Business process patterns - approval workflows, data validation, report generation

**Whiteboard Skill:** Pattern recognition - seeing "this is a validation pattern" in both code and business process

**Why Before What:** Patterns are the vocabulary of experienced practitioners - recognizing them accelerates communication

---

## Competency Framework

### Competency Cluster: Technical Literacy for Professionals (TLP)

All competencies begin with "Can" to indicate observable capabilities.

#### Foundation Competencies
| ID | Competency | Dependencies |
|----|------------|--------------|
| TLP-1 | Can explain why computers require explicit, step-by-step instructions | None |
| TLP-2 | Can convert a simple business process into a numbered sequence of unambiguous steps | TLP-1 |

#### Data & Operations Competencies
| ID | Competency | Dependencies |
|----|------------|--------------|
| TLP-3 | Can diagram a set of variables with their current values | TLP-1, TLP-2 |
| TLP-4 | Can trace how variable values change through a sequence of operations | TLP-3 |
| TLP-5 | Can explain why meaningful variable names improve code maintainability | TLP-3 |
| TLP-6 | Can identify the inputs and output of a described operation | TLP-3 |
| TLP-7 | Can trace through a chain of operations to predict the final result | TLP-6 |
| TLP-8 | Can describe operations on different data types (numbers, text, dates, true/false) | TLP-6 |

#### Control Flow Competencies
| ID | Competency | Dependencies |
|----|------------|--------------|
| TLP-9 | Can convert business rules into conditional diagrams | TLP-4, TLP-6 |
| TLP-10 | Can identify missing cases or ambiguous conditions in requirements | TLP-9 |
| TLP-11 | Can trace multiple scenarios through a conditional diagram to verify coverage | TLP-9 |
| TLP-12 | Can identify when a process requires repetition and specify the exit condition | TLP-4, TLP-6 |
| TLP-13 | Can trace through a loop with sample data to verify the number of iterations | TLP-12 |
| TLP-14 | Can diagram a process that combines repetition with conditional logic | TLP-9, TLP-12 |

#### Organization Competencies
| ID | Competency | Dependencies |
|----|------------|--------------|
| TLP-15 | Can diagram a process as a function with defined inputs and outputs | TLP-7, TLP-14 |
| TLP-16 | Can explain why changing a function's internals might not affect its callers (and vice versa) | TLP-15 |
| TLP-17 | Can identify what information is visible at different scope levels in a diagram | TLP-15 |
| TLP-18 | Can diagram a list with operations (add, remove, access by position) | TLP-4 |
| TLP-19 | Can diagram an object/record with named fields | TLP-18 |
| TLP-20 | Can model real-world data as nested lists and objects | TLP-19 |

#### Integration Competencies
| ID | Competency | Dependencies |
|----|------------|--------------|
| TLP-21 | Can interpret a system diagram and identify its major components | TLP-15, TLP-20 |
| TLP-22 | Can create a whiteboard diagram to describe a business process to a developer | TLP-21 |
| TLP-23 | Can translate between business process language and programming concepts | TLP-22 |

### Competency Progression Model

```
Foundation (All learners)
TLP-1: Explain literal execution
TLP-2: Sequence business processes
    │
    ├─► Data & Operations
    │   TLP-3: Diagram variables
    │   TLP-4: Trace state changes
    │   TLP-5: Explain naming importance
    │   TLP-6: Identify operation I/O
    │   TLP-7: Trace operation chains
    │   TLP-8: Describe typed operations
    │       │
    ├───────┴─► Control Flow
    │           TLP-9: Convert rules to conditionals
    │           TLP-10: Identify missing cases
    │           TLP-11: Verify conditional coverage
    │           TLP-12: Identify repetition needs
    │           TLP-13: Trace loop iterations
    │           TLP-14: Diagram combined logic
    │               │
    ├───────────────┴─► Organization
    │                   TLP-15: Diagram functions
    │                   TLP-16: Explain encapsulation
    │                   TLP-17: Understand scope
    │                   TLP-18: Diagram lists
    │                   TLP-19: Diagram objects
    │                   TLP-20: Model nested data
    │                       │
    └───────────────────────┴─► Integration (Capstone)
                                TLP-21: Interpret system diagrams
                                TLP-22: Create whiteboard diagrams
                                TLP-23: Translate terminology
```

---

## Whiteboard Communication Skills by Unit

| Unit | Whiteboard Skill | What Learner Can Draw/Describe |
|------|------------------|------------------------------|
| 1 | Sequential diagrams | Numbered steps with arrows showing flow |
| 2 | State diagrams | Labeled boxes with values; before/after snapshots |
| 3 | Operation diagrams | Inputs → operation → output; chained operations |
| 4 | Decision diagrams | Diamond shapes with conditions; branching paths |
| 5 | Loop diagrams | Repetition with start/body/exit; for-each collections |
| 6 | Function diagrams | Black boxes with inputs/outputs; scope boundaries |
| 7 | Data model diagrams | Lists with indices; objects with fields; nested structures |
| 8 | System diagrams | Combined notation; full process diagrams |

---

## Key Analogies Reference

| Concept | Business Analogy (featuring Norm) | Why It Works |
|---------|----------------------------------|--------------|
| Program execution | Norm following a to-do list | Shows literal, step-by-step nature |
| Program | Recipe written for Norm | Shows precision required |
| Variable | Norm's labeled storage boxes | Physical, named, holds value |
| State | Snapshot of Norm's workspace | Current values at a moment |
| Expression | Spreadsheet formula Norm calculates | Familiar, shows transformation |
| Conditional | Decision point in Norm's workflow | Already used in business |
| Loop | Norm processing an invoice stack | Repetitive business task |
| Function | Procedure Norm can reference by name | Defined once, used many times |
| Scope | What Norm can see from his desk | Natural access boundaries |
| Encapsulation | Norm using a coffee machine | Interface hides complexity |
| List | Norm's numbered task list | Ordered collection |
| Object | Contact card in Norm's rolodex | Named fields grouped together |
| Nested data | Customer → Orders → Line Items | Business hierarchy |

---

## Pedagogical Research Sources

### CS Unplugged
- [Classic CS Unplugged](https://classic.csunplugged.org) - Original activities
- [CS Fundamentals Unplugged | Code.org](https://code.org/curriculum/unplugged)
- [Critical Review: Unplugged Pedagogies in K-12 CS Education](https://www.tandfonline.com/doi/full/10.1080/08993408.2020.1789411)
- [Fostering computational thinking through unplugged activities: A systematic literature review](https://link.springer.com/article/10.1186/s40594-023-00434-7)

### Notional Machines
- [Notional Machines and Introductory Programming Education](https://dl.acm.org/doi/10.1145/2483710.2483713) - Sorva's foundational work
- [Computational Thinking and Notional Machines: The Missing Link](https://dl.acm.org/doi/10.1145/3627829)
- [How Do Students Learn the Notional Machine?](https://computinged.wordpress.com/2018/04/06/how-do-students-learn-the-notional-machine-developing-a-mental-model-of-program-behavior/)

### Teaching Programming Analogies
- [Khan Academy: Teaching Variables: Analogies and Approaches](https://cs-blog.khanacademy.org/2013/09/teaching-variables-analogies-and.html)
- [Hard Coding Concepts with Simple Real-Life Analogies](https://medium.com/edge-coders/hard-coding-concepts-explained-with-simple-real-life-analogies-280635e98e37)
- [Animated Interactive Analogies in Teaching Programming](https://www.researchgate.net/publication/228719904_Using_animated_interactive_analogies_in_teaching_basic_programming_concepts_and_structures)

### Conceptual vs Syntactic Understanding
- [Syntactic vs. Conceptual Lesson Plans in CS Curricula](https://www.socialsciencejournal.in/assets/archives/2016/vol2issue12/2-12-12-309.pdf)
- [Conceptual Transfer for Students Learning New Programming Languages](https://dl.acm.org/doi/10.1145/3372782.3406270)
- [Syntactic/Semantic Interactions in Programmer Behavior (Shneiderman)](https://www.cs.umd.edu/users/ben/papers/Shneiderman1979Syntactica.pdf)

### PRIMM Model
- [PRIMM Lesson Plans and Ideas](https://www.cambridge.org/gb/education/blog/2023/07/18/downloadable-primm-lesson-plan-and-ideas/)

### Computational Thinking
- [k12cs.org: Computational Thinking](https://k12cs.org/computational-thinking/)
- [Computational Thinking for All: K-12 Pedagogical Approaches](https://link.springer.com/article/10.1007/s11528-016-0087-7)

### Constructivism and Pedagogy
- [Pedagogical Content Knowledge in Programming Education](https://www.researchgate.net/publication/221209648_Pedagogical_content_knowledge_in_programming_education_for_secondary_school)
- [Constructivism in Education: Piaget, Vygotsky, and Bruner](https://www.researchgate.net/publication/378071316_Constructivism_in_Education_Exploring_the_Contributions_of_Piaget_Vygotsky_and_Bruner)

---

## Future Enhancements (Not in This Phase)

1. **Add unplugged activities** for each concept (CS Unplugged style)
   - Card sorting for variables
   - Human loop (physical repetition activity)
   - Decision tree role-play for conditionals

2. **Create scenario assessments** for competency evaluation
   - Business scenarios requiring whiteboard explanation
   - Requirements review exercises identifying missing cases

3. **Add progression paths** for different learner backgrounds
   - Fast track for those with spreadsheet expertise
   - Extended track for those new to structured thinking

4. **Develop instructor guide** with facilitation notes
   - Common misconceptions to watch for
   - Discussion questions for each lesson
   - Assessment rubrics

---

*Last updated: 2026-01-19*
*Status: Implemented in authoring API; Norm character added as course mascot*
*Course ID: 265c6fc0-6e60-46ea-bfa2-94b9933c855e*
