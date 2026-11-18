---
name: "HireSwift Design System"
description: "A fast, high-clarity recruitment design system engineered for agile startup hiring teams."
---

## Overview

HireSwift balances the crisp productivity of modern SaaS (such as Ashby and Linear) with warm, human accessibility. Small hiring teams process high volumes under intense time pressure; the interface prioritizes scannable typography, high-contrast match indicators, zero visual clutter, and seamless keyboard navigation.

The design philosophy is clean, purposeful minimalism: calm slate neutrals, an electric deep indigo primary for confidence and authority, emerald success for high match scores, and warm amber for action flags.

## Colors

The palette employs an authoritative Deep Indigo primary paired with clean slate neutrals and crisp semantic status signals.

- **Primary:** Deep indigo commanding focus across primary CTAs, active filters, and key navigation states.
- **Secondary:** Slate blue for secondary interactions, subtle tags, and muted states.
- **Status Tones:** Emerald for 85%+ AI match scores and offers, Amber for candidate reviews and skill gaps, Coral for rejections and warnings.

```yaml
colors:
  primary: "#1E3A8A"
  on-primary: "#FFFFFF"
  secondary: "#475569"
  on-secondary: "#FFFFFF"
  success: "#047857"
  on-success: "#FFFFFF"
  warning: "#B45309"
  on-warning: "#FFFFFF"
  error: "#B91C1C"
  on-error: "#FFFFFF"
  accent: "#4338CA"
  on-accent: "#FFFFFF"
  light:
    surface: "#F8FAFC"
    on-surface: "#0F172A"
    surface-card: "#FFFFFF"
    on-surface-card: "#1E293B"
    surface-subtle: "#F1F5F9"
    border: "#E2E8F0"
  dark:
    surface: "#0F172A"
    on-surface: "#F8FAFC"
    surface-card: "#1E293B"
    on-surface-card: "#F1F5F9"
    surface-subtle: "#334155"
    border: "#334155"
```

## Typography

HireSwift uses **Red Hat Text** for geometric structural headlines and navigation, **Instrument Sans** for clear, legible body text and dense candidate records, and **Spline Sans Mono** for match percentages, CGPA, graduation years, and technical skill metrics.

```yaml
typography:
  display-lg:
    fontFamily: "Red Hat Text"
    fontSize: 36px
    fontWeight: 700
    lineHeight: 44px
    letterSpacing: -0.5px
  display-lg-mobile:
    fontFamily: "Red Hat Text"
    fontSize: 28px
    fontWeight: 700
    lineHeight: 34px
    letterSpacing: -0.25px
  headline-lg:
    fontFamily: "Red Hat Text"
    fontSize: 24px
    fontWeight: 600
    lineHeight: 30px
    letterSpacing: -0.25px
  headline-md:
    fontFamily: "Red Hat Text"
    fontSize: 20px
    fontWeight: 600
    lineHeight: 26px
  headline-sm:
    fontFamily: "Red Hat Text"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 22px
  body-lg:
    fontFamily: "Instrument Sans"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
  body-md:
    fontFamily: "Instrument Sans"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
  body-sm:
    fontFamily: "Instrument Sans"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
  label-md:
    fontFamily: "Instrument Sans"
    fontSize: 13px
    fontWeight: 500
    lineHeight: 18px
  mono-sm:
    fontFamily: "Spline Sans Mono"
    fontSize: 12px
    fontWeight: 500
    lineHeight: 16px
```

## Layout & Spacing

A responsive layout that adapts between desktop recruiter multi-column workspaces (max-width fluid container with fixed sidebar and flexible pipeline lanes) and compact single-column mobile views. An 8px base grid rhythm governs component padding and section gutters.

```yaml
spacing:
  gutter-xs: 4px
  gutter-sm: 8px
  gutter-md: 16px
  gutter-lg: 24px
  gutter-xl: 32px
  section: 48px
  page-margin: 24px
```

## Elevation & Depth

HireSwift uses flat, low-contrast border boundaries (`1px solid #E2E8F0`) with subtle ambient drop shadows (`0 1px 3px rgba(15, 23, 42, 0.06)`) on interactive candidate cards. High-priority modals and candidate comparison sheets use focused overlay scrims with medium elevation (`0 10px 25px -5px rgba(15, 23, 42, 0.1)`).

## Shapes

Shapes reflect precision and modern SaaS elegance: tight, consistent corner radii with rounded badges for skill tags and pipeline stage markers.

```yaml
rounded:
  sm: 4px
  DEFAULT: 8px
  md: 10px
  lg: 14px
  xl: 20px
  full: 9999px
```

## Motion & Micro-interaction

Micro-interactions are snappy and informative. Candidate cards lift slightly on hover and drag, stage drops trigger quick border pulses, and match score badges render smoothly.

```yaml
motion:
  state-change:
    duration: 120ms
    delay: 0ms
    timingFunction: ease-out
  surface-enter:
    duration: 200ms
    delay: 0ms
    timingFunction: cubic-bezier(0.16, 1, 0.3, 1)
  surface-exit:
    duration: 140ms
    delay: 0ms
    timingFunction: cubic-bezier(0.7, 0, 0.84, 0)
```

## Voice & Content Strategy

The HireSwift voice is concise, objective, and action-driven. Recruiter copy prioritizes immediate candidate comprehension without verbose HR jargon.

- **Tone:** Efficient, supportive, insightful.
- **Capitalization:** Sentence case for interface headers and controls ("Shortlist candidate", "Bulk import resumes").
- **Metrics:** Strict formatting for criteria (`8.8 CGPA`, `4.5 yrs exp`, `94% match`).
- **Action Buttons:** Clear verb phrases ("Compare 3 candidates", "Move to Interview", "Send bulk invite").

## Components

Component implementations live as individual HTML sticker sheet files in
`components/`. Each file contains the canonical, styled HTML components with
`<!-- COMPONENT: name -->` comment markers. Read each file before use.

- **Badge** → `@components/badge.html`: `badge-numeric`, `badge-dot`
- **Button** → `@components/button.html`: `button-primary`, `button-icon`, `button-with-icon`
- **Card** → `@components/card.html`: `card-elevated`, `card-action`, `card-interactive`, `card-interactive-2`
- **Input Field** → `@components/input-field.html`: `input-field-text`, `input-field-icon`
- **Table** → `@components/table.html`: `table-standard`, `table-interactive`, `table-selectable`
