---
"react-data-form": minor
---

Nouvelle entrée `react-data-form/hydra` : `createFormFromHydraClass(doc, classIri, options)` produit un `FormInterface` depuis la documentation Hydra d'API Platform (`/api/docs.jsonld`, termes préfixés `hydra:` ou non). `xsd:`/`xmls:` `string` → `DefaultInputController`, `integer`/`decimal`/`float`/`double` → `NumberInputController`, `dateTime`/`date` → `DatePickerInputController`, `boolean` → `SwitchInputController` ; une relation vers une autre classe → `SelectSearchInputController` (`MultiSelectSearchInputController` pour une collection), dont la recherche passe par `options.onSearch(query, relation)`. `hydra:title` donne le libellé, `hydra:required` → `required`, une propriété non `hydra:writeable` est en `readonly`, et ni lisible ni modifiable elle est exclue. `options.inputs` surcharge un champ, ou l'exclut avec `false`.
