import { ValueOptionInterface } from "@/form/utils/valueOption"

/**
 * Charge de façon asynchrone la liste exhaustive d'émojis natifs et la
 * transforme en options de formulaire. Le dataset (`emojiData`) est importé
 * dynamiquement : il n'est donc téléchargé que lorsque le sélecteur est ouvert,
 * et n'alourdit pas le bundle initial.
 *
 * Les émojis les plus utilisés sont déjà placés en tête de `EMOJI_LIST`.
 * Cette fonction respecte la signature de `FormInputInterface.getValueOptions`
 * et peut donc être réutilisée directement comme `getValueOptions` d'un champ.
 */
export async function getEmojiValueOptions(): Promise<ValueOptionInterface[]> {
  const { EMOJI_LIST } = await import("./emojiData")

  return EMOJI_LIST.map((emoji) => ({ label: emoji, value: emoji }))
}
