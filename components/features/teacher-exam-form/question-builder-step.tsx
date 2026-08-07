"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useFormikContext } from "formik";
import {
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  FileText,
  LoaderCircle,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { client } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import type { TeacherExamFormValues, TeacherExamQuestionType } from "./types";
import { QuestionDeleteDialog } from "./question-delete-dialog";
import { TextBatchModal } from "./text-batch-modal";
import {
  applyTeacherExamQuestionType,
  createEmptyOption,
  createEmptyQuestion,
  isAcceptedAnswerQuestionType,
  isChoiceQuestionType,
  isEssayQuestionType,
  normalizeTeacherExamQuestionType,
  reindexTeacherExamOptions,
  reindexTeacherExamQuestions,
} from "./utils";

const QUESTION_TYPE_OPTIONS: Array<{
  label: string;
  value: TeacherExamQuestionType;
}> = [
  { value: "single_choice", label: "Một đáp án" },
  { value: "multiple_choice", label: "Nhiều đáp án" },
  { value: "true_false", label: "Đúng / sai" },
  { value: "fill_in_blank", label: "Điền vào chỗ trống" },
  { value: "short_answer", label: "Trả lời ngắn" },
];

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
  minHeightClassName?: string;
}

interface ToolbarButtonProps {
  label: string;
  title: string;
  className?: string;
  active?: boolean;
  onClick: () => void;
}

type InsertDialogType = "link" | "table" | "formula";
type ScriptTag = "sub" | "sup";

interface TeacherImageUploadResponse {
  message: string;
  image: {
    id: number;
    filename: string;
    content_type: string;
    size_bytes: number;
    public_id: string;
    url: string;
    created_at?: string | null;
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function ToolbarButton({
  label,
  title,
  className,
  active = false,
  onClick,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      aria-pressed={active}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={cn(
        "rounded px-1.5 py-0.5 text-[#1E293B] transition-colors hover:bg-[#E2E8F0]",
        active && "bg-[#DBEAFE] text-[#1D4ED8] ring-1 ring-[#93C5FD]",
        className,
      )}
    >
      {label}
    </button>
  );
}

function RichTextEditor({
  value,
  onChange,
  placeholder,
  ariaLabel,
  minHeightClassName = "min-h-28",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const lastEmittedHtmlRef = useRef(value);
  const isComposingRef = useRef(false);
  const [blockFormat, setBlockFormat] = useState("p");
  const [pendingScript, setPendingScript] = useState<ScriptTag | null>(null);
  const [insertDialog, setInsertDialog] = useState<InsertDialogType | null>(
    null,
  );
  const [dialogValue, setDialogValue] = useState("");
  const [tableRows, setTableRows] = useState("2");
  const [tableColumns, setTableColumns] = useState("2");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  useEffect(() => {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    /*
     * Không gán lại innerHTML sau mỗi ký tự người dùng nhập.
     * Việc React ghi lại DOM của contentEditable sẽ đẩy con trỏ về đầu,
     * khiến "hello" bị nhập thành "olleh".
     */
    const isCurrentTypingUpdate =
      document.activeElement === editor && value === lastEmittedHtmlRef.current;

    if (isCurrentTypingUpdate) {
      return;
    }

    if (editor.innerHTML !== value) {
      editor.innerHTML = value;
    }

    lastEmittedHtmlRef.current = value;
  }, [value]);

  function emitChange() {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    const nextHtml = editor.innerHTML.replace(/\u200B/g, "");

    lastEmittedHtmlRef.current = nextHtml;
    onChange(nextHtml);
  }

  function saveSelection() {
    const editor = editorRef.current;
    const selection = window.getSelection();

    if (!editor || !selection || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);

    if (editor.contains(range.commonAncestorContainer)) {
      savedRangeRef.current = range.cloneRange();
    }
  }

  function restoreSelection() {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    editor.focus();

    const selection = window.getSelection();

    if (!selection) {
      return;
    }

    const savedRange = savedRangeRef.current;
    const savedRangeIsValid =
      savedRange !== null &&
      editor.contains(savedRange.startContainer) &&
      editor.contains(savedRange.endContainer);

    selection.removeAllRanges();

    if (savedRangeIsValid && savedRange) {
      selection.addRange(savedRange);
      return;
    }

    const fallbackRange = document.createRange();

    fallbackRange.selectNodeContents(editor);
    fallbackRange.collapse(false);
    selection.addRange(fallbackRange);
    savedRangeRef.current = fallbackRange.cloneRange();
  }

  function setCaretAfterNode(node: Node) {
    const selection = window.getSelection();
    const parent = node.parentNode;

    if (!selection || !parent) {
      return;
    }

    /*
     * Chèn một ký tự vô hình nằm ngoài thẻ <sup>/<sub> rồi đặt con trỏ vào
     * đó. Nhờ vậy sau khi nhập một ký tự chỉ số, ký tự tiếp theo chắc chắn
     * quay về kiểu chữ bình thường thay vì tiếp tục nằm trong chỉ số.
     */
    const normalTextNode = document.createTextNode("\u200B");

    parent.insertBefore(normalTextNode, node.nextSibling);

    const nextRange = document.createRange();

    nextRange.setStart(normalTextNode, normalTextNode.data.length);
    nextRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(nextRange);
    savedRangeRef.current = nextRange.cloneRange();
  }

  function executeCommand(command: string, commandValue?: string) {
    setPendingScript(null);
    restoreSelection();
    document.execCommand(command, false, commandValue);
    emitChange();
    saveSelection();
  }

  function insertHtml(html: string) {
    executeCommand("insertHTML", html);
  }

  function handleBlockFormat(nextFormat: string) {
    setBlockFormat(nextFormat);
    executeCommand(
      "formatBlock",
      nextFormat === "p" ? "<p>" : `<${nextFormat}>`,
    );
  }

  function handleScript(scriptTag: ScriptTag) {
    restoreSelection();

    const editor = editorRef.current;
    const selection = window.getSelection();

    if (!editor || !selection || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);

    if (!editor.contains(range.commonAncestorContainer)) {
      return;
    }

    /*
     * Khi người dùng đã bôi đen văn bản, áp dụng chỉ số trên/dưới ngay cho
     * phần được chọn. Khi chỉ có con trỏ, bật chế độ chờ: ký tự tiếp theo
     * sẽ được chèn dưới dạng sup/sub rồi tự quay về chữ bình thường.
     */
    if (!range.collapsed) {
      const wrapper = document.createElement(scriptTag);

      wrapper.appendChild(range.extractContents());
      range.insertNode(wrapper);
      setCaretAfterNode(wrapper);
      setPendingScript(null);
      emitChange();
      return;
    }

    savedRangeRef.current = range.cloneRange();
    setPendingScript((current) => (current === scriptTag ? null : scriptTag));
  }

  function insertPendingScriptText(textValue: string) {
    const editor = editorRef.current;

    if (!editor || !pendingScript || !textValue) {
      return;
    }

    restoreSelection();

    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);
    const wrapper = document.createElement(pendingScript);

    wrapper.textContent = textValue;
    range.deleteContents();
    range.insertNode(wrapper);
    setCaretAfterNode(wrapper);
    setPendingScript(null);
    emitChange();
  }

  function openImagePicker() {
    saveSelection();
    setPendingScript(null);
    setImageUploadError(null);
    imageInputRef.current?.click();
  }

  async function handleImageFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    // Cho phép chọn lại cùng một file ở lần sau.
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setImageUploadError("Vui lòng chọn đúng định dạng hình ảnh.");
      return;
    }

    const maxImageSize = 10 * 1024 * 1024;

    if (file.size > maxImageSize) {
      setImageUploadError("Hình ảnh không được vượt quá 10 MB.");
      return;
    }

    setIsUploadingImage(true);
    setImageUploadError(null);

    try {
      const formData = new FormData();

      // OpenAPI yêu cầu đúng field multipart là "image".
      formData.append("image", file);

      const response = await client.post<TeacherImageUploadResponse>(
        "/teacher/image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const imageUrl = response.data.image.url;

      if (!imageUrl) {
        throw new Error("API không trả về URL hình ảnh.");
      }

      insertHtml(
        `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(
          file.name,
        )}" /><p><br></p>`,
      );
    } catch (error) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof error.message === "string"
          ? error.message
          : "Không thể tải hình ảnh lên. Vui lòng thử lại.";

      setImageUploadError(message);
    } finally {
      setIsUploadingImage(false);
    }
  }

