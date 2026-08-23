Create a responsive Progressive Web App screen for the Laboratory Technician role of the existing government livestock antimicrobial surveillance, food safety and traceability platform called PashuPramaan.

This is the main LABORATORY TESTING WORKSPACE.

IMPORTANT: This must be a direct continuation of the existing PashuPramaan Farmer, Veterinarian and Laboratory interfaces.

Maintain the exact established PashuPramaan design system:

- Warm off-white or very light cream background
- Deep forest green as the primary brand and action colour
- Muted sage green secondary accents
- Soft amber for warnings, pending states and review-required states
- Muted red for critical, rejected or hold states
- White cards with subtle warm-grey borders
- Large elegant serif typography for major page headings
- Clean modern sans-serif typography for labels, forms, metadata and navigation
- Minimal thin-line icons
- Rounded corners around 10–14px
- Minimal shadows
- Generous whitespace
- Calm, trustworthy, government-grade visual language
- No gradients
- No glassmorphism
- No neon colours
- No flashy generic SaaS styling

The interface should feel like a serious Indian government digital platform for livestock antimicrobial surveillance and food safety.

==================================================
RESPONSIVE PWA NAVIGATION
==================================================

Design this screen in both desktop web and mobile app states.

IMPORTANT NAVIGATION RULE:

DESKTOP / WEB:
Use a horizontal TOP NAVIGATION BAR.

MOBILE APP:
Use a fixed BOTTOM NAVIGATION BAR.

Do not use a left sidebar.

--------------------------------------------------
DESKTOP TOP NAVIGATION
--------------------------------------------------

Full-width horizontal navigation bar.

Left:

PashuPramaan logo and brand mark.

Small role label:

LABORATORY

Center navigation:

- Dashboard
- Dispatches
- Testing Queue — ACTIVE
- Results
- Reports

Use the same active state established previously:
deep forest green text with a subtle pale sage background or restrained underline.

Right:

- Help & Guidelines
- Notification icon
- Subtle divider
- Circular user avatar
- Dr. Priya Sharma
- Laboratory Officer
- Dropdown chevron

--------------------------------------------------
MOBILE BOTTOM NAVIGATION
--------------------------------------------------

Use a fixed bottom navigation bar designed specifically for a mobile PWA.

Show five primary navigation items with minimal line icons and labels:

- Home
- Dispatches
- Testing
- Results
- Profile

The Testing tab is ACTIVE.

Use deep forest green for the active icon and label.

Inactive items should use muted grey.

The bottom navigation should:

- Have a white or warm off-white background
- Have a subtle top border
- Be fixed above the bottom edge
- Have large touch-friendly tap targets
- Respect mobile safe area spacing
- Remain visually minimal and professional

Do not overcrowd the bottom navigation with too many items.

Help, guidelines and secondary actions should be accessible from Profile or contextual menus.

==================================================
PAGE CONTEXT
==================================================

The Laboratory Technician has already:

✓ Opened the Dispatch
✓ Received the sample
✓ Verified sample identity
✓ Inspected sample condition
✓ Confirmed receipt

The sample is now:

READY FOR TESTING

Display the following active example:

Dispatch ID:
MLK-2026-00124

Sample ID:
LAB-MLK-00981

Product:
Raw Milk

Source:
Shree Krishna Dairy

Linked Animal:
MP-104

Current Risk:
MODERATE

Risk context:
Recent antimicrobial treatment history detected.

==================================================
PAGE HEADER
==================================================

Desktop:

Small back navigation:

← Back to Testing Queue

Small eyebrow:

LABORATORY TESTING

Large serif heading:

MLK-2026-00124

Supporting text:

Raw Milk · Sample LAB-MLK-00981

On the right, display a restrained status pill:

READY FOR TESTING

Below it, show:

Shree Krishna Dairy · Linked Animal MP-104

--------------------------------------------------
MOBILE
--------------------------------------------------

Keep the header compact.

Top row:

← Back

More options icon

Below:

MLK-2026-00124

Raw Milk

Sample ID: LAB-MLK-00981

Show the current status as a compact pill.

Do not overcrowd the top of the mobile screen.

==================================================
TESTING PROGRESS
==================================================

Below the header, show a clear but elegant testing progress component.

Heading:

Required Assessments

Show:

1 of 3 Complete

Use three connected assessment stages:

[ ✓ ]
Product Quality
Completed

[ ● ]
Microbiological Safety
In Progress

[ ○ ]
Antimicrobial Residue
Pending

On desktop, use a horizontal step/progress layout.

On mobile, use vertically stacked compact cards.

The current active test should be visually prominent.

==================================================
LEFT OR PRIMARY CONTENT AREA
==================================================

The primary focus is the active test.

Create a large white card.

Small label:

TEST 02 OF 03

Large heading:

Microbiological Safety

Supporting text:

Record the laboratory findings for this sample.

Show test status:

IN PROGRESS

==================================================
TEST PARAMETERS
==================================================

Create clean structured input rows.

Do not make the screen feel like a dense spreadsheet.

Parameter 1:

Standard Plate Count

Input:

[                ]

Unit:

CFU/mL

Reference or acceptance criteria:

Within configured laboratory limits

--------------------------------------------------

Parameter 2:

Coliform Screening

Use a segmented control:

Detected | Not Detected

--------------------------------------------------

Parameter 3:

Pathogen Screen

Use:

Detected | Not Detected

If Detected is selected, reveal:

Organism identified

[ Select or enter organism ]

--------------------------------------------------

Each parameter should have:

- Clear label
- Input or segmented control
- Unit where applicable
- Optional subtle reference criteria
- Automatic interpretation area

Example:

✓ Within Range

or

! Requires Review

Use semantic colour sparingly.

==================================================
TEST NOTES
==================================================

