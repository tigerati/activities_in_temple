import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ResetPassword() {
  const [sp] = useSearchParams();
  const token = sp.get('token') || '';
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [msg, setMsg] = useState(null);
  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

  useEffect(() => { if (!token) setMsg('ลิงก์ไม่ถูกต้อง'); }, [token]);

  const submit = async (e) => {
    e.preventDefault();
    if (pw1 !== pw2) return setMsg('รหัสผ่านไม่ตรงกัน');
    try {
      const { data } = await axios.post(`${API_BASE}/users/reset`, { token, newPassword: pw1 });
      setMsg(data.message);
      setTimeout(() => navigate('/login'), 1200);
    } catch (e) {
      setMsg(e.response?.data?.message || 'เกิดข้อผิดพลาด');
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 480 }}>
      <h3 className="mb-3">ตั้งรหัสผ่านใหม่</h3>
      <form onSubmit={submit}>
        <input
          type="password"
          className="form-control mb-3"
          placeholder="รหัสผ่านใหม่"
          value={pw1}
          onChange={e => setPw1(e.target.value)}
          required
          minLength={6}
        />
        <input
          type="password"
          className="form-control mb-3"
          placeholder="ยืนยันรหัสผ่านใหม่"
          value={pw2}
          onChange={e => setPw2(e.target.value)}
          required
          minLength={6}
        />
        <button className="btn btn-warning text-white w-100">บันทึกรหัสผ่าน</button>
      </form>
      {msg && <div className="alert alert-info mt-3">{msg}</div>}
    </div>
  );
}