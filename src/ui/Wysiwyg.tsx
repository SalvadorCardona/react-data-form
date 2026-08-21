import { useState } from "react"
import { type Editor, EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import {
  Bold,
  Code,
  Italic,
  LinkIcon,
  Redo,
  Strikethrough,
  Type,
  Undo,
} from "lucide-react"
import { Separator } from "@/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover"
import { Label } from "@/ui/label"
import { Input } from "@/ui/input"
import { Button } from "@/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/ui/tooltip"
import { BubbleMenu } from "@tiptap/react/menus"
import { Toggle } from "./toggle"
import { sanitizeHtml } from "@/ui/sanitizeHtml"

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  const [linkUrl, setLinkUrl] = useState<string>("")

  if (!editor) {
    return null
  }

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run()
      setLinkUrl("")
    }
  }

  const ToolbarButton = ({
    icon: Icon,
    label,
    isActive,
    onClick,
    disabled,
  }: {
    icon: any
    label: string
    isActive?: boolean
    onClick: () => void
    disabled?: boolean
  }) => (
    <TooltipProvider>
      <Tooltip>
        {/* `render` merges the trigger into the Toggle; nested, we
            obtiendrait un <button> dans un <button>, HTML invalide qui
            provoque une erreur d'hydratation React. */}
        <TooltipTrigger
          render={
            <Toggle
              size="sm"
              pressed={isActive}
              onPressedChange={onClick}
              disabled={disabled}
              aria-label={label}
              className="h-9 w-9 transition-all hover:bg-accent data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
            >
              <Icon className="h-4 w-4" />
            </Toggle>
          }
        />
        <TooltipContent side="bottom" className="text-xs">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

  return (
    <div className="border-b border-border bg-muted/30 backdrop-blur-sm rounded-t-lg px-3 py-2 flex flex-wrap items-center gap-1">
      {/* Text Formatting Group */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton
          icon={Bold}
          label="Gras (⌘B)"
          isActive={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          icon={Italic}
          label="Italique (⌘I)"
          isActive={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />

        <ToolbarButton
          icon={Code}
          label="Code inline (⌘E)"
          isActive={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
        />
      </div>

      <Separator orientation="vertical" className="h-7 mx-1" />

      {/* Heading Group */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton
          icon={Type}
          label="Paragraphe"
          isActive={editor.isActive("paragraph")}
          onClick={() => editor.chain().focus().setParagraph().run()}
        />
      </div>

      <Separator orientation="vertical" className="h-7 mx-1" />

      {/* Insert Group */}
      <div className="flex items-center gap-0.5">
        <TooltipProvider>
          <Tooltip>
            <Popover>
              {/* Both triggers and the button are merged into a single
                  element; nested, they would produce three stacked
                  <button> elements. */}
              <TooltipTrigger
                render={
                  <PopoverTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 hover:bg-accent"
                      >
                        <LinkIcon className="h-4 w-4" />
                      </Button>
                    }
                  />
                }
              />
              <TooltipContent side="bottom" className="text-xs">
                <p>Insert link (⌘K)</p>
              </TooltipContent>
              <PopoverContent className="w-80" align="start">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm leading-none">
                      Ajouter un lien
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Entrez l'URL du lien
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="link">URL</Label>
                    <Input
                      id="link"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="https://example.com"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          addLink()
                        }
                      }}
                    />
                  </div>
                  <Button size="sm" onClick={addLink} className="w-full">
                    Ajouter le lien
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* History Controls */}
      <div className="ml-auto flex items-center gap-0.5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().undo().run()}
                  disabled={!editor.can().undo()}
                  className="h-9 w-9 p-0 hover:bg-accent disabled:opacity-30"
                >
                  <Undo className="h-4 w-4" />
                </Button>
              }
            />
            <TooltipContent side="bottom" className="text-xs">
              <p>Annuler (⌘Z)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().redo().run()}
                  disabled={!editor.can().redo()}
                  className="h-9 w-9 p-0 hover:bg-accent disabled:opacity-30"
                >
                  <Redo className="h-4 w-4" />
                </Button>
              }
            />
            <TooltipContent side="bottom" className="text-xs">
              <p>Redo (⌘⇧Z)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}

export default function WysiwygEditor(props: {
  value?: string
  onChange: (e: string) => void
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start writing something great…",
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class:
            "text-primary underline underline-offset-2 hover:text-primary/80 transition-colors cursor-pointer",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto my-4 shadow-sm",
        },
      }),
    ],
    content: props.value ?? "",
    onUpdate: ({ editor }) => {
      props.onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base lg:prose-lg max-w-none focus:outline-none min-h-[300px]",
      },
      transformPastedHTML: (html) => sanitizeHtml(html),
    },
  })

  return (
    <div className="mx-auto w-full">
      <div className="flex flex-col rounded-lg border border-border bg-background shadow-sm overflow-hidden transition-all focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <MenuBar editor={editor} />

        {editor && (
          <BubbleMenu editor={editor}>
            <div className="flex items-center gap-0.5 rounded-lg border border-border bg-popover/95 backdrop-blur-sm p-1 shadow-lg animate-in fade-in zoom-in-95">
              <Toggle
                size="sm"
                pressed={editor.isActive("bold")}
                onPressedChange={() => editor.chain().focus().toggleBold().run()}
                className="h-8 w-8 data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
              >
                <Bold className="h-3.5 w-3.5" />
              </Toggle>
              <Toggle
                size="sm"
                pressed={editor.isActive("italic")}
                onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                className="h-8 w-8 data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
              >
                <Italic className="h-3.5 w-3.5" />
              </Toggle>
              <Toggle
                size="sm"
                pressed={editor.isActive("strike")}
                onPressedChange={() => editor.chain().focus().toggleStrike().run()}
                className="h-8 w-8 data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
              >
                <Strikethrough className="h-3.5 w-3.5" />
              </Toggle>
              <Separator orientation="vertical" className="h-6 mx-0.5" />
              <Toggle
                size="sm"
                pressed={editor.isActive("code")}
                onPressedChange={() => editor.chain().focus().toggleCode().run()}
                className="h-8 w-8 data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
              >
                <Code className="h-3.5 w-3.5" />
              </Toggle>
            </div>
          </BubbleMenu>
        )}

        <div className="relative px-6 py-5 bg-background">
          <EditorContent
            editor={editor}
            className="prose-headings:font-semibold prose-headings:tracking-tight prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-a:text-primary prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-blockquote:border-l-primary prose-blockquote:border-l-4 prose-blockquote:pl-4 prose-blockquote:italic prose-hr:border-border"
          />
        </div>
      </div>
    </div>
  )
}
