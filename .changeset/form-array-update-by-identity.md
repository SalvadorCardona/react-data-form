---
"react-data-form": patch
---

`FormArrayInputController` : modifier un bloc ne modifie plus que ce bloc. Les blocs sont affichés triés par `identifierKey` (`order`), mais la modification était écrite à la position affichée dans le tableau non trié : dès que l'ordre stocké différait de l'ordre du tableau (données API non triées, ordre changé avec le champ `#`), un autre bloc était écrasé et le bloc édité dupliqué. Le bloc modifié est désormais retrouvé par son `id`, à défaut son `@id`, à défaut sa position dans le tableau source.

Modifier un bloc après avoir changé son ordre ne lui rend plus l'ancien ordre : celui-ci est porté par l'en-tête du bloc, et le corps du bloc n'écrase plus l'ordre réindexé.
