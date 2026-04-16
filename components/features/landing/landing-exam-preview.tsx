import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ExamCard } from '@/components/features/exam/exam-card';
import { mockExams } from '@/data/mock/mock-exams';

export function LandingExamPreview() {
  const featuredExams = mockExams.slice(0, 4);

  return (
    <section className="py-16 md:py-24 px-6 bg-surface">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-10">
          <span className="inline-block px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-semibold tracking-wide mb-3">
            ĐỀ THI NỔI BẬT
          </span>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-on-surface mb-3">
            Khám phá đề thi chất lượng
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
            Hàng nghìn đề thi được biên soạn kỹ lưỡng bởi các giáo viên có kinh nghiệm,
            phù hợp với chương trình GDPT mới.
          </p>
        </div>

        {/* Exam grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {featuredExams.map((exam) => (
            <ExamCard key={exam.id} exam={exam} compact />
          ))}
        </div>

        {/* View all link */}
        <div className="text-center">
          <Link
            href="/exams"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-container-lowest text-on-surface text-sm font-semibold hover:bg-surface-container-low transition-colors shadow-sm"
          >
            Xem tất cả đề thi
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}