import React, { useState } from 'react';
import axios from 'axios';
import Lottie from 'lottie-react';
import fp from '../assets/forget_password.json';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);
  const [exists, setExists] = useState(null);   // null until we submit
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  
  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrMsg('');
    setResult(null);
    setExists(null);
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE}/users/forgot`, { email });
      // Expect backend to return: { exists: boolean, message: string, resetUrl?: string }
      setExists(data.exists);
      setResult(data);
    } catch (err) {
      setErrMsg(err?.response?.data?.message || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  // Turn RED if email exists in DB (your requirement)
  // If you want the opposite behavior, just swap the classes below.
  const inputClass =
    exists === true
      ? 'form-control is-valid'
      : exists === false
      ? 'form-control is-invalid'
      : 'form-control';

  return (
    <div className="container py-5" style={{ maxWidth: 480 }}>
      <div style={{ maxWidth: 300, margin: '0 auto' }}>
        <Lottie animationData={fp} loop={false} />
      </div>

      <h3 className="mb-3">ลืมรหัสผ่าน</h3>
      <p className="text-muted">กรอกอีเมลของคุณเพื่อรีเซ็ตรหัสผ่าน</p>

      <form onSubmit={handleSubmit} noValidate>
        <input
          type="email"
          className={inputClass}
          placeholder="you@example.com"
          value={email}
          onChange={e => {
            setEmail(e.target.value);
            // reset validation state while typing
            if (exists !== null) setExists(null);
          }}
          required
          aria-invalid={exists === true}
        />
        {/* Validation feedback (Bootstrap) */}
        {exists === true && (
          <div className="valid-feedback">
          </div>
        )}

        {exists === false && (
          <div className="invalid-feedback">
            ไม่พบบัญชีด้วยอีเมลนี้
          </div>
        )}
        
        <button className="btn btn-warning text-white w-100 mt-3" disabled={loading}>
          {loading ? 'กำลังตรวจสอบ...' : 'ส่งลิงก์รีเซ็ต'}
        </button>
      </form>

      {errMsg && <div className="alert alert-danger mt-3">{errMsg}</div>}

      {/* Show RED alert when email not found */}
      {result?.exists === false && (
        <div className="alert alert-danger mt-3">
          {result.message}
        </div>
      )}

      {/* Show BLUE alert only when email exists */}
      {result?.exists === true && (
        <div className="alert alert-info mt-3">
          {result.message}
          {result.resetUrl && (
            <>
              <div className="small text-muted mt-2">Dev only:</div>
              <a href={result.resetUrl}>{result.resetUrl}</a>
            </>
          )}
        </div>
      )}
    </div>
  );
}
