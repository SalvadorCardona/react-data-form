import type { TranslationKey } from "@/i18n/translationKeys"

/**
 * French dictionary for every key in {@link translationKeys}, ready for
 * `setTranslation`. Spread it under your own keys to override a wording.
 *
 * @example
 * setTranslation({ ...fr, "My profile": "Mon profil" })
 */
export const fr: Record<TranslationKey, string> = {
  Create: "Créer",
  Save: "Enregistrer",
  Saved: "Enregistré",
  "The form is invalid": "Le formulaire est invalide",
  "Unable to load the data": "Impossible de charger les données",
  "This field is required": "Ce champ est obligatoire",
  "This value should be greater than or equal to {{min}}":
    "Cette valeur doit être supérieure ou égale à {{min}}",
  "This value should be less than or equal to {{max}}":
    "Cette valeur doit être inférieure ou égale à {{max}}",
  "Invalid value": "Valeur invalide",
  "Add a block": "Ajouter un bloc",
  "Pick the shape this entry takes.": "Choisissez la forme de ce bloc.",
  Drag: "Déplacer",
  Order: "Ordre",
  "Collapse the block": "Replier le bloc",
  "Expand the block": "Déplier le bloc",
  Remove: "Supprimer",
  "This collection should contain {{min}} elements or more.":
    "Cette liste doit contenir au moins {{min}} éléments.",
  "This collection should contain {{max}} elements or less.":
    "Cette liste doit contenir au plus {{max}} éléments.",
  Add: "Ajouter",
  "Remove {{value}}": "Retirer {{value}}",
  "Minimum {{min}} characters": "{{min}} caractères minimum",
  "Show password": "Afficher le mot de passe",
  "Hide password": "Masquer le mot de passe",
  "Search...": "Rechercher…",
  "Clear search": "Effacer la recherche",
  "Select...": "Sélectionner…",
  "Nothing found.": "Aucun résultat.",
  "{{count}} selected": "{{count}} sélectionné(s)",
  "Unable to load the options.": "Impossible de charger les options.",
  "Pick a date": "Choisir une date",
  "Start date": "Date de début",
  "End date": "Date de fin",
  "Selected range": "Période sélectionnée",
  // French sets the colon off with a non-breaking space.
  "{{label}}:": "{{label}}\u00a0:",
  "The end date must be after the start date":
    "La date de fin doit être postérieure à la date de début",
  "Image unavailable": "Image indisponible",
  Previous: "Précédent",
  Next: "Suivant",
  Finish: "Terminer",
  "Step {{current}} of {{total}}": "Étape {{current}} sur {{total}}",
  "Invalid Form": "Formulaire invalide",
}
