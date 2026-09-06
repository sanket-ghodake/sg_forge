# @forge/dev-hub Frontend Module

## Overview
This directory contains the user interface views, styling definitions, and interactive client-side controllers for the Developer Hub and Documentation Gateway.

## Architecture
- `hub-view.ts`: Master HTML template builder integrating the top navigation bar, quick search, and modular technical sections.
- `hub-styles.ts`: Astryx CSS design tokens, syntax styling, responsive layouts, and zero-flicker pre-hydration rules.
- `client-scripts.ts`: Client-side tab navigation controller, interactive API sandbox runner, token minting presets, and live code snippet generators.
- `sections/`: Feature-colocated section components for health mesh, SDK reference, route matrix, and testing standards.
