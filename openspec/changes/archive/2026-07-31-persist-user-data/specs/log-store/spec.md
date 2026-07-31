# Delta for Log Store

## ADDED Requirements

### Requirement: Persist Middleware

The logStore MUST use `zustand/persist` middleware. Food log entries are non-sensitive — all data SHALL be stored as plaintext JSON for performance. Actions (`addFoodToLog`, `removeFoodFromLog`, `validateToday`) MUST be excluded via `partialize`.

#### Scenario: Food log survives refresh

- GIVEN `addFoodToLog(food)` has been called, adding "tortilla" to `todayLog`
- WHEN the page is refreshed
- THEN `todayLog` SHALL contain the tortilla entry
- AND `todayValidation` SHALL be recomputed from persisted data

#### Scenario: Empty log on first visit

- GIVEN no prior localStorage data
- WHEN the store initializes
- THEN `todayLog` SHALL be `[]` and `todayValidation` SHALL be `null`

#### Scenario: Remove persists correctly

- GIVEN `todayLog` has 2 items persisted from prior session
- WHEN `removeFoodFromLog(0)` is called and page is refreshed
- THEN `todayLog` SHALL have 1 item

#### Scenario: Actions excluded from persist

- GIVEN the store is persisted
- WHEN serialized state is inspected
- THEN functions (`addFoodToLog`, `removeFoodFromLog`, `validateToday`) SHALL NOT be present

#### Scenario: Multiple food entries all persist

- GIVEN 5 food items added to `todayLog`
- WHEN page refreshes
- THEN all 5 items SHALL be present, in order
