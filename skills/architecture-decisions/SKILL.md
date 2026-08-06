# Architecture Decisions — Mandatory Pillars

Every architectural decision MUST pass these 4 pillars.

## 1. Security by Design + Security by Default

- Security is NOT a patch. It is in the product's DNA.
- Apply OWASP Top 10 and NIST as baseline.
- Default configurations MUST be secure even if the user changes nothing.
- Least privilege: each component receives the minimum necessary access.
- Defense in depth: never rely on a single security layer.

## 2. SRP + Modularity (OCP)

- **One reason to change**: each module, class and function has exactly ONE responsibility.
- **Open for extension**: design to add behavior without modifying existing code.
- **Closed for modification**: stable abstractions that do not require rewrites.
- **Never mix**: domain logic does NOT live with data access, presentation or infrastructure.

## 3. Domain Isolation

- The core does NOT depend on frameworks, databases or HTTP layers.
- Domain tests without infrastructure mocks.
- Painless evolution: change database or UI framework without touching business rules.
- **Ubiquitous Language**: if the expert says "classify", the code says `classify()`, NOT `insertRow()`.

## 4. Organizational Scalability

- Bounded Contexts that map to autonomous teams.
- Contractual APIs between contexts.
- Independent deploy per context.
- No shared databases between contexts.

## Checklist

Before finalizing a decision:

- [ ] Does each module have ONE reason to change? (SRP)
- [ ] Are business rules free of framework dependencies? (Domain Isolation)
- [ ] Can it be extended without modifying existing code? (OCP)
- [ ] Are default configurations secure without user action? (Security by Default)
- [ ] Does the code speak the domain expert's language? (Ubiquitous Language)
