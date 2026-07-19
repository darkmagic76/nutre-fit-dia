# Tasks: M4 — Zero-Waste Module

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~55 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

## Phase 1: RED — Failing Tests First

- [x] 1.1 **food.test.ts** — Write schema test: `food()` without flags defaults `isUglyProduce` and `isZeroWaste` to `false`
- [x] 1.2 **food.test.ts** — Write schema test: `food()` with `isUglyProduce: true` and `isZeroWaste: true` preserves explicit values
- [x] 1.3 **PlanView.test.tsx** — Write badge test: food with `isZeroWaste: true` renders ♻️ badge
- [x] 1.4 **PlanView.test.tsx** — Write badge test: food with `isUglyProduce: true` renders 🥕 badge
- [x] 1.5 **PlanView.test.tsx** — Write badge test: food with both flags `false` renders zero badges

## Phase 2: GREEN — Implementation

- [x] 2.1 **food.ts** — Add `isUglyProduce: z.boolean().default(false)` and `isZeroWaste: z.boolean().default(false)` to `FoodSchema`
- [x] 2.2 **foods-data.ts** — Tag ~6 items: ugly-produce (veg-tomate, fruit-manzana) + zero-waste (veg-espinaca, veg-brocoli, veg-tomate, fruit-manzana, fruit-pera, legume-lentejas, legume-garbanzos)
- [x] 2.3 **PlanView.tsx** — Add inline `ZeroWasteBadges` component rendering ♻️ for `isZeroWaste` and 🥕 for `isUglyProduce`, wired beside `CulturalBadges`

## Phase 3: Quality Gate

- [x] 3.1 Run `pnpm quality` — lint, typecheck, test:run all green (345/345)
- [x] 3.2 Verify backward compat: existing foods (no flags) render without error
