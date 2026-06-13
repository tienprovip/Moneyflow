# Auth Page - Break Spec (Design/Product)

## 1) Muc tieu man hinh

`AuthPage` la diem vao xac thuc cua MoneyFlow, giup nguoi dung:

- Dang nhap de vao ung dung nhanh.
- Tao tai khoan moi neu chua co.
- Cam nhan duoc gia tri san pham ngay tai man hinh dau tien (thong qua illustration + thong diep).

Muc tieu UX: don gian, ro rang, it ma sat, tao cam giac an toan khi giao pho du lieu tai chinh.

## 2) Doi tuong nguoi dung

- Nguoi dung moi: can dang ky va hieu MoneyFlow dung de lam gi.
- Nguoi dung cu: muon dang nhap nhanh de tiep tuc quan ly chi tieu.
- Nguoi khong ranh ky thuat: can copy de hieu, nut bam ro, loi de doc.

## 3) Cau truc trang (Information Architecture)

Trang duoc chia thanh 2 khoi lon:

1. **Khoi xac thuc (ben trai / trung tam):**
   - Hien `AuthCard`.
   - Co logo + ten thuong hieu MoneyFlow.
   - Co 2 tab chinh: `Login` va `Register`.
   - Hien form tuong ung voi tab dang chon.

2. **Khoi truyen thong gia tri (ben phai tren man hinh rong):**
   - Hinh minh hoa tai chinh.
   - Tieu de value proposition: "Take control of your finances".
   - Mo ta ngan ve loi ich: track spending, set budgets, grow wealth.

## 4) Hanh vi chinh (User Flows)

### Flow A - Dang nhap

1. Nguoi dung vao trang Auth.
2. Tab mac dinh la `Login`.
3. Nguoi dung nhap email + password.
4. Bam `Login`.
5. Thanh cong -> dieu huong ve trang chinh (`/`).
6. That bai -> hien thong bao loi de nguoi dung sua.

### Flow B - Dang ky

1. Nguoi dung bam tab `Register` (hoac nut "Register" trong login form).
2. Nhap Full Name, Email, Password, Confirm Password.
3. Tick dong y Terms/Privacy.
4. Bam `Create Account`.
5. Thanh cong -> dieu huong ve trang chinh (`/`).
6. That bai -> hien thong bao loi ro rang.

### Flow C - Chuyen doi giua Login/Register

- Nguoi dung co the chuyen qua lai bang:
  - Tab tren card.
  - Link chuyen trang trong chan form.

## 5) Noi dung hien thi (Content Spec)

### Thuong hieu

- Logo + text: `MoneyFlow` (nhan manh "Flow").
- Dong trust message: "Your data is protected with 256-bit encryption".

### Login copy

- Nut chinh: `Login`
- Trang thai loading: `Logging in...`
- Link chuyen tab: `Register`
- Ho tro bo nho: `Remember me`
- Nut phu: `Forgot password` (hien tai la placeholder, chua co flow hoan chinh)

### Register copy

- Nut chinh: `Create Account`
- Trang thai loading: `Creating...`
- Link chuyen tab: `Login`
- Checkbox dong y Terms + Privacy

### Illustration panel copy

- Tieu de: `Take control of your finances`
- Mo ta: theo huong ngan gon, tao dong luc, nhan manh su an toan va tong quan tai chinh.

## 6) Quy tac giao dien (UI Rules)

- Mobile-first:
  - Man hinh nho: an panel illustration, uu tien form.
  - Man hinh trung/large: hien panel illustration ben phai.
- Card auth can de doc:
  - bo cuc gon, spacing deu.
  - nhan manh nut primary.
- Chuyen tab co indicator truot de user nhan biet context hien tai.

## 7) Trang thai va phan hoi he thong

- **Idle:** form trong, user co the thao tac.
- **Validation error:** hien loi ngay tai field.
- **Server error:** hien thong diep chung/tu backend.
- **Loading:** khoa nut submit, doi label nut.
- **Success:** dieu huong vao app.

## 8) Accessibility va tone

- Anh co `alt` mo ta ro y nghia.
- Nut va input co label ro rang, de keyboard focus.
- Ngon ngu ngan gon, than thien, khong qua ky thuat.

## 9) Ngoai pham vi (Out of scope hien tai)

- Social login (Google button dang la UI, chua noi backend flow).
- Forgot password end-to-end.
- Terms/Privacy page chi tiet.

## 10) Ban giao cho team design/product

Khi dung spec nay, team khong can doc code van co the:

- Hieu man hinh nay dung de lam gi.
- Hieu bo cuc va thanh phan can co.
- Hieu user flow chinh va cac trang thai quan trong.
- Hieu phan nao da co, phan nao chi la placeholder.
