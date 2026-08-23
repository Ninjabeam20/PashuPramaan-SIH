Create the next screen for the PashuPramaan Laboratory module, designed as a responsive Progressive Web App (PWA).

This screen combines the Sample Receipt workflow and the Testing Queue.

IMPORTANT: This must be a direct continuation of the existing PashuPramaan Farmer, Veterinarian, Lab Dashboard, Dispatches, and Dispatch Detail interfaces.

Maintain the exact same established design system:

- Warm off-white / light cream background
- Deep forest green as the primary brand colour
- Muted sage green accents
- Soft amber for warnings and pending states
- Muted red for critical or non-compliant states
- White cards with subtle warm-grey borders
- Elegant serif typography for major headings
- Clean modern sans-serif typography for UI elements
- Minimal thin-line icons
- Rounded corners around 10–14px
- Minimal shadows
- Generous whitespace
- No gradients
- No glassmorphism
- No neon colours
- No generic flashy SaaS styling

The interface should feel like a serious, trustworthy Indian government livestock health, antimicrobial surveillance, food safety and laboratory operations platform.

==================================================
RESPONSIVE PWA REQUIREMENTS
==================================================

Design this as one responsive product across:

1. Desktop
2. Tablet
3. Mobile

The primary design should show the desktop view, but clearly demonstrate how the layout adapts into a usable mobile PWA.

Do not simply shrink the desktop UI.

On smaller screens:

- Navigation should collapse into a compact responsive navigation pattern
- Tables should transform into stacked cards where necessary
- Primary actions should remain easy to reach
- Buttons must be touch-friendly
- Avoid hover-only interactions
- Important workflow actions can use a sticky bottom action bar
- Preserve the current Dispatch ID and Sample ID throughout the workflow
- The screen should feel useful for a laboratory technician using a tablet or phone while physically handling a sample

==================================================
TOP NAVIGATION
==================================================

Use the same PashuPramaan horizontal top navigation bar.

Desktop navigation:

- PashuPramaan logo
- Small role indicator: LABORATORY

Navigation items:

- Dashboard
- Dispatches
- Testing Queue — ACTIVE
- Results
- Reports

Right side:

- Help & Guidelines
- Notification icon
- User profile
- Dr. Priya Sharma
- Laboratory Officer

On tablet, simplify spacing while retaining visible navigation.

On mobile:

- PashuPramaan logo on the left
- Notification icon
- User/profile icon
- Compact menu icon for additional navigation

Do not overcrowd the mobile header.

==================================================
PAGE HEADER
==================================================

Small eyebrow:

LABORATORY OPERATIONS

Large serif heading:

Testing Queue

Supporting text:

Receive samples, verify their condition, and prepare them for laboratory testing.

On desktop, show a compact summary on the right:

12 samples awaiting receipt
18 tests in progress

On mobile, place these as small horizontal summary cards below the heading.

==================================================
WORKFLOW TABS
==================================================

Below the page heading, create two clear workflow tabs:

1. Awaiting Receipt
2. Ready for Testing

The active tab should be:

Awaiting Receipt

Show count badges:

Awaiting Receipt   12

Ready for Testing   8

Use the established subtle active-state styling with forest green and pale sage background.

On mobile, make these horizontally scrollable if necessary.

==================================================
SECTION 1: SAMPLES AWAITING RECEIPT
==================================================

Create a clean operational queue.

Desktop version can use a structured table.

Columns:

- Dispatch ID
- Product
- Source
- Sample ID
- Arrival
- Priority
- Action

Example Row 1:

Dispatch ID:
MLK-2026-00131

Product:
Milk
Raw Milk

Source:
Mahalaxmi Dairy
Animal: MP-087

Sample ID:
LAB-MLK-00992

Arrival:
Expected today
10:45 AM

Priority:
HIGH PRIORITY

Reason:
Targeted residue test

Action:

Receive Sample →

--------------------------------------------------

Example Row 2:

Dispatch ID:
MEAT-2026-00091

Product:
Meat
Batch M-56

Source:
Green Valley Livestock

Sample ID:
LAB-MT-00481

Arrival:
Received 15 min ago

Priority:
MODERATE

Action:

Receive →

--------------------------------------------------

Example Row 3:

Dispatch ID:
EGG-2026-00255

Product:
Eggs
Flock FLK-2026-051

Source:
Sunrise Poultry

Sample ID:
LAB-EGG-01142

Arrival:
Expected today
12:30 PM

Priority:
ROUTINE

Action:

Receive →

Use restrained semantic badges.

HIGH PRIORITY:
soft amber or muted red depending on severity.

MODERATE:
soft amber.

ROUTINE:
soft sage or neutral grey.

==================================================
MOBILE SAMPLE CARDS
==================================================

On mobile, transform each queue row into a clean stacked dispatch/sample card.

Example:

[ MILK ICON ]    HIGH PRIORITY

MLK-2026-00131

Mahalaxmi Dairy

Sample
LAB-MLK-00992

Expected arrival
Today · 10:45 AM

Targeted residue testing required

[ Receive Sample → ]

The entire card should be easy to scan and use with touch.

Do not make the user horizontally scroll through a desktop table.

==================================================
SAMPLE RECEIPT WORKFLOW
==================================================

When the Lab Technician taps:

Receive Sample

Open a focused Sample Receipt screen, panel, or step-based workflow.

The current dispatch context should remain clearly visible at the top.

