---
"react-data-form": patch
---

`PriceInputController` respecte les ports `currency` et `intlLocale` en édition : le symbole, sa position (avant ou après le montant), le séparateur décimal et le placeholder sont dérivés de `Intl.NumberFormat(intlLocale, { style: "currency", currency })`, au lieu de « € », de la virgule et de « 0,00 » codés en dur. La saisie accepte toujours `.` ou `,` ; une devise sans décimales (JPY) n'accepte que des entiers. En lecture seule, une valeur vide s'affiche « - » au lieu de « 0,00 € ».
