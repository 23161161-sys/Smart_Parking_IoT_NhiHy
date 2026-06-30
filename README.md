# Smart Parking System - Web Dashboard & Firebase
* **Tên đồ án:** Hệ thống quản lý bãi đỗ xe thông minh (Smart Parking System)
* **Sinh viên thực hiện:**
    * Trương Thị Yến Nhi - MSSV: 23161161
    * Nguyễn Huỳnh Nhật Hỷ - MSSV: 23161130
* **Môn học:** [Thực tập Cơ sở và Ứng dụng IoT]
* **Giảng viên hướng dẫn:** [Trương Quang Phúc]

## Tổng Quan Dự Án
Dự án ứng dụng công nghệ IoT nhằm xây dựng một hệ thống giám sát và quản lý bãi đỗ xe thông minh. Hệ thống cho phép cập nhật trạng thái các vị trí đỗ, điều khiển rào chắn tự động và xử lý các sự cố an ninh, hỏa hoạn theo thời gian thực (Real-time) thông qua sự kết hợp giữa vi điều khiển ESP32, cơ sở dữ liệu đám mây Firebase và giao diện điều khiển Web Dashboard.

## Các Tính Năng Nổi Bật
* **Giám sát Real-time 2 chiều:** Theo dõi trực tuyến trạng thái của 05 vị trí đỗ xe độc lập (P1 - P5). Hệ thống tự động tính toán tổng số xe, số chỗ trống trên Web Dashboard và cập nhật tức thời lên bảng LED ảo.
* **Điều khiển Barie độc lập từ xa:** Người quản lý có thể chủ động nhấn nút Đóng/Mở độc lập rào chắn Barie làn VÀO và làn RA trực tiếp từ giao diện Web.
* **Cơ chế khóa cứng an ninh (Chống xâm nhập):** Khi Barie đang ĐÓNG mà có tác động làm thay đổi xe vào/ra ô đỗ bất hợp pháp, hệ thống sẽ kích hoạt còi báo động đỏ trên Web, ghi nhật ký cảnh báo gian lận và tự động ép dữ liệu Firebase quay về trạng thái cũ (Từ chối hành vi xâm nhập).
* **Kịch bản PCCC tự động thông minh:** Khi nhiệt độ vượt ngưỡng an toàn (>50°C) hoặc phát hiện tín hiệu khói nguy hiểm:
    * Giao diện chuyển sang chế độ Báo động đỏ khẩn cấp, tự động kích hoạt Còi hú cứu hỏa và Vòi phun nước dập lửa.
    * Tự động đóng cứng Barie làn VÀO (ngăn xe mới vào bãi) và mở toang Barie làn RA để hỗ trợ các xe phía trong hầm sơ tán khẩn cấp.

## Linh Kiện & Công Nghệ Sử Dụng

### 1. Phần cứng (Hardware)
* **Vi điều khiển:** ESP32 (Trung tâm xử lý và kết nối Wifi).
* **Cảm biến vị trí:** 05 Cảm biến siêu âm HC-SR04 (Quản lý trạng thái vật lý tại từng ô đỗ).
* **Thiết bị chấp hành:** Động cơ Servo (Mô phỏng cơ chế đóng/mở của thanh chắn Barie).
* **Hệ thống kiểm soát môi trường:** Tích hợp cảm biến Nhiệt độ & Khói phục vụ công tác PCCC.

### 2. Phần mềm & Nền tảng (Software & Cloud)
* **Web Frontend:** HTML5, CSS3, JavaScript (Xây dựng bảng điều khiển Admin Dashboard trực quan, cập nhật dữ liệu không cần tải lại trang).
* **Cloud Platform:** Firebase Realtime Database (Nền tảng trung gian lưu trữ và truyền nhận dữ liệu siêu tốc, độ trễ thấp giữa ESP32 và Web).

## Demo Hệ Thống & Mã Nguồn
* **Link Video Thuyết Trình Demo:** [https://www.youtube.com/watch?v=25c98vBTRL0]

---
*Đồ án được thực hiện và hoàn thiện bởi nhóm sinh viên nhằm mục đích nghiên cứu, học tập các giải pháp IoT ứng dụng vào đô thị thông minh (Smart City).*
