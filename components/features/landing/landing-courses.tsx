import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';

const courses = [
  {
    title: 'Toán học 12 - Luyện thi THPT Quốc gia',
    category: 'Luyện thi',
    lessons: '45 đề thi',
    duration: '90 ngày',
    attempts: '120 lượt làm',
    price: 'Miễn phí',
    image: '/images/landing/course-math.webp',
    teacher: 'Thầy Nguyễn Văn Thành',
  },
  {
    title: 'Tiếng Anh giao tiếp và luyện thi IELTS',
    category: 'Ngoại ngữ',
    lessons: '35 đề thi',
    duration: '60 ngày',
    attempts: '85 lượt làm',
    price: '50 QuizzCoin',
    image: '/images/landing/about-teacher.webp',
    teacher: 'Cô Lê Thị Mai',
  },
  {
    title: 'Khoa học tự nhiên và đánh giá năng lực',
    category: 'Đánh giá năng lực',
    lessons: '50 đề thi',
    duration: '120 ngày',
    attempts: '150 lượt làm',
    price: '100 QuizzCoin',
    image: '/images/landing/about-students.webp',
    teacher: 'Thầy Trần Quốc Bảo',
  },
] as const;

export function LandingCourses() {
  return (
    <section id="courses" className="border-t border-[#e5e7eb] bg-white py-20 md:py-28">
      <div className="mx-auto max-w-[1280px] px-5 md:px-8">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e55a3b]/25 px-4 py-2 text-xs font-bold text-[#e55a3b]">
              <BookOpen className="h-4 w-4" />
              Kho đề thi ôn luyện
            </div>
            <h2 className="mt-4 max-w-[760px] text-3xl font-extrabold leading-tight text-[#111827] sm:text-4xl">
              Danh mục khóa học và đề ôn luyện nổi bật
            </h2>
          </div>
          <Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-[#e55a3b] hover:underline">
            Xem tất cả khóa học
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-7 md:grid-cols-3">
          {courses.map((course) => (
            <Link
              key={course.title}
              href="/login"
              className="group overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-[0_18px_50px_rgba(17,24,39,0.12)]"
            >
              <div className="relative h-48 overflow-hidden rounded-xl bg-[#f8fafc]">
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute left-3 top-3 rounded-md bg-white/90 px-2.5 py-1 text-[10px] font-extrabold uppercase text-[#e55a3b] shadow-sm backdrop-blur">
                  {course.category}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2 border-b border-[#e5e7eb] pb-3 text-[11px] font-bold text-[#6b7280]">
                <span>{course.duration}</span><span aria-hidden>•</span>
                <span>{course.lessons}</span><span aria-hidden>•</span>
                <span>{course.attempts}</span>
              </div>
              <h3 className="mt-4 min-h-12 text-base font-extrabold leading-6 text-[#111827] transition-colors group-hover:text-[#e55a3b]">
                {course.title}
              </h3>
              <p className="mt-2 text-xs leading-6 text-[#6b7280]">
                Ngân hàng câu hỏi bám sát chương trình, hỗ trợ đánh giá năng lực và theo dõi tiến độ học tập.
              </p>
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#e5e7eb] pt-4">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e55a3b]/10 text-xs font-bold text-[#e55a3b]">
                    {course.teacher.includes('Cô') ? 'C' : 'T'}
                  </span>
                  <span className="truncate text-xs font-bold text-[#4b5563]">{course.teacher}</span>
                </div>
                <span className="shrink-0 text-sm font-extrabold text-[#e55a3b]">{course.price}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
