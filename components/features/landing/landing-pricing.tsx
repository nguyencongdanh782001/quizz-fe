import Link from 'next/link';
import { CheckSquare } from 'lucide-react';

const plans = [
  {
    name: 'Gói Bạc',
    description: 'Dành cho giáo viên bắt đầu trải nghiệm tạo đề bằng AI',
    price: '69.000đ',
    popular: false,
    features: ['300 QuizzCoin mỗi gói', 'Premium trong 30 ngày', 'Tạo và quản lý lớp học', 'Chấm điểm tự động', 'Xuất kết quả Excel'],
  },
  {
    name: 'Gói Vàng',
    description: 'Phù hợp với giáo viên thường xuyên tạo và giao đề',
    price: '129.000đ',
    popular: true,
    features: ['800 QuizzCoin mỗi gói', 'Premium trong 30 ngày', 'AI sinh lời giải chi tiết', 'Theo dõi kết quả theo lớp', 'Quản lý tài liệu học tập'],
  },
  {
    name: 'Gói Premium',
    description: 'Nhiều QuizzCoin hơn cho nhu cầu sử dụng cường độ cao',
    price: '249.000đ',
    popular: false,
    features: ['2.000 QuizzCoin mỗi gói', 'Premium trong 30 ngày', 'Tạo nhiều dạng câu hỏi AI', 'Theo dõi số dư và giao dịch', 'Hỗ trợ đầy đủ tính năng giáo viên'],
  },
] as const;

export function LandingPricing() {
  return (
    <section id="pricing" className="border-t border-[#e5e7eb] bg-white py-20 md:py-28">
      <div className="mx-auto max-w-[1280px] px-5 md:px-8">
        <div className="mx-auto mb-14 max-w-[720px] text-center">
          <p className="text-xs font-bold uppercase text-[#e55a3b]">Bảng giá QuizzCoin</p>
          <h2 className="mt-3 text-3xl font-extrabold leading-tight text-[#111827] sm:text-4xl">
            Nâng cấp trải nghiệm tạo đề thi bằng AI
          </h2>
          <p className="mt-4 text-base leading-7 text-[#6b7280]">
            Lựa chọn gói QuizzCoin phù hợp với nhu cầu sử dụng của giáo viên và lớp học.
          </p>
        </div>

        <div className="mx-auto grid max-w-[1140px] items-stretch gap-7 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`relative flex flex-col justify-between rounded-2xl border p-7 transition-shadow hover:shadow-xl ${
                plan.popular
                  ? 'border-2 border-[#e55a3b] bg-linear-to-b from-[#fff7f0] to-[#ffe8d6] shadow-lg lg:-translate-y-2'
                  : 'border-[#e5e7eb] bg-white shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-2xl font-extrabold text-[#111827]">{plan.name}</h3>
                  {plan.popular ? (
                    <span className="rounded-full bg-[#e55a3b] px-3 py-1 text-[10px] font-extrabold uppercase text-white">
                      Phổ biến
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 min-h-12 text-xs leading-6 text-[#6b7280]">{plan.description}</p>
                <ul className="mt-6 space-y-3 border-t border-[#e5e7eb] pt-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2.5 text-sm font-medium text-[#4b5563]">
                      <CheckSquare className="h-4 w-4 shrink-0 text-[#e55a3b]" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8 border-t border-dashed border-[#d1d5db] pt-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-[#e55a3b]">{plan.price}</span>
                  <span className="text-xs font-semibold text-[#6b7280]">/ gói</span>
                </div>
                <Link
                  href="/login"
                  className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#e55a3b] text-sm font-bold text-white transition-colors hover:bg-[#d4492a]"
                >
                  Bắt đầu ngay
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
