import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingCTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-surface to-secondary/5">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="font-display font-bold text-3xl md:text-4xl text-on-surface mb-4">
          Sẵn sàng bắt đầu?
        </h2>
        <p className="text-muted-foreground text-base md:text-lg mb-8 max-w-xl mx-auto">
          Đăng ký miễn phí trong 30 giây. Không cần thẻ tín dụng, không có phí
          ẩn.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="h-12 px-8 font-semibold" asChild>
            <Link href="/register">
              Đăng ký miễn phí
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-12 px-8 font-medium"
            asChild
          >
            <Link href="/login">Tôi đã có tài khoản</Link>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          Hơn 50,000+ học sinh và 2,000+ giáo viên đang sử dụng Scholar Clarity
        </p>
      </div>
    </section>
  );
}
