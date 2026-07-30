# Delta for Tracker Store

## ADDED Requirements

### Requirement: Persist Middleware

The trackerStore MUST use `zustand/persist` middleware with `createPersistConfig`. Sensitive clinical fields (`weight`, `height`, `age`, `diagnosisAge`, `glucose`, `imc`) SHALL be encrypted via Web Crypto before localStorage write. Non-sensitive fields (`gender`, `paf`, `glucoseContext`, `restrictionActive`) SHALL remain plaintext. Actions (`set*`, `calculateTarget`) MUST be excluded via `partialize`.

#### Scenario: Sensitive fields encrypted in localStorage

- GIVEN `setWeight('80')` and `setGender('male')` have been called
- WHEN DevTools inspects localStorage key `nutrifit-tracker`
- THEN `weight` SHALL NOT appear as plaintext `"80"`
- AND `gender` SHALL appear as plaintext `"male"`

#### Scenario: State survives refresh

- GIVEN `setWeight('82')`, `setHeight('175')`, `setGender('female')` have been called
- WHEN the page is refreshed
- THEN `weight` SHALL be `'82'`, `height` SHALL be `'175'`, `gender` SHALL be `'female'`

#### Scenario: Actions excluded from persist

- GIVEN the store is persisted to localStorage
- WHEN the serialized state is inspected
- THEN `setWeight`, `calculateTarget`, and other functions SHALL NOT be present

#### Scenario: Fresh start with no prior data

- GIVEN localStorage is empty
- WHEN the store initializes
- THEN defaults SHALL match current defaults (`weight='80'`, `height='170'`, `age='55'`, `gender='male'`, `paf='1.2'`)
