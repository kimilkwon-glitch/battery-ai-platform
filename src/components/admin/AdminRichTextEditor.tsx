"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import {
  isStoredContentUnchanged,
  plainTextToEditorHtml,
} from "@/lib/content/rich-text-content";

export type AdminRichTextEditorVariant = "qna" | "guide";

export type AdminRichTextEditorHandle = {
  insertPlainText: (text: string) => void;
  focus: () => void;
};

type Props = {
  variant: AdminRichTextEditorVariant;
  value: string;
  storedValue?: string;
  onChange: (html: string, meta: { dirty: boolean }) => void;
  placeholder?: string;
  minHeight?: string;
  disabled?: boolean;
  imageUploadUrl?: string;
};

function ToolbarButton({
  active,
  disabled,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      className={`admin-rte__btn${active ? " admin-rte__btn--active" : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export const AdminRichTextEditor = forwardRef<AdminRichTextEditorHandle, Props>(
  function AdminRichTextEditor(
    {
      variant,
      value,
      storedValue,
      onChange,
      placeholder = "내용을 입력하세요",
      minHeight = "10rem",
      disabled = false,
      imageUploadUrl,
    },
    ref,
  ) {
    const storedRef = useRef(storedValue ?? value ?? "");
    const suppressUpdateRef = useRef(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => {
      storedRef.current = storedValue ?? value ?? "";
    }, [storedValue, value]);

    const starterKit = StarterKit.configure({
      heading: variant === "guide" ? { levels: [2, 3] } : false,
      hardBreak: { keepMarks: true },
      ...(variant === "qna"
        ? { blockquote: false, horizontalRule: false }
        : {}),
    });

    const extensions = [
      starterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
      Placeholder.configure({ placeholder }),
      ...(variant === "guide"
        ? [
            Image.configure({
              inline: false,
              allowBase64: false,
            }),
          ]
        : []),
    ];

    const editor = useEditor({
      extensions,
      content: plainTextToEditorHtml(value),
      editable: !disabled,
      immediatelyRender: false,
      editorProps: {
        attributes: {
          class: "admin-rte__content",
          style: `min-height:${minHeight}`,
        },
      },
      onUpdate: ({ editor: ed }) => {
        if (suppressUpdateRef.current) return;
        const html = ed.getHTML();
        const dirty = !isStoredContentUnchanged(storedRef.current, html);
        onChange(html, { dirty });
      },
    });

    useEffect(() => {
      if (!editor) return;
      suppressUpdateRef.current = true;
      const next = plainTextToEditorHtml(value);
      const current = editor.getHTML();
      if (next !== current) {
        editor.commands.setContent(next, { emitUpdate: false });
      }
      suppressUpdateRef.current = false;
    }, [editor, value]);

    useEffect(() => {
      if (!editor) return;
      editor.setEditable(!disabled);
    }, [editor, disabled]);

    const insertPlainText = useCallback(
      (text: string) => {
        if (!editor) return;
        const trimmed = text.trim();
        if (!trimmed) return;
        editor.chain().focus().insertContent(plainTextToEditorHtml(trimmed)).run();
      },
      [editor],
    );

    useImperativeHandle(
      ref,
      () => ({
        insertPlainText,
        focus: () => editor?.commands.focus(),
      }),
      [editor, insertPlainText],
    );

    const setLink = useCallback(() => {
      if (!editor) return;
      const prev = editor.getAttributes("link").href as string | undefined;
      const url = window.prompt("링크 URL", prev ?? "https://");
      if (url === null) return;
      if (url === "") {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
        return;
      }
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }, [editor]);

    const uploadBodyImage = useCallback(async () => {
      if (!editor || !imageUploadUrl) return;
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/jpeg,image/png,image/webp";
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
          window.alert("이미지는 5MB 이하만 업로드할 수 있습니다.");
          return;
        }
        setUploadingImage(true);
        try {
          const body = new FormData();
          body.append("file", file);
          const res = await fetch(imageUploadUrl, {
            method: "POST",
            credentials: "include",
            body,
          });
          const data = (await res.json()) as { ok?: boolean; url?: string; message?: string };
          if (!res.ok || !data.ok || !data.url) {
            window.alert(data.message ?? "이미지 업로드에 실패했습니다.");
            return;
          }
          editor.chain().focus().setImage({ src: data.url, alt: "" }).run();
        } finally {
          setUploadingImage(false);
        }
      };
      input.click();
    }, [editor, imageUploadUrl]);

    if (!editor) {
      return <div className="admin-rte admin-rte--loading">에디터 불러오는 중…</div>;
    }

    return (
      <div className="admin-rte">
        <div className="admin-rte__toolbar" role="toolbar" aria-label="서식">
          {variant === "guide" ? (
            <>
              <ToolbarButton
                title="제목 2"
                active={editor.isActive("heading", { level: 2 })}
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              >
                H2
              </ToolbarButton>
              <ToolbarButton
                title="제목 3"
                active={editor.isActive("heading", { level: 3 })}
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              >
                H3
              </ToolbarButton>
            </>
          ) : null}
          <ToolbarButton
            title="굵게"
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            B
          </ToolbarButton>
          {variant === "guide" ? (
            <ToolbarButton
              title="기울임"
              active={editor.isActive("italic")}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              I
            </ToolbarButton>
          ) : null}
          {variant === "guide" ? (
            <ToolbarButton
              title="밑줄"
              active={editor.isActive("underline")}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              U
            </ToolbarButton>
          ) : null}
          <ToolbarButton
            title="글머리 목록"
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            •
          </ToolbarButton>
          <ToolbarButton
            title="번호 목록"
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            1.
          </ToolbarButton>
          {variant === "guide" ? (
            <ToolbarButton
              title="인용"
              active={editor.isActive("blockquote")}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
              “
            </ToolbarButton>
          ) : null}
          {variant === "guide" ? (
            <ToolbarButton
              title="구분선"
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
            >
              ―
            </ToolbarButton>
          ) : null}
          <ToolbarButton title="링크" active={editor.isActive("link")} onClick={setLink}>
            🔗
          </ToolbarButton>
          {variant === "guide" && imageUploadUrl ? (
            <ToolbarButton title="본문 이미지" disabled={uploadingImage} onClick={() => void uploadBodyImage()}>
              {uploadingImage ? "…" : "🖼"}
            </ToolbarButton>
          ) : null}
          <ToolbarButton title="실행 취소" onClick={() => editor.chain().focus().undo().run()}>
            ↶
          </ToolbarButton>
          <ToolbarButton title="다시 실행" onClick={() => editor.chain().focus().redo().run()}>
            ↷
          </ToolbarButton>
        </div>
        <EditorContent editor={editor} />
        <p className="admin-rte__hint">
          Enter — 새 문단 · Shift+Enter — 줄바꿈 · HTML 태그 입력 불필요
        </p>
      </div>
    );
  },
);
