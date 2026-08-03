# QuizzVN Frontend Design System

> Tài liệu mô tả hệ thống thiết kế đang tồn tại trong source FE tại thời điểm hiện tại. Nguồn chuẩn được đọc từ `app/globals.css`, `components/ui`, `components/shared/app-shell.tsx` và các màn hình vận hành của giáo viên/học sinh.

## 1. Nền tảng

- Framework: Next.js 16, React 19, TypeScript.
- Styling: Tailwind CSS 4, CSS variables, `class-variance-authority`, `clsx`, `tailwind-merge`.
- UI primitives: shadcn/ui và Radix UI.
- Icon: `lucide-react`.
- Animation: Framer Motion và `tw-animate-css`.
- Font: Manrope cho tiêu đề, Public Sans cho nội dung và giao diện vận hành.
- Theme: light/dark được điều khiển bằng CSS variables; dark mode dùng class `.dark`.

## 2. Nguyên tắc hình ảnh

QuizzVN hiện theo hướng giao diện giáo dục vận hành: sáng, gọn, dễ quét dữ liệu và ưu tiên bảng biểu. Indigo là màu hành động chính, cyan là màu phụ, violet dùng cho điểm nhấn và gradient thương hiệu.

Các nguyên tắc đang được dùng làm chuẩn:

1. Nền ứng dụng xám xanh rất nhạt, nội dung chính đặt trên bề mặt trắng.
2. Trang quản lý ưu tiên bảng, thanh lọc và pagination thay vì nhiều card trang trí.
3. Border radius của control vận hành nằm trong khoảng 4-8px; chỉ avatar, badge, toggle và pagination được bo tròn hoàn toàn.
4. Button lệnh chính dùng gradient indigo-violet; button phụ dùng nền trắng hoặc màu semantic.
5. Giáo viên và học sinh dùng chung shell, typography, table, form và feedback; khác nhau ở menu và nghiệp vụ.

## 3. Bảng màu

### 3.1. Màu thương hiệu và semantic token

| Token | Light | Dark | Mục đích |
| --- | --- | --- | --- |
| `primary` | `#4F46E5` | `#A5B4FC` | Hành động chính, active, focus |
| `primary-foreground` | `#EEF2FF` | `#1E1B4B` | Chữ/icon trên primary |
| `primary-container` | `#E0E7FF` | `#312E81` | Nền active nhẹ, selected state |
| `on-primary-container` | `#312E81` | `#E0E7FF` | Nội dung trên primary container |
| `secondary` | `#0891B2` | `#67E8F9` | Hành động phụ, thông tin |
| `secondary-container` | `#CFFAFE` | `#164E63` | Nền secondary nhẹ |
| `tertiary` | `#7C3AED` | `#C4B5FD` | Điểm nhấn violet, gradient |
| `tertiary-container` | `#EDE9FE` | `#5B21B6` | Nền tertiary nhẹ |
| `destructive` | `#BA1A1A` | `#FFB4AB` | Xóa, lỗi, cảnh báo nguy hiểm |
| `ring` | `#4F46E5` | `#A5B4FC` | Focus ring |

### 3.2. Nền, bề mặt và chữ

| Token | Light | Dark | Mục đích |
| --- | --- | --- | --- |
| `background` / `surface` | `#F5F7FF` | `#060B1A` | Nền tổng thể |
| `surface-container` | `#EDF2FF` | `#0F172A` | Vùng nội dung cấp 1 |
| `surface-container-low` | `#F3F6FF` | `#111C33` | Panel nhẹ |
| `surface-container-lowest` | `#FFFFFF` | `#0A1022` | Form, table, card |
| `surface-container-high` | `#E4EBFB` | `#16213C` | Nền disabled/nhấn nhẹ |
| `surface-container-highest` | `#DCE5F7` | `#1D2847` | Bề mặt nổi bật hơn |
| `foreground` / `on-surface` | `#0F172A` | `#EEF2FF` | Chữ chính |
| `on-surface-variant` | `#64748B` | `#94A3B8` | Chữ phụ, mô tả |
| `border` | `#CBD5E1` | `#25314C` | Viền mặc định |
| `outline` | `#94A3B8` | `#475569` | Viền nhấn |
| `outline-variant` | `#D7DEEF` | `#2B3958` | Separator, viền nhẹ |
| `input` | `#DBE4F3` | `#334155` | Viền input |

