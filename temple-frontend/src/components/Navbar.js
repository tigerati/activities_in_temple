// src/components/Navbar.jsx
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Optional: hide some links on specific pages
  const hideContactLink = location.pathname === "/contact";

  // Read token if present; show admin links only when role === 'admin'
  let isAdmin = false;
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const payload = jwtDecode(token);
      isAdmin = payload?.role === "admin";
    } catch (e) {
      // bad/expired token -> treat as non-admin
      isAdmin = false;
    }
  }

  const handleLogout = () => {
    if (window.confirm("ยืนยันออกจากระบบผู้ดูแล?")) {
      localStorage.removeItem("token");
      navigate("/", { replace: true });
    }
  };

  return (
    <nav className="navbar navbar-expand-lg ms-auto" style={{ backgroundColor: "#ffffff" }}>
      <div className="container">
        <Link className="navbar-brand text-black fw-bold" to="/">
          สถาบันวิปัสสนา วัดมเหยงคณ์
        </Link>

        <button className="navbar-toggler ms-auto" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {/* Public links for everyone */}
            <li className="nav-item ms-auto">
              <Link className="nav-link" to="/">หน้าหลัก</Link>
            </li>
            <li className="nav-item ms-auto">
              <Link className="nav-link" to="/audio-library">ห้องสมุดเสียง</Link>
            </li>
            {(!hideContactLink && !isAdmin) && (
              <li className="nav-item ms-auto">
                <Link className="nav-link" to="/contact">ติดต่อเรา</Link>
              </li>
            )}

            {/* Admin-only links (visible only when token role === 'admin') */}
            {isAdmin && (
              <>
                <li className="nav-item ms-auto">
                  <Link className="nav-link" to="/admin/legacy-lookup">ค้นหาข้อมูลผู้ใช้งาน</Link>
                </li>
                {/* Logout for admin */}
                <li className="nav-item ms-auto">
                  <button
                    type="button"
                    className="nav-link"
                    onClick={handleLogout}
                    style={{ textDecoration: "none" }}
                  >
                    ออกจากระบบ
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
