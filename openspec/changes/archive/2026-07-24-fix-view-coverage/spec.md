# Delta for fix-view-coverage: Test Coverage Gap Closure

## Context

Add missing tests to reach 100% statement coverage on three files. Zero production code changes. Existing behavior is implicitly correct — this spec formalizes test-level requirements for behaviors that already work but lack test coverage.

## ADDED Requirements

### Requirement: REQ-ERRORBOUNDARY-FALLBACK — Function fallback receives handleRetry

The ErrorBoundary component MUST support a function-as-fallback prop and wire `handleRetry` to it when an error occurs.

#### Scenario: Error with function fallback

- GIVEN an ErrorBoundary with `fallback={(handleRetry) => <button data-testid="fn-retry" onClick={handleRetry}>Retry</button>}`
- WHEN a child component throws during render
- THEN the function fallback receives `handleRetry` as an argument
- AND clicking the rendered button invokes `handleRetry`
- AND the error state resets (fallback dismissed)

### Requirement: REQ-SCANNER-ORANGE — TrafficLabel returns ORANGE i18n key

The ScannerView `trafficLabel` function MUST return the `scanner.trafficOrange` i18n key when the classification color is ORANGE.

#### Scenario: Orange classification

- GIVEN a ScannerView rendered with `result={{ color: 'orange', reasons: ['moderate sodium'] }}` and ES locale
- WHEN the result section renders
- THEN the label displays the translated value for `scanner.trafficOrange`

### Requirement: REQ-SCANNER-DETAILS — Food details render name, category, macros when selected

The ScannerView MUST display the selected food's name, translated category, macros (kcal/protein/carbs/fat per 100g), and harmful ingredients when a food is selected.

#### Scenario: Food selected with details

- GIVEN a ScannerView rendered with a selected Food object
- WHEN the food details section renders
- THEN it displays the food name
- AND it displays the translated category label (`category.{selected.category}`)
- AND it displays macros in `kcal: {N}, protein: {N}g, carbs: {N}g, fat: {N}g` format

### Requirement: REQ-CONTAINER-CLASSIFY — handleClassify triggers classification, safety check, and nudge

The NutritionalTrafficLightContainer `handleClassify` MUST call `classifyFoodWithReasons`, `checkSafetyAlerts`, and `evaluateAndEnqueue(selected)` when a food is selected.

#### Scenario: Classify with food selected

- GIVEN a NutritionalTrafficLightContainer with a food selected via `setSelectedId('food-1')`
- WHEN the classify button is clicked (invoking `handleClassify`)
- THEN `classifyFoodWithReasons` is called with the selected food
- AND `checkSafetyAlerts` is called with the selected food
- AND `evaluateAndEnqueue` is called with the selected food

### Requirement: REQ-CONTAINER-LOG — handleAddToLog adds food to daily log and enqueues nudge

The NutritionalTrafficLightContainer `handleAddToLog` MUST call `addFoodToLog(selected)` and `evaluateAndEnqueue()` when a food is selected.

#### Scenario: Add to log with food selected

- GIVEN a NutritionalTrafficLightContainer with a food selected via `setSelectedId('food-1')`
- WHEN the "Add to Log" button is clicked (invoking `handleAddToLog`)
- THEN `addFoodToLog` is called with the selected food
- AND `evaluateAndEnqueue` is called (no-arg form)

### Requirement: REQ-NONREGRESSION — All existing tests continue passing

The existing 551-test suite MUST pass without modification after adding the new tests.

#### Scenario: Full test suite passes

- GIVEN the new tests are added for ErrorBoundary, ScannerView, and NutritionalTrafficLightContainer
- WHEN `pnpm test:run` is executed
- THEN all existing tests pass with zero failures
- AND the new tests also pass
