import { useEffect, useState } from 'react';
import axios from 'axios';

export default function ManageActivities() {
  const [items, setItems] = useState([]);
  const token = localStorage.getItem('token');

  const load = async () => {
    const { data } = await axios.get('http://localhost:5000/activity', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setItems(data);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('ลบกิจกรรมนี้หรือไม่?')) return;
    await axios.delete(`http://localhost:5000/activity/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    load();
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>จัดการกิจกรรม</h3>
        <a className="btn btn-warning text-white" href="/admin/activities/new">เพิ่มกิจกรรม</a>
      </div>

      <table className="table table-hover">
        <thead className="table-light">
          <tr>
            <th>ชื่อกิจกรรม</th><th>วันเวลา</th><th>ความจุ</th><th>สถานที่</th><th></th>
          </tr>
        </thead>
        <tbody>
          {items.map(a => (
            <tr key={a.id}>
              <td>{a.title}</td>
              <td>{a.start_date ? new Date(a.start_date).toLocaleString() : '-'}</td>
              <td>{a.capacity ?? '-'}</td>
              <td>{a.location ?? '-'}</td>
              <td className="text-end">
                <a className="btn btn-sm btn-outline-secondary me-2" href={`/admin/activities/${a.id}/edit`}>แก้ไข</a>
                <a className="btn btn-sm btn-outline-primary me-2" href={`/admin/activities/${a.id}/registrants`}>รายชื่อ</a>
                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(a.id)}>ลบ</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
