Create the RESEARCHER SIDE of the existing PashuPramaan system.

IMPORTANT: The two attached PashuPramaan screenshots showing the existing Home and Prescriptions pages are the STRICT visual source of truth for this work. These pages already belong to the same product/system.

DO NOT redesign the product.
DO NOT create a new visual identity.
DO NOT introduce a new dashboard style.
DO NOT change the existing header, logo, typography, spacing system, navigation treatment, buttons, cards, tables, dropdowns, borders, icons, or general UI language.

The new researcher pages must look like they were designed by the SAME DESIGNER as the attached Home and Prescriptions pages.

First, create the researcher-side top navigation with these six tabs, in this exact order:

1. Overview
2. AMU & Regional Analytics
3. Anomalies
4. Health × AMU
5. Forecast & Planning
6. Research Workspace

Use the SAME top navigation structure as the attached screenshots. The active tab should use the same active-navigation treatment already present in the screenshots. Do not invent a sidebar if the existing system does not use one.

Build ONLY the first two tabs in this prompt.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAB 1 — OVERVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create a researcher/regulator overview page.

The purpose of this page is:

"What is happening across antimicrobial usage right now?"

Use the same page structure and visual density as the existing PashuPramaan Home page.

Page title:

AMU & Regional Overview

Subtitle:

Monitor antimicrobial usage, emerging anomalies, and regional demand.

Create a top summary section using the SAME card/KPI language already established in the PashuPramaan Home page.

Include these four KPIs:

• Total AMU
69,420

• AMU change
↑ 18% vs previous period

• Active anomalies
17

• Unexplained anomalies
5

Then create a large "Regional AMU" section.

This section should contain the India state-level choropleth heatmap using the SAME geographic-map treatment as the reference map screenshots supplied separately in this conversation.

The map must show India divided by states.

States should be visually differentiated according to AMU.

Beside/below the map, include a compact regional summary table using the SAME table styling as the existing Prescriptions page.

Columns:

State
AMU
Change
Anomalies
Unexplained

Example rows:

Maharashtra | 69,420 | ↑ 23% | 17 | 5
Gujarat | 65,960 | ↑ 11% | 9 | 2
Rajasthan | 87,670 | ↑ 31% | 14 | 7
Karnataka | 73,380 | ↑ 8% | 6 | 1

Below this, create a compact "Needs your attention" section using the SAME visual language as the existing Home page's "Needs your attention" cards.

Include:

• 5 unexplained AMU anomalies require investigation
• Maharashtra demand predicted to increase
• 2 regions showing elevated CIA usage
• 12 anomalies associated with recorded health events

This page should feel like the researcher equivalent of the existing Dr. Bankey Home page.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAB 2 — AMU & REGIONAL ANALYTICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create the detailed geographic analytics page.

Page title:

AMU & Regional Analytics

Subtitle:

Explore antimicrobial usage across states and districts.

At the top create the filter row.

Use the EXACT existing dropdown/form-control visual language from the attached PashuPramaan screenshots.

Filters:

State
[All States]

District
[All Districts]

Year
[2026]

Metric
[AMU]

The geographic interaction MUST follow this hierarchy:

INDIA → STATE → DISTRICT

At the default India level, display an India state-level heatmap.

Use the existing geographic map screenshots as the STRICT reference for how the map looks and behaves.

The map must NOT look like a generic Figma-generated map.

Clicking a state should drill down into that state's districts.

For example:

India
→ Gujarat
→ Gujarat district map
→ Kachchh

The table must update together with the map.

Create a summary panel containing:

AMU
Total AMU: 69,420
Change vs previous period: ↑ 18%
Unexplained anomalies: 17
CIA usage: 8.2%

Below the map, create a regional table.

At India level:

State | AMU | Change | Anomalies | Unexplained

At state level:

District | AMU | Change | Anomalies | Unexplained

The Metric dropdown should conceptually support:

AMU
AMU Change %
Predicted Demand
Anomalies
Unexplained Anomalies
CIA Usage
Explained vs Unexplained AMU

Do not build separate maps for each metric. This is one reusable geographic analytics component.

MOST IMPORTANT:

Preserve the exact existing PashuPramaan visual system from the supplied screenshots.

The goal is NOT "design a beautiful new analytics dashboard."

The goal is:

"Extend this exact PashuPramaan interface with a researcher section."

Do not add gradients, glassmorphism, futuristic AI elements, oversized dashboard cards, dark analytics UI, decorative illustrations, or unrelated components.

Do not modify the existing Home or Prescriptions pages.

Only add the Researcher navigation and the first two researcher tabs described above.
