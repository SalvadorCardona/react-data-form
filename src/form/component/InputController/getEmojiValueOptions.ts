import { ValueOptionInterface } from "@/form/utils/valueOption"

/**
 * Asynchronously loads the full list of native emojis and turns it into form
 * options. The dataset (`emojiData`) is imported dynamically, so it is only
 * downloaded when the picker is opened,
 * et n'alourdit pas le bundle initial.
 *
 * The most used emojis already sit at the top of `EMOJI_LIST`.
 * Cette fonction respecte la signature de `FormInputInterface.getValueOptions`
 * so it can be used directly as a field's `getValueOptions`.
 */
export async function getEmojiValueOptions(): Promise<ValueOptionInterface[]> {
  const { EMOJI_LIST } = await import("./emojiData")

  return EMOJI_LIST.map((emoji) => ({ label: emoji, value: emoji }))
}
