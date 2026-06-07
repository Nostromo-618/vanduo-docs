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

### Requirement: Live demo parity

The theme-switcher documentation page live demo SHALL mirror the navbar implementation.

#### Scenario: Demo uses menu markup

- GIVEN the user navigates to `#docs/components/theme-switcher`
- WHEN the live demo section renders
- THEN it contains `.vd-theme-switcher[data-theme-ui="menu"]` in a navbar-style action strip
- AND does not use separate large labeled demo buttons as the primary demo

#### Scenario: Demo shows current theme

- GIVEN the live demo is visible
- WHEN the user changes theme via the demo menu
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
