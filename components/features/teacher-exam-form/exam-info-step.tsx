"use client";

import { useFormikContext } from "formik";
import { Info, X, ChevronDown, Upload, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { InputField } from "@/components/common/form/input-field";
import { TextareaField } from "@/components/common/form/textarea-field";
import { DateTimePicker } from "@/components/common/form/date-time-picker";
import type { TeacherExamFormValues } from "./types";
import { cn } from "@/lib/utils";

const GRADE_OPTIONS = [
  "Đại học",
  "Cao học",
  "Cao đẳng",
  "Trung học phổ thông",
  "Trung học cơ sở",
  "Tiểu học",
  "Trung tâm đào tạo",
  "Doanh nghiệp",
];

const SCHOOL_OPTIONS = [
  "Đại học Bách Khoa",
  "Đại học Quốc Gia",
  "Đại học Kinh tế",
  "Đại học Sư phạm",
  "Đại học Y Dược",
  "Khác",
];

const SUBJECT_OPTIONS = [
  "Toán học",
  "Tiếng Anh",
  "Vật lý",
  "Hóa học",
  "Tin học",
  "Ngữ văn",
  "Sinh học",
  "Lịch sử",
  "Khác",
];

const TOPIC_OPTIONS = [
  "Ôn thi THPT",
  "Ngữ pháp",
  "Từ vựng",
  "Lý thuyết cơ bản",
  "Bài tập nâng cao",
  "Khác",
];

const PRESET_IMAGES = [
  "/image/hình tạo đề 1.jpeg",
  "/image/hình tạo đề 2.jpeg",
  "/image/hình tạo đề 3.jpeg",
  "/image/hình tạo đề 4.jpeg",
];

interface TagComboboxProps {
  label: string;
  required?: boolean;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  options: string[];
  errorMessage?: string;
  className?: string;
}

function normalizeCustomOption(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function TagCombobox({
  label,
  required,
  value,
  onChange,
  placeholder,
  options,
  errorMessage,
  className,
}: TagComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updateMenuPosition = useCallback(() => {
    const trigger = triggerRef.current;

    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();

    setMenuPosition({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  const openMenu = useCallback(() => {
    updateMenuPosition();
    setIsOpen(true);
  }, [updateMenuPosition]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      const clickedInsideTrigger =
        containerRef.current?.contains(target) ?? false;
      const clickedInsideMenu = menuRef.current?.contains(target) ?? false;

      if (!clickedInsideTrigger && !clickedInsideMenu) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    function handleViewportChange() {
      updateMenuPosition();
    }

    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [isOpen, updateMenuPosition]);

  const filteredOptions = useMemo(() => {
    const keyword = inputValue.trim().toLocaleLowerCase("vi");

    if (!keyword) return options;

    return options.filter((option) =>
      option.toLocaleLowerCase("vi").includes(keyword),
    );
  }, [inputValue, options]);

  const menu =
    isOpen && menuPosition && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: menuPosition.top,
              left: menuPosition.left,
              width: menuPosition.width,
            }}
            className="z-[9999] max-h-48 overflow-y-auto rounded-[6px] border border-[#CBD5E1] bg-white py-1 shadow-lg [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    onChange(option);
                    setInputValue("");
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-1.5 text-left text-xs text-[#1E293B] hover:bg-[#F1F5F9]",
                    value === option && "bg-[#F1F5F9] font-bold text-[#8B5CF6]",
                  )}
                >
                  <span className="truncate">{option}</span>
                </button>
              ))
            ) : (
              <button
                type="button"
                onClick={() => {
                  const customValue = normalizeCustomOption(inputValue);

                  if (!customValue) return;

                  onChange(customValue);
                  setInputValue("");
                  setIsOpen(false);
                }}
                className="w-full px-3 py-1.5 text-left text-xs font-medium text-[#8B5CF6] hover:bg-[#F1F5F9]"
              >
                + Thêm &quot;{inputValue}&quot;
              </button>
            )}
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={containerRef} className={cn("relative space-y-1", className)}>
      <label className="block text-xs font-bold text-[#1E293B]">
        {label} {required ? <span className="text-rose-500">*</span> : null}
      </label>

      <div
        ref={triggerRef}
        role="combobox"
        aria-expanded={isOpen}
        tabIndex={0}
        onClick={() => {
          if (!isOpen) openMenu();
        }}
        onKeyDown={(event) => {
          const target = event.target;

          const isTypingElement =
            target instanceof HTMLInputElement ||
            target instanceof HTMLTextAreaElement ||
            (target instanceof HTMLElement && target.isContentEditable);

          if (isTypingElement) {
            return;
          }

          if (
            event.key === "Enter" ||
            event.key === " " ||
            event.key === "ArrowDown"
          ) {
            event.preventDefault();
            openMenu();
          }

          if (event.key === "Escape") {
            setIsOpen(false);
          }
        }}
        className={cn(
          "flex h-9 min-h-9 w-full cursor-pointer items-center justify-between gap-1.5 rounded-[6px] border bg-white px-2 py-1 text-xs outline-none transition-colors",
          errorMessage
            ? "border-rose-500 focus-within:border-rose-500"
            : "border-[#CBD5E1] focus-within:border-[#8B5CF6]",
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
          {value ? (
            <span className="inline-flex max-w-[88%] shrink-0 items-center gap-1 rounded border border-[#CBD5E1] bg-[#F1F5F9] px-1.5 py-0.5 text-[11px] font-medium text-[#334155]">
              <span className="truncate">{value}</span>

              <button
                type="button"
                aria-label={`Xóa ${label}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onChange("");
                  setInputValue("");
                  setIsOpen(false);
                }}
                className="shrink-0 rounded-full p-0.5 text-[#94A3B8] hover:bg-[#E2E8F0] hover:text-[#475569] focus:outline-none"
              >
                <X className="size-3" />
              </button>
            </span>
          ) : (
            <input
              type="text"
              value={inputValue}
              onFocus={openMenu}
              onClick={(event) => {
                event.stopPropagation();
                openMenu();
              }}
              onChange={(event) => {
                setInputValue(event.target.value);

                if (!isOpen) {
                  openMenu();
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  const customValue = normalizeCustomOption(inputValue);

                  if (!customValue) {
                    return;
                  }

                  event.preventDefault();
                  event.stopPropagation();

                  onChange(customValue);
                  setInputValue("");
                  setIsOpen(false);
                }

                if (event.key === "Escape") {
                  setIsOpen(false);
                }
              }}
              placeholder={placeholder}
              className="min-w-[60px] flex-1 bg-transparent text-xs text-[#1E293B] outline-none placeholder:text-[#94A3B8]"
            />
          )}
        </div>

        <button
          type="button"
          aria-label={isOpen ? "Đóng danh sách" : "Mở danh sách"}
          onClick={(event) => {
            event.stopPropagation();

            if (isOpen) {
              setIsOpen(false);
            } else {
              openMenu();
            }
          }}
          className="shrink-0 rounded p-0.5 text-[#64748B] hover:bg-[#F1F5F9]"
        >
          <ChevronDown
            className={cn(
              "size-3.5 transition-transform",
              isOpen && "rotate-180",
            )}
          />
        </button>
      </div>

      {errorMessage ? (
        <p className="text-[11px] font-medium text-rose-500">{errorMessage}</p>
      ) : null}

      {menu}
    </div>
  );
}

function getFieldError(
  error: unknown,
  touched: unknown,
  submitCount: number,
): string | undefined {
  return (submitCount > 0 || Boolean(touched)) && typeof error === "string"
    ? error
    : undefined;
}

export function ExamInfoStep() {
  const {
    values,
    errors,
    touched,
    setFieldValue,
    setFieldTouched,
    submitCount,
  } = useFormikContext<TeacherExamFormValues>();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageCleared, setImageCleared] = useState(false);

  useEffect(() => {
    // Only auto-assign the first preset if never set (initial load) and user hasn't manually cleared it
    if (!values.image_url && !imageCleared) {
      void setFieldValue("image_url", PRESET_IMAGES[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          void setFieldValue("image_url", event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  type GradeParts = {
    grade: string;
    school: string;
    subject: string;
    topic: string;
  };

  function hasOption(options: readonly string[], value: string) {
    const normalizedValue = value.trim().toLocaleLowerCase("vi");

    return options.some(
      (option) => option.trim().toLocaleLowerCase("vi") === normalizedValue,
    );
  }

  const gradeParts = useMemo<GradeParts>(() => {
    const rawValue = values.grade?.trim() ?? "";

    if (!rawValue) {
      return {
        grade: "",
        school: "",
        subject: "",
        topic: "",
      };
    }

    /*
     * Chuỗi mới có thể chứa ô trống ở giữa, ví dụ:
     * "Lớp 12 -  - Toán học"
     *
     * Khi có ô trống, phải giữ đúng vị trí để Môn học không bị
     * đọc nhầm thành Trường học.
     */
    const positionalParts = rawValue.split(" - ").map((part) => part.trim());

    if (positionalParts.some((part) => part === "")) {
      return {
        grade: positionalParts[0] ?? "",
        school: positionalParts[1] ?? "",
        subject: positionalParts[2] ?? "",
        topic: positionalParts[3] ?? "",
      };
    }

    /*
     * Tương thích dữ liệu cũ đã bị rút gọn, ví dụ:
     * "Lớp 12 - Toán học"
     *
     * "Toán học" phải được nhận diện là Môn học, không phải Trường học.
     */
    const legacyParts = positionalParts.filter(Boolean);
    const nextParts: GradeParts = {
      grade: legacyParts[0] ?? "",
      school: "",
      subject: "",
      topic: "",
    };

    for (const part of legacyParts.slice(1)) {
      const isSchool = hasOption(SCHOOL_OPTIONS, part);
      const isSubject = hasOption(SUBJECT_OPTIONS, part);
      const isTopic = hasOption(TOPIC_OPTIONS, part);
      const isOther = part.toLocaleLowerCase("vi") === "khác";

      if (!nextParts.school && isSchool && !isOther) {
        nextParts.school = part;
        continue;
      }

      if (!nextParts.subject && isSubject && !isOther) {
        nextParts.subject = part;
        continue;
      }

      if (!nextParts.topic && isTopic && !isOther) {
        nextParts.topic = part;
        continue;
      }

      if (!nextParts.school) {
        nextParts.school = part;
      } else if (!nextParts.subject) {
        nextParts.subject = part;
      } else if (!nextParts.topic) {
        nextParts.topic = part;
      }
    }

    return nextParts;
  }, [values.grade]);

  function updateGradeParts(patch: Partial<GradeParts>) {
    const nextParts: GradeParts = {
      ...gradeParts,
      ...patch,
    };

    const slots = [
      nextParts.grade.trim(),
      nextParts.school.trim(),
      nextParts.subject.trim(),
      nextParts.topic.trim(),
    ];

    /*
     * Chỉ bỏ các ô trống ở cuối. Ô trống ở giữa phải được giữ lại,
     * nếu không Môn học sẽ lại nhảy sang Trường học.
     */
    let lastFilledIndex = slots.length - 1;

    while (lastFilledIndex >= 0 && !slots[lastFilledIndex]) {
      lastFilledIndex -= 1;
    }

    const serializedValue =
      lastFilledIndex >= 0
        ? slots.slice(0, lastFilledIndex + 1).join(" - ")
        : "";

    void setFieldValue("grade", serializedValue);
    void setFieldTouched("grade", true, false);
  }

  function updateGradePart(key: keyof GradeParts, value: string) {
    updateGradeParts({ [key]: value });
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 items-stretch">
      {/* Column 1: Ảnh đề thi (3 cols) */}
      <div className="lg:col-span-3 space-y-3 rounded-[10px] border border-[#DDE2EB] bg-white p-4 shadow-xs flex flex-col justify-between">
        <div className="space-y-2">
          <h3 className="font-bold text-sm text-[#1E293B]">Ảnh đề thi</h3>

          {/* Big Preview Image Box */}
          <div className="relative group aspect-4/3 w-full overflow-hidden rounded-[6px] border border-[#CBD5E1] bg-[#F8FAFC]">
            {values.image_url ? (
              <>
                <img
                  src={values.image_url}
                  alt={values.title || "Ảnh đề thi"}
                  className="h-full w-full object-cover"
                />

                {/* Hover Delete Trash Overlay */}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-start p-2.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageCleared(true);
                      void setFieldValue("image_url", "");
                    }}
                    className="flex items-center gap-1 rounded-[6px] bg-[#DC2626] px-2 py-1 text-[11px] font-bold text-white shadow hover:bg-rose-700 transition-colors"
                    title="Xoá ảnh"
                  >
                    <Trash2 className="size-3.5" />
                    <span>Xoá ảnh</span>
                  </button>
                </div>
              </>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex h-full flex-col items-center justify-center p-4 text-center cursor-pointer hover:bg-[#F1F5F9] transition-colors"
              >
                <Upload className="size-8 text-[#94A3B8] mb-2" />
                <span className="text-xs text-[#64748B] font-medium">
                  Nhấp để chọn ảnh từ máy tính
                </span>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          <p
            onClick={() => fileInputRef.current?.click()}
            className="text-center text-[11px] text-[#64748B] cursor-pointer hover:text-[#8B5CF6] transition-colors"
          >
            Tải ảnh lên hoặc chọn ảnh đề thi
          </p>

          {/* Preset Thumbnail Selector */}
          <div className="space-y-1.5 pt-1">
            <p className="text-xs font-semibold text-[#1E293B]">
              Chọn ảnh đại diện
            </p>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_IMAGES.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => void setFieldValue("image_url", img)}
                  className={cn(
                    "aspect-square overflow-hidden rounded-[6px] border-2 cursor-pointer transition-all hover:opacity-90",
                    values.image_url === img
                      ? "border-[#3F63F3] ring-2 ring-[#3F63F3]/20"
                      : "border-transparent",
                  )}
                >
                  <img
                    src={img}
                    alt={`Preset ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Column 2: Thông tin cơ bản (5 cols) */}
      <div className="lg:col-span-5 space-y-3 rounded-[10px] border border-[#DDE2EB] bg-white p-4 shadow-xs flex flex-col justify-between">
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-[#1E293B]">Thông tin cơ bản</h3>

          {/* Tên đề thi * */}
          <InputField
            label="Tên đề thi"
            required
            value={values.title}
            onChange={(event) =>
              void setFieldValue("title", event.target.value)
            }
            error={getFieldError(errors.title, touched.title, submitCount)}
            placeholder="Nhập tên đề thi"
          />

          {/* Row 1: Trình độ * & Trường học * (z-20) */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 relative z-20">
            <TagCombobox
              label="Trình độ"
              required
              value={gradeParts.grade}
              onChange={(val) => updateGradePart("grade", val)}
              placeholder="Chọn trình độ"
              options={GRADE_OPTIONS}
              errorMessage={
                submitCount > 0 && !gradeParts.grade
                  ? "Trình độ là bắt buộc."
                  : undefined
              }
            />

            <TagCombobox
              label="Trường học"
              required
              value={gradeParts.school}
              onChange={(val) => updateGradePart("school", val)}
              placeholder="Chọn trường học"
              options={SCHOOL_OPTIONS}
            />
          </div>

          {/* Row 2: Môn học & Chủ đề (z-10) */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 relative z-10">
            <TagCombobox
              label="Môn học"
              value={gradeParts.subject}
              onChange={(val) =>
                updateGradeParts({
                  subject: val,
                  topic: "",
                })
              }
              placeholder="Chọn Môn học"
              options={SUBJECT_OPTIONS}
            />

            <TagCombobox
              label="Chủ đề"
              value={gradeParts.topic}
              onChange={(val) => updateGradePart("topic", val)}
              placeholder="Chọn Chủ đề"
              options={TOPIC_OPTIONS}
            />
          </div>

          {/* Mô tả */}
          <TextareaField
            label="Mô tả"
            value={values.description}
            onChange={(event) =>
              void setFieldValue("description", event.target.value)
            }
            error={getFieldError(
              errors.description,
              touched.description,
              submitCount,
            )}
            placeholder="Nhập mô tả đề thi"
            rows={5}
          />
        </div>
      </div>

      {/* Column 3: Cấu hình truy cập (4 cols) */}
      <div className="lg:col-span-4 space-y-3 rounded-[10px] border border-[#DDE2EB] bg-white p-4 shadow-xs flex flex-col justify-between">
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-[#1E293B]">
            Cấu hình truy cập
          </h3>

          {/* Blue Info Banner */}
          <div className="flex items-center gap-2.5 rounded-[6px] bg-[#0284C7] px-3 py-2 text-xs text-white shadow-xs">
            <Info className="size-4 shrink-0" />
            <span>Cấu hình này chỉ áp dụng khi truy cập ôn thi</span>
          </div>

          {/* Phạm vi chia sẻ * */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#1E293B]">
              Phạm vi chia sẻ <span className="text-rose-500">*</span>
            </label>
            <select
              value={values.scope}
              onChange={(e) => {
                const scopeVal = e.target.value;
                setFieldValue("scope", scopeVal);
                if (scopeVal === "public") {
                  setFieldValue("is_published", true);
                  setFieldValue("is_active", true);
                } else if (scopeVal === "private") {
                  setFieldValue("is_published", false);
                  setFieldValue("is_active", true);
                } else if (scopeVal === "unlisted") {
                  setFieldValue("is_published", true);
                  setFieldValue("is_active", false);
                }
              }}
              className="h-9 w-full rounded-[6px] border border-[#CBD5E1] bg-white px-2.5 text-xs text-[#1E293B] outline-none focus:border-[#8B5CF6] cursor-pointer"
            >
              <option value="private">Riêng tư</option>
              <option value="public">Công khai</option>
              <option value="unlisted">Không công khai</option>
            </select>
            <p className="text-[11px] text-[#64748B]">
              Chỉ mình bạn và thành viên được chia sẻ mới có thể truy cập đề thi
            </p>
          </div>

          {/* Thời lượng */}
          <InputField
            label="Thời lượng (phút)"
            required
            type="number"
            min={1}
            value={values.duration_minutes}
            onChange={(event) =>
              void setFieldValue("duration_minutes", Number(event.target.value))
            }
            error={getFieldError(
              errors.duration_minutes,
              touched.duration_minutes,
              submitCount,
            )}
            placeholder="45"
          />

          {/* Thời gian bắt đầu */}
          <DateTimePicker
            label="Thời gian bắt đầu"
            value={values.start_time}
            onChange={(value) => void setFieldValue("start_time", value)}
            onBlur={() => void setFieldTouched("start_time", true)}
            error={getFieldError(
              errors.start_time,
              touched.start_time,
              submitCount,
            )}
          />

          {/* Thời gian kết thúc */}
          <DateTimePicker
            label="Thời gian kết thúc"
            value={values.end_time}
            onChange={(value) => void setFieldValue("end_time", value)}
            onBlur={() => void setFieldTouched("end_time", true)}
            error={getFieldError(
              errors.end_time,
              touched.end_time,
              submitCount,
            )}
          />
        </div>
      </div>
    </div>
  );
}
