// src/pages/AdminLegacyLookup.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminLegacyLookup.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export default function AdminLegacyLookup() {
  const PAGE_SIZE = 100;

  // paging / totals
  const [page, setPage] = useState(0); // 0-based
  const [total, setTotal] = useState(0);
  const offset = page * PAGE_SIZE;

  // search mode
  const [q, setQ] = useState("");
  const [currentQuery, setCurrentQuery] = useState(""); // "" => show-all mode

  // data & ui
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [revealed, setRevealed] = useState({});
  const [sortKey, setSortKey] = useState("mem_id");
  const [sortDir, setSortDir] = useState("asc");

  // note modal
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [noteTarget, setNoteTarget] = useState(null);
  const [noteValue, setNoteValue] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  // set-id modal
  const [idModalOpen, setIdModalOpen] = useState(false);
  const [idTarget, setIdTarget] = useState(null);
  const [idValue, setIdValue] = useState("");
  const [savingId, setSavingId] = useState(false);

  // row delete state map
  const [deleting, setDeleting] = useState({});

  const token = localStorage.getItem("token");

  const maskId = (id) => {
    if (!id) return "-";
    const digits = String(id).replace(/\D/g, "");
    if (digits.length <= 4) return digits;
    return "••••••" + digits.slice(-4);
  };

  // ---------------- fetchers ----------------
  const fetchAll = async () => {
    setLoading(true);
    setErr("");
    setRevealed({});
    try {
      const { data } = await axios.get(`${API_BASE}/legacy/admin/members/all`, {
        params: { sortKey, sortDir, limit: PAGE_SIZE, offset },
        headers: { Authorization: `Bearer ${token}` },
      });
      setRes(Array.isArray(data) ? { count: data.length, matches: data } : data);
      setTotal(data.total ?? data.count ?? 0);
    } catch (e) {
      setErr(e?.response?.data?.message || "ดึงข้อมูลทั้งหมดไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const fetchLookup = async () => {
    setLoading(true);
    setErr("");
    setRevealed({});
    try {
      const { data } = await axios.get(`${API_BASE}/legacy/admin/members/lookup`, {
        params: { q: currentQuery, sortKey, sortDir, limit: PAGE_SIZE, offset },
        headers: { Authorization: `Bearer ${token}` },
      });
      setRes(Array.isArray(data) ? { count: data.length, matches: data } : data);
      setTotal(data.total ?? data.count ?? 0);
    } catch (e) {
      setErr(e?.response?.data?.message || "ค้นหาไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  // submit search => switch to lookup mode & reset page
  const search = (e) => {
    e?.preventDefault?.();
    if (!q.trim()) return;
    setPage(0);
    setCurrentQuery(q.trim());
  };

  // show all => switch to all mode & reset page
  const loadAll = () => {
    setPage(0);
    setCurrentQuery("");
  };

  // refetch on mode / page / sort changes
  useEffect(() => {
    if (currentQuery) fetchLookup();
    else fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sortKey, sortDir, currentQuery]);

  // sorting: server-side; also reset to page 0
  const onSort = (key) => {
    const nextDir = sortKey === key ? (sortDir === "asc" ? "desc" : "asc") : "asc";
    setSortKey(key);
    setSortDir(nextDir);
    setPage(0);
  };

  const SortHead = ({ label, k, className }) => (
    <th
      role="button"
      onClick={() => onSort(k)}
      className={className}
      style={{ whiteSpace: "nowrap" }}
      title="คลิกเพื่อจัดเรียง"
    >
      {label}{" "}
      <small className="text-muted">
        {sortKey === k ? (sortDir === "asc" ? "▲" : "▼") : ""}
      </small>
    </th>
  );

  const toggleReveal = (i) => setRevealed((p) => ({ ...p, [i]: !p[i] }));

  // ---------------- note modal ----------------
  const openNoteModal = (m) => {
    setNoteTarget(m);
    setNoteValue(m.note || "");
    setNoteModalOpen(true);
  };
  const closeNoteModal = () => {
    setNoteModalOpen(false);
    setNoteTarget(null);
    setNoteValue("");
  };
  const saveNote = async () => {
    if (!noteTarget) return;
    const ident = noteTarget.mem_id || noteTarget.id; // robust
    setSavingNote(true);
    try {
      await axios.patch(
        `${API_BASE}/legacy/admin/members/${encodeURIComponent(ident)}/note`,
        { note: noteValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRes((prev) => {
        if (!prev?.matches) return prev;
        const updated = prev.matches.map((m) =>
          (m.mem_id || m.id) === ident ? { ...m, note: noteValue } : m
        );
        return { ...prev, matches: updated };
      });
      closeNoteModal();
    } catch (e) {
      alert(e?.response?.data?.message || "บันทึกหมายเหตุไม่สำเร็จ");
    } finally {
      setSavingNote(false);
    }
  };

  // ---------------- set-id modal ----------------
  const openIdModal = (m) => {
    setIdTarget(m);
    setIdValue(m.mem_id || "");
    setIdModalOpen(true);
  };
  const closeIdModal = () => {
    setIdModalOpen(false);
    setIdTarget(null);
    setIdValue("");
  };
  const saveMemId = async () => {
    if (!idTarget) return;
    const ident = idTarget.mem_id || idTarget.id; // allow both
    if (!idValue.trim()) {
      alert("กรุณากรอกรหัสสมาชิก");
      return;
    }
    setSavingId(true);
    try {
      const { data } = await axios.patch(
        `${API_BASE}/legacy/admin/members/${encodeURIComponent(ident)}/mem-id`,
        { mem_id: idValue.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRes((prev) => {
        if (!prev?.matches) return prev;
        const updated = prev.matches.map((m) =>
          (m.mem_id || m.id) === ident ? { ...m, mem_id: data.mem_id || idValue.trim() } : m
        );
        return { ...prev, matches: updated };
      });
      closeIdModal();
    } catch (e) {
      alert(e?.response?.data?.message || "กำหนดรหัสสมาชิกไม่สำเร็จ");
    } finally {
      setSavingId(false);
    }
  };

  // ---------------- delete ----------------
  const deleteUser = async (m) => {
    const ident = m.mem_id || m.id; // robust
    console.log('Deleting ident:', ident, m);
    if (!window.confirm("ยืนยันลบผู้ใช้นี้? การลบไม่สามารถย้อนกลับได้")) return;
    setDeleting((p) => ({ ...p, [ident]: true }));
    try {
      await axios.delete(
        `${API_BASE}/legacy/admin/members/${encodeURIComponent(ident)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRes((prev) => {
        if (!prev?.matches) return prev;
        const updated = prev.matches.filter((x) => (x.mem_id || x.id) !== ident);
        return { ...prev, matches: updated, count: updated.length };
      });
    } catch (e) {
      alert(e?.response?.data?.message || "ลบผู้ใช้ไม่สำเร็จ");
    } finally {
      setDeleting((p) => ({ ...p, [ident]: false }));
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: 1000 }}>
      <h3 className="mb-3">ค้นหาข้อมูลสมาชิก (สำหรับเจ้าหน้าที่)</h3>

      <form onSubmit={search} className="d-flex gap-2 flex-wrap">
        <input
          className="form-control"
          placeholder="ชื่อ หรือ นามสกุล หรือ ชื่อและนามสกุล(ตัวอย่าง สมชาย ใจดี) หรือ เลขบัตรประชาชน"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ minWidth: 260, flex: "1 1 auto" }}
        />
        <button className="btn btn-warning text-white" disabled={loading}>
          {loading ? "กำลังค้นหา..." : "ค้นหา"}
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={loadAll}
          disabled={loading}
          title="ดึงข้อมูลสมาชิกทั้งหมด"
        >
          {loading ? "กำลังโหลด..." : "แสดงทั้งหมด"}
        </button>
      </form>

      {err && <div className="alert alert-danger mt-3">{err}</div>}

      {res && !err && (
        <div className="mt-3">
          <div className="d-flex justify-content-between align-items-center my-2">
            <div className="text-muted">
              {res?.count ?? 0} รายการ | หน้าที่ {page + 1} จาก{" "}
              {Math.max(1, Math.ceil(total / PAGE_SIZE))}
              {currentQuery ? ` | คำค้น: “${currentQuery}”` : ""}
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={page === 0 || loading}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                ‹ ก่อนหน้า
              </button>
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={(page + 1) * PAGE_SIZE >= total || loading}
                onClick={() => setPage((p) => p + 1)}
              >
                ถัดไป ›
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-sm align-middle full-width-table">
              <thead>
                <tr>
                  <SortHead label="รหัสสมาชิก" k="mem_id" className="col-memid" />
                  <SortHead label="ชื่อ" k="name" />
                  <SortHead label="อีเมล" k="mem_email" />
                  <SortHead label="โทร" k="mem_phone" />
                  <SortHead label="จังหวัด/อำเภอ" k="province_amphur" />
                  <th className="col-idcard">เลขบัตร</th>
                  <SortHead label="วันเกิด" k="birthdate" className="col-birthdate" />
                  <th>หมายเหตุ</th>
                  <th>การกระทำ</th>
                </tr>
              </thead>

              <tbody>
                {(res?.matches || []).map((m, i) => {
                  const fullId = m.mem_idcard || "";
                  const isShown = !!revealed[i];
                  const nameText = [m.prefix || m.prefix_oth, m.mem_fname, m.mem_lname]
                    .filter(Boolean)
                    .join(" ");
                  const provText = [m.mem_amphur, m.mem_province].filter(Boolean).join(", ");
                  const ident = m.mem_id || m.id; // single identity for actions

                  return (
                    <tr key={`${ident}-${i}`}>
                      <td className="col-memid">{m.mem_id || "-"}</td>
                      <td className="name-col">{nameText || "-"}</td>
                      <td>{m.mem_email || "-"}</td>
                      <td>{m.mem_phone || "-"}</td>
                      <td>{provText || "-"}</td>

                      <td className="col-idcard">
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          <span className="idcard-text">
                            {isShown ? fullId || "-" : maskId(fullId)}
                          </span>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => toggleReveal(i)}
                          >
                            {isShown ? "ซ่อน" : "แสดง"}
                          </button>
                        </div>
                      </td>

                      <td className="col-birthdate">
                        {m.birthdate ? (m.birthdate.split?.("T")[0] || m.birthdate) : "-"}
                      </td>

                      <td>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => openNoteModal(m)}
                        >
                          Note
                        </button>
                      </td>

                      <td>
                        <div className="d-flex gap-2 flex-wrap">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => openIdModal(m)}
                          >
                            กำหนดรหัส
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            disabled={!!deleting[ident]}
                            onClick={() => deleteUser(m)}
                          >
                            {deleting[ident] ? "กำลังลบ..." : "ลบ"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {(!res?.matches || res.matches.length === 0) && (
                  <tr>
                    <td colSpan={9} className="text-center text-muted py-3">
                      ไม่พบข้อมูล
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {noteModalOpen && (
        <div className="note-modal-backdrop">
          <div className="note-modal">
            <h5 className="mb-3">
              หมายเหตุสำหรับ {noteTarget?.prefix || noteTarget?.prefix_oth || ""}{" "}
              {noteTarget?.mem_fname} {noteTarget?.mem_lname}
            </h5>
            <textarea
              rows={4}
              className="form-control mb-3"
              value={noteValue}
              onChange={(e) => setNoteValue(e.target.value)}
              placeholder="พิมพ์หมายเหตุที่นี่..."
            />
            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-secondary" onClick={closeNoteModal} disabled={savingNote}>
                ยกเลิก
              </button>
              <button className="btn btn-primary" onClick={saveNote} disabled={savingNote}>
                {savingNote ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Set ID Modal */}
      {idModalOpen && (
        <div className="note-modal-backdrop">
          <div className="note-modal">
            <h5 className="mb-3">
              กำหนดรหัสสมาชิกสำหรับ{" "}
              {idTarget?.prefix || idTarget?.prefix_oth || ""} {idTarget?.mem_fname}{" "}
              {idTarget?.mem_lname}
            </h5>
            <input
              className="form-control mb-2"
              placeholder="เช่น 100123 หรือ MEM00123"
              value={idValue}
              onChange={(e) => setIdValue(e.target.value)}
            />
            <div className="text-muted mb-3" style={{ fontSize: 12 }}>
              * ต้องไม่ซ้ำกับสมาชิกคนอื่น
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-secondary" onClick={closeIdModal} disabled={savingId}>
                ยกเลิก
              </button>
              <button className="btn btn-primary" onClick={saveMemId} disabled={savingId || !idValue.trim()}>
                {savingId ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