### 3.3. Màu vận hành đang dùng trực tiếp

Một số màn hình mới đang dùng màu trực tiếp thay vì semantic token. Khi chỉnh sửa nên quy về token tương ứng và không tạo thêm mã màu mới.

| Màu | Vai trò hiện tại | Token nên dùng |
| --- | --- | --- |
| `#1E293B` | Heading, text chính | `foreground` |
| `#64748B` | Text phụ | `on-surface-variant` |
| `#7C879B`, `#94A3B8` | Placeholder, icon phụ | `muted-foreground` |
| `#DDE2EB` | Border table/control | `outline-variant` |
| `#F3F4F6`, `#F7F8FB` | Table header, hover | `surface-container-low` |
| `#EEF2FF` | Active navigation | `primary-container` |
| `#3F63F3`, `#4867F8` | Button/action blue | `primary` |
| `#C62CF2` | Đầu violet của gradient | `tertiary` |

### 3.4. Màu trạng thái

- Thành công/đã đạt/đã duyệt: emerald/green.
- Cảnh báo/bản nháp/chờ xử lý: amber/yellow.
- Lỗi/chưa đạt/xóa: rose hoặc destructive red.
- Thông tin/đang chọn: indigo/primary.
- Trung tính/disabled: slate và surface container.

Không chỉ dùng màu để truyền đạt trạng thái; luôn kèm icon hoặc text.

### 3.5. Gradient

- Brand/primary button: indigo sang violet, thường là `primary -> tertiary`.
- Hero hiện tại: `#4338CA -> #6366F1 52% -> #06B6D4`, góc 135 độ.
- Text brand: `#4338CA -> #7C3AED -> #06B6D4`.
- Secondary button: cyan sang sky.

Gradient chỉ dùng cho CTA chính, khu vực thương hiệu hoặc trạng thái nổi bật; không dùng cho toàn bộ bảng/form.

## 4. Typography

### 4.1. Font family

| Vai trò | Font | CSS/Tailwind |
| --- | --- | --- |
| Display, heading | Manrope | `.font-display` / `var(--font-manrope)` |
| Body, form, table, navigation | Public Sans | `.font-body`, `font-sans` / `var(--font-public-sans)` |

Cả hai font được tải qua `next/font/google` với `display: swap`.

### 4.2. Thang chữ đang dùng

| Cấp | Kích thước gợi ý | Weight | Dùng cho |
| --- | --- | --- | --- |
| Hero/display | 30-36px | 600-700 | Landing, màn hình giới thiệu lớn |
| Page title | 18-20px | 700 | Tiêu đề trang quản lý |
| Section title | 16-18px | 600-700 | Tiêu đề vùng/table |
| Card title | 14-16px | 600 | Tiêu đề card/panel |
| Body | 14px | 400-500 | Nội dung thông thường |
| Operational text | 12px | 400-600 | Table, filter, button nhỏ |
| Caption | 11px | 400-600 | Metadata, helper, badge nhỏ |

Quy tắc:

- Heading dùng Manrope; table và form dùng Public Sans.
- Tiêu đề trang quản lý thống nhất `text-lg` hoặc `text-xl`, không dùng hero-scale.
- Mô tả ngay dưới heading dùng `text-xs`, màu phụ.
- Không scale font theo viewport và không dùng letter spacing âm.
- Overline hiện tại có một số chỗ dùng uppercase/tracking; không mở rộng pattern này sang các màn hình vận hành mới.

## 5. Spacing, kích thước và hình khối

### 5.1. Spacing

Hệ spacing dựa trên Tailwind, ưu tiên bội số 4px:

- 4px: khoảng cách rất nhỏ giữa icon và trạng thái.
- 8px: gap trong control/menu.
- 12px: padding compact.
- 16px: padding card/table phổ biến.
- 20-24px: khoảng cách giữa các section.
- 32px: lề nội dung desktop lớn.

