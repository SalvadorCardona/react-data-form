# CLAUDE.md

## Le projet

`react-data-form` est une librairie React de formulaires pilotés par la
donnée : on décrit un formulaire comme un objet, la librairie rend les champs,
gère l'état, valide et affiche les erreurs renvoyées par l'API. Elle est
pensée pour des backends JSON-LD / API Platform, mais reste utilisable avec
n'importe quelle API.

## Stack

- React 19 (peer dependency, 18.3+ accepté) + TypeScript 6, strict.
- Build : [tsdown](https://tsdown.dev) → ESM + types dans `dist/`.
- Tests : Vitest + Testing Library, environnement jsdom.
- Lint : ESLint (config flat) + Prettier (pas de `;`, `printWidth` 85).
- Styles : Tailwind CSS v4, thème shadcn (`components.json`).
- Gestionnaire de paquets : pnpm 10.33.2 (`packageManager` dans
  `package.json` — ne pas utiliser npm/yarn).
- Node 22 en CI.
- Versionning : [changesets](https://github.com/changesets/changesets).

## Commandes

```bash
pnpm install         # installation
pnpm run dev          # tsdown --watch
pnpm run build        # build de dist/ (ESM + types)
pnpm run test          # vitest run
pnpm run lint           # eslint .
pnpm run typecheck       # tsc --noEmit
pnpm run ci               # typecheck, lint, test, build — dans cet ordre exact (CI)

pnpm run docs:dev          # site de démo (docs/), Vite
pnpm run docs:build        # build du site de démo
```

Le site de doc (`docs/`) consomme la librairie directement depuis `src/`
(alias Vite), sans étape de build intermédiaire : ce qu'on voit sur le site
est ce que fait le code courant.

## Arborescence utile

```
src/
  form/        # useForm, FormElement, providers, hooks — le cœur
  ui/          # composants shadcn (style base-luma)
  group/       # sections repliables — entrée `react-data-form/group`
  media/       # upload, galerie, éditeur d'image — entrée `react-data-form/media`
  step/        # formulaires multi-étapes — entrée `react-data-form/step`
  internal/    # utilitaires internes non exportés
docs/          # site de démo, testé avec la librairie (docs/**/*.test.tsx)
components.json # config shadcn (alias @/ui, style base-luma, iconLibrary lucide)
.changeset/    # changelogs en attente, un fichier par changement publiable
```

Les quatre points d'entrée publiés (`.`, `./group`, `./media`, `./step`)
correspondent chacun à une entrée dans `tsdown.config.ts` — un nouveau
sous-module doit être déclaré aux deux endroits (`src/<nom>/index.ts` et
`tsdown.config.ts`).

## Conventions

- Commits : format conventionnel (`feat:`, `fix:`, `docs:`, `chore:`, `test:`,
  `ci:`), avec scope entre parenthèses quand pertinent (`feat(media): …`).
- Prettier gère le formatage (pas de point-virgule, virgule finale ES5) —
  `pnpm run format` avant de commit si besoin, ne pas reformater à la main.
- `@typescript-eslint/no-explicit-any` est désactivé volontairement : la
  forme des données de formulaire n'est connue qu'à l'exécution. Ne pas le
  réactiver localement.
- Toute modification touchant l'API publique (nouveaux exports, changement de
  signature, nouveau contrôleur…) doit s'accompagner d'un changeset
  (`pnpm changeset`), un fichier par changement dans `.changeset/`.
- `react-mini-i18n` et `resource-registry` sont des peer dependencies parce
  qu'elles portent chacune un singleton module (dictionnaire de traduction,
  registre de ressources) : ne jamais les repasser en dependencies, ça
  dupliquerait le singleton.

## Pièges connus

- **`dist/` n'existe pas hors build.** Les tests et le site de doc résolvent
  `react-data-form` (et ses sous-chemins) vers `src/` via des alias dans
  `vitest.config.ts` et `docs/vite.config.ts`. Ne pas s'attendre à ce que
  `dist/` existe en dehors de `pnpm run build`.
- **Dédoublonnage React obligatoire.** `react-mini-i18n` est lié en local et
  embarque sa propre copie de React ; `dedupe: ["react", "react-dom"]` dans
  les configs Vite/Vitest est nécessaire, sinon les hooks tournent sur deux
  instances de React et cassent silencieusement.
- **`tsdown.config.ts` externalise explicitement** `react`, `react-dom`,
  `react-mini-i18n`, `jsonld-item`, `resource-registry`. Ajouter une nouvelle
  dépendance à peer/singleton sans l'ajouter à `external` la ferait bundler
  dans `dist/`, dupliquant son état.
- **Le CSS n'est pas géré par tsdown.** Le script `build` fait
  `tsdown && cp src/styles.css dist/styles.css` : oublier ce `cp` casse
  l'export `./styles.css`.
- **`docs:build` a besoin de `DOCS_BASE`** pour être servi depuis
  `/react-data-form/` sur GitHub Pages (voir `.github/workflows/pages.yml`).
  En local, `docs:dev`/`docs:build` sans cette variable servent depuis `/`.
- **Les tests du site de doc font partie de la suite.** `vitest.config.ts`
  inclut `docs/**/*.test.{ts,tsx}` en plus de `src/` : un changement dans
  `src/` qui casse une page de démo fait échouer `pnpm run test`.
- **`components.json`** est la config du CLI shadcn (style `base-luma`,
  alias `@/ui`) : les composants sous `src/ui/` sont censés rester ajoutables
  via ce CLI, ne pas diverger de sa structure d'alias sans raison.
