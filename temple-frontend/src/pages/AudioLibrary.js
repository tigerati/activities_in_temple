import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Spinner } from 'react-bootstrap';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

function fmtBytes(bytes) {
  if (!bytes && bytes !== 0) return '-';
  const units = ['B','KB','MB','GB'];
  let i = 0, v = bytes;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(v < 10 ? 1 : 0)} ${units[i]}`;
}

export default function AudioLibrary() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setErr('');
        setLoading(true);
        const { data } = await axios.get(`${API_BASE}/media/audio`);
        if (alive) setItems(data || []);
      } catch (e) {
        if (alive) setErr(e?.response?.data?.message || 'โหลดรายการเสียงไม่สำเร็จ');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return items;
    return items.filter(x => x.filename.toLowerCase().includes(k));
  }, [q, items]);

  return (
    <div className="container py-4" style={{ maxWidth: 1000 }}>
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-3">
        <h3 className="mb-0">คลังเสียง</h3>
        <input
          className="form-control"
          placeholder="ค้นหาไฟล์ (เช่น ธรรมะ, chant, mp3)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ maxWidth: 360 }}
        />
      </div>

      {loading && (
        <div className="d-flex justify-content-center py-5"><Spinner animation="border" role="status" /></div>
      )}
      {err && <div className="alert alert-danger">{err}</div>}
      {!loading && !err && filtered.length === 0 && (
        <div className="text-muted">ไม่พบไฟล์เสียง</div>
      )}

      <div className="row g-3">
        {filtered.map((a, i) => (
          <div key={i} className="col-12">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
                  <div className="flex-grow-1">
                    <div className="fw-semibold">{a.filename}</div>
                    <div className="text-muted small">
                      {fmtBytes(a.size)} · แก้ไขล่าสุด {new Date(a.modified_at).toLocaleString('th-TH')}
                    </div>
                  </div>
                  <audio
                    controls
                    preload="none"
                    style={{ width: '100%', maxWidth: 420 }}
                    src={a.url.startsWith('http') ? a.url : `${API_BASE}${a.url}`}
                  />
                  <div className="d-flex gap-2">
                    <a
                      className="btn btn-sm btn-outline-secondary"
                      href={a.url.startsWith('http') ? a.url : `${API_BASE}${a.url}`}
                      download
                    >
                      ดาวน์โหลด
                    </a>
                    <a
                      className="btn btn-sm btn-outline-primary"
                      href={a.url.startsWith('http') ? a.url : `${API_BASE}${a.url}`}
                      target="_blank" rel="noreferrer"
                    >
                      เปิดไฟล์
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
