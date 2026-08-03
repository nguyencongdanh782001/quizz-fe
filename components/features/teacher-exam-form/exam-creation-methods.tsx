import Image from "next/image";
import Link from "next/link";

const creationMethods = [
  {
    title: "Tạo đề AI",
    description: "Tạo đề tự động bằng AI, chọn loại câu hỏi và rà soát từng câu trước khi lưu.",
    href: "/teacher/ai-exams?scope=system",
    imageSrc: "/image/text2.png",
    hoverClassName: "hover:from-[#FF5277] hover:to-[#FF855A]",
  },
  {
    title: "Soạn thảo văn bản",
    description: "Nhập trực tiếp câu hỏi và đáp án dạng văn bản theo cú pháp để hệ thống tự động trích xuất và xem trước.",
    href: "/teacher/exams/create?mode=text",
    imageSrc: "/image/text1.png",
    hoverClassName: "hover:from-[#4F62F2] hover:to-[#7C3AED]",
  },
  {
    title: "Trình soạn thảo thủ công",
    description: "Tạo đề từ đầu và tự nhập thông tin, câu hỏi, đáp án theo từng bước.",
    href: "/teacher/exams/create?mode=manual",
    imageSrc: "/image/text3.png",
    hoverClassName: "hover:from-[#06B6D4] hover:to-[#4F62F2]",
  },
] as const;

export function ExamCreationMethods() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-[#1E293B]">Lựa chọn phương thức tạo đề thi phù hợp</h1>
        <p className="mt-1 text-xs text-[#64748B]">Mỗi phương thức đều lưu về cùng hệ thống quản lý đề thi của giáo viên.</p>
      </div>

      <section className="rounded-[10px] border border-[#E0E7FF] bg-[#EEF2FF] p-4">
        <div className="grid gap-4 md:grid-cols-3">
          {creationMethods.map((method) => (
            <Link
              key={method.title}
              href={method.href}
              className={`group relative flex min-h-[230px] flex-col items-center justify-between overflow-hidden rounded-[10px] bg-white p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-gradient-to-r ${method.hoverClassName} hover:shadow-md`}
            >
              <div>
                <h2 className="text-sm font-bold text-[#1E293B] transition-colors group-hover:text-white">{method.title}</h2>
                <p className="mx-auto mt-2 max-w-[280px] text-xs leading-5 text-[#64748B] transition-colors group-hover:text-white/90">{method.description}</p>
              </div>

              <div className="mt-5 flex h-[84px] w-[140px] items-center justify-center">
                <Image
                  src={method.imageSrc}
                  alt=""
                  width={140}
                  height={84}
                  className="h-[84px] w-[140px] object-contain"
                />
              </div>

              <span className="mt-4 text-xs font-bold text-[#4F62F2] transition-colors group-hover:text-white">Chọn phương thức</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
