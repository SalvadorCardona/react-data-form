import { useEffect, useRef } from "react"
import useFormContext from "@/form/provider/useFormContext"
import {
  applyStep,
  FormStep,
  FormWithStepsBuild,
  getNextStep,
  getPreviousStep,
  getProgress,
} from "@/step/FormStep"
import { validateForm } from "@/form/utils/validateForm"
import { formHasError } from "@/form/utils/formHasError"
import getFormInputsFromForm from "@/form/utils/getFormInputsFromForm"
import { getSortedItemGroup } from "@/group/getSortedItemGroup"

interface UseFormStepResult {
  currentStep?: FormStep
  nextStep?: FormStep
  previousStep?: FormStep
  steps: FormStep[]
  progress: number
  goToNextStep: () => void
  goToPrevStep: () => void
  onSubmit: () => void
  form: FormWithStepsBuild
}

function findFirstStepWithViolation(form: FormWithStepsBuild): FormStep | undefined {
  const inputsByGroup = new Map<string, boolean>()
  getFormInputsFromForm(form, false).forEach((input) => {
    if (!input.violations?.length) return
    input.groups?.forEach((group) => inputsByGroup.set(group, true))
  })

  return getSortedItemGroup(form.groupOption).find((step) =>
    inputsByGroup.has(step.group)
  )
}

export function useFormStep(): UseFormStepResult {
  const formContext = useFormContext()
  const mainForm = formContext.form as FormWithStepsBuild

  const currentStep = mainForm.groupOption?.currentStep
  const nextStep = getNextStep(mainForm)
  const previousStep = getPreviousStep(mainForm)
  const steps = getSortedItemGroup(mainForm.groupOption)
  const submitAttemptedRef = useRef(false)

  useEffect(() => {
    if (!submitAttemptedRef.current) return
    submitAttemptedRef.current = false

    const stepWithError = findFirstStepWithViolation(mainForm)
    if (stepWithError && stepWithError.group !== currentStep?.group) {
      formContext.updateForm(applyStep({ ...mainForm }, stepWithError))
    }
  }, [mainForm.version])

  function goToPrevStep() {
    if (!previousStep) return
    const newForm = applyStep({ ...mainForm }, previousStep)
    formContext.updateForm(newForm)
  }

  async function goToNextStep() {
    if (!nextStep || !currentStep) return

    let validatedForm = validateForm(mainForm) as FormWithStepsBuild

    if (formHasError(validatedForm)) {
      formContext.updateForm(validatedForm)
      return
    }

    formContext.isLoading.setTrue()

    if (mainForm.groupOption?.onNextStep) {
      validatedForm = await mainForm.groupOption?.onNextStep?.({
        step: currentStep,
        form: validatedForm,
      })
    }

    if (currentStep?.onNextStep) {
      validatedForm = await currentStep?.onNextStep?.({
        step: currentStep,
        form: validatedForm,
      })
    }

    formContext.isLoading.setFalse()

    formContext.updateForm(applyStep({ ...validatedForm }, nextStep))
  }

  async function onSubmit() {
    submitAttemptedRef.current = true
    await formContext.onSubmit()
  }

  return {
    form: mainForm,
    currentStep,
    nextStep,
    previousStep,
    steps,
    progress: getProgress(mainForm),
    goToNextStep,
    goToPrevStep,
    onSubmit,
  }
}
