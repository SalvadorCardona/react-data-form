import { InputControllerInterface } from "@/form/InputControllerInterface"
import { lazy, Suspense } from "react"
import { translate } from "react-mini-i18n"
import Loader from "@/ui/Loader"
import { WysiwygReader } from "@/ui/WysiwygReader"

const WisiwigEditor = lazy(() => import("@/ui/Wysiwyg"))

export const WysiwygInputController = ({
  formInput,
  onChange,
}: InputControllerInterface) => {
  const change = (e: string) => {
    onChange({ ...formInput, ...{ value: e } })
  }

  if (formInput.readonly) {
    return <WysiwygReader content={formInput.value} />
  }

  return (
    <Suspense fallback={<Loader />}>
      <WisiwigEditor
        value={formInput?.value ?? ""}
        placeholder={
          formInput.placeholder ?? translate("Start writing something great…")
        }
        onChange={change}
      />
    </Suspense>
  )
}
