// src/pages/Register.js
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

export default function Register() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    password: "",
    confirmPassword: "",
    email: "",
    phone: "",
    address: "",
    id_number: "",
    birthdate: ""
  });

  
  const today = new Date().toISOString().slice(0, 10); // e.g. "2025-08-11"
  const minBirth = '1900-01-01';
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const pwStrength = useMemo(() => {
    const p = formData.password || "";
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[a-z]/.test(p)) score++;
    if (/\d/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score; // 0..5
  }, [formData.password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    if (loading) return;

    if (!form.checkValidity()) {
        form.reportValidity(); // shows browser's built-in warnings
        return;
    }

    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "รหัสผ่านไม่ตรงกัน",
        text: "โปรดตรวจสอบรหัสผ่านอีกครั้ง",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    try {
      setLoading(true);
      const { confirmPassword, ...dataToSend } = formData;
      await axios.post(`${API_BASE}/users/register`, dataToSend, {
        headers: { "Content-Type": "application/json" },
      });

      await Swal.fire({
        icon: "success",
        title: "ลงทะเบียนสำเร็จ",
        text: "ยินดีต้อนรับ! กรุณาเข้าสู่ระบบ",
        confirmButtonText: "ไปหน้าเข้าสู่ระบบ",
      });

      navigate("/login");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "ลงทะเบียนไม่สำเร็จ",
        text: err.response?.data?.message || err.message || "เกิดข้อผิดพลาด",
        confirmButtonText: "ตกลง",
      });
    } finally {
      setLoading(false);
    }
  };

  const strengthLabel = ["อ่อนมาก", "อ่อน", "ปานกลาง", "ดี", "ดีมาก"];
  const strengthClass = [
    "bg-danger",
    "bg-warning",
    "bg-info",
    "bg-primary",
    "bg-success",
  ];

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "100vh", marginTop: 50, marginBottom: 50 }}>
      <div className="card shadow border-0 p-4 w-100" style={{ maxWidth: 720, borderRadius: 18 }}>
        <div className="text-center mb-3">
          <h3 className="fw-bold mb-1">ลงทะเบียนผู้ใช้งาน</h3>
          <p className="text-muted mb-0">สร้างบัญชีใหม่เพื่อใช้งานระบบ</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="row g-3">
            {/* Left column */}
            <div className="col-12 col-md-6">
              <label className="form-label">ชื่อจริง</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="form-control"
                placeholder="กรอกชื่อ"
                required
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label">นามสกุล</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="form-control"
                placeholder="กรอกนามสกุล"
                required
              />
            </div>

            <div className="col-12 col-md-6">
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
              <input
                type={showPw ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-control"
                placeholder="อย่างน้อย 8 ตัวอักษร"
                required
                minLength={8}
              />
              {/* strength bar */}
              {formData.password && (
                <div className="mt-2">
                  <div className="progress" style={{ height: 6 }}>
                    <div
                      className={`progress-bar ${strengthClass[Math.max(0, pwStrength - 1)]}`}
                      role="progressbar"
                      style={{ width: `${(pwStrength / 5) * 100}%` }}
                    />
                  </div>
                  <small className="text-muted">
                    ความแข็งแรงรหัสผ่าน: {strengthLabel[Math.max(0, pwStrength - 1)]}
                  </small>
                </div>
              )}
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label d-flex justify-content-between">
                <span>ยืนยันรหัสผ่าน</span>
                <button
                  type="button"
                  className="btn btn-sm btn-link p-0"
                  onClick={() => setShowPw2((s) => !s)}
                >
                  {showPw2 ? "ซ่อน" : "แสดง"}
                </button>
              </label>
              <input
                type={showPw2 ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`form-control ${
                  formData.confirmPassword
                    ? formData.password === formData.confirmPassword
                      ? "is-valid"
                      : "is-invalid"
                    : ""
                }`}
                placeholder="พิมพ์รหัสผ่านอีกครั้ง"
                required
                minLength={8}
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <div className="invalid-feedback">รหัสผ่านไม่ตรงกัน</div>
              )}
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label">อีเมล</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-control"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="col-12 col-md-6">
                <label className="form-label">เลขบัตรประชาชน / หนังสือเดินทาง</label>
                <input
                    type="text"
                    name="id_number"
                    value={formData.id_number}
                    onChange={(e) => {
                    // normalize: remove spaces, uppercase letters for passports
                    const v = e.target.value.replace(/\s+/g, '').toUpperCase();
                    setFormData(prev => ({ ...prev, id_number: v }));
                    }}
                    className="form-control"
                    placeholder="เช่น 1103701234567 หรือ A1234567"
                    inputMode="numeric"           // helps mobile keyboard (still allows letters)
                    autoComplete="off"
                    maxLength={13}                 // optional; remove if you want up to 9 for passport
                    pattern="(^\d{13}$)|(^[A-Za-z0-9]{6,9}$)"
                    title="ใส่เลขบัตร 13 หลัก หรือ เลขพาสปอร์ต 6–9 ตัว (ตัวอักษร/ตัวเลข)"
                    required
                />
                <small className="text-muted">
                    กรอก <b>เลขบัตร 13 หลัก</b> หรือ <b>พาสปอร์ต 6–9 ตัว</b>
                </small>
            </div>

            <div className="col-12 col-md-6">
                <label className="form-label">วันเกิด</label>
                <input
                    type="date"
                    name="birthdate"
                    className="form-control"
                    value={formData.birthdate}
                    onChange={(e) => setFormData(f => ({ ...f, birthdate: e.target.value }))}
                    min={minBirth}
                    max={today}                 // no future birthdays
                    required
                />
                <small className="text-muted">เลือกจากปฏิทิน หรือกรอกรูปแบบ YYYY-MM-DD</small>
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label">เบอร์ติดต่อ</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="form-control"
                placeholder="0812345678"
                pattern="^[0-9]{9,10}$"
                required
              />
              <small className="text-muted">ตัวเลข 9–10 หลัก</small>
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label">ที่อยู่</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="form-control"
                placeholder="กรอกที่อยู่"
                rows={3}
                required
              />
            </div>
            
          </div>

          <button
            type="submit"
            className="btn btn-warning w-100 text-white fw-bold mt-4"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
            ) : null}
            {loading ? "กำลังลงทะเบียน..." : "ลงทะเบียน"}
          </button>

          <p className="text-center text-muted mt-3 mb-0">
            มีบัญชีอยู่แล้ว? <a href="/login" className="text-decoration-none">เข้าสู่ระบบ</a>
          </p>
        </form>
      </div>
    </div>
  );
}
