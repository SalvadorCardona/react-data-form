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

const URL_ATTRS = ["href", "src"]

// Relative URLs (no scheme) are accepted along with these schemes.
const ALLOWED_PROTOCOLS = new Set(["http", "https", "mailto", "tel"])

export function sanitizeHtml(html: string): string {
  if (!html) return ""

  // Without a DOM (server render) there is nothing to sanitize with: the
  // markup is escaped so that it is shown as text rather than injected.
  if (typeof window === "undefined" || typeof DOMParser === "undefined") {
    return escapeHtml(html)
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

    for (const name of URL_ATTRS) {
      const url = child.getAttribute(name)
      if (url !== null && !isSafeUrl(url)) {
        child.removeAttribute(name)
      }
    }

    if (tag === "A" && child.getAttribute("target") === "_blank") {
      const rel = (child.getAttribute("rel") ?? "").split(/\s+/).filter(Boolean)
      for (const token of ["noopener", "noreferrer"]) {
        if (!rel.includes(token)) rel.push(token)
      }
      child.setAttribute("rel", rel.join(" "))
    }
  }

  for (const el of toRemove) el.remove()
  for (const el of toUnwrap) {
    while (el.firstChild) el.parentNode!.insertBefore(el.firstChild, el)
    el.remove()
  }
}

function isSafeUrl(url: string): boolean {
  // Browsers ignore control characters and whitespace inside a scheme
  // ("java\tscript:"), so they are removed before reading it.
  // eslint-disable-next-line no-control-regex
  const normalized = url.replace(/[\u0000-\u0020\u007f-\u009f]/g, "")
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(normalized)
  return !scheme || ALLOWED_PROTOCOLS.has(scheme[1].toLowerCase())
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}
