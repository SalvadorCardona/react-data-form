import {
  FormBuiltInterface,
  FormInterface,
  GroupOption,
  ItemGroupOption,
} from "@/form/FormInterface"
import { createForm } from "@/form/utils/createForm"
import { FormStepDecorator } from "@/step/FormStepDecorator"
import { FormStepNavigation } from "@/step/FormStepNavigation"
import { getSortedItemGroup } from "@/group/getSortedItemGroup"

interface NextStepParams {
  step: FormStep
  form: FormWithStepsBuild
}

export interface FormStep extends ItemGroupOption {
  onNextStep?: (params: NextStepParams) => Promise<FormWithStepsBuild>
}

export interface FormStepOption extends GroupOption {
  itemGroups: FormStep[]
  currentStep?: FormStep
  hideStepNumber?: boolean
  onNextStep?: (params: NextStepParams) => Promise<FormWithStepsBuild>
}

export interface FormWithSteps extends FormInterface {
  groupOption?: FormStepOption
}

export interface FormWithStepsBuild extends FormBuiltInterface {
  groupOption: FormStepOption
}

export function getFirstStep(option: FormStepOption): FormStep | undefined {
  return getSortedItemGroup(option)[0]
}

export function getNextStep(form: FormWithStepsBuild): FormStep | undefined {
  const sorted = getSortedItemGroup(form.groupOption)
  const current = form.groupOption.currentStep
  if (!current) return undefined
  const idx = sorted.findIndex((s) => s.group === current.group)
  return sorted[idx + 1] ?? undefined
}

export function getPreviousStep(form: FormWithStepsBuild): FormStep | undefined {
  const sorted = getSortedItemGroup(form.groupOption)
  const current = form.groupOption.currentStep
  if (!current) return undefined
  const idx = sorted.findIndex((s) => s.group === current.group)
  return idx > 0 ? sorted[idx - 1] : undefined
}

export function applyStep(
  form: FormWithStepsBuild,
  step: FormStep
): FormWithStepsBuild {
  form.groupOption.currentStep = step
  form.groups = [step.group]
  return form
}

export function getProgress(form: FormWithStepsBuild): number {
  const sorted = getSortedItemGroup(form.groupOption)
  if (!sorted.length) return 0
  const current = form.groupOption.currentStep
  if (!current) return 0
  const idx = sorted.findIndex((s) => s.group === current.group)
  if (idx === -1) return 0
  return Math.round(((idx + 1) / sorted.length) * 100)
}

export function createStepForm(form: FormWithSteps): FormWithStepsBuild {
  if (!form.groupOption?.itemGroups?.length) {
    throw new Error("FormStep: groupOption.itemGroups must be defined and non-empty")
  }

  const formBuilt = createForm(form)
  const formStep = { ...formBuilt } as FormWithStepsBuild

  const firstStep = getFirstStep(formStep.groupOption)!
  applyStep(formStep, firstStep)

  formStep.components = {
    ...formStep.components,
    formSubmitAction: FormStepNavigation,
    formDecorator: FormStepDecorator,
  }

  return formStep
}
