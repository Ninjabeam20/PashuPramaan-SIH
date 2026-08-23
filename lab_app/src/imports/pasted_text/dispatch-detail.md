# Create a desktop web interface for the **Laboratory Technician role** of an existing government livestock antimicrobial surveillance, food safety and traceability platform called **PashuPramaan**.

This screen is the **Dispatch Detail page**.

IMPORTANT: This page must look like a direct continuation of the existing PashuPramaan Farmer and Veterinarian portals and the previously designed Laboratory Dashboard and Dispatches page.

Maintain the exact same:

* Warm off-white / cream background
* Deep forest green primary colour
* Muted sage accents
* Soft amber warning states
* Muted red critical states
* White cards
* Thin warm-grey borders
* Large elegant serif headings
* Clean modern sans-serif UI text
* Minimal thin-line icons
* Generous whitespace
* Rounded corners around 10–14px
* Minimal shadows
* No gradients
* No glassmorphism
* No flashy SaaS styling

The interface should feel like a **government-grade veterinary food safety and laboratory operations system**.

---

# TOP NAVIGATION BAR

Use the exact same full-width horizontal navigation bar as the Laboratory Dashboard and Dispatches page.

Left:

* PashuPramaan logo
* Small role label: **LABORATORY**

Center navigation:

* Dashboard
* Dispatches — ACTIVE
* Testing Queue
* Results
* Reports

Right:

* Help & Guidelines
* Notification bell
* Subtle divider
* Circular avatar
* **Dr. Priya Sharma**
* **Laboratory Officer**
* Dropdown chevron

The Dispatches navigation item should remain active.

---

# PAGE HEADER

Below the navigation, use a wide content container.

At the top left, add a subtle back navigation:

**← Back to Dispatches**

Below it, use a small eyebrow label:

**DISPATCH ASSESSMENT**

Then create a prominent but clean header:

# MLK-2026-00124

Large serif heading.

Next to or below it:

**Milk Dispatch**

Use a subtle milk icon.

Add a status pill:

🟠 **TESTING IN PROGRESS**

Supporting text:

**Shree Krishna Dairy · Submitted 22 Aug 2026 at 10:30 AM**

On the right side, add a compact risk indicator:

### Risk Level

**MODERATE**

Supporting reason:

**Recent antimicrobial exposure**

Use amber styling, restrained and professional.

---

# PRIMARY ACTION AREA

On the right or below the header, create primary action buttons depending on status.

Primary button:

**Continue Testing →**

Secondary outlined button:

**View Sample Details**

Do not use a "Release" or "Hold" button yet because testing is still in progress.

---

# DISPATCH OVERVIEW

Create a large white card.

Section heading:

## Dispatch Overview

Use a clean two-column or four-column information grid.

Fields:

### Product

**Raw Milk**

### Quantity

**850 L**

### Source Farm

**Shree Krishna Dairy**

### Linked Animal

**MP-104**

### Dispatch Date

**22 Aug 2026**

### Dispatch Time

**10:30 AM**

### Dispatch ID

**MLK-2026-00124**

### Current Sample

**LAB-MLK-00981**

Use subtle labels above or beside values.

The Dispatch ID and Sample ID should be visually recognisable and easy to copy, but avoid excessive technical styling.

---

# SAMPLE STATUS

Directly below or beside the Dispatch Overview, create a compact workflow card.

## Sample Tracking

Use a horizontal progress tracker with five stages:

### 1. Dispatch Created

✓ Complete

### 2. Sample Received

✓ Complete

### 3. Testing

ACTIVE

### 4. Verification

Upcoming

### 5. Final Assessment

Upcoming

Use deep green for completed stages.

Use amber or forest green for the current active stage.

Future stages should be muted grey.

The progress tracker should be elegant and minimal, not overly decorative.

---

# ANTIMICROBIAL TRACEABILITY

This is one of the most important sections of the page.

Create a prominent white card with a subtle green accent.

Section heading:

## Antimicrobial Traceability

Supporting text:

**Treatment history linked to this dispatch.**

At the top, display:

### Linked Animal

**MP-104 · Holstein Cow**

### Recent Clinical Condition

**Clinical Mastitis**

Then create a treatment history table.

Columns:

* Antimicrobial
* Classification
* Last Administered
* Withdrawal Completion
* Status

Row:

### Amoxicillin

Classification:
**ACCESS**

Last administered:
**15 Aug 2026**

Withdrawal completion:
**20 Aug 2026**

Status:
🟢 **COMPLETED BEFORE DISPATCH**

Below the table, show an automated traceability message:

