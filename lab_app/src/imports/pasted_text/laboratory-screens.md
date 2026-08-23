Continue designing the existing PashuPramaan Laboratory Technician module and implement ALL remaining key frontend screens required to complete the laboratory workflow.

This is a responsive Progressive Web App for a government livestock antimicrobial usage, food safety, residue monitoring and traceability platform.

IMPORTANT: Do not redesign the existing product. This must feel like a direct continuation of the already designed PashuPramaan Farmer, Veterinarian and Laboratory screens.

Maintain the exact established design system:

- Warm off-white / cream background
- Deep forest green primary colour
- Muted sage green accents
- Soft amber for pending and review states
- Muted red for critical, failed and hold states
- White cards with subtle warm-grey borders
- Elegant serif font for major headings
- Clean modern sans-serif for UI elements
- Minimal thin-line icons
- Rounded corners around 10–14px
- Minimal shadows
- Spacious, calm layouts
- No gradients
- No glassmorphism
- No neon colours
- No flashy generic SaaS styling

The overall feeling should be:

Government-grade + veterinary health + laboratory operations + trustworthy digital public infrastructure.

==================================================
RESPONSIVE NAVIGATION
==================================================

WEB / DESKTOP:

Use the existing horizontal TOP NAVIGATION BAR.

Navigation:

- Dashboard
- Dispatches
- Testing Queue
- Results
- Reports

Include:

- PashuPramaan logo
- LABORATORY role label
- Notifications
- Help
- Dr. Priya Sharma
- Laboratory Officer profile

MOBILE APP:

Use a fixed BOTTOM NAVIGATION BAR.

Items:

- Home
- Dispatches
- Testing
- Results
- Profile

The active tab should use deep forest green.

Use large touch targets and respect safe-area spacing.

Do not use a left sidebar.

==================================================
SCREEN 1 — RESULTS
==================================================

Create the consolidated Results screen for completed laboratory assessments.

Page heading:

Laboratory Results

Supporting text:

Review completed tests and submit dispatches for final assessment.

Include search:

Search Dispatch ID, Sample ID or Farm

Include filters:

- All
- Awaiting Verification
- Verified
- Released
- On Hold

Show result cards or a clean responsive table.

Example primary item:

MLK-2026-00124

Raw Milk · Shree Krishna Dairy

Sample:
LAB-MLK-00981

Show three assessment rows:

Product Quality
✓ COMPLIANT

Microbiological Safety
✓ COMPLIANT

Antimicrobial Residue
✓ WITHIN LIMIT

Overall Status:

AWAITING VERIFICATION

Primary action:

Review Assessment →

Second example:

MEAT-2026-00087

Meat · Green Valley Livestock

Product Quality
✓ Compliant

Microbiological Safety
✓ Compliant

Antimicrobial Residue
! REVIEW REQUIRED

Overall Status:

ACTION REQUIRED

Primary action:

Review →

On mobile, convert table rows into stacked cards.

==================================================
SCREEN 2 — FINAL ASSESSMENT
==================================================

Clicking Review Assessment opens the complete assessment page.

Example:

← Back to Results

FINAL ASSESSMENT

MLK-2026-00124

Raw Milk

Sample ID: LAB-MLK-00981

Status:

AWAITING VERIFICATION

Create one clean consolidated assessment card.

Section:

Traceability

✓ Source and sample linked
✓ Treatment history available

Section:

Withdrawal Verification

✓ Withdrawal period completed before dispatch

Section:

Laboratory Results

✓ Product Quality — Compliant
✓ Microbiological Safety — Compliant
✓ Antimicrobial Residue — Within limit

Use a clean checklist layout.

Do not overload the page with all raw laboratory values.

Add a small expandable:

View Detailed Results

==================================================
FINAL DECISION SUMMARY
==================================================

Create a visually important card:

Assessment Outcome

For the compliant example:

✓ ELIGIBLE FOR RELEASE

Supporting text:

All required traceability checks and laboratory assessments have been completed successfully.

For the non-compliant example:

! HOLD RECOMMENDED

Supporting text:

One or more laboratory results require regulatory review before this dispatch can proceed.

Include:

Laboratory Remarks

Optional text field.

Actions:

Save Draft

Submit for Verification →

On mobile, place these in a sticky bottom action bar above the bottom navigation.

==================================================
SCREEN 3 — VERIFICATION STATE
==================================================

After submission, show the verification state.

Heading:

Assessment Submitted

Large status:

AWAITING VERIFICATION

Show a simple progress tracker:

Testing Complete
✓

Assessment Submitted
✓

Verification
ACTIVE

Final Outcome
Pending

Supporting text:

This dispatch is awaiting authorised verification before its final status is issued.

Primary action:

View Assessment

Secondary:

Back to Results

Keep this screen simple.

==================================================
SCREEN 4 — VERIFIED / RELEASED
==================================================

Create the successful final outcome state.

Large green success indicator.

Heading:

Dispatch Eligible for Release

Dispatch ID:

MLK-2026-00124

Supporting text:

All required laboratory assessments have been verified successfully.

Show compact summary:

Traceability
✓ Complete

Withdrawal Verification
✓ Passed

Product Quality
✓ Compliant

Microbiological Safety
✓ Compliant

