# Hallazgos de Seguridad — Nutre-Fit-Dia

- **Fecha de revisión:** 2026-10-21
- **Alcance:** aplicación cliente (React + Vite + PWA), persistencia en `localStorage`,
  cabeceras de la build publicada en GitHub Pages, dependencias y cadena de CI.
- **Método:** revisión de código sobre `develop` (`775853e`) y comprobación directa de la
  respuesta HTTP del despliegue de producción.
- **Modelo de amenaza:** la app no tiene backend. Todos los datos clínicos viven en el
  navegador del usuario. Las amenazas relevantes son XSS en el propio origen, acceso
  físico al dispositivo y manipulación de la cadena de suministro; no hay superficie
  servidor que comprometer.

## Resumen

| ID     | Hallazgo                                                     | Severidad | Estado  |
| ------ | ------------------------------------------------------------ | --------- | ------- |
| SEC-01 | `public/_headers` no se aplica en GitHub Pages               | Alta      | Abierto |
| SEC-02 | Cifrado parcial: dietas, planes y nudges se guardan en claro | Alta      | Abierto |
| SEC-03 | Exportación JSON sin cifrar y sin advertencia al usuario     | Media     | Abierto |
| SEC-04 | 39 advisories en dependencias de desarrollo y sin Dependabot | Media     | Abierto |
| SEC-05 | CI con `pnpm` en `version: latest` y actions sin pin por SHA | Baja      | Abierto |

---

## SEC-01 — Las cabeceras de seguridad no llegan a producción

**Severidad:** Alta · **Componente:** despliegue / `public/_headers`

**Evidencia.** El repositorio declara la política en `public/_headers`:

```
Content-Security-Policy: default-src 'self'; script-src 'self'; ...
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

El archivo se copia a `dist/_headers` en cada build, pero GitHub Pages **no soporta** ese
formato. La respuesta real de producción no incluye ninguna de esas cabeceras:

```console
$ curl -sSI https://darkmagic76.github.io/nutre-fit-dia/
HTTP/2 200
server: GitHub.com
content-type: text/html; charset=utf-8
# sin content-security-policy, x-content-type-options,
# permissions-policy ni x-frame-options
```

**Qué queda protegido y qué no.** `index.html` incluye meta etiquetas equivalentes, y su
cobertura real es desigual:

| Control                   | Meta en `index.html` | Efectivo en navegador                                             |
| ------------------------- | -------------------- | ----------------------------------------------------------------- |
| `Content-Security-Policy` | Sí                   | **Sí** (salvo `frame-ancestors`, que meta ignora)                 |
| `Referrer-Policy`         | Sí                   | **Sí**                                                            |
| `Permissions-Policy`      | Sí                   | **No** — solo se admite como cabecera                             |
| `X-Content-Type-Options`  | Sí                   | **No** — solo se admite como cabecera                             |
| Anti-clickjacking         | No                   | **Sin protección** (`frame-ancestors`/`X-Frame-Options` ausentes) |

**Impacto.** La app puede embeberse en un iframe de terceros (clickjacking sobre acciones
que persisten datos clínicos) y el navegador no aplica `nosniff` ni restringe APIs de
dispositivo. La CSP sí está activa y es la mitigación principal frente a XSS.

**Remediación.**

1. Servir el sitio desde una plataforma que respete `_headers` (Cloudflare Pages, Netlify)
   o añadir un proxy que inyecte las cabeceras.
2. Si se mantiene GitHub Pages, no confiar en `_headers`: dejar solo las meta que
   funcionan y documentar la ausencia de anti-clickjacking.
3. Como mitigación mínima, mover `frame-ancestors 'none'` a una cabecera real en cuanto
   exista una capa que la emita.

---

## SEC-02 — Cifrado parcial de datos de salud

**Severidad:** Alta · **Componente:** `src/infrastructure/storage.ts` y stores Zustand

**Evidencia.** `createPersistConfig(name, opts?)` cifra únicamente los campos declarados
en `sensitiveFields`. Solo tres stores los declaran:

| Store       | Campos cifrados (AES-256-GCM)                        | Campos en claro                      |
| ----------- | ---------------------------------------------------- | ------------------------------------ |
| `tracker`   | `weight`, `height`, `age`, `diagnosisAge`, `glucose` | resto del estado                     |
| `biomarker` | `glucoseHistory`, `weightHistory`                    | —                                    |
| `activity`  | `weeklyMinutes`, `strengthSessions`                  | `entries` (fechas y minutos por día) |
| `log`       | ninguno                                              | `todayLog`, `todayValidation`        |
| `plan`      | ninguno                                              | plan semanal completo                |
| `nudge`     | ninguno                                              | `pending`, `history`, `cooldowns`    |

**Impacto.** La ingesta diaria, las violaciones de raciones y el plan terapéutico quedan
legibles en `localStorage`. Cualquier XSS, extensión del navegador o inspección manual del
dispositivo obtiene el historial dietético completo sin necesitar la clave. La clave AES es
un `CryptoKey` no extraíble en IndexedDB, así que el cifrado sí protege los campos que lo
usan, pero el modelo es inconsistente: el dato más sensible (qué come el paciente) es el
que está en claro.

**Remediación.**

1. Declarar `sensitiveFields` en `log`, `plan` y `nudge`, y cifrar `activity.entries`.
2. Añadir un test que falle si un store persiste con `sensitiveFields` vacío, para evitar
   que el próximo store repita el patrón.
3. Evaluar cifrar el estado completo en lugar de campos sueltos: es más simple de auditar
   y no deja huecos al añadir propiedades nuevas.

---

## SEC-03 — Exportación de datos sin cifrar y sin advertencia

**Severidad:** Media · **Componente:** `src/shared/hooks/useExportData.ts`

**Evidencia.** `exportData()` serializa el estado y `useExportData` lo descarga como JSON
en claro. La vista solo muestra el aviso legal genérico, sin advertir del contenido:

```ts
const json = exportData();
const blob = new Blob([json], { type: 'application/json' });
anchor.download = `nutrifit-export-${formatDate(new Date())}.json`;
```

**Impacto.** El archivo descargado contiene datos clínicos sin protección y el usuario no
recibe ninguna indicación de que debe tratarlo como información sensible.

**Remediación.** Añadir un texto de confirmación antes de exportar que indique que el
archivo no está cifrado, o exportar en un contenedor cifrado con contraseña del usuario.

---

## SEC-04 — Advisories en dependencias de desarrollo y ausencia de Dependabot

**Severidad:** Media · **Componente:** `package.json`, `.github/`

**Evidencia.**

```console
$ pnpm audit --prod
0 vulnerabilidades (5 dependencias de producción)

