/**
 * Vietnamese translations, keyed by the English string used as the
 * default/fallback throughout the codebase (so components read
 * `t("Total Vessels")` instead of needing an invented key namespace).
 * English text not listed here just passes through unchanged when the
 * locale is English, and falls back to itself in Vietnamese too if a
 * translation hasn't been added yet — nothing breaks by omission.
 */
export const VI_DICTIONARY: Record<string, string> = {
  // Nav
  Dashboard: "Tổng quan",
  Vessels: "Tàu",
  Fleets: "Đội tàu",
  Map: "Bản đồ",
  Voyages: "Hành trình",
  Predictions: "Dự đoán",
  Alerts: "Cảnh báo",

  // Common
  "Search vessel name or MMSI…": "Tìm tên tàu hoặc MMSI…",
  "System online": "Hệ thống hoạt động",
  Previous: "Trước",
  Next: "Sau",
  "Reset view": "Đặt lại góc nhìn",
  "Clear selection": "Bỏ chọn tàu",
  "View details": "Xem chi tiết",
  "Chi tiết / View Details": "Chi tiết",
  Close: "Đóng",
  "All types": "Tất cả loại",
  "All statuses": "Tất cả trạng thái",
  Loading: "Đang tải",
  "of": "trên",

  // Dashboard
  "Total Vessels": "Tổng số tàu",
  Moving: "Đang di chuyển",
  Anchored: "Đang neo đậu",
  Stopped: "Đang dừng",
  Offline: "Mất tín hiệu",
  "Vessels by Type": "Tàu theo loại",
  "Recent Activity": "Hoạt động gần đây",
  "Recent Alerts": "Cảnh báo gần đây",
  "No recent AIS activity.": "Chưa có hoạt động AIS gần đây.",
  "No alerts detected.": "Chưa phát hiện cảnh báo nào.",
  "No destination": "Chưa có điểm đến",

  // Vessels page
  total: "tổng số",
  "Search name or MMSI…": "Tìm tên hoặc MMSI…",
  "Destination…": "Điểm đến…",
  Name: "Tên",
  MMSI: "MMSI",
  IMO: "IMO",
  Type: "Loại",
  SOG: "Tốc độ",
  COG: "Hướng đi",
  Destination: "Điểm đến",
  Status: "Trạng thái",
  "Last Update": "Cập nhật cuối",
  "No vessels match the current filters.": "Không có tàu nào khớp bộ lọc hiện tại.",

  // Ship types
  Cargo: "Hàng rời",
  Tanker: "Tàu dầu",
  Passenger: "Tàu khách",
  Fishing: "Tàu cá",
  Tug: "Tàu kéo",
  Military: "Quân sự",
  Other: "Khác",

  // Voyage status
  Scheduled: "Đã lên lịch",
  "In Progress": "Đang thực hiện",
  Completed: "Hoàn thành",
  Cancelled: "Đã huỷ",

  // Anomaly types
  "Route Deviation": "Lệch tuyến đường",
  "Abnormal Speed": "Tốc độ bất thường",
  "Sudden Course Change": "Đổi hướng đột ngột",
  "AIS Signal Gap": "Mất tín hiệu AIS",
  "Long Stationary Period": "Đứng yên kéo dài",

  // Anomaly / severity status (rendered lowercase with a CSS `capitalize`,
  // so keys are lowercase here too)
  open: "mở",
  acknowledged: "đã ghi nhận",
  resolved: "đã xử lý",
  dismissed: "đã bỏ qua",
  low: "thấp",
  medium: "trung bình",
  high: "cao",
  critical: "nghiêm trọng",

  // Map
  Basemap: "Nền bản đồ",
  "Historical trajectory": "Hành trình đã qua",
  "Predicted trajectory": "Hành trình dự đoán",
  "Anomaly alerts": "Cảnh báo bất thường",
  "Vessel Type": "Loại tàu",
  "Loading fleet…": "Đang tải đội tàu…",

  // Vessel detail panel
  Current: "Hiện tại",
  History: "Lịch sử",
  Particulars: "Thông số",
  "Last 1 hour": "1 giờ qua",
  "Last 3 hours": "3 giờ qua",
  "Last 6 hours": "6 giờ qua",
  "Last 9 hours": "9 giờ qua",
  "Last 12 hours": "12 giờ qua",
  "Last 24 hours": "24 giờ qua",
  "Vessel Information": "Thông tin tàu",
  "Current AIS Data": "Dữ liệu AIS hiện tại",
  "Voyage History": "Lịch sử hành trình",
  "No voyage records.": "Chưa có dữ liệu hành trình.",
  "No AIS data available.": "Chưa có dữ liệu AIS.",
  "No recent AIS messages.": "Chưa có bản tin AIS gần đây.",
  "Call Sign": "Số hiệu gọi",
  Flag: "Quốc tịch",
  Length: "Chiều dài",
  Width: "Chiều rộng",
  Latitude: "Vĩ độ",
  Longitude: "Kinh độ",
  Speed: "Tốc độ",
  Course: "Hướng đi",
  Heading: "Hướng mũi",
  "Nav Status": "Trạng thái hành hải",
  Timestamp: "Thời gian",
  "Vessel not found.": "Không tìm thấy tàu.",
  "No AIS data available to generate a prediction for this vessel.":
    "Chưa có dữ liệu AIS để tạo dự đoán cho tàu này.",

  // Fleets
  vessels: "tàu",

  // Voyages
  Departure: "Cảng đi",
  "Departed": "Khởi hành",
  ETA: "Dự kiến đến",
  Arrived: "Đã đến",
  "No voyages match the current filters.": "Không có hành trình nào khớp bộ lọc.",

  // Anomalies / alerts
  Vessel: "Tàu",
  Detected: "Phát hiện",
  Severity: "Mức độ",
  Score: "Điểm",
  Position: "Vị trí",
  Description: "Mô tả",
  "No anomalies match the current filters.": "Không có cảnh báo nào khớp bộ lọc.",
  "DEMO DATA": "DỮ LIỆU DEMO",

  // Predictions
  "AI Predictions": "Dự đoán AI",
  "Select a vessel above to generate a demo trajectory and ETA prediction.":
    "Chọn một tàu ở trên để tạo dự đoán hành trình và thời gian đến (demo).",
  "Trajectory Prediction": "Dự đoán hành trình",
  "ETA Prediction": "Dự đoán thời gian đến",
  Horizon: "Tầm dự đoán",
  "Predicted Points": "Số điểm dự đoán",
  "Final Confidence": "Độ tin cậy cuối",
  Confidence: "Độ tin cậy",
  "Error Margin": "Sai số",
  "Destination port": "Cảng đến",
  "Auto (AIS reported destination)": "Tự động (theo điểm đến AIS báo cáo)",
  "Loading vessels…": "Đang tải danh sách tàu…",
  "Select a moving vessel…": "Chọn một tàu đang di chuyển…",

  // Fleet detail page
  "Fleet Position": "Vị trí đội tàu",

  // Voyage filters / detail
  "Anomaly type": "Loại bất thường",
  "All severities": "Tất cả mức độ",
  "Destination port…": "Cảng đến…",
  "Voyage Details": "Chi tiết hành trình",
  "Voyage Trajectory": "Hành trình di chuyển",
  "Start Time": "Thời gian khởi hành",
  "Actual Arrival": "Thời gian đến thực tế",
  Duration: "Thời lượng",
  "Last Report": "Báo cáo cuối",
};
