---
"react-data-form": minor
---

`react` et `react-dom` passent en peer `^19.0.0` (au lieu de `^18.3.0 || ^19.0.0`). La librairie n'a jamais fonctionné sous React 18 : le cœur lit ses contextes avec `use()` et les rend comme leur propre provider, et les composants de `src/ui/` reçoivent `ref` en simple prop — trois API de React 19. Une application React 18.3 l'installait sans avertissement puis plantait au premier rendu (`use is not a function`) ; elle est désormais signalée dès l'installation. Pour utiliser la librairie, passez à React 19.
