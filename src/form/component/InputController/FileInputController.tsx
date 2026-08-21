import { InputControllerInterface } from "@/form/InputControllerInterface"
import { FormInputInterface } from "@/form/FormInputInterface"
import { ChangeEvent } from "react"
import { Input } from "@/ui/input"

function fileToBase64(file: File): Promise<string | null | ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })
}

export const FileInputController = ({
  formInput,
  onChange,
}: InputControllerInterface<FormInputInterface<string | undefined>>) => {
  const change = (value: string | undefined) => {
    onChange({ ...formInput, ...{ value } })
  }

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e?.target?.files) {
      return
    }

    fileToBase64(e.target.files[0]).then((file) => {
      change(file as string)
    })
  }

  return (
    <Input
      type="file"
      defaultValue={formInput.value ?? ""}
      onChange={(e) => onFileChange(e)}
    />
  )
}
