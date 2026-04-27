'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, Users } from 'lucide-react';
import { ClassCard } from '@/components/features/class/class-card';
import { getStudentClasses, joinStudentClass } from '@/lib/student-classes';
import type { ClassInfo } from '@/types/class.types';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ALL_GRADES = '__all_grades__';

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [isJoiningClass, setIsJoiningClass] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinSuccess, setJoinSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [grade, setGrade] = useState<number | ''>('');

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
      Array.from(new Set(classes.map((cls) => cls.grade).filter((g) => g > 0))).sort(
        (a, b) => a - b,
      ),
    [classes],
  );

  const filtered = classes.filter((cls) => {
    if (search && !cls.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (grade && cls.grade !== grade) return false;
    return true;
  });

  async function handleJoinClass(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedJoinCode = joinCode.trim().toUpperCase();

    if (!normalizedJoinCode) {
      setJoinError('Vui lòng nhập mã vào lớp.');
      setJoinSuccess(null);
      return;
    }

    setIsJoiningClass(true);
    setJoinError(null);
    setJoinSuccess(null);

    try {
      const joinedClass = await joinStudentClass(normalizedJoinCode);

      setClasses((current) => {
        const withoutDuplicate = current.filter((cls) => cls.id !== joinedClass.id);
        return [joinedClass, ...withoutDuplicate];
      });
      setJoinCode('');
      setJoinSuccess(`Đã tham gia lớp ${joinedClass.name}.`);
    } catch (error) {
      const message =
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof error.message === 'string'
          ? error.message
          : 'Không thể tham gia lớp học. Vui lòng thử lại.';

      setJoinError(message);
    } finally {
      setIsJoiningClass(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-on-surface mb-1">
          Lớp học của tôi
        </h1>
        <p className="text-sm text-muted-foreground">
          {classes.length} lớp đã tham gia
        </p>
      </div>

      <section className="rounded-2xl border border-outline/10 bg-surface-container-lowest p-5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Users className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className="font-display font-semibold text-lg text-on-surface">
              Tham gia lớp bằng mã
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Nhập mã lớp do giáo viên cung cấp để thêm lớp học vào tài khoản của
              bạn.
            </p>

            <form
              onSubmit={(event) => void handleJoinClass(event)}
              className="mt-4 flex flex-col gap-3 sm:flex-row"
            >
              <Input
                type="text"
                placeholder="Ví dụ: IT01"
                value={joinCode}
                onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                className="h-12 rounded-2xl border-outline/15 bg-background sm:flex-1"
                maxLength={30}
              />
              <button
                type="submit"
                disabled={isJoiningClass}
                className="h-12 rounded-2xl bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {isJoiningClass ? 'Đang tham gia...' : 'Tham gia lớp'}
              </button>
            </form>

            {joinError && (
              <p className="mt-3 text-sm text-red-600">{joinError}</p>
            )}

            {joinSuccess && (
              <p className="mt-3 text-sm text-green-600">{joinSuccess}</p>
            )}
          </div>
        </div>
      </section>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm kiếm lớp học..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-12 rounded-2xl border-outline/15 bg-surface-container-lowest pl-10 pr-4 shadow-none"
          />
        </div>
        <Select
          value={grade === '' ? ALL_GRADES : String(grade)}
          onValueChange={value => setGrade(value === ALL_GRADES ? '' : Number(value))}
        >
          <SelectTrigger className="h-12 w-[180px] rounded-2xl border-outline/15 bg-surface-container-lowest shadow-none">
            <SelectValue placeholder="Tất cả khối" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value={ALL_GRADES}>Tất cả khối</SelectItem>
            {gradeOptions.map(g => (
              <SelectItem key={g} value={String(g)}>
                Lớp {g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoadingClasses ? (
        <div className="rounded-2xl border border-outline/10 bg-surface-container-lowest p-6 text-sm text-muted-foreground">
          Đang tải lớp học...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">
            {classes.length === 0
              ? 'Bạn chưa tham gia lớp học nào'
              : 'Không tìm thấy lớp học nào'}
          </p>
        </div>
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
