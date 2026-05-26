'use client';

import { motion } from 'framer-motion';
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Reveal,
  fadeUpVariants,
  staggerContainer,
} from '@/components/features/landing/landing-motion';

const exams = [
  {
    title: 'Kiểm tra giữa kỳ Toán 11',
    status: 'Đang diễn ra',
    participants: '128 học sinh',
    progress: 82,
  },
  {
    title: 'Ôn tập Ngữ văn 12',
    status: 'Sắp bắt đầu',
    participants: '64 học sinh',
    progress: 46,
  },
  {
    title: 'Trắc nghiệm Vật lý chương 3',
    status: 'Đã chấm điểm',
    participants: '92 học sinh',
    progress: 100,
  },
] as const;

const classrooms = [
  {
    name: 'Lớp ReactJS nâng cao',
    students: '36 học sinh',
    documents: '12 tài liệu',
  },
  {
    name: 'Lớp Toán nền tảng 10',
    students: '42 học sinh',
    documents: '18 tài liệu',
  },
  {
    name: 'Lớp Ôn thi THPT',
    students: '55 học sinh',
    documents: '24 tài liệu',
  },
] as const;

const documents = [
  { title: 'Giải tích cơ bản', scope: 'Hệ thống' },
  { title: 'Tài liệu React Hooks', scope: 'Lớp học' },
  { title: 'Ngân hàng câu hỏi Hóa học', scope: 'Hệ thống' },
] as const;

const performance = [
  { label: 'Điểm trung bình', value: '8.6/10', progress: 86 },
  { label: 'Tỷ lệ hoàn thành', value: '94%', progress: 94 },
  { label: 'Học sinh đúng hạn', value: '88%', progress: 88 },
] as const;

const chartPoints = [48, 72, 66, 92, 84, 110, 126] as const;

