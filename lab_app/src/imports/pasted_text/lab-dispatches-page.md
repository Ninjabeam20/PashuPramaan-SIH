# Create a desktop web interface for the **Laboratory Technician role** of an existing government livestock antimicrobial surveillance and traceability platform called **PashuPramaan**.

This is the **Dispatches page** of the Laboratory module.

IMPORTANT: The design must look like part of the exact same PashuPramaan product ecosystem as the existing Farmer and Veterinarian portals. Maintain a consistent visual language, typography, colours, spacing, cards, buttons, status badges, and overall government-grade professional aesthetic.

Do NOT use a left sidebar.

---

# Overall visual style

Create a calm, premium, trustworthy interface for a government livestock health, food safety, antimicrobial surveillance and traceability platform.

Use:

* Warm off-white / light cream page background
* Deep forest green as the primary brand colour
* Muted sage green for subtle accents
* White cards and tables
* Very subtle warm-grey or beige borders
* Minimal, soft shadows
* Rounded corners around 10–14px, not excessively rounded
* Large elegant serif font for major headings
* Clean modern sans-serif font for navigation, labels, tables, metadata and buttons
* Thin-line minimal icons
* Generous whitespace
* Restrained and professional visual hierarchy

Semantic colours:

* Deep green for compliant, complete and primary actions
* Soft amber for pending, warning and review states
* Muted red for hold, critical or non-compliant states
* Soft neutral grey for inactive or informational states

Avoid:

* Gradients
* Glassmorphism
* Neon colours
* Excessive illustrations
* Overly rounded SaaS-style components
* Dense enterprise dashboard styling
* Bright blue primary buttons

The design should feel like:

**Indian government digital service + veterinary health platform + laboratory operations system**

---

# TOP NAVIGATION BAR

Create a full-width horizontal navigation bar at the top of the page.

The navbar should be clean, spacious and elegant, with a subtle bottom border.

## Left side

Place the existing **PashuPramaan logo/brand mark**.

Next to or below it subtly indicate:

**LABORATORY**

Do not make the role label dominant.

---

## Center navigation

Use horizontal navigation items with thin-line icons where appropriate:

* Dashboard
* Dispatches
* Testing Queue
* Results
* Reports

The **Dispatches** item is currently active.

Show the active state using:

* Deep forest green text
* A subtle pale sage or pale green background OR a thin deep-green underline
* Keep it restrained and consistent with the existing PashuPramaan UI

Other navigation items should be dark muted grey.

---

## Right side

Include:

* Small Help icon or **Help & Guidelines**
* Notification bell with a small subtle indicator
* Vertical divider
* Circular user avatar placeholder
* User name: **Dr. Priya Sharma**
* Small secondary text: **Laboratory Officer**
* Small dropdown chevron

The top navigation should remain consistent across all future Lab pages.

---

# PAGE HEADER

Below the navigation bar, use a wide centered content container with generous horizontal margins.

Small eyebrow label:

**LABORATORY OPERATIONS**

Large serif heading:

# Dispatches

Supporting text:

**Track and assess milk, meat and egg dispatches submitted for laboratory testing.**

On the right side of the header, add a subtle outlined secondary button:

**Laboratory Guidelines**

with a minimal document or information icon.

Do not add a prominent "Create Dispatch" button because the laboratory does not create dispatches. Dispatches originate from the Farmer workflow.

---

# SEARCH AND FILTER AREA

Below the header, create a large clean control area.

## Search bar

Wide search field with search icon.

Placeholder:

**Search by Dispatch ID, Sample ID, Farm or Animal/Flock ID**

The search field should be visually prominent but elegant.

---

## Product type filter tabs

Below the search bar, create horizontal filter pills or tabs:

* All Dispatches
* Milk
* Meat
* Eggs

The **All Dispatches** filter should be active.

Each product type can have a subtle icon:

🥛 Milk
🥩 Meat
🥚 Eggs

However, use refined minimal line icons rather than colourful emoji styling.

---

## Status filter

On the right side or below the product filters, create a dropdown:

**All Statuses**

Options represented visually in the UI:

* Awaiting Receipt
* Ready for Testing
* Testing in Progress
* Awaiting Verification
* Completed
* On Hold

Add another subtle filter for:

**Risk Level**

Options:

* All Risk Levels
* Low
* Moderate
* High

Keep the filter area clean and not overloaded.

---

# DISPATCH OVERVIEW SUMMARY

Before the main table, add four compact summary metrics.

### Total Dispatches

**48**

Supporting text:
**Across all product types**

---

### Ready for Testing

**12**

Use a subtle amber indicator.

---

### In Progress

**18**

Use a muted neutral or sage indicator.

---

### Requires Attention

**4**

Use muted red or amber depending on severity.

The cards should be smaller and less dominant than the dashboard summary cards.

---

# MAIN DISPATCH TABLE

Create a large white card containing the dispatch directory.

At the top of the card:

### All Dispatches

Supporting text:

**Showing 48 dispatches across milk, meat and egg products.**

On the right:

**Sort: Most Recent**

with a dropdown.

---

## Table columns

Use the following columns:

