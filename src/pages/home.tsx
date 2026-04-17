import React, { useState, useEffect, useRef } from "react";
import { Page, Header, Box, Text, Modal, Input, Button, Spinner } from "zmp-ui";
import * as api from "zmp-sdk/apis";

// Helper: chuyển chuỗi hồ sơ phân cách bằng dấu chấm phẩy thành danh sách có gạch đầu dòng
const renderHoSo = (hoSoStr) => {
  if (!hoSoStr || hoSoStr.trim() === "") return <Text size="small">Chưa có thông tin</Text>;
  const items = hoSoStr.split(";").map(item => item.trim()).filter(item => item !== "");
  if (items.length === 0) return <Text size="small">Chưa có thông tin</Text>;
  return (
    <ul style={{ margin: 0, paddingLeft: 20 }}>
      {items.map((item, idx) => (
        <li key={idx} style={{ marginBottom: 4, fontSize: 14, lineHeight: 1.4 }}>
          {item}
        </li>
      ))}
    </ul>
  );
};

// ==================== COMPONENT MODAL THỦ TỤC ====================
const ThuTucModal = ({ show, onClose, data, loading, keyword, setKeyword, onSelect }) => {
  const filtered = (data || []).filter(item =>
    (item.ten || "").toLowerCase().includes(keyword.toLowerCase())
  );

  return (
    <Modal visible={show} onClose={onClose} fullScreen>
      <div style={{ padding: 20, position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text size="large" weight="bold">📋 Thủ tục hành chính thiết yếu</Text>
          <Button size="small" onClick={onClose} style={{ background: 'transparent', color: '#0068ff', border: 'none', fontWeight: 'bold' }}>✕ Đóng</Button>
        </div>
        <Input.Search
          placeholder="Tìm kiếm thủ tục..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{ margin: "8px 0 16px 0" }}
        />
        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}><Spinner /></div>
        ) : filtered.length === 0 ? (
          <Text style={{ textAlign: "center", color: "#999" }}>Không tìm thấy thủ tục</Text>
        ) : (
          <>
            <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
              {filtered.map(item => (
                <div
                  key={item.id}
                  style={{ padding: "12px 0", borderBottom: "1px solid #eee", cursor: "pointer" }}
                  onClick={() => onSelect(item)}
                >
                  <Text weight="medium">{item.ten}</Text>
                  <Text size="xSmall" style={{ color: "#888" }}>{item.ma ? `Mã: ${item.ma}` : ''}</Text>
                </div>
              ))}
            </div>
            <Box mt={4}><Button fullWidth onClick={onClose}>Đóng</Button></Box>
          </>
        )}
      </div>
    </Modal>
  );
};

// ==================== COMPONENT MODAL CHI TIẾT THỦ TỤC ====================
const ThuTucDetailModal = ({ show, onClose, item }) => {
  if (!item) return null;
  return (
    <Modal visible={show} onClose={onClose}>
      <div style={{ padding: 20, maxHeight: "80vh", overflowY: "auto" }}>
        <Text size="large" weight="bold">{item.ten}</Text>
        {item.ma && <Text size="small" style={{ color: '#666', marginTop: 4 }}>Mã: {item.ma}</Text>}
        <Box mt={2}>
          <Text weight="medium">📄 Hồ sơ cần chuẩn bị:</Text>
          {renderHoSo(item.hoSo)}
        </Box>
        <Box mt={2}>
          <Text weight="medium">💰 Lệ phí:</Text>
          <Text size="small">{item.lePhi || "Chưa có thông tin"}</Text>
        </Box>
        <Box mt={2}>
          <Text weight="medium">⏱️ Thời gian giải quyết:</Text>
          <Text size="small">{item.thoiGian || "Chưa có thông tin"}</Text>
        </Box>
        {item.mauDon && (
          <Box mt={2}>
            <Text weight="medium">📎 Mẫu tờ khai:</Text>
            <Text size="small" style={{ color: '#0068ff', cursor: 'pointer' }} onClick={() => window.open(item.mauDon, '_blank')}>Tải về</Text>
          </Box>
        )}
        {item.linkOnline && (
          <Box mt={2}>
            <Text weight="medium">🌐 Nộp trực tuyến:</Text>
            <Text size="small" style={{ color: '#0068ff', cursor: 'pointer' }} onClick={() => api.openWebview({ url: item.linkOnline })}>Tại đây</Text>
          </Box>
        )}
        {item.linkHuongDan && (
          <Box mt={2}>
            <Text weight="medium">📘 Hướng dẫn chi tiết:</Text>
            <Text size="small" style={{ color: '#0068ff', cursor: 'pointer' }} onClick={() => api.openWebview({ url: item.linkHuongDan })}>Xem hướng dẫn</Text>
          </Box>
        )}
        <Box mt={4}>
          <Button fullWidth onClick={onClose}>Đóng</Button>
        </Box>
      </div>
    </Modal>
  );
};

