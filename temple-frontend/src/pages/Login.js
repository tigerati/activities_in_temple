// src/pages/Login.jsx (or wherever your login page lives)
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import lottie from "lottie-web";
import checkmarkAnim from "../assets/checkmark.json"; // <- your Lottie JSON

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/users/login`, formData, {
        headers: { "Content-Type": "application/json" },
      });

      // Save JWT
      localStorage.setItem("token", res.data.token);

      // Success popup with Lottie checkmark
      await Swal.fire({
        title: "เข้าสู่ระบบสำเร็จ",
        html: '<div id="lottie-check" style="width:120px;height:120px;margin:6px auto 0"></div>',
        showConfirmButton: false,
        timer: 1600,
        timerProgressBar: true,
        backdrop: true,
        // Optional fallback if Lottie fails to mount (keep an asset in /public if you like)
        // imageUrl: "/checkmark.png",
        didOpen: () => {
          const container = document.getElementById("lottie-check");
          if (container) {
            lottie.loadAnimation({
              container,
              animationData: checkmarkAnim,
              renderer: "svg",
              loop: false,
              autoplay: true,
            });
          }
        },
        willClose: () => {
          lottie.destroy();
        },
      });

      navigate("/");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "เข้าสู่ระบบไม่สำเร็จ",
        text: err?.response?.data?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่",
        confirmButtonText: "ตกลง",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <div className="card shadow border-0 p-4" style={{ width: "100%", maxWidth: 420, borderRadius: 16 }}>
        <div className="text-center mb-3">
          {/* Optional logo — hides itself if missing */}
          <img
            src="/logo.png"
            alt="Logo"
            style={{ height: 48 }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>

        <h4 className="text-center fw-bold mb-1">เข้าสู่ระบบ</h4>
        <p className="text-center text-muted mb-4">กรุณากรอกอีเมลและรหัสผ่านของคุณ</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label className="form-label">อีเมล</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className="mb-3">
            <label className="form-label d-flex justify-content-between">
              <span>รหัสผ่าน</span>
              <button
                type="button"
                className="btn btn-sm btn-link p-0"
                onClick={() => setShowPw((s) => !s)}
              >
                {showPw ? "ซ่อน" : "แสดง"}
              </button>
            </label>
            <div className="input-group">
              <input
                type={showPw ? "text" : "password"}
                name="password"
                className="form-control"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="rememberMe" />
              <label className="form-check-label" htmlFor="rememberMe">
                จำฉันไว้
              </label>
            </div>
            <a href="/forgot-password" className="text-decoration-none">
              ลืมรหัสผ่าน?
            </a>
          </div>

          <button type="submit" className="btn btn-warning w-100 fw-bold text-white" disabled={loading}>
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            ) : null}
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>

        <p className="text-center text-muted mt-3 mb-0">
          ยังไม่มีบัญชี?{" "}
          <a href="/register" className="text-decoration-none">
            สมัครสมาชิก
          </a>
        </p>
      </div>
    </div>
  );
}