Below the parameters:

Laboratory Notes

Optional multiline field:

Add observations or testing notes...

Keep it secondary.

==================================================
RIGHT-SIDE CONTEXT PANEL ON DESKTOP
==================================================

Create a compact sticky contextual panel.

Heading:

Sample Context

Show:

Dispatch
MLK-2026-00124

Sample
LAB-MLK-00981

Product
Raw Milk

Source
Shree Krishna Dairy

Sample Condition
✓ Acceptable

Received Temperature
4.2°C

--------------------------------------------------

Below, show:

Antimicrobial Context

Recent treatment:

Amoxicillin

Last administered:
15 Aug 2026

Withdrawal status:

✓ Completed before dispatch

Add a subtle note:

Laboratory residue testing remains required for analytical confirmation.

This panel should provide context without distracting from the active test.

On mobile, move this into a collapsible:

Sample Details

section near the top.

==================================================
TEST ACTIONS
==================================================

Desktop:

At the bottom of the testing card:

Left:

Save Draft

Right:

Cancel

Primary action:

Complete Test →

Use the deep forest green primary button.

--------------------------------------------------
MOBILE
--------------------------------------------------

Use a fixed or sticky bottom action area ABOVE the bottom navigation bar.

Secondary:

Save Draft

Primary:

Complete Test →

Ensure there is enough spacing so the action area never overlaps with the bottom navigation.

Buttons must be large and touch-friendly.

==================================================
SAVE DRAFT STATE
==================================================

When the user saves:

Show subtle confirmation:

Draft saved

Just now

Do not use a disruptive modal.

The user should be able to continue working.

==================================================
COMPLETE TEST FLOW
==================================================

When Complete Test is selected, show a compact confirmation or review state.

Heading:

Review Microbiological Results

Display a concise summary:

Standard Plate Count
Within Range

Coliform Screening
Not Detected

Pathogen Screen
Not Detected

Overall Test Assessment:

COMPLIANT

Actions:

← Continue Editing

Confirm & Complete →

After confirmation, update the progress:

✓ Product Quality
✓ Microbiological Safety
○ Antimicrobial Residue

2 of 3 Complete

Then transition the user naturally to:

Next Required Test

==================================================
NEXT TEST CARD
==================================================

After completing Microbiological Safety, show a clear next action.

Heading:

Next Required Assessment

Antimicrobial Residue Testing

Supporting text:

Targeted residue testing is required based on the linked antimicrobial treatment history.

Show:

Triggered by treatment history

Pending

Primary button:

Start Residue Test →

Secondary:

Return to Testing Queue

This transition should make the workflow feel continuous.

==================================================
PRODUCT-SPECIFIC ADAPTIVE DESIGN
==================================================

The testing workspace must be designed as a reusable framework.

The header, navigation, progress tracker, sample context and actions remain consistent.

Only the testing parameters change according to the dispatch product.

--------------------------------------------------
MILK
--------------------------------------------------

Potential test categories:

Product Quality
- Fat
- SNF
- Acidity
- Adulteration screen

Microbiological Safety
- Standard Plate Count
- Coliform Screening
- Pathogen Screen

Antimicrobial Residue
- Beta-lactam
- Tetracycline
- Other targeted antimicrobial groups

--------------------------------------------------
MEAT
--------------------------------------------------

Potential categories:

Product Condition
- Appearance
- Odour
- pH
- Temperature

Microbiological Safety
- Aerobic Count
- E. coli
- Salmonella
- Other pathogen screening

Antimicrobial Residue
- Targeted analysis based on treatment history

--------------------------------------------------
EGGS
--------------------------------------------------

Potential categories:

Physical Quality
- Average weight
- Shell integrity
- Cracked percentage
- Cleanliness

Microbiological Safety
- Relevant microbiological screening

Antimicrobial Residue
- Targeted analysis based on flock treatment history

Do not create three entirely different products.

The PashuPramaan Testing Workspace should remain visually and structurally consistent, while dynamically adapting the test parameters to Milk, Meat or Eggs.

==================================================
MOBILE PWA EXPERIENCE
==================================================

The mobile version should feel like a real application, not a compressed website.

Prioritize:

- One-hand-friendly interactions
- Large touch targets
- Segmented controls instead of tiny dropdowns where possible
- Vertical information flow
- Collapsible secondary details
- Sticky action buttons
- Fixed bottom navigation
- Clear progress through the testing workflow
- Minimal typing
- Easy access to the current Dispatch and Sample IDs

The mobile user should always know:

Which dispatch am I testing?

Which sample am I handling?

Which test am I currently completing?

How many tests remain?

What should I do next?

==================================================
FINAL VISUAL FLOW
==================================================

The screen should clearly communicate:

DISPATCH
MLK-2026-00124
        ↓
SAMPLE
LAB-MLK-00981
        ↓
REQUIRED ASSESSMENTS

✓ Product Quality

● Microbiological Safety
CURRENT

○ Antimicrobial Residue
NEXT
        ↓
COMPLETE TEST
        ↓
REVIEW RESULTS
        ↓
NEXT REQUIRED TEST

==================================================
FINAL DESIGN GOAL
==================================================

Create a polished, realistic, responsive PWA interface that feels like the core working environment of a laboratory technician inside the PashuPramaan ecosystem.

The design must be:

- Operational
- Touch-friendly
- Government-grade
- Calm
- Highly organised
- Trustworthy
- Responsive
- Consistent with the Farmer and Veterinarian portals

On WEB, use the established TOP NAVIGATION BAR.

On MOBILE APP, use the fixed BOTTOM NAVIGATION BAR.

Do not use a left sidebar.

Do not redesign the visual identity.

This should feel like one continuous PashuPramaan product across desktop, tablet and mobile.