---
"react-data-form": patch
---

`FormArrayInputController` : une valeur vide n'affiche plus de bloc implicite (le `{}` fantôme ne se retrouve plus dans la valeur envoyée après « Ajouter »). `max` limite désormais l'ajout de blocs (message traduisible « This collection should contain {{max}} elements or less. ») et `min` devient une règle de validation vérifiée à la soumission (« This collection should contain {{min}} elements or more. ») au lieu de bloquer l'ajout. La liste suit `formInput.value` quand elle change de l'extérieur (`updateData`, chargement asynchrone).
