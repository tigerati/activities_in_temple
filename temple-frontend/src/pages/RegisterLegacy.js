import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export default function RegisterLegacy() {
  const navigate = useNavigate();
  const [f, setF] = useState({
    mem_id: "",
    prefix: "",
    prefix_oth: "",
    mem_fname: "",
    mem_lname: "",
    mem_gender: "",
    mem_province: "",
    mem_amphur: "",
    address1: "",
    address2: "",
    address3: "",
    address4: "",
    address5: "",
    address6: "",
    postcode: "",
    mem_phone: "",
    mem_email: "",
    mem_education: "",
    mem_occupation: "",
    birthdate: "",
    mem_idcard: "",
    zoomdetail: ""
  });
  const [loading, setLoading] = useState(false);

  const set = (e) => setF(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    try {
      setLoading(true);
      const { data } = await axios.post(`${API_BASE}/legacy/members/register`, f, {
        headers: { "Content-Type": "application/json" }
      });
      await Swal.fire({ icon: "success", title: "สำเร็จ", text: data.message || "บันทึกแล้ว" });
      navigate("/legacy/check");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "ไม่สำเร็จ",
        text: err.response?.data?.message || err.message || "เกิดข้อผิดพลาด"
      });
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().slice(0,10);
  const addressFields = [
            { name: "address1", label: "บ้านเลขที่" },
            { name: "address2", label: "หมู่" },
            { name: "address3", label: "ชื่อหมู่บ้าน / โครงการ" },
            { name: "address4", label: "ซอย" },
            { name: "address5", label: "ถนน" },
  ];

  return (
    <div className="container my-5">
      <div className="card shadow border-0 p-4" style={{ maxWidth: 960, margin: "0 auto", borderRadius: 18 }}>
        <h3 className="fw-bold mb-3 text-center">ลงทะเบียนสมาชิก</h3>
        <form onSubmit={submit} className="row g-3">
          {/* Row 1 */}
          <div className="col-12 col-md-3">
            <label className="form-label">คำนำหน้า</label>
            <select name="prefix" value={f.prefix} onChange={set} className="form-select">
              <option value="">เลือก...</option>
              <option>นาย</option>
              <option>นาง</option>
              <option>นางสาว</option>
              <option>อื่นๆ</option>
            </select>
          </div>

          <div className="col-12 col-md-3">
            <label className="form-label">คำนำหน้าอื่น</label>
            <input name="prefix_oth" value={f.prefix_oth} onChange={set} className="form-control" />
          </div>

          <div className="col-12 col-md-3">
            <label className="form-label">ชื่อ</label>
            <input name="mem_fname" value={f.mem_fname} onChange={set} className="form-control" placeholder="กรอกชื่อจริงของคุณ" required />
          </div>

          <div className="col-12 col-md-3">
            <label className="form-label">นามสกุล</label>
            <input name="mem_lname" value={f.mem_lname} onChange={set} className="form-control" placeholder="กรอกนามสกุลของคุณ" required />
          </div>

          {/* Row 2 */}
          <div className="col-12 col-md-3">
            <label className="form-label">เพศ</label>
            <select name="mem_gender" value={f.mem_gender} onChange={set} className="form-select">
              <option value="">เลือก...</option>
              <option>ชาย</option>
              <option>หญิง</option>
              <option>อื่นๆ</option>
            </select>
          </div>
        
          {addressFields.map((field) => (
            <div key={field.name} className="col-12 col-md-6">
                <label className="form-label">{field.label}</label>
                <input
                name={field.name}
                value={f[field.name]}
                onChange={set}
                className="form-control"
                />
            </div>
          ))}

          <div className="col-12 col-md-3">
            <label className="form-label">อำเภอ/เขต</label>
            <input name="mem_amphur" value={f.mem_amphur} onChange={set} className="form-control" placeholder="กรอกอำเภอ/เขต" />
          </div>

          <div className="col-12 col-md-3">
            <label className="form-label">ตำบล/แขวง</label>
            <input name="address6" value={f.address6} onChange={set} className="form-control" />
          </div>

          <div className="col-12 col-md-3">
            <label className="form-label">จังหวัด</label>
            <input name="mem_province" value={f.mem_province} onChange={set} className="form-control" placeholder="กรอกจังหวัด" />
          </div>

          <div className="col-12 col-md-3">
            <label className="form-label">รหัสไปรษณีย์</label>
            <input name="postcode" value={f.postcode} onChange={set} className="form-control" pattern="^\d{5}$" placeholder="กรอกรหัสไปรษณีย์" />
          </div>

          {/* Contact */}
          <div className="col-12 col-md-6">
            <label className="form-label">เบอร์โทร</label>
            <input name="mem_phone" value={f.mem_phone} onChange={set}
                   className="form-control" placeholder="0812345678" required pattern="^\d{9,10}$" />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label">อีเมล</label>
            <input type="email" name="mem_email" value={f.mem_email} onChange={set} className="form-control" placeholder="example@example.com" />
          </div>

          {/* Education/Occupation */}
          <div className="col-12 col-md-6">
            <label className="form-label">การศึกษา</label>
            <input name="mem_education" value={f.mem_education} onChange={set} className="form-control" />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label">อาชีพ</label>
            <input name="mem_occupation" value={f.mem_occupation} onChange={set} className="form-control" />
          </div>

          {/* Birth + ID */}
          <div className="col-12 col-md-6">
            <label className="form-label">วันเกิด</label>
            <input type="date" name="birthdate" className="form-control"
                   value={f.birthdate} onChange={set} max={today} />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label">เลขบัตรประจำตัวประชาชน/พาสปอร์ต</label>
            <input name="mem_idcard" value={f.mem_idcard} onChange={(e)=> {
              const v = e.target.value.toUpperCase().replace(/\s+/g,'');
              setF(p=>({...p, mem_idcard: v}));
            }} className="form-control"
            placeholder="13 หลัก หรือ พาสปอร์ต 6–9 ตัว"
            pattern="(^\d{13}$)|(^[A-Za-z0-9]{6,9}$)" required />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label">อุปกรณ์ที่ใช้</label>
            <select name="zoomdetail" value={f.zoomdetail} onChange={set} className="form-select">
              <option value="">เลือก...</option>
              <option>คอมพิวเตอร์ (PC, Notebook, Macbook)</option>
              <option>Android (Samsung, HUAWEI, Xiaomi, OPPO, Vivo ฯลฯ)</option>
              <option>iOS (iPhone, iPAD)</option>
            </select>
          </div>

          <div className="col-12">
            <button className="btn btn-warning w-100 text-white fw-bold" disabled={loading}>
              {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