| Dispatch ID | Product | Source | Sample | Risk Level | Testing Status | Action |

Make the table spacious and highly readable.

---

## Row 1

### Dispatch ID

**MLK-2026-00124**

Secondary text:

**22 Aug 2026 · 10:30 AM**

### Product

Minimal milk icon

**Milk**

Secondary text:

**Raw milk**

### Source

**Shree Krishna Dairy**

Secondary text:

**Animal: MP-104**

### Sample

**LAB-MLK-00981**

Small green dot or indicator:

**Received**

### Risk Level

Amber status pill:

**MODERATE**

Secondary tooltip-style indicator:

**Recent antimicrobial exposure**

### Testing Status

Neutral/amber pill:

**READY FOR TESTING**

### Action

Outlined or text action:

**View →**

---

## Row 2

### Dispatch ID

**MEAT-2026-00087**

Secondary text:

**22 Aug 2026 · 08:45 AM**

### Product

Minimal meat icon

**Meat**

Secondary text:

**Batch M-42**

### Source

**Green Valley Livestock**

Secondary text:

**Batch: M-42**

### Sample

**LAB-MT-00472**

Small indicator:

**Testing**

### Risk Level

Muted red pill:

**HIGH**

Secondary text:

**Withdrawal review required**

### Testing Status

Pale green/sage pill:

**IN PROGRESS**

### Action

**Continue →**

---

## Row 3

### Dispatch ID

**EGG-2026-00241**

Secondary text:

**21 Aug 2026 · 04:20 PM**

### Product

Minimal egg icon

**Eggs**

Secondary text:

**Flock dispatch**

### Source

**Sunrise Poultry**

Secondary text:

**Flock: FLK-2026-042**

### Sample

**LAB-EGG-01128**

Small green indicator:

**Complete**

### Risk Level

Green pill:

**LOW**

Secondary text:

**No recent exposure**

### Testing Status

Amber pill:

**AWAITING VERIFICATION**

### Action

**Review →**

---

## Row 4

Create another example:

**MLK-2026-00118**

Milk

**Mahalaxmi Dairy**

Animal: MP-087

Sample: **LAB-MLK-00972**

Risk:

**LOW**

Status:

**COMPLETED**

Action:

**View Report →**

---

## Row 5

**MEAT-2026-00072**

Meat

**Raj Farms**

Batch: M-18

Sample:

**LAB-MT-00461**

Risk:

**HIGH**

Testing status:

**ON HOLD**

Use a restrained muted red status.

Action:

**Review →**

---

# TABLE INTERACTION DESIGN

The table should feel operational and easy to scan.

Use:

* Thin subtle horizontal row dividers
* Slight row hover state
* Dispatch IDs styled prominently in deep forest green
* Secondary metadata in smaller muted grey text
* Status badges with soft tinted backgrounds
* Avoid heavy borders around every cell
* Generous vertical row spacing

The **Dispatch ID should always be the primary clickable identifier** because it is the central traceability object throughout PashuPramaan.

Clicking a row or the View action should conceptually lead to the Dispatch Detail page.

---

# RIGHT-SIDE OPTIONAL PRIORITY PANEL

If the layout has sufficient space, add a narrow secondary panel titled:

## Priority Dispatches

Show three compact items:

### MEAT-2026-00087

**High risk**

Withdrawal verification requires review.

**Review →**

---

### MLK-2026-00131

**High priority**

Targeted antimicrobial residue testing required.

**Start Testing →**

---

### EGG-2026-00255

**Results pending**

Awaiting laboratory verification.

**Review →**

This panel should not overpower the main dispatch table.

If the screen looks cleaner without it, prioritize the table and do not force the panel.

---

# PAGINATION

At the bottom of the table:

**Showing 1–10 of 48 dispatches**

Minimal pagination controls:

Previous
1  2  3  4  5
Next

Use subtle styling.

---

# IMPORTANT INFORMATION ARCHITECTURE

The Laboratory Technician does NOT create a dispatch.

The flow is:

Farmer creates Dispatch
→ System generates Dispatch ID
→ Sample is linked to the Dispatch
→ Lab Technician receives the sample
→ Required tests are performed
→ Results are entered
→ Assessment is verified
→ Dispatch is marked Eligible for Release or On Hold

Therefore, visually communicate that:

**The Dispatch ID is the parent traceability record.**

Each dispatch may contain:

* Product information
* Farm source
* Animal or flock
* Antimicrobial treatment history
* Withdrawal status
* One or more Sample IDs
* Required test plan
* Laboratory results
* Final assessment status

Do not expose all of this information directly in the table. Keep the table clean and use the Dispatch Detail page for deeper information.

---

# FINAL VISUAL GOAL

This page should look like a polished continuation of the existing PashuPramaan Farmer and Veterinarian portals.

The page should communicate:

**"These are real livestock product dispatches moving through a traceable laboratory assessment workflow."**

It must feel:

* Government-grade
* Trustworthy
* Clinical
* Operational
* Calm
* Modern
* Highly organised

Maintain exact consistency with the PashuPramaan brand system.

Do not redesign the product into a generic laboratory SaaS application.