### 5.2. Radius

Base radius là `0.625rem` (10px). Các mức được map trong theme:

| Token | Giá trị |
| --- | --- |
| `radius-sm` | 6px |
| `radius-md` | 8px |
| `radius-lg` | 10px |
| `radius-xl` | 14px |
| `radius-2xl` | 18px |
| `radius-3xl` | 22px |
| `radius-4xl` | 26px |

Chuẩn áp dụng cho màn hình quản lý:

- Button lệnh: 4-6px.
- Input/select/search: 6-7px.
- Dropdown/popover: 8px.
- Table container/panel: 6-8px.
- Card nội dung: tối đa 8px khi cần đồng bộ giao diện vận hành.
- Avatar, badge, toggle, radio và page indicator: có thể bo tròn hoàn toàn.

### 5.3. Border và shadow

- Border mặc định: 1px, màu `outline-variant` hoặc `#DDE2EB`.
- Table dùng separator rõ, shadow rất nhẹ hoặc không có.
- Dialog/dropdown có shadow sâu hơn để thể hiện elevation.
- CTA có shadow màu theo primary; không áp shadow lớn cho mọi card.
- `surface-panel` hiện dùng blur 24px và shadow `0 24px 80px -40px rgba(15,23,42,.28)` cho vùng đặc biệt, không phải table chuẩn.

## 6. Iconography

- Thư viện duy nhất: `lucide-react`.
- Control/table action: 14-16px.
- Navigation: 16-18px.
- Empty/error state: 24px trở lên khi thật sự cần.
- Button có icon đặt trước text, gap 6-8px.
- Lệnh quen thuộc như sửa, xóa, làm mới, xem chi tiết có thể chỉ dùng icon nếu có tooltip/aria-label rõ ràng.
- Không tự vẽ SVG nếu Lucide đã có icon tương ứng.

## 7. Component primitives

Các primitive hiện có trong `components/ui`:

- `Button`
- `Input`, `Textarea`, `Label`
- `Select`, `Checkbox`, `RadioGroup`
- `Dialog`, `AlertDialog`
- `DropdownMenu`, `Popover`, `Tooltip`
- `Card`, `Badge`, `Avatar`
- `Toast`
- `Skeleton`

### 7.1. Button

- Base: `rounded-[6px]`, text 14px, medium, icon 16px.
- Default: cao 32px; `sm` 28px; `lg` 36px; icon button 32px.
- CTA quản lý thường dùng cao 36px, radius 4px, text 12px semibold.
- Variants:
  - `default`: gradient primary-tertiary.
  - `outline`: nền trắng, border nhẹ.
  - `secondary`: cyan-sky.
  - `ghost`: lệnh phụ/icon.
  - `destructive`: xóa hoặc hành động nguy hiểm.
  - `link`: hành động dạng liên kết.
- Disabled phải giảm opacity và chặn pointer events.

### 7.2. Input, textarea và select

- Input mặc định cao 44px, radius 7px, padding ngang 14px, text 14px.
- Select mặc định cao 44px; size nhỏ cao 36px.
- Màn hình bảng compact có thể dùng cao 36-40px và text 12px.
- Focus: border primary và ring primary mờ; không chỉ đổi màu placeholder.
- Invalid: border destructive, helper text lỗi ở dưới.
- Select menu radius 8px; item radius 4px, cao theo padding 8px.

### 7.3. Dialog, popover và dropdown

- Dùng Radix để giữ focus trap, keyboard navigation và portal.
- Dialog dùng cho tác vụ ngắn; form không nên kéo ngang toàn màn hình.
- Dropdown item: icon trái, text phải, vùng click toàn hàng.
- Hành động xóa đặt cuối, ngăn bằng separator và dùng destructive color.
- Radius dialog/dropdown ưu tiên 6-10px, không dùng pill shape.

### 7.4. Badge và status

- Badge hiện là pill (`rounded-full`), text 12px, padding ngang 10px.
- Dùng cho trạng thái ngắn: Đang hoạt động, Bản nháp, Đã đạt, Chưa đạt.
- Không dùng badge thay cho button hoặc đoạn mô tả dài.

