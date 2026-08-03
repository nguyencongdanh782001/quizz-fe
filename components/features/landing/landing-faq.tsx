'use client';

import Link from 'next/link';
import { ChevronDown, CircleHelp } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    question: 'Làm thế nào để tạo đề thi bằng AI trên QuizzVN?',
    answer: 'Giáo viên nhập bối cảnh đề thi, chọn loại câu hỏi, độ khó và số lượng. Hệ thống tạo bản nháp để giáo viên rà soát, chỉnh sửa và duyệt trước khi lưu thành đề thi.',
  },
  {
    question: 'Học sinh có cần tài khoản để làm bài không?',
    answer: 'Học sinh có thể đăng ký tài khoản để lưu lịch sử và kết quả học tập. Với lớp học, học sinh dùng mã tham gia do giáo viên cung cấp để truy cập nội dung được giao.',
  },
  {
    question: 'Hệ thống hỗ trợ hạn chế gian lận như thế nào?',
    answer: 'QuizzVN hỗ trợ xáo trộn câu hỏi, phương án trả lời, thời gian làm bài và ghi nhận tiến trình nộp bài để giáo viên kiểm tra kết quả rõ ràng hơn.',
  },
  {
    question: 'QuizzCoin được sử dụng cho tính năng nào?',
    answer: 'QuizzCoin dùng để thanh toán chi phí tạo câu hỏi bằng AI. Giáo viên có thể theo dõi số dư, gói sử dụng và lịch sử giao dịch trong khu vực QuizzCoin.',
  },
] as const;

export function LandingFaq() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  return (
    <section id="faqs" className="border-t border-[#e5e7eb] bg-[#f8fafc] py-20 md:py-28">
      <div className="mx-auto grid max-w-[1280px] items-start gap-12 px-5 md:px-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="lg:sticky lg:top-28">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e55a3b]/25 bg-white px-4 py-2 text-xs font-bold text-[#e55a3b]">
            <CircleHelp className="h-4 w-4" />
            Giải đáp thắc mắc
          </div>
          <h2 className="mt-5 text-3xl font-extrabold leading-tight text-[#111827] sm:text-4xl">
            Bạn cần hỗ trợ? QuizzVN luôn sẵn sàng trả lời
          </h2>
          <p className="mt-5 text-base leading-8 text-[#6b7280]">
            Những câu trả lời ngắn gọn về cách tạo đề thi, tham gia lớp học và sử dụng công nghệ AI trên hệ thống.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-[#111827] px-7 text-sm font-bold text-white transition-colors hover:bg-[#1f2937]"
          >
            Liên hệ hỗ trợ
          </Link>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const open = activeIndex === index;
            return (
              <div key={faq.question} className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setActiveIndex(open ? null : index)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left text-sm font-bold text-[#111827] transition-colors hover:text-[#e55a3b] sm:text-base"
                >
                  <span>{faq.question}</span>
                  <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${open ? 'rotate-180 text-[#e55a3b]' : 'text-[#6b7280]'}`} />
                </button>
                {open ? (
                  <div className="border-t border-[#e5e7eb] px-5 py-4 text-sm leading-7 text-[#6b7280]">
                    {faq.answer}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
