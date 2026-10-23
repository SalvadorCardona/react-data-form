---
"react-data-form": minor
---

`EMOJI_LIST` n'est plus exporté par `react-data-form`. Cet export forçait `dist/index.js` à importer statiquement les 15,5 Ko d'emojis (4,1 Ko gzip), si bien que le chargement à la demande d'`IconInputController` ne servait à rien : toute application les téléchargeait au démarrage. Ils ne sont plus chargés qu'à l'ouverture du sélecteur. `IconInputController` n'en a pas besoin : il charge lui-même la liste. Une application qui importait `EMOJI_LIST` doit embarquer sa propre liste.

Le paquet ne publie plus de sourcemaps (`*.js.map`, `*.d.ts.map`) : elles représentaient plus de la moitié de `dist/` et renvoyaient vers `src/`, qui n'est pas publié.