🟢 **Withdrawal verification passed**

**The recorded withdrawal period was completed before this product was dispatched. Laboratory residue testing is still required for analytical confirmation.**

Make this explanation clear but compact.

IMPORTANT:

Visually distinguish:

* **Withdrawal verification** = system traceability check
* **Residue testing** = laboratory analytical confirmation

Do not merge these into one result.

---

# REQUIRED TEST PLAN

Create another large white card.

Heading:

## Required Test Plan

Supporting text:

**Tests selected based on product type, surveillance requirements and linked antimicrobial history.**

Create three clean test cards.

---

### TEST 01

Use a minimal laboratory or quality icon.

## Product Quality

Required checks:

* Fat
* SNF
* Acidity
* Adulteration screen

Status:

🟢 **COMPLETED**

Small action:

**View Results →**

---

### TEST 02

Minimal microbiology icon.

## Microbiological Safety

Required checks:

* Standard plate count
* Coliform screening
* Pathogen screen

Status:

🟠 **IN PROGRESS**

Action:

**Continue Testing →**

This card should visually indicate it is the current active test.

---

### TEST 03

Minimal analytical/lab icon.

## Antimicrobial Residue

Required checks:

* Beta-lactam screen
* Targeted residue analysis

Show a small contextual badge:

**Triggered by treatment history**

Status:

⚪ **PENDING**

Action:

**Start Test →**

This section should make the lab workflow immediately understandable.

---

# LABORATORY NOTES

Below the Required Test Plan, create a smaller card.

## Laboratory Notes

Show:

**Sample condition:** Acceptable

**Received temperature:** 4.2°C

**Container integrity:** Intact

**Received by:** Dr. Priya Sharma

**Received:** 22 Aug 2026 · 11:05 AM

Include a small outlined action:

**View Full Sample Record**

This should feel like supporting operational information, not the main focus.

---

# ACTIVITY TIMELINE

At the bottom of the page, create a clean vertical timeline.

Heading:

## Activity

Entries:

### 11:05 AM

**Sample received and registered**

Sample ID **LAB-MLK-00981** linked to this dispatch.

---

### 11:20 AM

**Product quality testing completed**

Results submitted by **Dr. Priya Sharma**.

---

### 12:10 PM

**Microbiological testing started**

Current laboratory status updated to **In Progress**.

---

### 10:30 AM

**Dispatch created**

Milk dispatch submitted from **Shree Krishna Dairy**.

Use subtle vertical lines and small minimal status icons.

Newest activity should appear first.

---

# RIGHT-SIDE ASSESSMENT SUMMARY

If the desktop layout allows, include a sticky or visually prominent compact summary card.

## Assessment Summary

| Assessment             | Status      |
| ---------------------- | ----------- |
| Traceability           | ✓ Complete  |
| Withdrawal Check       | ✓ Passed    |
| Product Quality        | ✓ Complete  |
| Microbiological Safety | In Progress |
| Residue Testing        | Pending     |

At the bottom:

### Overall Status

🟠 **TESTING IN PROGRESS**

Supporting text:

**2 of 3 required test categories are complete or active.**

Primary button:

**Continue Testing →**

This summary should provide a quick snapshot without replacing the detailed sections.

---

# IMPORTANT INFORMATION ARCHITECTURE

The Dispatch Detail page must clearly communicate the relationship:

**Dispatch ID**
↓
**Sample ID**
↓
**Linked Animal or Flock**
↓
**Treatment and Antimicrobial History**
↓
**Withdrawal Verification**
↓
**Required Laboratory Tests**
↓
**Laboratory Results**
↓
**Verification**
↓
**Final Release or Hold**

The Dispatch ID is the parent traceability record.

Do not make this screen look like a generic laboratory patient record.

It should feel like a real livestock food-product dispatch moving through a regulated laboratory assessment workflow.

---

# FINAL VISUAL GOAL

The user should immediately understand:

* What product is being assessed
* Where it came from
* Which animal or flock it is linked to
* Whether there was recent antimicrobial exposure
* Whether withdrawal requirements were met
* Which laboratory tests are required
* What stage the sample is currently in
* What action the Lab Technician should take next

The strongest visual hierarchy should be:

1. Dispatch ID and current status
2. Immediate next action
3. Antimicrobial traceability
4. Required test plan
5. Sample tracking and laboratory details
6. Activity history

Keep the interface elegant, spacious, restrained and highly consistent with the existing PashuPramaan Farmer and Veterinarian portals.

This is a serious government livestock antimicrobial surveillance and food safety system, not a generic laboratory SaaS dashboard.
