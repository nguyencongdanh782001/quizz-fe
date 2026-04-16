import { BookOpen, ShieldCheck, BarChart3, Users, Clock, Smartphone } from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Ngân hàng đề thi phong phú',
    description: 'Hơn 1000+ đề thi được biên soạn bởi giáo viên giàu kinh nghiệm, cập nhật liên tục theo chương trình GDPT mới.',
    color: 'bg-primary-container text-on-primary-container',
  },
  {
    icon: Clock,
    title: 'Thi với đồng hồ thật',
    description: 'Bài thi có giới hạn thời gian thực. Hệ thống tự nộp bài khi hết giờ, đảm bảo công bằng cho mọi học sinh.',
    color: 'bg-secondary-container text-on-secondary-container',
  },
  {
    icon: BarChart3,
    title: 'Phân tích kết quả chi tiết',
    description: 'Sau mỗi bài thi, học sinh nhận được báo cáo điểm số, xem lại từng câu sai kèm giải thích ngay.',
    color: 'bg-tertiary-container text-on-tertiary-container',
  },
  {
    icon: ShieldCheck,
    title: 'An toàn & Bảo mật',
    description: 'Dữ liệu được mã hóa, không có đáp án lộ trước khi thi. Môi trường thi trực tuyến công bằng 100%.',
    color: 'bg-primary-container text-on-primary-container',
  },
  {
    icon: Users,
    title: 'Quản lý lớp học',
    description: 'Giáo viên dễ dàng tạo lớp, giao bài thi, theo dõi kết quả và quản lý học sinh trên cùng một nền tảng.',
    color: 'bg-secondary-container text-on-secondary-container',
  },
  {
    icon: Smartphone,
    title: 'Mọi thiết bị',
    description: 'Thi và ôn tập trên máy tính, máy tính bảng hoặc điện thoại. Giao diện responsive, thao tác mượt mà.',
    color: 'bg-tertiary-container text-on-tertiary-container',
  },
];

export function LandingFeatures() {
  return (
    <section className="py-20 md:py-28 bg-surface">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-on-surface mb-4">
            Tại sao chọn Scholar Clarity?
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
            Nền tảng thi trực tuyến được thiết kế cho cả giáo viên và học sinh
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, description, color }) => (
            <div
              key={title}
              className="group bg-surface-container-lowest rounded-2xl p-6 hover:shadow-[0_8px_32px_rgba(7,30,39,0.1)] transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-display font-semibold text-lg text-on-surface mb-2">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
