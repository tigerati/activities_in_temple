import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function AdminDashboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        // Send token in Authorization header
        const res = await axios.get('http://localhost:5000/users/admin-only-data', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setUsers(res.data);
      } catch (err) {
        console.error('Error fetching users:', err);
        alert('You must be logged in to access this data.');
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="container mt-5">
        <h2 className="mb-4">รายชื่อผู้ลงทะเบียน</h2>

        <table className="table table-bordered">
            <thead className="table-light">
            <tr>
                <th>#</th>
                <th>ชื่อ</th>
                <th>อีเมล</th>
                <th>เบอร์โทร</th>
                <th>ที่อยู่</th>
            </tr>
            </thead>
            <tbody>
            {users.map((user, index) => (
                <tr key={user.id}>
                <td>{index + 1}</td>
                <td>{user.full_name}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>{user.address}</td>
                </tr>
            ))}
            </tbody>
        </table>
    </div>
  );
}

export default AdminDashboard;
