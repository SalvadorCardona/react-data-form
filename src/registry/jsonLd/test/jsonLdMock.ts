import { JsonLdCollection } from "@/registry/jsonLd/jsonLdCollection"
import { JsonLDItem } from "@/registry/jsonLd/jsonLDItem"

export const jsonLdCollection: JsonLdCollection = {
  "@context": "/api/contexts/Translation",
  "@id": "/api/public/translations",
  "@type": "Collection",
  totalItems: 154,
  member: [
    {
      "@id": "/api/translations/1f021b69-cfd2-6616-ae25-efeef69ca708",
      "@type": "Translation",
      languageCode: "fr",
      key: "show more",
      value: "voir plus",
    },
    {
      "@id": "/api/translations/1f021b69-cfd2-67b0-b776-efeef69ca708",
      "@type": "Translation",
      languageCode: "fr",
      key: "show less",
      value: "voir moins",
    },
  ],
  search: {
    "@type": "IriTemplate",
    template: "/api/public/translations{?languageCode,languageCode[],key,value}",
    variableRepresentation: "BasicRepresentation",
    mapping: [
      {
        "@type": "IriTemplateMapping",
        variable: "languageCode",
        property: "languageCode",
        required: false,
      },
      {
        "@type": "IriTemplateMapping",
        variable: "languageCode[]",
        property: "languageCode",
        required: false,
      },
      {
        "@type": "IriTemplateMapping",
        variable: "key",
        property: "key",
        required: false,
      },
      {
        "@type": "IriTemplateMapping",
        variable: "value",
        property: "value",
        required: false,
      },
    ],
  },
}

export const jsonLdItem: JsonLDItem<any> = {
  "@context": "/api/contexts/CompanyService",
  "@id": "/api/company_services/1f025a07-d312-60ec-9f27-0dd9c18490da",
  "@type": "CompanyService",
  name: "eius voluptate odit Service",
  price: 756,
  priceType: "/api/public/company_service_price_types/HIDDEN",
  paiementType: "/api/public/company_service_paiement_types/PAIEMENT_ON_RESERVATION",
  addressType: "/api/public/company_service_address_types/SERVICE_HAS_ADDRESS",
  address: "/api/addresses/1f025a07-d30f-6400-beee-0dd9c18490da",
  description:
    "Voluptatibus distinctio delectus quia sed id. Consequatur tempora eligendi ut et quod. Fuga dolor adipisci delectus eum sed fugit aut.",
  thumbnail: "/api/media_objects/1f025a07-d312-61dc-8ad6-0dd9c18490da",
  calendarEvents: [],
  duration: 177,
  durationBetweenAppointment: 5,
  limitBookingLimit: 0,
  startDate: "2025-05-06T20:14:19+00:00",
  endDate: "2025-05-06T20:14:21+00:00",
  company: "/api/companies/1f025a07-54c1-647c-aef6-0dd9c18490da",
  maxParticipantAnimals: 2,
  maxParticipants: 12,
  frequency: "/api/public/recurrence_frequencies/DAILY",
  animalAccepted: [
    "/api/animal_species/1f025a07-48b1-62fe-9505-0dd9c18490da",
    "/api/animal_species/1f025a07-48b1-6b32-a995-0dd9c18490da",
    "/api/animal_species/1f025a07-48b2-60d2-ae3f-0dd9c18490da",
  ],
  organizer: "/api/users/1f025a07-3fee-6fb8-b0df-0dd9c18490da",
  categories: [
    "/api/company_categories/1f025a07-4f41-6754-9539-0dd9c18490da",
    "/api/company_categories/1f025a07-4f42-612c-bccc-0dd9c18490da",
  ],
  isActive: false,
  isBookable: true,
  categoriesNames:
    "Nettoyage des oreilles et des yeux, Prévention des troubles de l’anxiété",
  addressLabel: "68, boulevard Humbert, De Oliveira, 91460",
  animalAcceptedNames: ["Cheval", "Furet", "Rongeur"],
}
