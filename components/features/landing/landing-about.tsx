import Image from 'next/image';
import Link from 'next/link';
import { Award, Check, Sparkles } from 'lucide-react';

const benefits = [
  'Tạo đề thi AI theo chủ đề, cấp lớp và mức độ khó',
  'Tự động chấm điểm, xáo trộn đề và theo dõi kết quả',
  'Kết nối lớp học, học liệu và bài thi trên cùng hệ thống',
] as const;

export function LandingAbout() {
  return (
    <>
      <section id="about" className="bg-white py-20 md:py-28">
        <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-5 md:px-8 lg:grid-cols-2">
          <div className="grid h-[420px] grid-cols-2 gap-4 sm:h-[470px] sm:gap-5">
            <div className="relative overflow-hidden rounded-xl border border-[#e5e7eb] bg-[#f8fafc]">
              <Image
                src="/images/landing/about-teacher.webp"
                alt="Giáo viên hướng dẫn học sinh"
                fill
                sizes="(max-width: 1024px) 45vw, 300px"
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
            <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
              <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-[#fceddd] bg-[#fff7f0] p-5 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e55a3b] text-white">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="mt-3 text-base font-extrabold text-[#111827]">Tạo đề thi AI</h3>
                <p className="mt-1 text-xs leading-5 text-[#6b7280]">
                  Biên soạn nhiều loại câu hỏi và chấm điểm ngay trên một quy trình.
                </p>
              </div>
              <div className="relative h-[205px] overflow-hidden rounded-xl rounded-br-[52px] border border-[#e5e7eb] bg-[#f8fafc] sm:h-[225px]">
                <Image
                  src="/images/landing/about-students.webp"
                  alt="Nhóm học sinh trao đổi bài học"
                  fill
                  sizes="(max-width: 1024px) 45vw, 300px"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e55a3b]/30 bg-[#fff7f0] px-4 py-2 text-sm font-bold text-[#e55a3b]">
              <Sparkles className="h-4 w-4" />
              Giới thiệu QuizzVN
            </div>
            <h2 className="mt-6 text-3xl font-extrabold leading-tight text-[#111827] sm:text-4xl">
              Nền tảng kiểm tra cho tất cả
              <span className="mt-1 block text-[#e55a3b]">Nâng tầm thế hệ học sinh Việt</span>
            </h2>
            <p className="mt-6 text-base leading-8 text-[#6b7280]">
              QuizzVN giúp giáo viên giảm thời gian biên soạn, tổ chức thi và tổng hợp kết quả; đồng thời cho học sinh một không gian ôn luyện rõ ràng, dễ tiếp cận.
            </p>
            <ul className="mt-6 space-y-4">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3 text-sm font-semibold leading-6 text-[#111827]">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 stroke-[3] text-[#e55a3b]" />
                  {benefit}
                </li>
              ))}
            </ul>
            <Link
              href="/login"
              className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-[#e55a3b] px-7 text-base font-bold text-white transition-colors hover:bg-[#d4492a]"
            >
              Khám phá ngay
            </Link>
          </div>
        </div>
      </section>

      <section className="relative flex min-h-[440px] items-center overflow-hidden bg-[#111827] py-20 text-white md:min-h-[520px]">
        <Image
          src="/images/landing/future-learning.jpeg"
          alt="Không gian học tập số hiện đại"
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-linear-to-r from-black/60 via-black/25 to-transparent" />
        <div className="relative z-10 mx-auto w-full max-w-[1280px] px-5 md:px-8">
          <div className="max-w-[600px]">
            <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl lg:text-[44px]">
              Chuẩn bị cho tương lai học tập bắt đầu từ giáo dục số
            </h2>
            <p className="mt-6 text-base font-medium leading-8 text-gray-100">
              QuizzVN cung cấp lộ trình ôn luyện và kiểm tra toàn diện, giúp học sinh nắm vững kiến thức trọng tâm và sẵn sàng cho các kỳ thi lớn.
            </p>
            <Link
              href="/login"
              className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-[#e55a3b] px-7 text-sm font-bold text-white transition hover:bg-[#d4492a]"
            >
              Tìm hiểu thêm
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
