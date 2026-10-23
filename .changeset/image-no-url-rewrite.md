---
"react-data-form": patch
---

`Image` (aperçu de `MediaObjectInputController`, `IaImageInputController`) affiche désormais la source telle quelle — chaîne, ou `@id` d'un objet JSON-LD. Les IRI d'API ne sont plus réécrites vers `/api/public/media_object/image-id/{id}`, une route propre à une application : l'URL renvoyée par `port.toUrl` est respectée. Qui dépendait de cette réécriture doit la faire dans son `toUrl`. Sans source, plus aucune requête vers `placehold.co` : le repli local (icône, `role="img"`, libellé traduisible `Image unavailable` à défaut d'`alt`) s'affiche. Un `onError` passé par l'appelant est appelé sans plus désactiver ce repli.
