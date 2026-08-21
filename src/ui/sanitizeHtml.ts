const ALLOWED_TAGS = new Set([
  "P",
  "BR",
  "STRONG",
  "B",
  "EM",
  "I",
  "U",
  "S",
  "DEL",
  "CODE",
  "PRE",
  "BLOCKQUOTE",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "UL",
  "OL",
  "LI",
  "A",
  "IMG",
  "HR",
])

const ALLOWED_ATTRS: Record<string, string[]> = {
  A: ["href", "title", "target", "rel"],
  IMG: ["src", "alt", "title"],
}

const DROPPED_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "META",
  "LINK",
  "IFRAME",
  "OBJECT",
  "EMBED",
])

export function sanitizeHtml(html: string): string {
  if (!html || typeof window === "undefined" || typeof DOMParser === "undefined") {
    return html ?? ""
  }

  const doc = new DOMParser().parseFromString(html, "text/html")
  sanitizeNode(doc.body)
  return doc.body.innerHTML
}

function sanitizeNode(node: Element): void {
  const toRemove: Element[] = []
  const toUnwrap: Element[] = []

  for (const child of Array.from(node.children)) {
    sanitizeNode(child)

    const tag = child.tagName
    if (DROPPED_TAGS.has(tag)) {
      toRemove.push(child)
      continue
    }

    if (!ALLOWED_TAGS.has(tag)) {
      toUnwrap.push(child)
      continue
    }

    const allowed = ALLOWED_ATTRS[tag] ?? []
    for (const attr of Array.from(child.attributes)) {
      if (!allowed.includes(attr.name) || /^on/i.test(attr.name)) {
        child.removeAttribute(attr.name)
      }
    }

    if (tag === "A") {
      const href = child.getAttribute("href")
      if (href && /^\s*javascript:/i.test(href)) {
        child.removeAttribute("href")
      }
    }
  }

  for (const el of toRemove) el.remove()
  for (const el of toUnwrap) {
    while (el.firstChild) el.parentNode!.insertBefore(el.firstChild, el)
    el.remove()
  }
}