### 7.5. Toast và feedback

- Toast dùng cho kết quả thao tác: đăng nhập, lưu, xóa, tải lên, xuất file.
- Inline alert dùng khi lỗi ảnh hưởng trực tiếp đến vùng đang thao tác.
- Skeleton dùng khi tải dữ liệu, empty state dùng khi request thành công nhưng danh sách rỗng.
- Error state phải có thông báo ngắn và lệnh thử lại khi phù hợp.

## 8. Chuẩn bảng dữ liệu

Đây là pattern chính cho các trang quản lý đề thi, học sinh, lớp học, giao đề và kết quả:

1. Header trang: heading + mô tả bên trái; nhóm CTA bên phải.
2. Filter row: search trước, select/filter kế tiếp, refresh ở cuối.
3. Table header: nền `#F3F4F6`, text 12px semibold, màu gần `#111827`.
4. Table row: text 12px, separator `#DDE2EB`; toàn hàng có thể click nếu mở chi tiết.
5. Action: button nhỏ hoặc icon menu; không tạo nhiều button lớn trong từng row.
6. Empty state vẫn giữ table header và pagination để bố cục không nhảy.
7. Pagination: thông tin số hàng bên trái, điều hướng giữa, ô chuyển trang bên phải.

Kích thước khuyến nghị:

- Filter/search: cao 36-40px, radius 6px.
- Table head/row: tối thiểu 48px; tăng khi có avatar hoặc mô tả phụ.
- Action button: cao 32px, radius 4px, text 11-12px.
- Page indicator: 36px, hình tròn.

## 9. Card và collection

- Card chỉ dùng cho item lặp lại, metric, plan hoặc nội dung cần khung riêng.
- Không đặt card bên trong card và không biến mọi section thành card nổi.
- Danh sách quản trị nhiều dữ liệu dùng table.
- Thư viện đề/tài liệu có thể dùng grid card; desktop mục tiêu 4 card mỗi hàng khi đủ chiều rộng.
- Thumbnail có kích thước/aspect-ratio ổn định để nội dung không làm nhảy layout.

## 10. App layout

### 10.1. Desktop shell

```text
AppShell (min-height: 100vh, background: #F3F5F9)
├── Sidebar
│   ├── Logo area: 72px
│   ├── Navigation sections
│   └── Footer/copyright: 56px
└── Main column
    ├── Header: sticky, 72px
    │   ├── Global search: max 420px
    │   ├── Notification
    │   └── User menu
    └── Content
        └── max-width: 1480px; padding: 16/24/32px
```

- Sidebar mở: 240px, từ `xl` là 256px.
- Sidebar thu gọn: 72px.
- Header: cao 72px, sticky top, nền trắng.
- Content: `px-4 py-5`, lên `sm` là `px-6`, lên `lg` là `px-8`.
- Khung nội dung tối đa 1480px và căn giữa.

### 10.2. Navigation

- Nhóm lớn cao 40px, nền xám nhạt full width, không cần bo tròn.
- Mục con cao 40px, thụt trái, active dùng `#EEF2FF` và `#4F46E5`.
- Mục con có radius khoảng 8px; hover phủ toàn vùng click.
- Sidebar ẩn scrollbar nhưng vẫn cuộn được.
- Giáo viên và học sinh dùng cùng component shell, chỉ truyền cấu hình menu khác nhau.

### 10.3. Mobile

- Từ dưới breakpoint `lg`, sidebar desktop ẩn.
- Nút menu mở drawer rộng `88vw`, tối đa 320px.
- Drawer có overlay slate 40%, đóng bằng nút X, click overlay hoặc điều hướng.
- Header giữ search co giãn; tên và vai trò tài khoản ẩn trên màn hình nhỏ.
- Table rộng phải dùng overflow ngang có chủ đích hoặc chuyển sang row layout; không ép chữ chồng lên nhau.

## 11. Page patterns

### Trang danh sách

```text
Page heading + supporting text                  Primary actions
Filter/search bar
Data table / empty table
Pagination
```

