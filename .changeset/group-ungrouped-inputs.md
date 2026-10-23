---
"react-data-form": patch
---

`createGroupForm` / `FormInputsGroup` : un champ sans `groups`, ou dont les groupes ne figurent pas dans `itemGroups`, n'est plus rendu nulle part. Il apparaît désormais dans une section sans titre, après les groupes par défaut ; la nouvelle option `groupOption.ungroupedPosition` (`"start"` | `"end"`) permet de la placer avant.
