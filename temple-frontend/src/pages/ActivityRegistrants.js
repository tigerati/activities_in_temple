import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

export default function ActivityRegistrants() {
  const { id } = useParams();
  const token = localStorage.getItem('token');
  const [rows, setRows] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:5000/activity/${id}/registrants`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setRows(res.data));
  }, [id, token]);

  const downloadCSV = () => {
    window.location.href = `http://localhost:5000/activity/${id}/registrants.csv?token=${token}`;
    // (Alternative) fetch with headers and create blob if you don’t want querystring token
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>รายชื่อผู้สมัคร</h3>
        <button className="btn btn-outline-primary" onClick={downloadCSV}>ดาวน์โหลด CSV</button>
      </div>
      <table className="table table-striped">
        <thead>
          <tr><th>ชื่อ</th><th>อีเมล</th><th>โทร</th><th>เวลาสมัคร</th></tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>{r.full_name}</td>
              <td>{r.email}</td>
              <td>{r.phone}</td>
              <td>{r.registered_at ? new Date(r.registered_at).toLocaleString() : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
