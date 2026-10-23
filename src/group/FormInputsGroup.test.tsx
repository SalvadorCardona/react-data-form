import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import FormElement from "@/form/component/form/FormElement"
import { GroupOption } from "@/form/FormInterface"
import useForm from "@/form/hook/useForm"
import { createGroupForm } from "@/group/FormGroup"

function GroupForm({ groupOption }: { groupOption: GroupOption }) {
  const form = createGroupForm({
    inputs: {
      a: { label: "InGroup", groups: ["g1"] },
      b: { label: "NoGroup" },
      c: { label: "UnknownGroup", groups: ["missing"] },
    },
    groupOption,
  })
  const formContext = useForm({ form })
  return <FormElement {...formContext} />
}

const itemGroups = [{ group: "g1", title: "Group 1", order: 1 }]

describe("createGroupForm", () => {
  it("renders fields without a known group in a default section after the groups", () => {
    render(<GroupForm groupOption={{ itemGroups }} />)

    const inGroup = screen.getByText("InGroup")
    const noGroup = screen.getByText("NoGroup")
    const unknownGroup = screen.getByText("UnknownGroup")
    expect(
      inGroup.compareDocumentPosition(noGroup) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
    expect(
      inGroup.compareDocumentPosition(unknownGroup) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
  })

  it("renders the default section before the groups with ungroupedPosition: start", () => {
    render(<GroupForm groupOption={{ itemGroups, ungroupedPosition: "start" }} />)

    const inGroup = screen.getByText("InGroup")
    const noGroup = screen.getByText("NoGroup")
    expect(
      inGroup.compareDocumentPosition(noGroup) & Node.DOCUMENT_POSITION_PRECEDING
    ).toBeTruthy()
  })
})
