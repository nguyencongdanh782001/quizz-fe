"use client";

import { useEffect, useMemo, useState } from "react";
import { GraduationCap, Search, Sparkles, Users } from "lucide-react";
import { ClassCard } from "@/components/features/class/class-card";
import { getStudentClasses, joinStudentClass } from "@/lib/student-classes";
import type { ClassInfo } from "@/types/class.types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHero } from "@/components/shared/page-hero";
import { SurfacePanel } from "@/components/shared/surface-panel";
import { AppEmptyState } from "@/components/shared/empty-state";

const ALL_GRADES = "__all_grades__";

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [joinCode, setJoinCode] = useState("");
  const [isJoiningClass, setIsJoiningClass] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinSuccess, setJoinSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [grade, setGrade] = useState<number | "">("");

  useEffect(() => {
    let isMounted = true;

    async function loadClasses() {
      try {
        const joinedClasses = await getStudentClasses();

        if (!isMounted) {
          return;
        }

        setClasses(joinedClasses);
      } finally {
        if (isMounted) {
          setIsLoadingClasses(false);
        }
      }
    }

    void loadClasses();

    return () => {
      isMounted = false;
    };
  }, []);

  const gradeOptions = useMemo(
    () =>
      Array.from(
        new Set(classes.map((cls) => cls.grade).filter((g) => g > 0)),
      ).sort((a, b) => a - b),
    [classes],
  );

  const filtered = classes.filter((cls) => {
    if (search && !cls.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (grade && cls.grade !== grade) return false;
    return true;
  });

  async function handleJoinClass(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedJoinCode = joinCode.trim().toUpperCase();

    if (!normalizedJoinCode) {
      setJoinError("Vui lòng nhập mã vào lớp.");
      setJoinSuccess(null);
      return;
    }

    setIsJoiningClass(true);
    setJoinError(null);
    setJoinSuccess(null);

    try {
      const joinedClass = await joinStudentClass(normalizedJoinCode);

      setClasses((current) => {
        const withoutDuplicate = current.filter(
          (cls) => cls.id !== joinedClass.id,
        );
        return [joinedClass, ...withoutDuplicate];
      });
      setJoinCode("");
      setJoinSuccess(`Đã tham gia lớp ${joinedClass.name}.`);
    } catch (error) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof error.message === "string"
          ? error.message
          : "Không thể tham gia lớp học. Vui lòng thử lại.";

      setJoinError(message);
    } finally {
      setIsJoiningClass(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Không gian lớp học"
        title="Lớp học của tôi"
        description="Theo dõi lớp học đang tham gia, nhập mã lớp mới và tìm nhanh những không gian học tập phù hợp với bạn."
        icon={Sparkles}
        actions={
          <Button asChild variant="outline" size="lg">
            <a href="#tham-gia-lop">Nhập mã lớp ngay</a>
          </Button>
        }
        metrics={[
          {
            label: "Lớp đã tham gia",
            value: isLoadingClasses ? "--" : classes.length,
            description: "Các lớp học bạn đang theo dõi trên hệ thống.",
            icon: GraduationCap,
            tone: "primary",
          },
          {
            label: "Khối lớp hiện có",
            value: gradeOptions.length || "--",
            description: "Số nhóm khối lớp xuất hiện trong danh sách của bạn.",
            icon: Users,
            tone: "secondary",
          },
        ]}
      />

      <SurfacePanel className="p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Users className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className="font-display font-semibold text-lg text-on-surface">
              Tham gia lớp bằng mã
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Nhập mã lớp do giáo viên cung cấp để thêm lớp học vào tài khoản
              của bạn.
            </p>

            <form
              onSubmit={(event) => void handleJoinClass(event)}
              className="mt-4 flex flex-col gap-3 sm:flex-row"
            >
              <Input
                type="text"
                placeholder="Ví dụ: IT01"
                value={joinCode}
                onChange={(event) =>
                  setJoinCode(event.target.value.toUpperCase())
                }
                className="h-12 rounded-2xl border-outline/15 bg-background sm:flex-1"
                maxLength={30}
              />
              <Button type="submit" size="lg" disabled={isJoiningClass}>
                {isJoiningClass ? "Đang tham gia..." : "Tham gia lớp"}
              </Button>
            </form>

            {joinError && (
              <p className="mt-3 text-sm text-red-600">{joinError}</p>
            )}

            {joinSuccess && (
              <p className="mt-3 text-sm text-green-600">{joinSuccess}</p>
            )}
          </div>
        </div>
      </SurfacePanel>

      <SurfacePanel tone="muted" className="flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm kiếm lớp học..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 rounded-2xl border-outline/15 bg-surface-container-lowest pl-10 pr-4 shadow-none"
          />
        </div>
        <Select
          value={grade === "" ? ALL_GRADES : String(grade)}
          onValueChange={(value) =>
            setGrade(value === ALL_GRADES ? "" : Number(value))
          }
        >
          <SelectTrigger className="h-12 w-45 rounded-2xl border-outline/15 bg-surface-container-lowest shadow-none">
            <SelectValue placeholder="Tất cả khối" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value={ALL_GRADES}>Tất cả khối</SelectItem>
            {gradeOptions.map((g) => (
              <SelectItem key={g} value={String(g)}>
                Lớp {g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SurfacePanel>

      {isLoadingClasses ? (
        <SurfacePanel className="text-sm text-muted-foreground">
          Đang tải lớp học...
        </SurfacePanel>
      ) : filtered.length === 0 ? (
        <AppEmptyState
          icon={GraduationCap}
          title={
            classes.length === 0
              ? "Bạn chưa tham gia lớp học nào"
              : "Không tìm thấy lớp học nào"
          }
          description={
            classes.length === 0
              ? "Hãy nhập mã lớp để bắt đầu theo dõi hoạt động học tập cùng giáo viên."
              : "Thử thay đổi từ khóa hoặc bộ lọc để tìm lớp học phù hợp."
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((cls) => (
            <ClassCard key={cls.id} cls={cls} />
          ))}
        </div>
      )}
    </div>
  );
}
