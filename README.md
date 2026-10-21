# 🍽️ HÔM NAY ĂN GÌ? – Vòng quay gacha chọn món

Web random món ăn theo phong cách gacha (dải quay ngang, hiệu ứng nổ theo phẩm chất).
Backend **Python (Flask)**, kết quả được quyết định ở server.

## Chạy

```powershell
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```
Mở http://127.0.0.1:5000

## Cấu trúc

```
app.py                  # Tạo app Flask, điểm chạy
config.py               # Thông số: độ dài dải quay, giới hạn lượt quay...
data/items.py           # ⭐ Món ăn, giá, phẩm chất, tỉ lệ rơi (sửa ở đây là chính)
services/
  gacha.py              # Tính tỉ lệ, chọn món trúng, dựng dải quay
  catalog.py            # Chuẩn bị dữ liệu gửi ra giao diện
  spin_limit.py         # Giới hạn 1 lượt/khung giờ (từ main.py cũ, tắt mặc định)
routes/
  pages.py              # Trang chủ
  api.py                # POST /api/spin
utils/format.py         # Định dạng giá, phần trăm
templates/
  index.html            # Khung trang
  partials/             # header, dải quay, modal kết quả, modal tỉ lệ
static/
  css/  base · card · reel · modal
  js/   main (điều phối) · reel (dải quay) · effects (nổ) · sound · card · api · history
  img/  ảnh món ăn
```

## Danh sách món & Phẩm chất

| Món ăn | Giá | Phẩm chất | Màu |
|---|---|---|---|
| **Nhịn Ăn** | 0đ | Tiết Kiệm | Xám ⚪ |
| **Tự Nấu Cơm** | 0đ | Tiết Kiệm | Xám ⚪ |
| **Bánh Mì** | 20.000đ | Phổ Thông | Xanh lá 🟢 |
| **Bánh Bao** | 25.000đ | Phổ Thông | Xanh lá 🟢 |
| **Cháo Lòng** | 30.000đ | Hiếm | Xanh dương 🔵 |
| **Bún Chả** | 35.000đ | Hiếm | Xanh dương 🔵 |
| **Phở Cuốn** | 35.000đ | Sử Thi | Tím 🟣 |
| **Bún Bò** | 40.000đ | Sử Thi | Tím 🟣 |
| **Cơm Tấm** | 45.000đ | Huyền Thoại | Đỏ 🔴 |
| **Lẩu** | 100.000đ | Thần Thoại | Vàng 🟡 *(Chỉ có trong Hộp Quà Bí Ẩn)* |
| **Hộp Quà Bí Ẩn** | ??? | Bí Ẩn | Cam 🎁 |

Đổi tỉ lệ ở `rarity_weights` trong `data/items.py`.

## Nâng cấp nhanh
- **Thêm ảnh**: bỏ `pho.jpg`, `lau.jpg` vào `static/img/` (thiếu ảnh sẽ tự hiện emoji).
- **Thêm món**: thêm vào `ITEMS` + id vào `items` của pool trong `data/items.py`.
- **Giới hạn thời gian quay**: Cấu hình trong `config.py` (`SPIN_LIMIT_ENABLED = True`, `SPIN_COOLDOWN_SECONDS = 60` - hiện đang để hồi sau **1 phút**). Sau khi quay sẽ tự đếm ngược từng giây đến khi hồi lượt. Xoá `spin_data.json` nếu muốn reset ngay để test.