--------------------------------------------------

← Back to Testing Queue

MLK-2026-00131

Sample Receipt

Milk · Mahalaxmi Dairy

Sample ID:
LAB-MLK-00992

--------------------------------------------------

Create a compact step indicator:

1. Identify
2. Inspect
3. Confirm

Step 1 is active.

==================================================
STEP 1: IDENTIFY SAMPLE
==================================================

Heading:

Verify Sample Identity

Display:

Dispatch ID
MLK-2026-00131

Sample ID
LAB-MLK-00992

Product
Raw Milk

Source
Mahalaxmi Dairy

Linked Animal
MP-087

Include a prominent but elegant action:

Scan Sample ID

with a camera/scan icon.

Because this is a PWA, make this action feel mobile-first and field-friendly.

Also include:

or enter Sample ID manually

[ LAB-MLK-00992                  ]

[ Continue → ]

The Scan Sample ID action should be especially easy to access on mobile.

==================================================
STEP 2: INSPECT SAMPLE
==================================================

Heading:

Inspect Sample Condition

Supporting text:

Record the condition of the sample at the time of laboratory receipt.

Create the following input controls.

Sample condition:

○ Acceptable
○ Requires Attention
○ Rejected

Temperature on receipt:

[ 4.2 ] °C

Container integrity:

○ Intact
○ Damaged
○ Leaking

Sample quantity received:

[ 50 ] mL

Packaging condition:

○ Acceptable
○ Damaged

Use clean radio buttons, segmented controls, and numeric inputs.

Avoid excessive dropdowns.

If a non-acceptable condition is selected, reveal a small contextual note field:

Describe the issue

[ __________________________________ ]

Keep validation feedback subtle.

==================================================
STEP 3: CONFIRM RECEIPT
==================================================

Heading:

Confirm Sample Receipt

Show a compact summary card.

Sample ID:
LAB-MLK-00992

Dispatch:
MLK-2026-00131

Product:
Raw Milk

Condition:
Acceptable

Temperature:
4.2°C

Container:
Intact

Received by:
Dr. Priya Sharma

Received at:
23 Aug 2026 · 11:05 AM

At the bottom, show the next workflow state:

Once confirmed, this sample will move to:

READY FOR TESTING

==================================================
PRIMARY ACTION
==================================================

Desktop:

Place actions at the bottom right.

Secondary:

Cancel

Primary forest green button:

Confirm & Move to Testing →

Mobile:

Use a sticky bottom action bar.

Secondary action:

Save Draft

Primary action:

Confirm Receipt →

The buttons should be large enough for touch interaction.

==================================================
SUCCESS STATE
==================================================

After confirmation, show a clean success state.

Use a simple green check icon.

Heading:

Sample Received Successfully

Supporting text:

LAB-MLK-00992 has been registered and is now ready for laboratory testing.

Show:

Dispatch:
MLK-2026-00131

Current Status:
READY FOR TESTING

Primary action:

Start Testing →

Secondary action:

Back to Testing Queue

On mobile, make Start Testing the most prominent action.

==================================================
SECTION 2: READY FOR TESTING
==================================================

Below the Awaiting Receipt tab or in the second tab, show samples that have successfully passed receipt.

Heading:

Ready for Testing

Supporting text:

Samples received and prepared for the required laboratory assessments.

Each item should show:

MLK-2026-00124

Milk · Shree Krishna Dairy

Sample:
LAB-MLK-00981

Required Tests:

Product Quality
✓ Completed

Microbiological Safety
In Progress

Antimicrobial Residue
Pending

Overall progress:

1 of 3 completed

Primary action:

Continue Testing →

--------------------------------------------------

Another item:

MEAT-2026-00091

Meat · Green Valley Livestock

Sample:
LAB-MT-00481

Required Tests:

Quality Assessment
Pending

Microbiology
Pending

Antimicrobial Residue
Required

Primary action:

Start Testing →

--------------------------------------------------

Use a small, elegant progress indicator.

Do not use large colourful progress bars.

==================================================
QUICK FILTERS
==================================================

At the top of the Testing Queue, include compact filters:

All Products

Milk

Meat

Eggs

and:

All Priorities

On mobile, make these horizontally scrollable filter chips.

==================================================
IMPORTANT PWA UX BEHAVIOUR
==================================================

The workflow should support practical laboratory use.

Design for:

- Quick sample identification
- Minimal typing
- Scan-first interaction where possible
- Large touch targets
- Clear current workflow state
- Draft saving before confirmation
- Sticky primary actions on mobile
- No dependency on hover interactions
- Clear feedback after every workflow transition

The UI should feel usable on a tablet sitting on a laboratory bench.

The Lab Technician should always know:

1. Which Dispatch they are working on
2. Which Sample they are handling
3. What stage they are currently in
4. What action is required next

==================================================
FINAL VISUAL GOAL
==================================================

This screen should communicate the operational workflow:

DISPATCH CREATED
        ↓
SAMPLE ARRIVES
        ↓
IDENTITY VERIFIED
        ↓
CONDITION INSPECTED
        ↓
RECEIPT CONFIRMED
        ↓
READY FOR TESTING
        ↓
TESTING WORKSPACE

The page must feel like a seamless part of the PashuPramaan ecosystem.

Keep the visual design calm, spacious, credible, government-grade and production-ready.

Do not make it look like a generic laboratory management SaaS.

Design both desktop and mobile-responsive PWA states within the same design system.