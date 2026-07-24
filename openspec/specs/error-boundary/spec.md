# Error Boundary Specification

## Purpose

Define error-resilience behavior for the NutreFitDia SPA. This spec covers render-phase error catching, per-tab fault isolation, fallback UI, and recovery mechanisms.

## Requirements

### Requirement: ErrorBoundary catches render errors and displays fallback UI

The system MUST catch render-phase errors thrown by child components and display a fallback UI instead of crashing.

#### Scenario: Child throws during render

- GIVEN a component wrapped in ErrorBoundary
- WHEN the child component throws an Error during render
- THEN the ErrorBoundary catches the error
- AND displays the fallback UI
- AND the rest of the application remains functional

#### Scenario: Normal render — no error

- GIVEN a component wrapped in ErrorBoundary
- WHEN all children render without errors
- THEN the children render normally
- AND no fallback UI is displayed

#### Scenario: Multiple errors in sequence

- GIVEN a component wrapped in ErrorBoundary
- WHEN child throws, user retries, and child throws again
- THEN the fallback UI is displayed again
- AND the error state is properly reset between retries

#### Scenario: Error in deeply nested child

- GIVEN a component wrapped in ErrorBoundary with 3+ levels of nesting
- WHEN a deeply nested descendant throws during render
- THEN the ErrorBoundary catches the error
- AND the fallback UI replaces the entire child subtree

### Requirement: ErrorBoundary does NOT catch async or event-handler errors

The system MUST NOT catch errors occurring in event handlers, async callbacks, or promise rejections outside the render phase.

#### Scenario: Event handler throws

- GIVEN a component wrapped in ErrorBoundary
- WHEN a button onClick handler throws synchronously
- THEN the ErrorBoundary does NOT catch the error
- AND the uncaught error propagates normally

#### Scenario: setTimeout callback throws

- GIVEN a component wrapped in ErrorBoundary
- WHEN a `setTimeout` callback throws after render completes
- THEN the ErrorBoundary does NOT catch the error
- AND the error appears as an unhandled exception

#### Scenario: Promise rejection outside render

- GIVEN a component wrapped in ErrorBoundary
- WHEN an async function rejects after `await` and the error is not caught
- THEN the ErrorBoundary does NOT catch the rejection
- AND it appears as an unhandled promise rejection

#### Scenario: useEffect cleanup throws (async context)

- GIVEN a component wrapped in ErrorBoundary
- WHEN the component unmounts and its useEffect cleanup throws
- THEN the ErrorBoundary does NOT catch the error
- AND it surfaces as a standard React warning

### Requirement: Per-tab isolation — error in one tab does NOT affect other tabs

The system MUST ensure that a render error in one tab panel does not affect the rendering or interactivity of any other tab panel.

#### Scenario: Single tab crashes

- GIVEN a 7-tab dashboard with per-tab ErrorBoundary wrapping each tab
- WHEN the "Profile" tab throws during render
- THEN the "Profile" tab shows its fallback UI
- AND the other 6 tabs remain interactive and display their normal content

#### Scenario: Two tabs crash independently

- GIVEN per-tab ErrorBoundary wrapping
- WHEN the "Profile" tab AND the "Plan" tab both throw during render
- THEN each shows its own fallback UI
- AND the other 5 tabs remain fully interactive

#### Scenario: User navigates away from crashed tab

- GIVEN the "Profile" tab has crashed and shows fallback
- WHEN the user clicks the "Today" tab
- THEN the "Today" tab renders normally
- AND returning to "Profile" shows the fallback again (error state preserved per boundary instance)

#### Scenario: Tab recovers via retry

- GIVEN the "Profile" tab has crashed and shows fallback
- WHEN the user clicks "Retry" in that tab's fallback
- THEN the Profile components re-render
- AND if the error condition is resolved, the Profile tab displays normally
- AND other tabs remain unaffected throughout

### Requirement: Fallback UI shows error message + retry button

The system MUST provide a fallback UI containing an error message and a retry mechanism when an error is caught.

#### Scenario: Fallback renders with message

- GIVEN a per-tab ErrorBoundary catches an error
- WHEN the fallback UI is displayed
- THEN it shows a human-readable error title
- AND it shows a description message
- AND a "Retry" button is present

#### Scenario: Retry button resets error state

- GIVEN the fallback UI is displayed after a render error
- WHEN the user clicks the "Retry" button
- THEN the ErrorBoundary resets `hasError` to false
- AND attempts to re-render the children

#### Scenario: Fallback uses configured translation strings

- GIVEN the application locale is set to Spanish
- WHEN the fallback UI renders
- THEN the title, description, and button labels appear in Spanish

#### Scenario: Fallback has accessible role

- GIVEN the fallback UI renders
- THEN the container has `role="alert"`
- AND the error message is announced to screen readers

### Requirement: Global boundary catches errors outside tabs

The system MUST provide a global ErrorBoundary wrapping the entire application that catches errors in the app shell (header, navigation, footer, i18n context).

#### Scenario: App shell error caught by global boundary

- GIVEN the global ErrorBoundary wraps the I18nProvider and App
- WHEN the App shell (header/nav/footer) throws during render
- THEN the global fallback UI is displayed
- AND the fallback covers the full viewport

#### Scenario: Global fallback provides reload action

- GIVEN the global ErrorBoundary has caught an error
- WHEN the fallback UI is displayed
- THEN it includes a "Reload app" button
- AND clicking it calls `window.location.reload()`

#### Scenario: Tab error within global boundary

- GIVEN a per-tab ErrorBoundary catches an error
- WHEN that tab's parent is inside the global boundary
- THEN the global boundary does NOT activate
- AND only the per-tab fallback is shown

#### Scenario: Global boundary does not interfere with normal render

- GIVEN no errors occur anywhere
- WHEN the application renders normally
- THEN the global ErrorBoundary renders `<App />` as normal
- AND no fallback UI is visible

### Requirement: Dev mode error logging

The system MUST log caught error details to the console during development to aid debugging.

#### Scenario: Error logged in development mode

- GIVEN `import.meta.env.DEV` is true
- WHEN the ErrorBoundary catches an error
- THEN the error message is logged via `console.error`
- AND the component stack trace is included

#### Scenario: Error NOT logged in production mode

- GIVEN `import.meta.env.DEV` is false
- WHEN the ErrorBoundary catches an error
- THEN no `console.error` call is made for the caught error

#### Scenario: Console message includes identifiable prefix

- GIVEN dev mode is active
- WHEN the ErrorBoundary logs an error
- THEN the log message is prefixed with `[ErrorBoundary]` for easy filtering

#### Scenario: Component stack appears in console

- GIVEN dev mode and a nested component throws
- WHEN the error is caught and logged
- THEN the log includes `errorInfo.componentStack` showing the render tree

### Requirement: REQ-ERRORBOUNDARY-FALLBACK — Function fallback receives handleRetry

The ErrorBoundary component MUST support a function-as-fallback prop and wire `handleRetry` to it when an error occurs.

#### Scenario: Error with function fallback

- GIVEN an ErrorBoundary with `fallback={(handleRetry) => <button data-testid="fn-retry" onClick={handleRetry}>Retry</button>}`
- WHEN a child component throws during render
- THEN the function fallback receives `handleRetry` as an argument
- AND clicking the rendered button invokes `handleRetry`
- AND the error state resets (fallback dismissed)
