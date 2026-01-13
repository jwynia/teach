---
title: {{course_title}}
author: {{instructor_name}}
theme: white
transition: slide
controls: true
progress: true
slideNumber: true
hash: true
---

<style>
:root {
  --primary-blue: #1B365D;
  --accent-teal: #2E7D7A;
  --light-gray: #F5F5F5;
  --text-dark: #333333;
  --text-medium: #666666;
}

.reveal .slides section {
  text-align: left;
}

.reveal h1, .reveal h2, .reveal h3 {
  color: var(--primary-blue);
  text-transform: none;
}

.reveal .progress {
  color: var(--accent-teal);
}

.reveal blockquote {
  background: var(--light-gray);
  border-left: 4px solid var(--accent-teal);
  padding: 1em;
  font-style: normal;
  margin: 1em 0;
}

.reveal .competency-callout {
  background: var(--light-gray);
  border: 2px solid var(--accent-teal);
  padding: 1em;
  border-radius: 8px;
  margin: 1em 0;
}

.reveal .time-estimate {
  color: var(--primary-blue);
  background: rgba(46, 125, 122, 0.1);
  padding: 0.3em 0.6em;
  border-radius: 4px;
  font-weight: bold;
  display: inline-block;
}

.reveal .teaching-note {
  font-style: italic;
  color: var(--text-medium);
  font-size: 0.9em;
}

.reveal .two-column {
  display: flex !important;
  flex-direction: row !important;
  gap: 2em;
  width: 100% !important;
  max-width: 100% !important;
  justify-content: space-between;
  align-items: flex-start;
  margin: 0 !important;
  padding: 0;
  box-sizing: border-box;
  position: relative;
  left: 0;
  transform: none;
}

.reveal .two-column .column {
  flex: 1 1 0;
  min-width: 0;
  max-width: calc(50% - 1em);
  overflow: hidden;
  box-sizing: border-box;
}

.reveal .section-divider {
  color: white;
  padding: 2em;
  text-align: center;
}

.reveal .section-divider h1,
.reveal .section-divider h2,
.reveal .section-divider h3 {
  color: white;
}

/* Quote slide styles */
.reveal .quote-slide {
  text-align: center;
}

.reveal .quote-slide blockquote {
  background: transparent;
  border: none;
  font-size: 1.6em;
  font-style: italic;
  padding: 0.5em 1.5em;
  margin: 0 auto;
  max-width: 85%;
  text-align: center;
  position: relative;
}

.reveal .quote-slide blockquote::before {
  content: "\201C";
  font-size: 3em;
  color: var(--light-gray);
  position: absolute;
  left: -0.2em;
  top: -0.3em;
  font-family: Georgia, serif;
}

.reveal .quote-slide .attribution {
  font-size: 0.8em;
  font-style: italic;
  color: var(--text-medium);
  margin-top: 1em;
  text-align: right;
  max-width: 85%;
  margin-left: auto;
  margin-right: auto;
}

/* Full image slide styles */
.reveal .full-image-slide {
  padding: 0;
}

.reveal .full-image-slide .image-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(27, 54, 93, 0.85);
  color: white;
  padding: 0.8em;
  text-align: center;
  font-size: 0.9em;
}

/* Big text slide styles */
.reveal .big-text-slide {
  display: flex !important;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.reveal .big-text-slide .big-text {
  font-size: 2.5em;
  font-weight: bold;
  color: var(--primary-blue);
  max-width: 90%;
  line-height: 1.2;
}
</style>

# {{course_title}}

{{course_subtitle}}

**Instructor:** {{instructor_name}}  
**Date:** {{course_date}}

Note: {{instructor_introduction_notes}}

---

<!-- .slide: class="section-divider" data-background-color="#1B365D" -->
# {{section_title}}

{{section_description}}

Note: {{section_instructor_notes}}

---

## {{slide_title}}

{{main_content}}

Note: {{slide_instructor_notes}}

--

### {{subsection_title}}

{{subsection_content}}

Note: {{subsection_notes}}

---

## Competency Focus

<div class="competency-callout">

### {{competency_title}}

> {{competency_description}}

**Assessment Criteria:**
{{assessment_criteria}}

</div>

Note: {{competency_assessment_notes}}

---

## Learning Objectives

By the end of this module, you will be able to:

{{learning_objectives}}

Note: {{learning_objectives_notes}}

---

<div class="two-column">

<div class="column">

## {{left_column_title}}

{{left_column_content}}

</div>

<div class="column">

## {{right_column_title}}

{{right_column_content}}

</div>

</div>

Note: {{two_column_notes}}

---

## Activity: {{activity_title}}

### Instructions

{{activity_instructions}}

### Time Estimate
<span class="time-estimate">{{time_estimate}} minutes</span>

### Materials Needed
{{materials_needed}}

Note: {{activity_facilitation_notes}}

---

## Discussion

{{discussion_prompt}}

### Key Questions
{{discussion_questions}}

<div class="teaching-note">
**Teaching Notes:** {{discussion_teaching_notes}}
</div>

Note: {{discussion_facilitation_tips}}

---

## Knowledge Check

{{knowledge_check_question}}

{{knowledge_check_options}}

Note: {{knowledge_check_answer_and_rationale}}

---

## Summary

### Key Takeaways
{{key_takeaways}}

### Next Steps
{{next_steps}}

**Questions?**

Note: {{wrap_up_notes}}

---

## Resources

{{additional_resources}}

### Further Reading
{{further_reading}}

### Contact Information
{{contact_information}}

Note: {{resources_notes}}

---

<!-- .slide: class="quote-slide" -->

> {{quote_text}}

<div class="attribution">— {{attribution}}</div>

Note: {{quote_notes}}

---

<!-- .slide: class="full-image-slide" data-background-image="{{image_url}}" data-background-size="cover" -->

<div class="image-caption">{{image_caption}}</div>

Note: {{image_notes}}

---

<!-- .slide: class="big-text-slide" -->

<div class="big-text">{{big_text_content}}</div>

Note: {{big_text_notes}}