  function openInsertDialog(type: InsertDialogType) {
    saveSelection();
    setPendingScript(null);
    setDialogValue("");
    setTableRows("2");
    setTableColumns("2");
    setInsertDialog(type);
  }

  function closeInsertDialog() {
    setInsertDialog(null);
    setDialogValue("");
  }

  function handleInsertDialogConfirm() {
    if (insertDialog === "link") {
      const trimmedUrl = dialogValue.trim();

      if (!trimmedUrl) {
        return;
      }

      const normalizedUrl = /^(https?:|mailto:|tel:|#)/i.test(trimmedUrl)
        ? trimmedUrl
        : `https://${trimmedUrl}`;

      restoreSelection();

      const editor = editorRef.current;
      const selection = window.getSelection();
      const range =
        selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

      if (
        editor &&
        range &&
        editor.contains(range.commonAncestorContainer) &&
        !range.collapsed
      ) {
        document.execCommand("createLink", false, normalizedUrl);
        emitChange();
        saveSelection();
      } else {
        insertHtml(
          `<a href="${escapeHtml(
            normalizedUrl,
          )}" target="_blank" rel="noopener noreferrer">${escapeHtml(
            trimmedUrl,
          )}</a>&nbsp;`,
        );
      }

      closeInsertDialog();
      return;
    }

    if (insertDialog === "table") {
      const rows = Math.min(
        10,
        Math.max(1, Number.parseInt(tableRows, 10) || 2),
      );
      const columns = Math.min(
        10,
        Math.max(1, Number.parseInt(tableColumns, 10) || 2),
      );

      const tableBody = Array.from({ length: rows }, () => {
        const cells = Array.from(
          { length: columns },
          () => "<td><br></td>",
        ).join("");

        return `<tr>${cells}</tr>`;
      }).join("");

      insertHtml(`<table><tbody>${tableBody}</tbody></table><p><br></p>`);
      closeInsertDialog();
      return;
    }

    if (insertDialog === "formula") {
      const formula = dialogValue.trim();

      if (!formula) {
        return;
      }

      /*
       * Công thức được lưu cùng HTML của câu hỏi. Không cần API riêng.
       * data-formula giúp renderer phía học sinh nhận biết để render bằng
       * KaTeX/MathJax khi dự án tích hợp thư viện đó.
       */
      insertHtml(
        `<span data-formula="${escapeHtml(
          formula,
        )}" class="math-formula">${escapeHtml(formula)}</span>&nbsp;`,
      );
      closeInsertDialog();
    }
  }

  function getInsertDialogTitle(): string {
    switch (insertDialog) {
      case "link":
        return "Chèn liên kết";
      case "table":
        return "Chèn bảng";
      case "formula":
        return "Chèn công thức";
      default:
        return "";
    }
  }

  return (
    <div className="overflow-hidden rounded-[6px]">
      <div className="flex flex-wrap items-center gap-1 rounded-t-[6px] border border-b-0 border-[#CBD5E1] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#475569]">
        <select
          value={blockFormat}
          aria-label="Kiểu đoạn văn"
          onMouseDown={saveSelection}
          onChange={(event) => handleBlockFormat(event.target.value)}
          className="h-6 rounded border border-[#CBD5E1] bg-white px-1 text-[11px] font-medium text-[#1E293B] outline-none"
        >
          <option value="p">Normal</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
        </select>

        <div className="mx-0.5 h-4 w-px bg-[#CBD5E1]" />

        <ToolbarButton
          label="B"
          title="In đậm"
          className="font-bold"
          onClick={() => executeCommand("bold")}
        />
        <ToolbarButton
          label="I"
          title="In nghiêng"
          className="italic"
          onClick={() => executeCommand("italic")}
        />
        <ToolbarButton
          label="U"
          title="Gạch chân"
          className="underline"
          onClick={() => executeCommand("underline")}
        />

        <label
          title="Màu chữ"
          onMouseDown={saveSelection}
          className="flex h-6 cursor-pointer items-center rounded px-1.5 font-semibold text-[#3B82F6] hover:bg-[#E2E8F0]"
        >
          A
          <input
            type="color"
            aria-label="Chọn màu chữ"
            className="ml-1 size-3 cursor-pointer border-0 bg-transparent p-0"
            onChange={(event) =>
              executeCommand("foreColor", event.target.value)
            }
          />
        </label>

        <ToolbarButton
          label="x₂"
          title="Chỉ số dưới — bôi đen để áp dụng hoặc bấm rồi nhập ký tự tiếp theo"
          active={pendingScript === "sub"}
          onClick={() => handleScript("sub")}
        />
        <ToolbarButton
          label="x²"
          title="Chỉ số trên — bôi đen để áp dụng hoặc bấm rồi nhập ký tự tiếp theo"
          active={pendingScript === "sup"}
          onClick={() => handleScript("sup")}
        />

        <div className="mx-0.5 h-4 w-px bg-[#CBD5E1]" />

        <ToolbarButton
          label="“"
          title="Trích dẫn"
          onClick={() => executeCommand("formatBlock", "<blockquote>")}
        />
        <ToolbarButton
          label="</>"
          title="Khối mã nguồn"
          className="font-mono text-[11px]"
          onClick={() => executeCommand("formatBlock", "<pre>")}
        />

        <div className="mx-0.5 h-4 w-px bg-[#CBD5E1]" />

        <ToolbarButton
          label="•≡"
          title="Danh sách chấm"
          onClick={() => executeCommand("insertUnorderedList")}
        />
        <ToolbarButton
          label="1.≡"
          title="Danh sách số"
          onClick={() => executeCommand("insertOrderedList")}
        />

        <div className="mx-0.5 h-4 w-px bg-[#CBD5E1]" />

        <ToolbarButton
          label="🔗"
          title="Chèn liên kết"
          onClick={() => openInsertDialog("link")}
        />
        <ToolbarButton
          label={isUploadingImage ? "…" : "🖼️"}
          title={
            isUploadingImage ? "Đang tải hình ảnh lên" : "Chọn hình ảnh từ máy"
          }
          onClick={openImagePicker}
        />
        <ToolbarButton
          label="▦"
          title="Chèn bảng"
          onClick={() => openInsertDialog("table")}
        />
        <ToolbarButton
          label="fx"
          title="Chèn công thức"
          className="font-serif font-bold italic text-blue-600"
          onClick={() => openInsertDialog("formula")}
        />
      </div>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(event) => void handleImageFileChange(event)}
      />

      {pendingScript ? (
        <div className="border-x border-[#CBD5E1] bg-blue-50 px-3 py-1.5 text-[11px] font-medium text-blue-700">
          Đang nhập chỉ số {pendingScript === "sup" ? "trên" : "dưới"}. Ký tự
          tiếp theo sẽ được định dạng rồi tự trở về bình thường. Bấm lại nút
          hoặc nhấn Esc để hủy.
        </div>
      ) : null}

      {isUploadingImage ? (
        <div className="border-x border-[#CBD5E1] bg-amber-50 px-3 py-1.5 text-[11px] font-medium text-amber-700">
          Đang tải hình ảnh lên hệ thống...
        </div>
      ) : null}

      {imageUploadError ? (
        <div className="border-x border-[#CBD5E1] bg-rose-50 px-3 py-1.5 text-[11px] font-medium text-rose-700">
          {imageUploadError}
        </div>
      ) : null}

      <div
        ref={editorRef}
        role="textbox"
        aria-label={ariaLabel}
        aria-multiline="true"
        dir="ltr"
        contentEditable
        suppressContentEditableWarning
        spellCheck
        data-placeholder={placeholder}
        onBeforeInput={(event) => {
          const inputEvent = event.nativeEvent as InputEvent;

          if (
            pendingScript &&
            !isComposingRef.current &&
            inputEvent.inputType === "insertText" &&
            inputEvent.data
          ) {
            event.preventDefault();
            insertPendingScriptText(inputEvent.data);
          }
        }}
        onInput={() => {
          if (!isComposingRef.current) {
            emitChange();
          }

          saveSelection();
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape" && pendingScript) {
            event.preventDefault();
            setPendingScript(null);
          }
        }}
        onCompositionStart={() => {
          isComposingRef.current = true;
        }}
        onCompositionEnd={() => {
          isComposingRef.current = false;
          emitChange();
          saveSelection();
        }}
        onKeyUp={saveSelection}
        onMouseUp={saveSelection}
        onPointerUp={saveSelection}
        onSelect={saveSelection}
        onFocus={saveSelection}
        onBlur={emitChange}
        style={{
          direction: "ltr",
          unicodeBidi: "plaintext",
          textAlign: "left",
        }}
        className={cn(
          "w-full overflow-auto rounded-b-[6px] border border-[#CBD5E1] bg-white p-3 text-left text-xs leading-6 text-[#1E293B] outline-none transition-colors focus:border-[#8B5CF6]",
          "empty:before:pointer-events-none empty:before:text-[#94A3B8] empty:before:content-[attr(data-placeholder)]",
          "[&_a]:text-blue-600 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-3 [&_blockquote]:italic",
          "[&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-bold",
          "[&_h3]:text-lg [&_h3]:font-semibold [&_h4]:text-base [&_h4]:font-semibold [&_img]:max-w-full [&_img]:rounded",
          "[&_ol]:list-decimal [&_ol]:pl-5 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-slate-900 [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-white",
          "[&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-slate-300 [&_td]:p-2 [&_th]:border [&_th]:border-slate-300 [&_th]:p-2",
          "[&_ul]:list-disc [&_ul]:pl-5 [&_.math-formula]:rounded [&_.math-formula]:bg-blue-50 [&_.math-formula]:px-1.5 [&_.math-formula]:py-0.5 [&_.math-formula]:font-mono [&_.math-formula]:text-blue-700",
          minHeightClassName,
        )}
      />