export function LandingDashboardPreview() {
  return (
    <section id="dashboard" className="px-4 py-16 sm:px-6 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <Reveal className="mb-10 max-w-3xl space-y-4">
          <Badge variant="info" className="w-fit rounded-full px-4 py-1">
            Bảng điều khiển mô phỏng
          </Badge>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-on-surface sm:text-4xl">
            Giao diện quản trị giúp người dùng hiểu ngay điều gì đang diễn ra.
          </h2>
          <p className="text-sm leading-7 text-muted-foreground sm:text-base">
            Từ bài thi, lớp học, tài liệu đến hiệu suất học sinh, mọi thông tin
            quan trọng đều được đóng gói trong một bảng điều khiển giàu dữ liệu
            nhưng vẫn dễ đọc trên cả máy tính lẫn điện thoại.
          </p>
        </Reveal>

        <motion.div
          className="grid gap-6 xl:grid-cols-[1.25fr_0.85fr]"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.18 }}
          variants={staggerContainer}
        >
          <motion.div
            variants={fadeUpVariants}
            className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-[0_28px_90px_rgba(7,30,39,0.1)] backdrop-blur-xl"
          >
            <div className="border-b border-border/40 px-6 py-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-primary">
                    Không gian quản lý tập trung
                  </p>
                  <h3 className="font-display text-2xl font-semibold text-on-surface">
                    Bảng điều khiển lớp học và học liệu
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-sky-200/70 bg-sky-50 px-4 py-3 text-sm text-sky-700">
                    <p className="font-semibold">24 lớp đang hoạt động</p>
                    <p className="mt-1 text-sky-600">Tăng 18% trong 30 ngày</p>
                  </div>
                  <div className="hidden rounded-2xl border border-emerald-200/70 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 lg:block">
                    <p className="font-semibold">96% tài liệu đã đồng bộ</p>
                    <p className="mt-1 text-emerald-600">Không có lệch dữ liệu</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-5">
                <div className="rounded-[1.5rem] border border-border/50 bg-surface-container-low p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                        <LayoutDashboard className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-on-surface">Bài thi gần đây</p>
                        <p className="text-sm text-muted-foreground">
                          Theo dõi trạng thái và tiến độ làm bài
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="rounded-full">
                      Hôm nay
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {exams.map((exam) => (
                      <div
                        key={exam.title}
                        className="rounded-[1.25rem] border border-white/80 bg-white/85 p-4 shadow-sm"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-semibold text-on-surface">{exam.title}</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {exam.participants}
                            </p>
                          </div>
                          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                            {exam.status}
                          </span>
                        </div>
                        <div className="mt-4 h-2 rounded-full bg-primary/10">
                          <div
                            className="h-full rounded-full bg-linear-to-r from-primary to-sky-400"
                            style={{ width: `${exam.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-border/50 bg-white/85 p-5">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="rounded-2xl bg-violet-500/10 p-3 text-violet-700">
                      <BarChart3 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-on-surface">Biểu đồ hoạt động</p>
                      <p className="text-sm text-muted-foreground">
                        Số lượt truy cập và tương tác học tập trong tuần
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 items-end gap-3">
                    {chartPoints.map((point, index) => (
                      <div key={`${point}-${index}`} className="space-y-3">
                        <div className="flex h-36 items-end rounded-[1.25rem] bg-sky-100/60 p-2">
                          <div
                            className="w-full rounded-[1rem] bg-linear-to-t from-primary via-sky-400 to-cyan-300"
                            style={{ height: `${point}px` }}
                          />
                        </div>
                        <p className="text-center text-xs font-medium text-muted-foreground">
                          T{index + 2}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-[1.5rem] border border-border/50 bg-surface-container-low p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-700">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-on-surface">Tài liệu gần đây</p>
                      <p className="text-sm text-muted-foreground">
                        Học liệu mới được chia sẻ trong hệ thống
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {documents.map((document) => (
                      <div
                        key={document.title}
                        className="rounded-[1.25rem] border border-white/80 bg-white/85 p-4"
                      >
                        <p className="font-semibold text-on-surface">{document.title}</p>
                        <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                          <span>{document.scope}</span>
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-border/50 bg-white/85 p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-700">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-on-surface">Hiệu suất học sinh</p>
                      <p className="text-sm text-muted-foreground">
                        Chỉ số tổng hợp theo thời gian thực
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {performance.map((item) => (
                      <div key={item.label} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className="font-semibold text-on-surface">{item.value}</span>
                        </div>
                        <div className="h-2 rounded-full bg-primary/10">
                          <div
                            className="h-full rounded-full bg-linear-to-r from-primary to-emerald-400"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUpVariants} className="space-y-6">
            <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_28px_80px_rgba(7,30,39,0.1)] backdrop-blur-xl">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-on-surface">Lớp học nổi bật</p>
                  <p className="text-sm text-muted-foreground">
                    Không gian học tập được tổ chức rõ ràng
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {classrooms.map((classroom) => (
                  <motion.div
                    key={classroom.name}
                    whileHover={{ y: -4, scale: 1.01 }}
                    className="rounded-[1.4rem] border border-border/40 bg-surface-container-low p-4"
                  >
                    <p className="font-semibold text-on-surface">{classroom.name}</p>
                    <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                      <span>{classroom.students}</span>
                      <span>{classroom.documents}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-[1.75rem] border border-white/70 bg-sky-50/90 p-5">
                <div className="flex items-center gap-3">
                  <Clock3 className="h-5 w-5 text-sky-700" />
                  <div>
                    <p className="font-semibold text-sky-900">Tiết kiệm thời gian</p>
                    <p className="text-sm text-sky-700">
                      Tạo đề, xuất bản tài liệu và theo dõi lớp học ngay trong
                      một luồng làm việc duy nhất.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-white/70 bg-emerald-50/90 p-5">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-emerald-700" />
                  <div>
                    <p className="font-semibold text-emerald-900">Học liệu đồng bộ</p>
                    <p className="text-sm text-emerald-700">
                      Dữ liệu tài liệu, bài thi và lớp học được kết nối chặt chẽ
                      để người dùng không bị rời mạch thao tác.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
