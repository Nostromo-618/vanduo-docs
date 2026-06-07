# theme-switcher-consumer Specification

## Purpose

Define how the Vanduo docs site integrates the framework Theme Switcher menu variant in the navbar and documentation live demos.

## Requirements

### Requirement: Navbar menu variant

The docs navbar SHALL use the framework menu variant (`.vd-theme-switcher[data-theme-ui="menu"]`) instead of a cycle button.

#### Scenario: Navbar toggle opens menu

- GIVEN the docs site is loaded
- WHEN the user clicks the navbar theme switcher toggle
- THEN the icon menu opens without changing the current theme

#### Scenario: Navbar menu selection

- GIVEN the theme menu is open
- WHEN the user selects a theme option
- THEN the theme applies immediately and the menu closes

### Requirement: Live demo shows both variants

The theme-switcher documentation page live demo SHALL present the icon menu and cycle button side by side in a two-column layout.

#### Scenario: Demo uses menu and cycle markup

- GIVEN the user navigates to `#docs/components/theme-switcher`
- WHEN the live demo section renders
- THEN it contains `.vd-theme-switcher[data-theme-ui="menu"]` in the Icon Menu column
- AND it contains a cycle toggle with `data-toggle="theme"` and `[data-theme-icon]` in the Cycle Button column
- AND both toggles share the same demo styling (38px, matching border radius and background)

#### Scenario: Demo menu stacks above page content

- GIVEN the live demo icon menu is open
- WHEN the dropdown extends over content below the demo card
- THEN the menu panel is fully opaque and paints above subsequent sections

#### Scenario: Demo shows current theme

- GIVEN the live demo is visible
- WHEN the user changes theme via the demo menu or cycle button
- THEN `#demo-current-theme` reflects the stored preference

### Requirement: Docs theme resolution override

The docs site SHALL resolve system preference to an explicit `data-theme` on `<html>`.

#### Scenario: System mode explicit attribute

- GIVEN preference is `system` and OS prefers dark
- WHEN applyTheme runs in docs
- THEN `document.documentElement` has `data-theme="dark"`

### Requirement: No theme switcher hover tooltips

The docs site SHALL omit optional `data-tooltip` attributes on the theme switcher toggle and menu options.

#### Scenario: No hover labels on docs theme switcher

- GIVEN the docs navbar or theme-switcher live demo is rendered
- WHEN the user hovers the toggle or menu options
- THEN no Tooltips component hover label appears
- AND `aria-label` on the toggle still reflects the current preference for assistive technology

#### Scenario: Consumers may enable tooltips

- GIVEN a consumer adds `data-tooltip` to theme switcher markup
- WHEN ThemeSwitcher initializes with the Tooltips component loaded
- THEN hover labels are shown per framework opt-in behavior

### Requirement: No duplicate icon sync

The docs site SHALL rely on framework ThemeSwitcher `updateUI()` for toggle icon and label state.

#### Scenario: No docs-only icon sync helper

- GIVEN the docs navbar or theme-switcher live demo is rendered
- WHEN the user changes theme via the switcher or customizer
- THEN the toggle icon and `aria-label` update via framework behavior
- AND no docs-only `initDarkModeToggleIconSync` or equivalent helper runs

### Requirement: Theme demo label without observer loop

The docs site SHALL update `#demo-current-theme` on section init and cached navigation without a persistent MutationObserver on `#docs-view`.

#### Scenario: Navigate via global search without tab freeze

- GIVEN the user opens global search and navigates to `#docs/components/theme-switcher`
- WHEN the section mounts
- THEN the page remains responsive
- AND `#demo-current-theme` reflects the current preference