// ==================== HÀM XÓA DẤU TIẾNG VIỆT ====================
const removeAccents = (str) => {
  if (!str) return "";
  str = str.toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  return str;
};

// ==================== COMPONENT NGHỊ QUYẾT NÂNG CẤP ====================
const NghiQuyetSection = () => {
  const [activeTab, setActiveTab] = useState("danguy");
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // 👉 THAY URL NÀY BẰNG URL APPS SCRIPT CỦA BẠN
  const API_BASE = "https://script.google.com/macros/s/AKfycbygKDqnqSRwiE_fZt6LBgWoJYdDfQTSRKM1a53cvoO8hbUNw_pdhoGpdBJvJyfyMCHb/exec";

  // Hàm định dạng ngày
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    if (dateStr.includes("T") && dateStr.includes("Z")) {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
      }
    }
    return dateStr;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const sheetParam = activeTab === "danguy" ? "Dang%20uy" : "HDND";
        const url = `${API_BASE}?sheet=${sheetParam}`;
        const response = await fetch(url);
        const json = await response.json();
        if (json.data && Array.isArray(json.data)) {
          const reversed = [...json.data].reverse();
          setDataList(reversed);
        } else {
          setDataList([]);
        }
      } catch (error) {
        console.error("Lỗi fetch nghị quyết:", error);
        setDataList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab]);

  const filteredList = dataList.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    const searchNoAccent = removeAccents(searchLower);
    
    const trichYeu = item["Trích yếu"] || "";
    const soKyHieu = item["Số, ký hiệu"] || "";
    const ngayThang = item["Ngày, tháng"] || "";
    
    const trichYeuNoAccent = removeAccents(trichYeu.toLowerCase());
    const soKyHieuNoAccent = removeAccents(soKyHieu.toLowerCase());
    const ngayThangNoAccent = removeAccents(ngayThang.toLowerCase());
    
    return trichYeuNoAccent.includes(searchNoAccent) ||
           soKyHieuNoAccent.includes(searchNoAccent) ||
           ngayThangNoAccent.includes(searchNoAccent) ||
           trichYeu.toLowerCase().includes(searchLower) ||
           soKyHieu.toLowerCase().includes(searchLower) ||
           ngayThang.toLowerCase().includes(searchLower);
  });

  return (
    <Box mt={6} px={4}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 16 }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <div
            onClick={() => setActiveTab("danguy")}
            style={{
              flex: 1,
              textAlign: "center",
              padding: "10px 0",
              borderRadius: 30,
              fontWeight: "bold",
              cursor: "pointer",
              backgroundColor: activeTab === "danguy" ? "#0068ff" : "#f0f0f0",
              color: activeTab === "danguy" ? "#fff" : "#333",
              transition: "all 0.2s"
            }}
          >
            Nghị quyết Đảng ủy
          </div>
          <div
            onClick={() => setActiveTab("hdnd")}
            style={{
              flex: 1,
              textAlign: "center",
              padding: "10px 0",
              borderRadius: 30,
              fontWeight: "bold",
              cursor: "pointer",
              backgroundColor: activeTab === "hdnd" ? "#0068ff" : "#f0f0f0",
              color: activeTab === "hdnd" ? "#fff" : "#333",
              transition: "all 0.2s"
            }}
          >
            Nghị quyết HĐND
          </div>
        </div>

        <Input.Search
          placeholder="Tìm kiếm theo số, trích yếu hoặc ngày tháng (gõ có dấu hoặc không dấu)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginBottom: 16 }}
        />

        <div style={{ maxHeight: 400, overflowY: "auto" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: 20 }}><Spinner /></div>
          ) : filteredList.length === 0 ? (
            <Text style={{ textAlign: "center", color: "#999" }}>Không có dữ liệu</Text>
          ) : (
            filteredList.map((item, index) => {
              const link = item.Link || item.link || "";
              const soKyHieu = item["Số, ký hiệu"] || "";
              const ngayThangRaw = item["Ngày, tháng"] || "";
              const ngayThang = formatDate(ngayThangRaw);
              const trichYeu = item["Trích yếu"] || "";

              return (
                <div
                  key={index}
                  style={{
                    padding: "12px 0",
                    borderBottom: "1px solid #eee",
                    cursor: "pointer"
                  }}
                  onClick={() => {
                    if (link && link.trim() !== "") {
                      api.openWebview({ url: link });
                    } else {
                      api.showToast({ message: "Không có đường dẫn chi tiết" });
                    }
                  }}
                >
                  <div style={{ fontWeight: "bold", fontSize: 14, lineHeight: 1.4, marginBottom: 4 }}>
                    {trichYeu || "Không có tiêu đề"}
                  </div>
                  <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
                    {soKyHieu ? `Số: ${soKyHieu}` : ""}
                    {soKyHieu && ngayThang ? " | " : ""}
                    {ngayThang ? `Ngày: ${ngayThang}` : ""}
                  </div>
                  {link && (
                    <div style={{ marginTop: 4 }}>
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          api.openWebview({ url: link });
                        }}
                        style={{ background: "#0068ff", color: "#fff", borderRadius: 20, padding: "4px 12px", fontSize: 12 }}
                      >
                        📄 Xem/Tải về
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </Box>
  );
};

// ==================== COMPONENT CHÍNH ====================
const TulanSmartApp = () => {
  const [view, setView] = useState("home");
  const [slide, setSlide] = useState(0);
  const [sttData, setSttData] = useState(null);
  const [newsList, setNewsList] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [showHotline, setShowHotline] = useState(false);
  const [showThuTucModal, setShowThuTucModal] = useState(false);
  const [thuTucList, setThuTucList] = useState([]);
  const [loadingThuTuc, setLoadingThuTuc] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedThuTuc, setSelectedThuTuc] = useState(null);
  const [showThuTucDetail, setShowThuTucDetail] = useState(false);

  // 🔥 State mới cho menu VIP
  const [menuConfig, setMenuConfig] = useState([]);
  const [showManageModal, setShowManageModal] = useState(false);

  // 🔹 Bước 1: Khai báo state userId
  const [userId, setUserId] = useState("");

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const autoInterval = useRef(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [cccd, setCccd] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState("08:00");

  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw2l92TgLhyLOA3EuALw9Q1itM-doZuf3L8J7wEpPHFZFH7pFIyKT3CPvgsw8h-YjGjZw/exec";
  const CSV_URL_NEWS = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQCaJI86xdJAZ2qEaKCPjtXSF5kelYEwFSlAiH0SPiymLL1vJ3Dm-7QejC56AB8jwfwty_xeR8o13cc/pub?output=csv";
  const CSV_URL_THUTUC = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRMS5dRHxCGI8oW5gBeIZfVqu5gkcXhs6t4KLx2h8J-UYIq7-kZrwbMcRN2-XaM4ny2dD8t_BKYppzm/pub?output=csv";

  // Danh sách item đầy đủ (11 item)
  // Đã chuyển 3 icon từ emoji sang ảnh
  const allItems = [
    { id: "datlich", title: "Đặt lịch", icon: "images/icon_datlich.png", isEmoji: false, action: () => setView("booking") },
    { id: "maudon", title: "Mẫu đơn, Tờ khai", icon: "images/icon_mauDon.png", isEmoji: false, action: () => api.openWebview({ url: "https://script.google.com/macros/s/AKfycbwQW46V9GOs2VyAqpEo5NZ7RlM_VYgIGM3UmPgf5OMWk6HqQsXswTzQ_mN7sEk5PCd6Sg/exec" }) },
    { id: "dvc", title: "Nộp hồ sơ trực tuyến", icon: "images/icon_dvc.png", isEmoji: false, action: () => api.openWebview({ url: "https://dichvucong.gov.vn" }) },
    { id: "quyhoach", title: "Quy hoạch", icon: "images/icon_quyhoach.png", isEmoji: false, action: () => api.openWebview({ url: "https://tulan.bacninh.gov.vn/thong-tin-quy-hoach" }) },
    { id: "duan", title: "Dự án", icon: "images/icon_duan.png", isEmoji: false, action: () => api.openWebview({ url: "https://tulan.bacninh.gov.vn/thong-tin-du-an-dau-tu" }) },
    { id: "dauthau", title: "Đấu thầu", icon: "images/icon_dauthau.png", isEmoji: false, action: () => api.openWebview({ url: "https://tulan.bacninh.gov.vn/dau-thau-mua-sam-cong" }) },
    { id: "phananh", title: "Phản ánh", icon: "images/icon_phananh.png", isEmoji: false, action: () => api.openWebview({ url: "https://tulan.bacninh.gov.vn/phan-anh-kien-nghi" }) },
    { id: "tintuc", title: "Tin tức", icon: "images/icon_tintuc.png", isEmoji: false, action: () => api.openWebview({ url: "https://tulan.bacninh.gov.vn/" }) },
    { id: "truso", title: "Trụ sở", icon: "images/icon_truso.png", isEmoji: false, action: () => api.openWebview({ url: "https://www.google.com/maps/place/21%C2%B017'27.6%22N+106%C2%B002'50.1%22E/@21.2910123,106.0472348,17z/data=!4m4!3m3!8m2!3d21.2910123!4d106.0472348?entry=ttu&g_ep=EgoyMDI2MDQxMy4wIKXMDSoASAFQAw%3D%3D" }) },
    { id: "lichcongtac", title: "Lịch công tác", icon: "images/icon_lichcongtac.png", isEmoji: false, action: () => api.openWebview({ url: "https://tulan.bacninh.gov.vn/lich-lam-viec" }) },
    { id: "khaosat", title: "Khảo sát", icon: "images/icon_khaosat.png", isEmoji: false, action: () => api.openWebview({ url: "https://khao-sat-frontend.vercel.app/nguyen-van-luan.html" }) }
  ];

  // 🔥 Mảng màu gradient cho icon (đã thêm 4 màu mới, tổng 15 màu)
  const iconColors = [
    "linear-gradient(135deg, #FF6B6B, #FF8E8E)",
    "linear-gradient(135deg, #4ECDC4, #6EE7DE)",
    "linear-gradient(135deg, #FFE66D, #FFF2B2)",
    "linear-gradient(135deg, #A8E6CF, #C3F0E1)",
    "linear-gradient(135deg, #FFB347, #FFCC80)",
    "linear-gradient(135deg, #B5EAD7, #D4F1E6)",
    "linear-gradient(135deg, #C7CEEA, #E0E6FA)",
    "linear-gradient(135deg, #FBC2EB, #FFD6F0)",
    "linear-gradient(135deg, #84DCC6, #A8E6CF)",    // màu mới 1
    "linear-gradient(135deg, #FF9A8B, #FF6B6B)",    // màu mới 2
    "linear-gradient(135deg, #A1C4FD, #C2E9FB)",    // màu mới 3
    "linear-gradient(135deg, #D4A5A5, #E4C1C1)",    // màu mới 4
    "linear-gradient(135deg, #B8E1FC, #D0F0FD)",    // dự phòng 1
    "linear-gradient(135deg, #FFD6A5, #FFE4B5)",    // dự phòng 2
    "linear-gradient(135deg, #C0E0C0, #D4EAD4)"     // dự phòng 3
  ];

  // 🔥 Khởi tạo menuConfig (có merge với allItems để đảm bảo menu mới xuất hiện)
  const initMenu = () => {
    const defaultConfig = allItems.map((item, index) => ({
      ...item,
      visible: true,
      order: index
    }));
    setMenuConfig(defaultConfig);
  };

  useEffect(() => {
    const stored = localStorage.getItem("menuConfig");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // 🔥 FIX: merge với allItems để đảm bảo menu mới được thêm vào
        const restored = allItems.map(item => {
          const saved = parsed.find(p => p.id === item.id);
          return {
            ...item,
            visible: saved ? saved.visible : true,
            order: saved !== undefined ? saved.order : item.order
          };
        });
        setMenuConfig(restored);
      } catch (e) {
        initMenu();
      }
    } else {
      initMenu();
    }
  }, []);

  // Lưu menuConfig (loại bỏ function action trước khi lưu)
  useEffect(() => {
    if (menuConfig.length > 0) {
      const toStore = menuConfig.map(({ action, ...rest }) => rest);
      localStorage.setItem("menuConfig", JSON.stringify(toStore));
    }
  }, [menuConfig]);

  // 🔹 Bước 2: Thêm useEffect lấy userId (đặt sau các useEffect khác)
  useEffect(() => {
    const getUser = async () => {
      try {
        const user = await api.getUserInfo();
        console.log("USER INFO:", user); // 👈 QUAN TRỌNG
        setUserId(user.id);
      } catch (e) {
        console.error("Không lấy được user", e);
      }
    };
    getUser();
  }, []);

  // 🔥 Danh sách hiển thị
  const visibleItems = menuConfig
    .filter(item => item.visible)
    .sort((a, b) => a.order - b.order);

  const parseCSV = (csvText) => {
    const rows = [];
    let inQuote = false;
    let currentRow = [];
    let currentField = '';
    for (let idx = 0; idx < csvText.length; idx++) {
      const ch = csvText[idx];
      if (ch === '"') {
        if (inQuote && csvText[idx+1] === '"') {
          currentField += '"';
          idx++;
        } else {
          inQuote = !inQuote;
        }
      } else if (ch === ',' && !inQuote) {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (ch === '\n' && !inQuote) {
        currentRow.push(currentField.trim());
        rows.push(currentRow);
        currentRow = [];
        currentField = '';
      } else {
        currentField += ch;
      }
    }
    if (currentField !== '') currentRow.push(currentField.trim());
    if (currentRow.length > 0) rows.push(currentRow);
    return rows;
  };

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch(CSV_URL_NEWS);
        const csvText = await res.text();
        const rows = parseCSV(csvText);
        if (rows.length < 2) {
          setNewsList([]);
          setLoadingNews(false);
          return;
        }
        const headers = rows[0].map(h => h.trim().toLowerCase());
        const dataRows = rows.slice(1);
        const news = dataRows.map(row => {
          const item = {};
          headers.forEach((h, idx) => {
            item[h] = row[idx] || '';
          });
          return {
            stt: item.stt,
            ngayDang: item.ngaydang,
            tieuDe: item.tieude,
            link: item.link,
            anh: item.anhdaidien || item.anhdaiden || ''
          };
        }).filter(item => item.link && item.tieuDe);
        news.reverse();
        setNewsList(news.slice(0, 5));
      } catch (err) {
        console.error("Lỗi lấy tin:", err);
        setNewsList([]);
      } finally {
        setLoadingNews(false);
      }
    };
    fetchNews();
  }, []);

  const fetchThuTuc = async () => {
    if (thuTucList.length > 0) return;
    setLoadingThuTuc(true);
    try {
      const res = await fetch(CSV_URL_THUTUC);
      const csvText = await res.text();
      const rows = parseCSV(csvText);
      if (rows.length < 2) {
        setThuTucList([]);
        return;
      }
      const dataRows = rows.slice(1);
      const items = dataRows.map((row, idx) => ({
        id: idx,
        stt: row[0] || '',
        ma: row[1] || '',
        ten: row[2] || '',
        hoSo: row[3] || '',
        lePhi: row[4] || '',
        thoiGian: row[5] || '',
        mauDon: row[6] || '',
        linkOnline: row[7] || '',
        linkHuongDan: row[8] || '',
      })).filter(item => item.ten);
      setThuTucList(items);
    } catch (err) {
      console.error("Lỗi lấy thủ tục:", err);
      api.showToast({ type: "error", message: "Không tải được danh sách thủ tục" });
    } finally {
      setLoadingThuTuc(false);
    }
  };

  const stopAutoSlide = () => {
    if (autoInterval.current) {
      clearInterval(autoInterval.current);
      autoInterval.current = null;
    }
  };

  const startAutoSlide = () => {
    if (autoInterval.current) stopAutoSlide();
    if (newsList.length === 0) return;
    autoInterval.current = setInterval(() => {
      setSlide((prev) => (prev + 1) % newsList.length);
    }, 5000);
  };

  const resetAutoSlide = () => {
    stopAutoSlide();
    startAutoSlide();
  };

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchMove = (event) => {
    touchEndX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (newsList.length === 0) return;
    const deltaX = touchEndX.current - touchStartX.current;
    const minSwipeDistance = 50;
    if (Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        setSlide((prev) => (prev - 1 + newsList.length) % newsList.length);
      } else {
        setSlide((prev) => (prev + 1) % newsList.length);
      }
      resetAutoSlide();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  useEffect(() => {
    if (view !== "home") {
      stopAutoSlide();
      return;
    }
    if (newsList.length > 0) {
      startAutoSlide();
    }
    return () => stopAutoSlide();
  }, [view, newsList]);

  useEffect(() => {
    if (newsList.length > 0 && slide >= newsList.length) {
      setSlide(0);
    }
  }, [newsList, slide]);

  const isValidPhone = (num) => /^\d{10}$/.test(num);
  const isValidCccd = (num) => /^\d{12}$/.test(num);

  const handleSend = async () => {
    if (!name || !phone || !cccd) {
      api.showToast({ type: "error", message: "Vui lòng nhập Họ tên, SĐT và CCCD!" });
      return;
    }
    if (!isValidPhone(phone)) {
      api.showToast({ type: "error", message: "Số điện thoại phải đúng 10 chữ số!" });
      return;
    }
    if (!isValidCccd(cccd)) {
      api.showToast({ type: "error", message: "Căn cước công dân phải đúng 12 chữ số!" });
      return;
    }

    api.showToast({ message: "Đang gửi yêu cầu..." });
    try {
      const res = await fetch(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({ ten: name, sdt: phone, cccd, noidung: note, gio: time, ngay: date }),
      });
      const text = await res.text();
      const result = JSON.parse(text);
      if (result.result === "success") {
        setSttData({
          stt: result.stt,
          ten: name,
          sdt: phone,
          cccd: cccd,
          ngay: date,
          gio: time,
          noidung: note,
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      api.showToast({ type: "error", message: "Gửi thất bại: " + error.message });
      setSttData({
        stt: "Đã nhận (chờ xác nhận)",
        ten: name,
        sdt: phone,
        cccd: cccd,
        ngay: date,
        gio: time,
        noidung: note,
      });
    }
  };

  const handleScreenshot = () => {
    api.showToast({ message: "📸 Hãy chụp ảnh màn hình này để lưu lại phiếu hẹn!" });
  };

  const makePhoneCall = (phoneNumber) => {
    if (api.openPhone) {
      api.openPhone({
        phoneNumber: phoneNumber,
        success: () => console.log("Mở màn hình gọi điện thành công"),
        fail: (error) => console.error("Lỗi mở màn hình gọi điện:", error)
      });
    } else {
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  // Màn hình kết quả đặt lịch
  if (sttData) {
    return (
      <Page className="page-bg">
        <Header title="KẾT QUẢ" onBackClick={() => setSttData(null)} />
        <Box p={4} style={{ marginTop: 20 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 20, textAlign: 'center' }}>
            <Text weight="bold" size="large" style={{ color: '#0068ff', marginBottom: 8 }}>PHIẾU HẸN ĐIỆN TỬ</Text>
            <Box mt={4}>
              <Text size="small">Số thứ tự của bạn</Text>
              <div style={{ fontSize: 60, fontWeight: 'bold', color: '#ff4d4f', margin: '10px 0' }}>{sttData.stt}</div>
            </Box>
            <div style={{ textAlign: 'left', marginTop: 20 }}>
              <p><b>Họ tên:</b> {sttData.ten}</p>
              <p><b>Số điện thoại:</b> {sttData.sdt}</p>
              <p><b>Căn cước công dân:</b> {sttData.cccd}</p>
              <p><b>Ngày hẹn:</b> {sttData.ngay}</p>
              <p><b>Giờ hẹn:</b> {sttData.gio}</p>
              <p><b>Nội dung:</b> {sttData.noidung || "Không có"}</p>
            </div>
            <button onClick={handleScreenshot} style={{ width: '100%', padding: 12, background: '#28a745', color: '#fff', border: 'none', borderRadius: 25, marginTop: 20, fontWeight: 'bold', fontSize: 16, cursor: 'pointer' }}>
              📸 HƯỚNG DẪN CHỤP ẢNH
            </button>
            <button onClick={() => { setSttData(null); setView("home"); }} style={{ width: '100%', padding: 12, background: '#0068ff', color: '#fff', border: 'none', borderRadius: 25, marginTop: 12, fontWeight: 'bold', fontSize: 16, cursor: 'pointer' }}>
              XÁC NHẬN
            </button>
          </div>
        </Box>
      </Page>
    );
  }

  // Màn hình đặt lịch
  if (view === "booking") {
    return (
      <Page className="page-bg">
        <Header title="Đặt lịch làm việc" onBackClick={() => setView("home")} />
        <Box p={4}>
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 8 }}>Ngày & Giờ hẹn:</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: '100%', padding: 14, border: '1px solid #e0e0e0', borderRadius: 12, fontSize: 15 }} />
            <input type="time" value={time} onChange={e => setTime(e.target.value)} style={{ width: '100%', padding: 14, border: '1px solid #e0e0e0', borderRadius: 12, fontSize: 15, marginTop: 10 }} />
          </div>
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 8 }}>Họ và Tên:</label>
            <input type="text" placeholder="Nhập tên" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: 14, border: '1px solid #e0e0e0', borderRadius: 12, fontSize: 15 }} />
          </div>
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 8 }}>Số điện thoại (10 số):</label>
            <input type="tel" placeholder="Nhập SĐT" value={phone} onChange={e => setPhone(e.target.value)} style={{ width: '100%', padding: 14, border: '1px solid #e0e0e0', borderRadius: 12, fontSize: 15 }} />
          </div>
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 8 }}>Căn cước công dân (12 số):</label>
            <input type="text" placeholder="Nhập CCCD" value={cccd} onChange={e => setCccd(e.target.value)} style={{ width: '100%', padding: 14, border: '1px solid #e0e0e0', borderRadius: 12, fontSize: 15 }} />
          </div>
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 8 }}>Nội dung:</label>
            <textarea placeholder="Nội dung làm việc" value={note} onChange={e => setNote(e.target.value)} rows={3} style={{ width: '100%', padding: 14, border: '1px solid #e0e0e0', borderRadius: 12, fontSize: 15, fontFamily: 'inherit' }} />
          </div>
          <button onClick={handleSend} style={{ width: '100%', padding: '15px', background: '#0068ff', color: '#fff', border: 'none', borderRadius: '25px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>
            NHẬN SỐ THỨ TỰ
          </button>
        </Box>
      </Page>
    );
  }

  // Màn hình hotline
  if (showHotline) {
    return (
      <Page className="page-bg">
        <Header title="ĐƯỜNG DÂY NÓNG" onBackClick={() => setShowHotline(false)} />
        <Box p={4} style={{ marginTop: 8 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 20 }}>
            <Text weight="bold" size="large" style={{ color: '#0068ff', marginBottom: 16 }}>UBND PHƯỜNG TỰ LẠN</Text>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span>Chủ tịch UBND phường:</span>
                <span style={{ color: '#0068ff', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => makePhoneCall('0372433486')}>📞 0372433486</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span>Phó Chủ tịch Thường trực:</span>
                <span style={{ color: '#0068ff', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => makePhoneCall('0976103880')}>📞 0976103880</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span>Phó Chủ tịch UBND:</span>
                <span style={{ color: '#0068ff', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => makePhoneCall('0982384045')}>📞 0982384045</span>
              </div>
            </div>
            <Text weight="bold" size="large" style={{ color: '#0068ff', marginBottom: 16, marginTop: 16 }}>ĐƯỜNG DÂY NÓNG TIẾP NHẬN PHẢN ÁNH, GÓP Ý TTHC</Text>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span>Giám đốc TTPVHCC:</span>
                <span style={{ color: '#0068ff', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => makePhoneCall('0977010881')}>📞 0977010881</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span>Phó Giám đốc TTPVHCC:</span>
                <span style={{ color: '#0068ff', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => makePhoneCall('0914486324')}>📞 0914486324</span>
              </div>
            </div>
            <Text weight="bold" size="large" style={{ color: '#dc3545', marginBottom: 16, marginTop: 16 }}>KHẨN CẤP</Text>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Bảo vệ trẻ em:</span><span style={{ color: '#dc3545', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => makePhoneCall('111')}>📞 111</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Công an:</span><span style={{ color: '#dc3545', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => makePhoneCall('113')}>📞 113</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Cứu hỏa:</span><span style={{ color: '#dc3545', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => makePhoneCall('114')}>📞 114</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Cấp cứu y tế:</span><span style={{ color: '#dc3545', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => makePhoneCall('115')}>📞 115</span></div>
            </div>
          </div>
        </Box>
      </Page>
    );
  }

  // Trang chủ
  return (
    <Page className="page-bg" style={{ paddingBottom: '70px' }}>
      <Header title="Tự Lạn SmartApp" onBackClick={() => {}} />
      <ThuTucModal
        show={showThuTucModal}
        onClose={() => {
          setShowThuTucModal(false);
          setSearchKeyword("");
        }}
        data={thuTucList}
        loading={loadingThuTuc}
        keyword={searchKeyword}
        setKeyword={setSearchKeyword}
        onSelect={(item) => {
          setSelectedThuTuc(item);
          setShowThuTucDetail(true);
        }}
      />
      <ThuTucDetailModal
        show={showThuTucDetail}
        onClose={() => setShowThuTucDetail(false)}
        item={selectedThuTuc}
      />

      <div style={{ flex: 1 }}>
        {loadingNews ? (
          <div style={{ padding: 20, textAlign: 'center' }}>Đang tải tin tức...</div>
        ) : newsList.length > 0 && (
          <Box mt={2} px={4}>
            <div 
              style={{ position: 'relative', width: '100%', height: 200, overflow: 'hidden', borderRadius: 16, backgroundColor: '#eef2f5' }}
              onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
            >
              <div style={{ display: 'flex', transition: 'transform 0.5s ease', transform: `translateX(-${slide * 100}%)`, height: '100%' }}>
                {newsList.map((item, idx) => (
                  <div key={idx} style={{ width: '100%', flexShrink: 0, height: '100%', cursor: 'pointer', position: 'relative' }} onClick={() => api.openWebview({ url: item.link })}>
                    {item.anh ? <img src={item.anh} alt={item.tieuDe} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #0068ff, #00aaff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18, fontWeight: 'bold', textAlign: 'center', padding: 20 }}>{item.tieuDe}</div>
                    }
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', color: 'white', padding: '12px', textAlign: 'left' }}>
                      <Text weight="bold" style={{ fontSize: 15, marginBottom: 4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.tieuDe}</Text>
                      <Text size="xSmall" style={{ color: '#ddd' }}>{item.ngayDang}</Text>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6 }}>
                {newsList.map((_, idx) => (<div key={idx} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: slide === idx ? '#0068ff' : 'rgba(255,255,255,0.6)', transition: 'all 0.3s' }} />))}
              </div>
            </div>
          </Box>
        )}

        {/* 2 ô lớn phía trên */}
        <Box mt={4} px={4}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 12, textAlign: 'center', cursor: 'pointer', border: '1px solid #e6f0ff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'all 0.2s' }} onTouchStart={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; e.currentTarget.style.background = '#f5faff'; }} onTouchEnd={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = '#fff'; }} onClick={() => api.openWebview({ url: "https://tu-lan-dvc-ai-v3.vercel.app/" })}>
              <img src="images/icon_chatbot.png" style={{ width: 60, height: 60 }} />
              <Text weight="bold" size="medium" style={{ color: '#0068ff' }}>Chatbot AI</Text>
            </div>
            <div style={{ background: '#fff', borderRadius: 16, padding: 12, textAlign: 'center', cursor: 'pointer', border: '1px solid #e6f0ff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'all 0.2s' }} onTouchStart={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; e.currentTarget.style.background = '#f5faff'; }} onTouchEnd={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = '#fff'; }} onClick={async () => { await fetchThuTuc(); setShowThuTucModal(true); }}>
              <img src="images/icon_thutuc.png" style={{ width: 60, height: 60 }} />
              <div style={{ fontWeight: 'bold', fontSize: 14, color: '#0068ff', marginTop: 4 }}>
                Thủ tục hành chính<br/>thiết yếu
              </div>
            </div>
          </div>
        </Box>

        {/* Grid các chức năng (visibleItems) */}
        <Box mt={6} px={4}>
          <div style={{ background: "#fff", borderRadius: 20, padding: "16px 12px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, maxHeight: "55vh", overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
            {visibleItems.map((item) => {
              // Tìm index gốc để giữ màu sắc ổn định
              const originalIndex = allItems.findIndex(orig => orig.id === item.id);
              const colorIdx = originalIndex !== -1 ? originalIndex : 0;
              return (
                <div key={item.id} onClick={item.action} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }} onTouchStart={(e) => (e.currentTarget.style.transform = "scale(0.92)")} onTouchEnd={(e) => (e.currentTarget.style.transform = "scale(1)")}>
                  <div style={{ width: 64, height: 64, borderRadius: 18, background: iconColors[colorIdx % iconColors.length], display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8, boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}>
                    {item.isEmoji ? (
                      <span style={{ fontSize: 36 }}>{item.icon}</span>
                    ) : (
                      <img src={item.icon} alt={item.title} style={{ width: 45, height: 45 }} />
                    )}
                  </div>
                  <div style={{ textAlign: "center", fontWeight: 600, fontSize: 12, color: "#1a1a1a", lineHeight: 1.3, maxWidth: "100%", wordBreak: "break-word", whiteSpace: "normal" }}>
                    {item.title}
                  </div>
                </div>
              );
            })}
          </div>
        </Box>

        {/* NGHỊ QUYẾT */}
        <NghiQuyetSection />

        <div style={{ height: 70 }} />
      </div>

      {/* Footer cố định */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#fff',
        borderTop: '1px solid #ddd',
        padding: '8px 16px',
        zIndex: 1000
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          <div style={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => { setView("home"); window.scrollTo(0, 0); }}>
            <Text size="small" style={{ color: view === 'home' ? '#0068ff' : '#666', fontWeight: view === 'home' ? 'bold' : 'normal' }}>🏠 Trang chủ</Text>
          </div>
          <div style={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => api.openWebview({ url: "https://zalo.me/155482019626526050" })}>
            <Text size="small" style={{ color: '#666' }}>💬 Liên hệ</Text>
          </div>
          <div style={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => setShowHotline(true)}>
            <Text size="small" style={{ color: '#666' }}>📞 Đường dây nóng</Text>
          </div>
          <div style={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => setShowManageModal(true)}>
            <Text size="small" style={{ color: '#666' }}>⚙️ Q.lý</Text>
          </div>
        </div>
      </div>

      {/* 🔥 Modal quản lý VIP (drag & drop + switch + khôi phục) - ĐÃ FIX LỖI INDEX */}
      <Modal visible={showManageModal} onClose={() => setShowManageModal(false)}>
        <div style={{ padding: 20 }}>
          <Text size="large" weight="bold">⚙️ Quản lý chức năng</Text>

          <div style={{ marginTop: 16, maxHeight: 400, overflowY: "auto" }}>
            {(() => {
              // 🔥 QUAN TRỌNG: tạo mảng đã sort để dùng cho cả render và drag/drop
              const sortedMenu = [...menuConfig].sort((a, b) => a.order - b.order);
              return sortedMenu.map((item, index) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("dragIndex", index);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    const dragIndex = parseInt(e.dataTransfer.getData("dragIndex"));
                    
                    // Lấy lại mảng đã sort hiện tại (dựa trên menuConfig gốc)
                    const sorted = [...menuConfig].sort((a, b) => a.order - b.order);
                    const draggedItem = sorted[dragIndex];
                    sorted.splice(dragIndex, 1);
                    sorted.splice(index, 0, draggedItem);
                    
                    // Cập nhật lại order
                    const updated = sorted.map((it, idx) => ({
                      ...it,
                      order: idx
                    }));
                    setMenuConfig(updated);
                  }}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom: "1px solid #eee"
                  }}
                >
                  {/* LEFT */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: "#f0f0f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      {item.isEmoji ? (
                        <span>{item.icon}</span>
                      ) : item.icon ? (
                        <img src={item.icon} style={{ width: 24, height: 24 }} alt={item.title} />
                      ) : null}
                    </div>
                    <Text>{item.title}</Text>
                  </div>

                  {/* SWITCH */}
                  <div
                    onClick={() => {
                      setMenuConfig(prev =>
                        prev.map(it =>
                          it.id === item.id
                            ? { ...it, visible: !it.visible }
                            : it
                        )
                      );
                    }}
                    style={{
                      width: 46,
                      height: 26,
                      borderRadius: 20,
                      background: item.visible ? "#0068ff" : "#ccc",
                      position: "relative",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    <div style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: "#fff",
                      position: "absolute",
                      top: 2,
                      left: item.visible ? 22 : 2,
                      transition: "all 0.2s"
                    }} />
                  </div>
                </div>
              ));
            })()}
          </div>

          {/* ACTION BUTTONS */}
          <Button
            fullWidth
            style={{ marginTop: 12 }}
            onClick={() => initMenu()}
          >
            🔄 Khôi phục mặc định
          </Button>

          <Button
            fullWidth
            style={{ marginTop: 8 }}
            onClick={() => setShowManageModal(false)}
          >
            Đóng
          </Button>
        </div>
      </Modal>
    </Page>
  );
};

export default TulanSmartApp;