Antimicrobial Residue
✓ Within Limit

Final status pill:

CLEARED FOR DISPATCH

Include:

Verified by:
Laboratory Authority

Verified on:
23 Aug 2026 · 4:20 PM

Actions:

View Laboratory Report

View Dispatch

Back to Results

The page should feel trustworthy and official but not overly celebratory.

==================================================
SCREEN 5 — ON HOLD
==================================================

Create the alternative critical outcome state.

Use restrained muted red.

Heading:

Dispatch On Hold

Example:

MEAT-2026-00087

Sample:
LAB-MT-00472

Reason:

Antimicrobial residue result requires further review.

Show the assessment summary:

Traceability
✓ Complete

Withdrawal Verification
✓ Passed

Product Quality
✓ Compliant

Microbiological Safety
✓ Compliant

Antimicrobial Residue
! REVIEW REQUIRED

Final status:

ON HOLD

Include:

Required Next Step

Veterinary and regulatory review is required before the dispatch can proceed.

Actions:

View Detailed Results

View Linked Treatment

Back to Results

Do not make the screen alarming or visually aggressive.

It should feel formal, controlled and government-grade.

==================================================
SCREEN 6 — REPORTS
==================================================

Create a Reports page for the Laboratory module.

Page heading:

Laboratory Reports

Supporting text:

Access completed assessments and laboratory records.

Include filters:

- Date Range
- Product Type
- Status

Summary cards:

Completed Assessments
128

Released
112

On Hold
6

Awaiting Verification
10

Below, create a clean report history.

Columns or responsive cards:

- Dispatch ID
- Product
- Source
- Assessment Date
- Final Status
- Report

Example:

MLK-2026-00124
Milk
Shree Krishna Dairy
23 Aug 2026
CLEARED
View Report →

MEAT-2026-00087
Meat
Green Valley Livestock
23 Aug 2026
ON HOLD
View Report →

EGG-2026-00241
Eggs
Sunrise Poultry
22 Aug 2026
CLEARED
View Report →

On mobile, use stacked report cards.

==================================================
REPORT DETAIL / DOCUMENT VIEW
==================================================

When View Report is selected, show a clean official-looking digital laboratory report.

Heading:

Laboratory Assessment Report

Include only key information:

Dispatch ID
MLK-2026-00124

Sample ID
LAB-MLK-00981

Product
Raw Milk

Source
Shree Krishna Dairy

Assessment Summary:

✓ Product Quality — Compliant
✓ Microbiological Safety — Compliant
✓ Antimicrobial Residue — Within Limit

Final Outcome:

CLEARED FOR DISPATCH

Include:

Assessment Date

Verified By

Laboratory Reference Number

Actions:

Print

Download Report

Share

Keep it clean, official and suitable for a government digital record.

==================================================
COMPLETE LAB WORKFLOW
==================================================

Ensure all screens clearly form one continuous journey:

DASHBOARD
↓
DISPATCHES
↓
DISPATCH DETAIL
↓
SAMPLE RECEIPT
↓
TESTING QUEUE
↓
TESTING WORKSPACE
↓
PRODUCT-SPECIFIC TESTING
MILK / MEAT / EGGS
↓
LABORATORY RESULTS
↓
FINAL ASSESSMENT
↓
SUBMIT FOR VERIFICATION
↓
AWAITING VERIFICATION
↓
VERIFIED
↓
EITHER:

✓ ELIGIBLE FOR RELEASE

OR

! DISPATCH ON HOLD
↓
REPORT AVAILABLE

==================================================
IMPORTANT UX PRINCIPLES
==================================================

The Lab Technician should always know:

- Which Dispatch ID they are working on
- Which Sample ID is linked
- What product type it is
- What testing stage they are currently in
- Whether action is required
- What happens next

Use Dispatch ID as the central traceability identifier throughout the system.

Each dispatch connects:

Dispatch
→ Sample
→ Product
→ Farm
→ Animal or Flock
→ Antimicrobial treatment history
→ Withdrawal verification
→ Laboratory tests
→ Results
→ Verification
→ Final outcome

Keep detailed raw testing parameters inside the Testing Workspace.

Keep the Results and Final Assessment screens concise and decision-focused.

==================================================
MOBILE PWA REQUIREMENTS
==================================================

The mobile design must feel like a real application, not a shrunk website.

Use:

- Bottom navigation
- Vertical card layouts
- Horizontally scrollable filter chips
- Large touch-friendly controls
- Collapsible secondary information
- Sticky primary actions
- No hover-dependent interactions
- Clear status at the top of every workflow screen
- Easy navigation back through the workflow

Desktop should prioritise:

- Wide tables
- Multi-column layouts
- Context panels

Mobile should prioritise:

- One task at a time
- Stacked cards
- Clear primary action
- Minimal cognitive load

==================================================
FINAL GOAL
==================================================

Create all these screens as one connected, visually consistent PashuPramaan Laboratory PWA.

The final design should complete the entire Lab Technician frontend workflow from testing completion to final government-ready laboratory assessment.

It should feel like one cohesive ecosystem alongside the Farmer and Veterinarian portals, with:

WEB → TOP NAVIGATION

MOBILE PWA → BOTTOM NAVIGATION

Maintain the existing PashuPramaan design language across every screen.