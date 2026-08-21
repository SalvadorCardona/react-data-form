# @animalink/form

Formulaires React pilotés par la donnée : vous décrivez un formulaire comme un
objet, la librairie s'occupe du rendu des champs, de l'état, de la validation et
des erreurs remontées par l'API.

Conçue pour les API JSON-LD / [API Platform](https://api-platform.com), mais
utilisable avec n'importe quel backend.

```tsx
import { DatePickerInputController, FormElement, useForm } from "@animalink/form"

const formContext = useForm({
  form: {
    label: { title: "Mon profil" },
    inputs: {
      firstName: { label: "Prénom" },
      email: { type: "email", label: "Email" },
      birthDate: { label: "Naissance", controller: DatePickerInputController },
    },
    onSubmit: (data) => api.patch("/me", data),
  },
})

return <FormElement {...formContext} />
```

## Sommaire

- [Installation](#installation)
- [Configuration](#configuration)
- [Points d'entrée](#points-dentrée)
- [Concepts](#concepts)
- [Contrôleurs de champs disponibles](#contrôleurs-de-champs-disponibles)
- [Développement](#développement)

## Installation

```bash
pnpm add @animalink/form
```

`react` et `react-dom` (18.3+ ou 19) sont des dépendances pairs : ce sont les
vôtres qui sont utilisées.

### Styles

Les composants sont écrits en classes [Tailwind CSS v4](https://tailwindcss.com)
s'appuyant sur les variables de thème shadcn. Tailwind doit scanner les fichiers
compilés de la librairie pour générer ces classes :

```css
@import "tailwindcss";
@source "../node_modules/@animalink/form/dist";
```

Si votre application n'a pas déjà un thème shadcn, importez le thème neutre
fourni — sinon, **ne l'importez pas** : la librairie adoptera automatiquement
votre charte graphique.

```css
@import "@animalink/form/styles.css";
```

## Configuration

La librairie ne connaît ni votre backend, ni votre routeur, ni votre identité
visuelle : ces points de contact passent par des ports injectés une fois au
démarrage. Tous ont une valeur par défaut, sauf l'upload de médias qui n'a de
sens qu'avec une vraie API.

```ts
import { configurePorts } from "@animalink/form"

configurePorts({
  // Requis uniquement si vous utilisez les champs média (@animalink/form/media).
  mediaUploader: {
    async upload({ fileInBase64, role, gallery }) {
      const res = await api.post("/media_objects", { fileInBase64, role, gallery })
      return res["@id"]
    },
    async update(iri, { fileInBase64 }) {
      const res = await api.patch(iri, { fileInBase64 })
      return res["@id"]
    },
    async remove(iri) {
      await api.delete(iri)
    },
    async getMeta(iri) {
      return await api.get(iri) // { mimeType, label }
    },
  },

  components: {
    // Rend le libellé lisible d'une IRI dans les listes déroulantes.
    // Par défaut, l'identifiant brut est affiché.
    iriLabel: ({ iri }) => <ResourceName iri={iri} />,
    // Marque affichée au centre du loader. Par défaut : rien.
    logo: MyLogo,
  },
})
```

Le comportement global des formulaires se règle séparément, via `setFormConfig` :

```ts
import { setFormConfig } from "@animalink/form"

setFormConfig({
  defaultForm: {
    label: { success: "Enregistré", error: "Le formulaire est invalide" },
  },
})
```

### Traduction

Les libellés passent par un module de traduction volontairement minimal. Il
s'agit d'un singleton : pour que votre application et la librairie partagent le
même dictionnaire, importez-le depuis la librairie plutôt que d'en maintenir un
second.

```ts
import { setTranslation, Trans } from "@animalink/form/i18n"

setTranslation({ "Mon profil": "My profile" })
```

## Points d'entrée

| Import                     | Contenu                                                                      |
| -------------------------- | ---------------------------------------------------------------------------- |
| `@animalink/form`          | Noyau : `useForm`, `FormElement`, contrôleurs de champs, configuration       |
| `@animalink/form/group`    | Répartition des champs en sections repliables                                |
| `@animalink/form/media`    | Upload de fichiers, aperçu, éditeur d'image (recadrage / rotation)           |
| `@animalink/form/step`     | Formulaires multi-étapes avec navigation                                     |
| `@animalink/form/i18n`     | Traduction (`translate`, `Trans`, `TranslationProvider`)                     |
| `@animalink/form/registry` | Registre JSON-LD partagé (`createResource`, `getResource`, `searchMetaData`) |

## Concepts

### Le formulaire est une donnée

Un formulaire est un objet `FormInterface` décrivant ses champs, ses libellés,
son action et son comportement. Rien n'est codé en dur dans du JSX : la même
description peut être stockée, transformée ou générée depuis un schéma d'API.

```ts
const form: FormInterface = {
  action: ActionList.create,
  inputs: {
    name: { label: "Nom", required: true },
    price: { label: "Tarif", controller: PriceInputController },
  },
}
```

### Le champ délègue son rendu à un contrôleur

Chaque champ est rendu par un _contrôleur_ : un composant React qui reçoit
`{ formInput, onChange }` et n'a rien d'autre à savoir du formulaire.

Sans `controller`, le champ utilise `DefaultInputController`, un `<input>` HTML
dont le `type` du champ pilote le comportement (`text`, `email`, `number`,
`password`…). Pour tout le reste, on désigne le contrôleur explicitement :

```ts
inputs: {
  description: { controller: WysiwygInputController },
}
```

Un champ portant une clé `form` est rendu comme un sous-formulaire imbriqué.

Écrire son propre contrôleur revient à écrire un composant respectant
`InputControllerInterface` — aucune inscription préalable n'est nécessaire :

```tsx
const ColorInputController = ({ formInput, onChange }: InputControllerInterface) => (
  <input
    type="color"
    value={formInput.value ?? "#000000"}
    onChange={(e) => onChange({ ...formInput, value: e.target.value })}
  />
)
```

### Le registre JSON-LD

`addForm` enregistre un formulaire sous une IRI et `getForm` le retrouve par
type — tous deux exportés par le point d'entrée principal :

```ts
import { addForm, getForm } from "@animalink/form"
import { createResource } from "@animalink/form/registry"
```

Les deux écrivent dans le **même** registre. Si votre application déclare aussi
des ressources, importez `createResource` depuis `@animalink/form/registry`
plutôt que d'en maintenir une copie : deux registres en mémoire empêcheraient
`searchMetaData` de faire le lien entre une ressource et son formulaire.

## Contrôleurs de champs disponibles

Tous exportés par `@animalink/form`, à passer dans le champ `controller`.

**Texte** — `DefaultInputController`, `TextAreaInputController`,
`PasswordInputController`, `EmailInputController`, `WebsiteInputController`,
`PhoneInputController`, `WysiwygInputController`, `SearchInputController`,
`AutocompleteInputController`.

**Nombres** — `NumberInputController`, `PriceInputController`,
`DurationInputController`.

**Dates** — `DateInputController`, `DatePickerInputController`,
`DateRangeInputController`, `TimeInputController`, `SelectTimeInputController`,
`MomentInputController`.

**Choix** — `SelectInputController`, `SelectSearchInputController`,
`MultiSelectInputController`, `MultiSelectSearchInputController`,
`SelectRadioInputController`, `SelectCardInputController`,
`SelectButtonInputController`, `CheckboxInputController`,
`SwitchInputController`, `BooleanInputController`, `IconInputController`.

**Composés** — `ArrayInputController`, `FormArrayInputController`
(constructeur de page), `FormInputController` (sous-formulaire),
`BlockOrderInput`, `FileInputController`, `IaImageInputController`.

**Médias** (via `@animalink/form/media`) — `MediaObjectInputController` (image
avec recadrage et rotation), `MediaObjectWithPdfInputController`,
`MediaObjectDocumentInputController`.

## Développement

```bash
pnpm install
pnpm test          # 197 tests (Vitest + Testing Library)
pnpm typecheck
pnpm lint
pnpm build         # tsdown → dist/ (ESM + types)
```

### Publier une version

Le versionnage passe par [changesets](https://github.com/changesets/changesets) :

```bash
pnpm changeset       # décrire le changement et son impact (patch / minor / major)
git commit && git push
```

La CI publie sur npm après fusion sur `main`.

## Licence

MIT