      {insertDialog ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeInsertDialog();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={getInsertDialogTitle()}
            className="w-full max-w-md rounded-[10px] border border-[#DDE2EB] bg-white p-5 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-[#1E293B]">
                {getInsertDialogTitle()}
              </h3>
              <button
                type="button"
                onClick={closeInsertDialog}
                className="rounded px-2 py-1 text-sm text-[#64748B] hover:bg-[#F1F5F9]"
              >
                ×
              </button>
            </div>

            {insertDialog === "table" ? (
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1.5 text-xs font-semibold text-[#334155]">
                  <span>Số hàng</span>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={tableRows}
                    onChange={(event) => setTableRows(event.target.value)}
                    className="h-10 w-full rounded-[6px] border border-[#CBD5E1] px-3 outline-none focus:border-[#6366F1]"
                  />
                </label>
                <label className="space-y-1.5 text-xs font-semibold text-[#334155]">
                  <span>Số cột</span>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={tableColumns}
                    onChange={(event) => setTableColumns(event.target.value)}
                    className="h-10 w-full rounded-[6px] border border-[#CBD5E1] px-3 outline-none focus:border-[#6366F1]"
                  />
                </label>
              </div>
            ) : (
              <label className="block space-y-1.5 text-xs font-semibold text-[#334155]">
                <span>
                  {insertDialog === "link" ? "Đường dẫn" : "Công thức"}
                </span>
                <input
                  autoFocus
                  type={insertDialog === "link" ? "url" : "text"}
                  value={dialogValue}
                  placeholder={
                    insertDialog === "formula"
                      ? "Ví dụ: x^2 + y^2 = z^2"
                      : "https://..."
                  }
                  onChange={(event) => setDialogValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleInsertDialogConfirm();
                    }

                    if (event.key === "Escape") {
                      closeInsertDialog();
                    }
                  }}
                  className="h-10 w-full rounded-[6px] border border-[#CBD5E1] px-3 font-normal outline-none focus:border-[#6366F1]"
                />
              </label>
            )}

