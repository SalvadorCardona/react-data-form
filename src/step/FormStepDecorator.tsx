import { PropsWithChildren } from "react"
import { Badge } from "@/ui/badge"
import { Progress } from "@/ui/progress"
import { useFormStep } from "@/step/useFormStep"
import { Text } from "@/ui/Text"
import { AnimatePresence, motion } from "framer-motion"
import { CardDescription, CardTitle } from "../ui/card"
import useFormContext from "@/form/provider/useFormContext"
import Loader from "@/ui/Loader"

export type FormStepDecoratorPropsInterface = PropsWithChildren & {
  className?: string
}

const stepAnimation = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
  transition: { duration: 0.25, ease: "easeOut" as const },
}

export function FormStepDecorator({
  children,
  className,
}: FormStepDecoratorPropsInterface) {
  const { progress, steps, currentStep, form } = useFormStep()
  const { isLoading } = useFormContext()
  const saveOnChange = !!form.saveOnChange

  if (!currentStep) return <Badge>Invalid Form</Badge>

  if (!saveOnChange && isLoading.value) {
    return <Loader />
  }

  return (
    <div className={className}>
      <CardTitle className="text-2xl font-bold text-foreground mb-2">
        {currentStep.title}
      </CardTitle>
      <CardDescription className="text-muted-foreground mb-8">
        {currentStep.description}
      </CardDescription>
      <Progress value={progress} className="h-2 mt-5" />
      {!form.groupOption.hideStepNumber && (
        <Text variant="muted" className="block text-center m-2">
          Step {currentStep.order} of {steps.length}
        </Text>
      )}
      <AnimatePresence mode="wait">
        <motion.div key={currentStep.group} {...stepAnimation}>
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