$ pnpm audit
{ low: 3, moderate: 17, high: 19, critical: 0 }   # 39, todas de desarrollo
```

No existe `.github/dependabot.yml` ni ningún otro automatismo de actualización.

**Impacto.** El bundle publicado no arrastra vulnerabilidades conocidas, pero la cadena de
build sí. Sin actualización automatizada, los advisories se acumulan en silencio y el
momento en que uno de ellos afecte a producción llegará sin aviso.

**Remediación.** Añadir Dependabot (o Renovate) con grupos para `devDependencies`, y una
tarea de actualización periódica con `pnpm audit` como gate informativo.

---

## SEC-05 — Cadena de CI no determinista

**Severidad:** Baja · **Componente:** `.github/workflows/ci.yml`, `deploy.yml`

**Evidencia.** `pnpm/action-setup@v4` se configura con `version: latest` en los tres jobs,
y las actions se referencian por tag (`actions/checkout@v4`) en lugar de por SHA.

**Impacto.** Una misma revisión puede construir con versiones distintas de `pnpm`, y un tag
mutable comprometido ejecutaría código en el runner. El riesgo es bajo para un TFM, pero
rompe la reproducibilidad que el resto del pipeline sí persigue.

**Remediación.** Fijar la versión de `pnpm` (la misma que `.nvmrc` documenta para Node) y,
opcionalmente, anclar las actions por SHA con Dependabot encargándose de subirlas.

---

## Verificado y descartado

- **`parseFloat` en la entrada de glucosa.** `parseNumeric` en
  `src/domain/inputParsing.ts` valida con `NUMERIC_RE` y lanza `ValidationError` si el
  valor no coincide; `parseFloat` solo se ejecuta después de esa comprobación. No hay
  aceptación de entradas parciales como `"100abc"`.
- **Dependencias de producción.** `pnpm audit --prod` devuelve cero vulnerabilidades.

## Fuera de alcance

- Endurecimiento del `CSP` más allá de las directivas actuales.
- Rotación de la clave de cifrado y migración de datos ya persistidos.
- Revisión de la política de privacidad y del consentimiento informado.
