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
  "Collision Risk": "Nguy cơ va chạm",

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
  "No signal": "Mất tín hiệu",
  Fleet: "Đội tàu",
  Online: "Đang hoạt động",
  Road: "Đường",
  Satellite: "Vệ tinh",
  Terrain: "Địa hình",
  "Humanitarian (HOT)": "Nhân đạo (HOT)",
  "Position History": "Lịch sử vị trí",
  "Loading fleet…": "Đang tải đội tàu…",

  // Vessel detail panel
  Current: "Hiện tại",
  History: "Lịch sử",
  Particulars: "Thông số",
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
  "Pick a horizon above to generate a prediction.": "Chọn một khung giờ ở trên để tạo dự đoán.",

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
  "AI Trajectory Prediction": "Dự đoán hành trình AI",
  "AI ETA Prediction": "Dự đoán thời gian đến (AI)",
  "DEMO AI PREDICTION": "DEMO – DỰ ĐOÁN AI",
  Model: "Mô hình",
  "Prediction timestamp": "Thời điểm dự đoán",
  Horizon: "Tầm dự đoán",
  "Predicted Points": "Số điểm dự đoán",
  "Final Confidence": "Độ tin cậy cuối",
  Confidence: "Độ tin cậy",
  "Error Margin": "Sai số",
  "Expected range": "Khoảng thời gian dự kiến",
  "Remaining distance": "Quãng đường còn lại",
  "Current speed": "Tốc độ hiện tại",
  "AI ETA": "ETA (AI)",
  "Destination port": "Cảng đến",
  "Auto (AIS reported destination)": "Tự động (theo điểm đến AIS báo cáo)",

  // ETA comparison
  "ETA Comparison": "So sánh thời gian đến",
  "AIS / Traditional ETA": "ETA theo AIS / truyền thống",
  "Actual arrival": "Thời gian đến thực tế",
  "Not arrived yet": "Chưa đến",
  "AI error": "Sai số AI",
  min: "phút",

  // AI Insight
  "AI Insight": "Nhận định AI",

  // AI destination prediction (prep only)
  "AI Destination Prediction": "Dự đoán điểm đến (AI)",
  "Coming in next AI phase": "Sẽ có trong giai đoạn AI tiếp theo",
  "Will estimate the vessel's most likely destination port from its trajectory even when AIS reports none.":
    "Sẽ ước tính cảng đến khả năng cao nhất của tàu dựa trên hành trình, kể cả khi AIS không báo cáo điểm đến.",

  // Vessel detail sections
  "Core AIS Data": "Dữ liệu AIS cốt lõi",
  Voyage: "Hành trình",
  "AI Prediction": "Dự đoán AI",
  "No open alerts for this vessel.": "Tàu này chưa có cảnh báo nào đang mở.",

  // Voyage progress
  Progress: "Tiến độ",

  // Playback
  Play: "Phát",
  Pause: "Tạm dừng",
  "Playback position": "Vị trí phát lại",

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