            {insertDialog === "formula" ? (
              <p className="mt-2 text-[11px] leading-5 text-[#64748B]">
                Công thức được lưu trong HTML. Để hiển thị toán học đẹp ở màn
                hình học sinh, renderer nên tích hợp KaTeX hoặc MathJax.
              </p>
            ) : null}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeInsertDialog}
                className="h-9 rounded-[6px] border border-[#CBD5E1] bg-white px-4 text-xs font-semibold text-[#334155] hover:bg-[#F8FAFC]"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleInsertDialogConfirm}
                className="h-9 rounded-[6px] bg-[#3F63F3] px-4 text-xs font-semibold text-white hover:bg-[#3451D1]"
              >
                Chèn
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function QuestionBuilderStep({
  hideFooter = false,
  isSavingDraft = false,
  onSaveDraft,
  requestedQuestionIndex,
  requestedQuestionRequestKey = 0,
  validationMessage,
}: {
  hideFooter?: boolean;
  isSavingDraft?: boolean;
  onSaveDraft?: (values: TeacherExamFormValues) => Promise<void>;
  requestedQuestionIndex?: number | null;
  requestedQuestionRequestKey?: number;
  validationMessage?: string | null;
}) {
  const { values, resetForm, setFieldValue } =
    useFormikContext<TeacherExamFormValues>();
  const rootRef = useRef<HTMLDivElement>(null);
  const [footerLeft, setFooterLeft] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(() =>
    Math.max(0, values.questions.length - 1),
  );
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [saveNotice, setSaveNotice] = useState<{
    message: string;
    tone: "success" | "draft" | "error";
  } | null>(null);
  const [optionNotice, setOptionNotice] = useState<{
    questionClientId: string;
    optionClientId: string;
    message: string;
  } | null>(null);
  const saveNoticeTimeoutRef = useRef<number | null>(null);
  const optionNoticeTimeoutRef = useRef<number | null>(null);
  const [pendingDeleteQuestion, setPendingDeleteQuestion] = useState<{
    id: string;
    index: number;
  } | null>(null);

  useEffect(() => {
    if (
      requestedQuestionIndex === undefined ||
      requestedQuestionIndex === null ||
      values.questions.length === 0
    ) {
      return;
    }

    const nextIndex = Math.min(
      Math.max(0, requestedQuestionIndex),
      values.questions.length - 1,
    );

    let animationFrameId: number | null = null;

    const timeoutId = window.setTimeout(() => {
      setSelectedIndex(nextIndex);

      animationFrameId = window.requestAnimationFrame(() => {
        rootRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

        const questionEditor = rootRef.current?.querySelector<HTMLElement>(
          `[aria-label="Nội dung câu hỏi ${nextIndex + 1}"]`,
        );

        questionEditor?.focus();
      });
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);

      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [
    requestedQuestionIndex,
    requestedQuestionRequestKey,
    values.questions.length,
  ]);

  const safeIndex = Math.min(
    Math.max(0, selectedIndex),
    Math.max(0, values.questions.length - 1),
  );
  const activeQuestion = values.questions[safeIndex];

  useEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    const mainElement =
      root.closest<HTMLElement>("main") ??
      document.querySelector<HTMLElement>("main");

    const sidebarElement = document.querySelector<HTMLElement>(
      '[data-sidebar="sidebar"], [data-slot="sidebar"], aside',
    );

    function updateFooterLeft() {
      const mainLeft = mainElement?.getBoundingClientRect().left ?? 0;
      const sidebarRight = sidebarElement?.getBoundingClientRect().right ?? 0;

      /*
       * Ưu tiên mép trái của vùng <main>. Nếu layout dùng sidebar fixed
       * phủ lên main, dùng mép phải của sidebar làm giá trị dự phòng.
       */
      const nextLeft = mainLeft > 0 ? mainLeft : Math.max(0, sidebarRight);

      setFooterLeft(Math.round(nextLeft));
    }

    updateFooterLeft();

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updateFooterLeft)
        : null;

    if (mainElement) {
      resizeObserver?.observe(mainElement);
    }

    if (sidebarElement) {
      resizeObserver?.observe(sidebarElement);
    }

    window.addEventListener("resize", updateFooterLeft);
    document.addEventListener("transitionend", updateFooterLeft, true);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateFooterLeft);
      document.removeEventListener("transitionend", updateFooterLeft, true);
    };
  }, []);

  useEffect(() => {
    /*
     * Khi thanh thao tác cố định của bước xây dựng câu hỏi đang hiển thị,
     * đường phân cách ở footer của sidebar nằm cùng cao độ sẽ bị thừa.
     * Chỉ ẩn các đường viền ở sát đáy sidebar và khôi phục khi rời bước.
     */
    const sidebar = document.querySelector<HTMLElement>(
      '[data-sidebar="sidebar"], [data-slot="sidebar"], aside',
    );

    if (!sidebar) {
      return;
    }

    const candidates = Array.from(
      sidebar.querySelectorAll<HTMLElement>(
        '[data-sidebar="footer"], [data-slot="sidebar-footer"], footer, [class*="border-t"]',
      ),
    ).filter((element) => {
      const rect = element.getBoundingClientRect();

      return rect.bottom >= window.innerHeight - 180;
    });

    const previousStyles = candidates.map((element) => ({
      element,
      borderTop: element.style.borderTop,
      borderTopColor: element.style.borderTopColor,
      boxShadow: element.style.boxShadow,
    }));

    candidates.forEach((element) => {
      element.style.borderTop = "0";
      element.style.borderTopColor = "transparent";
      element.style.boxShadow = "none";
    });

    return () => {
      previousStyles.forEach(
        ({ element, borderTop, borderTopColor, boxShadow }) => {
          element.style.borderTop = borderTop;
          element.style.borderTopColor = borderTopColor;
          element.style.boxShadow = boxShadow;
        },
      );
    };
  }, []);

  useEffect(() => {
    return () => {
      if (saveNoticeTimeoutRef.current !== null) {
        window.clearTimeout(saveNoticeTimeoutRef.current);
      }

      if (optionNoticeTimeoutRef.current !== null) {
        window.clearTimeout(optionNoticeTimeoutRef.current);
      }
    };
  }, []);

  function showSaveNotice(
    message: string,
    tone: "success" | "draft" | "error" = "success",
  ) {
    if (saveNoticeTimeoutRef.current !== null) {
      window.clearTimeout(saveNoticeTimeoutRef.current);
    }

    setSaveNotice({ message, tone });

    saveNoticeTimeoutRef.current = window.setTimeout(() => {
      setSaveNotice(null);
      saveNoticeTimeoutRef.current = null;
    }, 3200);
  }

  function showOptionNotice(optionClientId: string, message: string) {
    if (optionNoticeTimeoutRef.current !== null) {
      window.clearTimeout(optionNoticeTimeoutRef.current);
    }

    setOptionNotice({
      questionClientId: activeQuestion?.client_id ?? "",
      optionClientId,
      message,
    });

    optionNoticeTimeoutRef.current = window.setTimeout(() => {
      setOptionNotice(null);
      optionNoticeTimeoutRef.current = null;
    }, 3200);
  }

  function handleSaveQuestion() {
    showSaveNotice(`Đã lưu câu hỏi ${safeIndex + 1} trong biểu mẫu`, "success");
  }

  async function persistDraft(): Promise<void> {
    if (!onSaveDraft) {
      throw new Error("Chức năng lưu nháp chưa được cấu hình.");
    }

    await onSaveDraft(values);

    /*
     * Đánh dấu toàn bộ dữ liệu hiện tại là trạng thái đã lưu.
     * Sau khi lưu nháp thành công, người dùng có thể rời trang mà không bị
     * cảnh báo mất thay đổi. Các chỉnh sửa phát sinh sau đó vẫn làm form dirty.
     */
    resetForm({ values });
  }

  async function handleSaveDraft() {
    if (isSavingDraft) {
      return;
    }

    try {
      await persistDraft();
      showSaveNotice("Đã lưu đề thi dưới dạng bản nháp", "draft");
    } catch (error) {
      const message =
        error instanceof Error && error.message.trim()
          ? error.message
          : "Không thể lưu bản nháp. Vui lòng thử lại.";

      showSaveNotice(message, "error");
    }
  }

  async function handleSaveAndCreateNext() {
    if (isSavingDraft) {
      return;
    }

    const savedQuestionNumber = safeIndex + 1;
    const nextQuestionNumber = values.questions.length + 1;

    try {
      await persistDraft();

      const nextQuestion = createEmptyQuestion(
        undefined,
        values.questions.length + 1,
      );
      const updatedQuestions = [...values.questions, nextQuestion];

      await setFieldValue("questions", updatedQuestions);
      setSelectedIndex(updatedQuestions.length - 1);

      showSaveNotice(
        `Đã lưu nháp câu ${savedQuestionNumber}, đang tạo câu ${nextQuestionNumber}`,
        "success",
      );
    } catch (error) {
      const message =
        error instanceof Error && error.message.trim()
          ? error.message
          : "Không thể lưu bản nháp. Vui lòng thử lại.";

      showSaveNotice(message, "error");
    }
  }

  function handleAddQuestion() {
    const nextQuestion = createEmptyQuestion(
      undefined,
      values.questions.length + 1,
    );
    const updatedQuestions = [...values.questions, nextQuestion];

    void setFieldValue("questions", updatedQuestions);
    setSelectedIndex(updatedQuestions.length - 1);
  }

  function handleRemoveQuestion(indexToRemove: number) {
    const updatedQuestions = reindexTeacherExamQuestions(
      values.questions.filter((_, index) => index !== indexToRemove),
    );

    void setFieldValue("questions", updatedQuestions);

    if (safeIndex >= updatedQuestions.length) {
      setSelectedIndex(Math.max(0, updatedQuestions.length - 1));
    }
  }

  function handleQuestionTypeChange(newType: TeacherExamQuestionType) {
    if (!activeQuestion) {
      return;
    }

    const updatedQuestion = applyTeacherExamQuestionType(
      activeQuestion,
      newType,
    );
    const nextQuestions = [...values.questions];

    nextQuestions[safeIndex] = updatedQuestion;
    void setFieldValue("questions", nextQuestions);
  }

  function handleAddOption() {
    if (!activeQuestion || activeQuestion.question_type === "true_false") {
      return;
    }

    const updatedOptions = reindexTeacherExamOptions([
      ...activeQuestion.options,
      createEmptyOption(false),
    ]);

    void setFieldValue(`questions.${safeIndex}.options`, updatedOptions);
  }

  function handleRemoveOption(optionIndex: number) {
    if (!activeQuestion || activeQuestion.question_type === "true_false") {
      return;
    }

    /*
     * Backend và validation yêu cầu câu lựa chọn có tối thiểu 2 đáp án.
     * Nút xóa vẫn luôn hiển thị để bố cục nhất quán, nhưng khi chỉ còn
     * 2 đáp án thì không cho xóa thêm.
     */
    if (activeQuestion.options.length <= 2) {
      const selectedOption = activeQuestion.options[optionIndex];

      if (selectedOption) {
        showOptionNotice(
          selectedOption.client_id,
          "Phải giữ tối thiểu 2 đáp án",
        );
      }

      return;
    }

    const updatedOptions = reindexTeacherExamOptions(
      activeQuestion.options.filter((_, index) => index !== optionIndex),
    );

    void setFieldValue(`questions.${safeIndex}.options`, updatedOptions);
    setOptionNotice(null);
  }

  function handleSetSingleCorrect(optionId: string) {
    if (!activeQuestion) {
      return;
    }

    const updatedOptions = activeQuestion.options.map((option) => ({
      ...option,
      is_correct: option.client_id === optionId,
    }));

    void setFieldValue(`questions.${safeIndex}.options`, updatedOptions);
  }

  function handleToggleMultipleCorrect(optionId: string) {
    if (!activeQuestion) {
      return;
    }

    const updatedOptions = activeQuestion.options.map((option) =>
      option.client_id === optionId
        ? {
            ...option,
            is_correct: !option.is_correct,
          }
        : option,
    );

    void setFieldValue(`questions.${safeIndex}.options`, updatedOptions);
  }

  function handleAddAcceptedAnswer() {
    if (!activeQuestion) {
      return;
    }

    const currentAnswers =
      activeQuestion.accepted_answers.length > 0
        ? activeQuestion.accepted_answers
        : [""];

    void setFieldValue(`questions.${safeIndex}.accepted_answers`, [
      ...currentAnswers,
      "",
    ]);
  }

  function handleRemoveAcceptedAnswer(answerIndex: number) {
    if (!activeQuestion) {
      return;
    }

    const nextAnswers = activeQuestion.accepted_answers.filter(
      (_, index) => index !== answerIndex,
    );

    void setFieldValue(
      `questions.${safeIndex}.accepted_answers`,
      nextAnswers.length > 0 ? nextAnswers : [""],
    );
  }

  const activeQuestionType = activeQuestion
    ? normalizeTeacherExamQuestionType(activeQuestion.question_type)
    : "single_choice";
  const isMultipleChoice = activeQuestionType === "multiple_choice";
  const isChoiceQuestion = isChoiceQuestionType(activeQuestionType);
  const isAcceptedAnswerQuestion =
    isAcceptedAnswerQuestionType(activeQuestionType);
  const isEssayQuestion = isEssayQuestionType(activeQuestionType);

  return (
    <div
      ref={rootRef}
      className={cn(
        "grid grid-cols-1 items-start gap-5 lg:grid-cols-12",
        hideFooter ? "pb-4" : "pb-20",
      )}
    >
      <div className="lg:sticky lg:top-4 lg:col-span-4 lg:self-start">
        <div className="space-y-4 rounded-[10px] border border-[#DDE2EB] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1E293B]">
              Danh sách câu hỏi
            </span>
            <span className="text-xs font-semibold text-[#64748B]">
              {values.questions.length} câu
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleAddQuestion}
              className="flex items-center gap-1 rounded-[6px] bg-[#3F63F3] px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#3451D1]"
            >
              <Plus className="size-3.5" />
              <span>Thêm câu hỏi</span>
            </button>

            <button
              type="button"
              onClick={() => setIsTextModalOpen(true)}
              className="flex cursor-pointer items-center gap-1 rounded-[6px] bg-[#3F63F3] px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#3451D1]"
            >
              <FileText className="size-3.5" />
              <span>Thêm bằng văn bản</span>
            </button>
          </div>

          <div className="flex max-h-[calc(100vh-18rem)] flex-wrap gap-1.5 overflow-y-auto pt-1 pr-1 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar]:w-1">
            {values.questions.length === 0 ? (
              <div className="my-4 w-full text-center text-xs font-medium text-[#94A3B8]">
                Không tìm thấy câu hỏi nào!
              </div>
            ) : (
              values.questions.map((question, index) => {
                const isSelected = index === safeIndex;

                return (
                  <button
                    key={question.client_id}
                    type="button"
                    onClick={() => setSelectedIndex(index)}
                    className={cn(
                      "flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[4px] text-xs font-bold transition-all",
                      isSelected
                        ? "bg-[#3F63F3] text-white shadow-sm"
                        : "border border-[#CBD5E1] bg-white text-[#475569] hover:bg-[#F8FAFC]",
                    )}
                  >
                    {index + 1}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-8">
        <div className="space-y-3.5 rounded-[10px] border border-[#DDE2EB] bg-white p-4.5 shadow-xs">
          {values.questions.length === 0 ? (
            <div className="my-16 space-y-3 text-center">
              <p className="text-sm font-semibold text-[#64748B]">
                Chưa có câu hỏi nào trong đề thi
              </p>
              <Button
                type="button"
                onClick={handleAddQuestion}
                className="bg-[#3F63F3] text-xs font-bold text-white hover:bg-[#3451D1]"
              >
                <Plus className="mr-1.5 size-4" />
                Tạo câu hỏi mới ngay
              </Button>
            </div>
          ) : activeQuestion ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 flex-wrap items-center gap-2.5">
                  <h2 className="text-sm font-bold text-[#1E293B]">
                    Thêm câu hỏi mới (Câu {safeIndex + 1})
                  </h2>

                  {saveNotice ? (
                    <span
                      role="status"
                      aria-live="polite"
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                        saveNotice.tone === "success"
                          ? "bg-emerald-50 text-emerald-700"
                          : saveNotice.tone === "draft"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-rose-50 text-rose-700",
                      )}
                    >
                      {saveNotice.tone === "success" ? (
                        <CheckCircle2 className="size-3.5" />
                      ) : saveNotice.tone === "draft" ? (
                        <Save className="size-3.5" />
                      ) : (
                        <CircleAlert className="size-3.5" />
                      )}
                      {saveNotice.message}
                    </span>
                  ) : null}

                  {validationMessage ? (
                    <span
                      role="alert"
                      aria-live="assertive"
                      className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700"
                    >
                      <CircleAlert className="size-3.5 shrink-0" />
                      <span>{validationMessage}</span>
                    </span>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setPendingDeleteQuestion({
                      id: activeQuestion.client_id,
                      index: safeIndex,
                    })
                  }
                  title="Xoá câu hỏi hiện tại"
                  className="flex cursor-pointer items-center gap-1 text-xs font-bold text-rose-600 transition-colors hover:text-rose-700"
                >
                  <Trash2 className="size-3.5" />
                  <span>Xoá câu hỏi</span>
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#1E293B]">
                  Loại câu hỏi
                </label>
                <div className="relative w-full max-w-xs sm:w-72">
                  <select
                    value={activeQuestionType}
                    onChange={(event) =>
                      handleQuestionTypeChange(
                        event.target.value as TeacherExamQuestionType,
                      )
                    }
                    className="block w-full cursor-pointer appearance-none rounded-[6px] border border-[#CBD5E1] bg-white py-1.5 pr-8 pl-3 text-xs font-semibold text-[#1E293B] outline-none transition-colors focus:border-[#3F63F3]"
                  >
                    {QUESTION_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-[#64748B]" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1E293B]">
                  Soạn câu hỏi
                </label>
                <RichTextEditor
                  key={`${activeQuestion.client_id}-prompt`}
                  value={activeQuestion.prompt}
                  onChange={(nextValue) =>
                    void setFieldValue(
                      `questions.${safeIndex}.prompt`,
                      nextValue,
                    )
                  }
                  placeholder="Nhập nội dung câu hỏi"
                  ariaLabel={`Nội dung câu hỏi ${safeIndex + 1}`}
                  minHeightClassName="min-h-28"
                />
              </div>

              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-[#1E293B]">
                  Câu trả lời
                </label>

                {isChoiceQuestion ? (
                  <>
                    {activeQuestion.options.map((option, optionIndex) => (
                      <div key={option.client_id} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-[#1E293B]">
                            <input
                              type={isMultipleChoice ? "checkbox" : "radio"}
                              name={`question-${safeIndex}-correct`}
                              checked={option.is_correct}
                              onChange={() => {
                                if (isMultipleChoice) {
                                  handleToggleMultipleCorrect(option.client_id);
                                } else {
                                  handleSetSingleCorrect(option.client_id);
                                }
                              }}
                              className="size-4 cursor-pointer accent-[#3B82F6]"
                            />
                            <span>
                              {option.option_key ||
                                String.fromCharCode(65 + optionIndex)}
                              . Đáp án {optionIndex + 1}
                            </span>
                          </label>

                          {activeQuestionType !== "true_false" ? (
                            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                              {optionNotice?.questionClientId ===
                                activeQuestion.client_id &&
                              optionNotice.optionClientId ===
                                option.client_id ? (
                                <span
                                  role="status"
                                  aria-live="polite"
                                  className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700"
                                >
                                  <CircleAlert className="size-3.5" />
                                  {optionNotice.message}
                                </span>
                              ) : null}

                              <button
                                type="button"
                                onClick={() => handleRemoveOption(optionIndex)}
                                title={
                                  activeQuestion.options.length <= 2
                                    ? "Câu hỏi phải có tối thiểu 2 đáp án"
                                    : `Xoá đáp án ${optionIndex + 1}`
                                }
                                aria-disabled={
                                  activeQuestion.options.length <= 2
                                }
                                className={cn(
                                  "flex shrink-0 items-center gap-1 rounded-[6px] px-2 py-1 text-xs font-bold transition-colors",
                                  activeQuestion.options.length > 2
                                    ? "cursor-pointer text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                                    : "cursor-pointer text-slate-400 hover:bg-amber-50 hover:text-amber-700",
                                )}
                              >
                                <Trash2 className="size-3.5" />
                                <span>Xoá đáp án</span>
                              </button>
                            </div>
                          ) : null}
                        </div>

                        <RichTextEditor
                          key={`${option.client_id}-text`}
                          value={option.option_text}
                          onChange={(nextValue) =>
                            void setFieldValue(
                              `questions.${safeIndex}.options.${optionIndex}.option_text`,
                              nextValue,
                            )
                          }
                          placeholder="Nhập nội dung đáp án"
                          ariaLabel={`Nội dung đáp án ${
                            optionIndex + 1
                          } của câu ${safeIndex + 1}`}
                          minHeightClassName="min-h-20"
                        />
                      </div>
                    ))}

                    {activeQuestionType !== "true_false" ? (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={handleAddOption}
                          className="flex cursor-pointer items-center gap-1.5 rounded-[6px] bg-gradient-to-r from-[#FF758C] to-[#FF7EB3] px-4 py-2 text-xs font-bold text-white shadow-xs transition-opacity hover:opacity-90"
                        >
                          <Plus className="size-3.5 stroke-[3]" />
                          <span>Thêm đáp án</span>
                        </button>
                      </div>
                    ) : null}
                  </>
                ) : null}

                {isAcceptedAnswerQuestion ? (
                  <>
                    <p className="text-[11px] leading-5 text-[#64748B]">
                      Nhập các đáp án được chấp nhận. Hệ thống dùng danh sách
                      này để đối chiếu câu trả lời của học sinh.
                    </p>

                    {(activeQuestion.accepted_answers.length > 0
                      ? activeQuestion.accepted_answers
                      : [""]
                    ).map((answer, answerIndex) => (
                      <div
                        key={`${activeQuestion.client_id}-accepted-${answerIndex}`}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="text"
                          value={answer}
                          placeholder={`Đáp án chấp nhận ${answerIndex + 1}`}
                          onChange={(event) =>
                            void setFieldValue(
                              `questions.${safeIndex}.accepted_answers.${answerIndex}`,
                              event.target.value,
                            )
                          }
                          className="h-10 min-w-0 flex-1 rounded-[6px] border border-[#CBD5E1] bg-white px-3 text-xs text-[#1E293B] outline-none transition-colors focus:border-[#8B5CF6]"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveAcceptedAnswer(answerIndex)
                          }
                          disabled={activeQuestion.accepted_answers.length <= 1}
                          className="rounded-[6px] border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Xoá
                        </button>
                      </div>
                    ))}

                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={handleAddAcceptedAnswer}
                        className="flex cursor-pointer items-center gap-1.5 rounded-[6px] bg-gradient-to-r from-[#FF758C] to-[#FF7EB3] px-4 py-2 text-xs font-bold text-white shadow-xs transition-opacity hover:opacity-90"
                      >
                        <Plus className="size-3.5 stroke-[3]" />
                        <span>Thêm đáp án chấp nhận</span>
                      </button>
                    </div>
                  </>
                ) : null}

                {isEssayQuestion ? (
                  <div className="rounded-[8px] border border-blue-200 bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-700">
                    Học sinh sẽ nhập câu trả lời dạng văn bản. Loại tự luận
                    không sử dụng danh sách đáp án đúng; giáo viên xem nội dung
                    bài làm trong phần kết quả.
                  </div>
                ) : null}
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-[#1E293B]">
                  Giải thích
                </label>
                <RichTextEditor
                  key={`${activeQuestion.client_id}-explanation`}
                  value={activeQuestion.explanation}
                  onChange={(nextValue) =>
                    void setFieldValue(
                      `questions.${safeIndex}.explanation`,
                      nextValue,
                    )
                  }
                  placeholder="Nhập nội dung giải thích đáp án"
                  ariaLabel={`Giải thích câu hỏi ${safeIndex + 1}`}
                  minHeightClassName="min-h-24"
                />
              </div>
            </>
          ) : null}
        </div>
      </div>

      {!hideFooter ? (
        <div
          className="fixed bottom-0 right-0 z-[60] border-t border-[#DDE2EB] bg-white/95 px-5 py-2 shadow-[0_-8px_24px_rgba(15,23,42,0.10)] backdrop-blur-md"
          style={{ left: footerLeft }}
        >
          <div className="flex min-h-10 items-center justify-end">
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleSaveQuestion}
                className="h-9 cursor-pointer rounded-[6px] bg-gradient-to-r from-[#4867F8] to-[#B72CF2] px-5 text-xs font-bold text-white shadow-sm transition-opacity hover:opacity-95"
              >
                Lưu câu hỏi
              </button>

              <button
                type="button"
                onClick={() => void handleSaveDraft()}
                disabled={isSavingDraft}
                className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-[6px] border border-[#CBD5E1] bg-white px-5 text-xs font-bold text-[#334155] shadow-sm transition-colors hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingDraft ? (
                  <LoaderCircle className="size-3.5 animate-spin" />
                ) : (
                  <Save className="size-3.5" />
                )}
                {isSavingDraft ? "Đang lưu..." : "Lưu nháp"}
              </button>

              <button
                type="button"
                onClick={() => void handleSaveAndCreateNext()}
                disabled={isSavingDraft}
                className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-[6px] bg-gradient-to-r from-[#4867F8] to-[#C62CF2] px-5 text-xs font-bold text-white shadow-sm transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingDraft ? (
                  <LoaderCircle className="size-3.5 animate-spin" />
                ) : null}
                {isSavingDraft ? "Đang lưu..." : "Lưu nháp và tiếp tục tạo mới"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <QuestionDeleteDialog
        open={pendingDeleteQuestion !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDeleteQuestion(null);
          }
        }}
        onConfirm={() => {
          if (!pendingDeleteQuestion) {
            return;
          }

          handleRemoveQuestion(pendingDeleteQuestion.index);
          setPendingDeleteQuestion(null);
        }}
      />

      <TextBatchModal
        open={isTextModalOpen}
        onClose={() => setIsTextModalOpen(false)}
        onImport={(newQuestions) => {
          const updatedQuestions = reindexTeacherExamQuestions([
            ...values.questions,
            ...newQuestions,
          ]);

          void setFieldValue("questions", updatedQuestions);
          setSelectedIndex(Math.max(0, updatedQuestions.length - 1));
        }}
      />
    </div>
  );
}
