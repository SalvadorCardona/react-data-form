import { useFormStep } from "@/step/useFormStep"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/ui/button"
import { Trans } from "react-mini-i18n"

export function FormStepNavigation() {
  const {
    nextStep,
    previousStep,
    goToNextStep,
    goToPrevStep,
    onSubmit,
    currentStep,
  } = useFormStep()

  return (
    <div className="flex items-center gap-3 pt-6 w-full">
      {previousStep && (
        <Button
          variant="outline"
          size="lg"
          onClick={goToPrevStep}
          className="flex items-center gap-2 bg-transparent"
        >
          <ChevronLeft className="w-4 h-4" />
          <Trans>Previous</Trans>
        </Button>
      )}
      {/* Pleine largeur sur mobile pour que le CTA principal soit bien visible */}
      <div className="ml-auto flex flex-1 items-center gap-2 sm:flex-initial">
        {nextStep ? (
          <Button
            size="lg"
            onClick={goToNextStep}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            {currentStep?.component?.submitButton ? (
              <currentStep.component.submitButton />
            ) : (
              <>
                Continuer
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        ) : (
          <Button size="lg" onClick={onSubmit} className="w-full sm:w-auto">
            <Trans>Finish</Trans>
          </Button>
        )}
      </div>
    </div>
  )
}
