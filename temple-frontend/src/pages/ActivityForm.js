// pages/admin/ActivityForm.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

export default function ActivityForm() {
  const { id } = useParams(); // if exists => edit
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [form, setForm] = useState({
    title: '', description: '', start_date: '', capacity: '', location: '', image_url: ''
  });

  useEffect(() => {
    if (!id) return;
    axios.get(`http://localhost:5000/activity/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      const a = res.data;
      setForm({
        title: a.title || '',
        description: a.description || '',
        start_date: a.start_date ? new Date(a.start_date).toISOString().slice(0,16) : '',
        capacity: a.capacity || '',
        location: a.location || '',
        image_url: a.image_url || ''
      });
    });
  }, [id, token]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    const { data } = await axios.post('http://localhost:5000/activity/upload', fd, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setForm(prev => ({ ...prev, image_url: data.url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, capacity: form.capacity ? Number(form.capacity) : null };
    if (id) {
      await axios.put(`http://localhost:5000/activity/${id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
    } else {
      await axios.post('http://localhost:5000/activity', payload, { headers: { Authorization: `Bearer ${token}` } });
    }
    navigate('/admin/manage-activities');
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-3">{id ? 'แก้ไขกิจกรรม' : 'เพิ่มกิจกรรม'}</h3>
      <form onSubmit={handleSubmit} className="row g-3">
        <div className="col-md-6">
          <label className="form-label">ชื่อกิจกรรม</label>
          <input className="form-control" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} required />
        </div>
        {/* <div className="col-md-6">
          <label className="form-label">วันเวลาเริ่ม</label>
          <input type="datetime-local" className="form-control" value={form.start_date} onChange={e=>setForm({...form, start_date:e.target.value})} />
        </div> */}
        <div className="col-md-12">
          <label className="form-label">รายละเอียด</label>
          <textarea className="form-control" rows="3" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
        </div>
        {/* <div className="col-md-3">
          <label className="form-label">ความจุ</label>
          <input type="number" className="form-control" value={form.capacity} onChange={e=>setForm({...form, capacity:e.target.value})} />
        </div>
        <div className="col-md-9">
          <label className="form-label">สถานที่</label>
          <input className="form-control" value={form.location} onChange={e=>setForm({...form, location:e.target.value})} />
        </div> */}
        <div className="col-md-8">
          <label className="form-label">รูปภาพ</label>
          <input type="file" className="form-control" onChange={handleUpload} />
          {form.image_url && <small className="text-muted d-block mt-1">อัปโหลดแล้ว: {form.image_url}</small>}
        </div>
        <div className="col-12">
          <button className="btn btn-warning text-white">บันทึก</button>
          <button type="button" className="btn btn-outline-secondary ms-2" onClick={()=>navigate('/admin/manage-activities')}>ยกเลิก</button>
        </div>
      </form>
    </div>
  );
}
