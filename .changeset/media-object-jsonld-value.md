---
"react-data-form": patch
---

`MediaObjectInputController` : une valeur objet JSON-LD (`{ "@id": "/api/media_objects/1", contentUrl: … }`, le média embarqué que renvoie souvent API Platform) affiche de nouveau son aperçu. L'objet est ramené à son IRI (`getLdIri`) avant `port.toUrl`, qui recevait jusque-là l'objet brut et rendait un placeholder. Le type de `value` dans `MediaObjectInputControllerInputInterface` est désormais `string | BaseJsonLdItemInterface | null` au lieu de `any`.
