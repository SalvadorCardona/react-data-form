// packages/form/utils/valueOption.test.ts

import {
  getValueOptionByGroup,
  getValueOptionFromValue,
  valueOptionFromArray,
  valueOptionFromJsonLdCollection,
  valueOptionMapper,
} from "@/form/utils/valueOption"
import { describe, expect, test } from "vitest"

describe("valueOption utils", () => {
  test("valueOptionMapper maps label, value and original correctly", () => {
    const data = [
      { name: "Option A", code: 1, extra: "x" },
      { name: "Option B", code: 2, extra: "y" },
    ] as any[]

    const options = valueOptionMapper(data, "name", "code")

    expect(options).toHaveLength(2)
    expect(options[0]).toMatchObject({
      label: "Option A",
      value: 1,
      original: data[0],
    })
    expect(options[1]).toMatchObject({
      label: "Option B",
      value: 2,
      original: data[1],
    })
  })

  test("valueOptionFromJsonLdCollection uses name and @id", () => {
    const data = [
      { "@id": "id1", name: "Nom 1" },
      { "@id": "id2", name: "Nom 2" },
    ] as any[]

    const options = valueOptionFromJsonLdCollection(data)

    expect(options).toHaveLength(2)
    expect(options[0]).toMatchObject({ label: "Nom 1", value: "id1" })
    expect(options[1]).toMatchObject({ label: "Nom 2", value: "id2" })
  })

  test("valueOptionFromArray turns items into options", () => {
    const data = ["Alpha", "Beta", 42] as any[]
    const options = valueOptionFromArray(data)

    expect(options).toHaveLength(3)
    expect(options[0]).toMatchObject({ label: "Alpha", value: "Alpha" })
    expect(options[1]).toMatchObject({ label: "Beta", value: "Beta" })
    expect(options[2]).toMatchObject({ label: 42, value: 42 })
  })

  test("getValueOptionFromValue returns the matching option", () => {
    const opts = [
      { label: "One", value: 1 },
      { label: "Two", value: 2 },
    ] as any[]

    const found = getValueOptionFromValue(2, opts)
    expect(found).toBeTruthy()
    expect(found?.value).toBe(2)
    expect(found?.label).toBe("Two")
  })

  test("groupByGroup groups by group, falling back to default", () => {
    const opts = [
      { label: "A", value: "a", group: "g1" },
      { label: "B", value: "b" }, // sans group
      { label: "C", value: "c", group: "g1" },
      { label: "D", value: "d", group: "g2" },
    ] as any[]

    const grouped = getValueOptionByGroup(opts)

    expect(grouped).toHaveProperty("g1")
    expect(grouped).toHaveProperty("default")
    expect(grouped).toHaveProperty("g2")

    expect(grouped["g1"]).toHaveLength(2)
    expect(grouped["default"]).toHaveLength(1)
    expect(grouped["g2"]).toHaveLength(1)
  })
})
