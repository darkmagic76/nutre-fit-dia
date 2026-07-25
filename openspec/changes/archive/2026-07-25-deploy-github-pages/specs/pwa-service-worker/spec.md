# Delta for pwa-service-worker

## MODIFIED Requirements

### Requirement: SW-RUNTIME

The service worker runtime caching configuration SHALL NOT include any Supabase API cache rule. No `NetworkFirst` handler targeting `*.supabase.co` SHALL be present in the Workbox runtimeCaching array.

(Previously: The service worker MUST runtime-cache Supabase API responses using NetworkFirst strategy with a maximum of 50 entries and 24-hour expiration.)

#### Scenario: Build produces sw.js without Supabase runtime caching

- GIVEN the VitePWA `runtimeCaching` array does not contain a Supabase URL pattern
- WHEN `pnpm build` runs
- THEN the generated `dist/sw.js` SHALL NOT register any `NetworkFirst` route for `supabase.co`

#### Scenario: No Supabase API calls are intercepted by the service worker

- GIVEN a service worker is active and the runtime cache configuration has no Supabase rule
- WHEN a Supabase API request is made (or would be made)
- THEN no runtime cache entry for `supabase-api` is consulted or populated
