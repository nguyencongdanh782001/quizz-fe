import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const perks = [
  'Hơn 1000+ đề thi chất lượng cao',
  'Đa dạng môn học từ lớp 6 đến 12',
  'Kết quả chi tiết & phân tích ngay',
  'Hỗ trợ thi trên mọi thiết bị',
];

export function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-hero py-24 md:py-32">
      {/* Decorative orbs */}
      <div className="absolute top-20 right-16 w-32 h-32 rounded-full bg-white/10 animate-pulse-ring" />
      <div className="absolute bottom-12 left-1/4 w-20 h-20 rounded-full bg-secondary/30" />
      <div className="absolute top-1/2 right-1/3 w-16 h-16 rounded-full bg-white/5" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 text-white text-sm font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Đã có hơn 50,000+ học sinh tin tưởng
        </div>

        {/* Headline */}
        <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-6">
          Học thông minh,<br />
          <span className="text-secondary">Thi hiệu quả</span>
        </h1>

        <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
          Scholar Clarity — Nền tảng thi trực tuyến hàng đầu Việt Nam.
          Hàng nghìn đề thi chất lượng cao, kết quả tức thì.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Button
            size="lg"
            className="bg-white text-primary hover:bg-white/90 h-12 px-8 font-semibold"
            asChild
          >
            <Link href="/auth/register">
              Bắt đầu miễn phí
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-white/30 text-white hover:bg-white/10 h-12 px-8 font-medium"
            asChild
          >
            <Link href="/auth/login">Đăng nhập</Link>
          </Button>
        </div>

        {/* Trust perks */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
          {perks.map(perk => (
            <div key={perk} className="flex items-center gap-2 text-white/70 text-sm">
              <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />
              <span>{perk}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