### Trang chi tiết

```text
Back link                                       Context actions
Entity summary + metrics
Tabs
Tab content as table, grid or form
```

### Trang form

```text
Page heading + supporting text
Compact form panel/dialog
Labels above controls
Inline validation
Cancel + primary submit
```

### Trang dashboard

- Metric cards có cùng chiều cao và grid ổn định.
- Quick actions là danh sách lệnh ngắn, không dùng hero marketing trong công cụ vận hành.
- Empty state diễn đạt trạng thái dữ liệu, không mô tả cách dùng dài dòng.

## 12. Motion và tương tác

- Transition control/menu: khoảng 100-200ms.
- Sidebar đổi width trong 200ms.
- Mobile drawer dùng spring, stiffness 320, damping 32.
- Hover không làm thay đổi kích thước layout.
- Tôn trọng `prefers-reduced-motion`; animation trang trí và smooth scroll phải tắt khi người dùng yêu cầu giảm chuyển động.
- Row có điều hướng phải cho click toàn hàng; action bên trong row phải `stopPropagation` để tránh điều hướng ngoài ý muốn.

## 13. Accessibility

- Mọi input có label; lỗi liên kết với control bằng thông báo rõ ràng.
- Icon-only button phải có `aria-label` và tooltip khi ý nghĩa chưa quen thuộc.
- Focus visible phải giữ ring rõ trên cả light và dark.
- Contrast text chính/phụ phải đủ đọc trên surface tương ứng.
- Modal/dropdown/select dùng Radix để hỗ trợ bàn phím và focus management.
- Trạng thái không chỉ phân biệt bằng màu.
- Nội dung tiếng Việt dùng UTF-8 và không để lỗi mojibake.

## 14. Điểm chưa đồng nhất cần kiểm soát

Source hiện có hai lớp style song song:

1. Semantic system trong `globals.css`: token màu, surface, radius, dark mode.
2. Operational system mới: nhiều màu hard-code, radius 4-8px, table compact.

Hướng thống nhất cho các lần triển khai tiếp theo:

- Giữ bố cục compact của operational system.
- Chuyển dần màu hard-code về semantic token, không thay đồng loạt ngoài phạm vi tính năng đang sửa.
- Dùng primitive trong `components/ui` trước khi tạo component mới.
- Dùng chung page header, filter bar, table shell, pagination, empty/error/loading state cho cả hai role.
- Không tạo thêm radius lớn cho form, dropdown, button và table.
- Kiểm tra encoding UTF-8 khi sửa file đang có text tiếng Việt.

## 15. Nguồn triển khai chính

| Phạm vi | File/thư mục |
| --- | --- |
| Token, theme, utility | `app/globals.css` |
| Font và metadata gốc | `app/layout.tsx` |
| Shell, header, sidebar, responsive | `components/shared/app-shell.tsx` |
| UI primitives | `components/ui/` |
| Pattern danh sách đề thi | `components/exams/ExamList.tsx` |
| Pattern trang giáo viên | `app/(teacher)/teacher/` |
| Pattern trang học sinh | `app/(student)/student/` |
| Shared layout/panel/metric | `components/shared/` |
| Form nghiệp vụ | `components/features/teacher-exam-form/` |

## 16. Checklist khi thêm hoặc sửa màn hình

- [ ] Dùng đúng AppShell và max-width hiện tại.
- [ ] Heading, mô tả và CTA đúng pattern trang.
- [ ] Ưu tiên token thay vì thêm mã màu mới.
- [ ] Radius control 4-8px; chỉ badge/avatar/pagination dùng pill/circle.
- [ ] Button dùng variant và size có sẵn, icon Lucide đặt sát text.
- [ ] Danh sách có filter, loading, empty, error và pagination nhất quán.
- [ ] Giáo viên và học sinh dùng chung component trình bày khi cùng loại dữ liệu.
- [ ] Kiểm tra desktop, tablet, mobile và overflow table.
- [ ] Kiểm tra focus, keyboard, aria-label và contrast.
- [ ] Kiểm tra UTF-8 cho toàn bộ text tiếng Việt.

