import React, { useState, useEffect } from 'react';
import axios from 'axios';

function EditUser({ userId }) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: ''
  });

  // Load existing user data
  useEffect(() => {
    axios.get(`http://localhost:5000/users/${userId}`)
      .then(res => setFormData(res.data))
      .catch(err => console.error(err));
  }, [userId]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/users/${userId}`, formData);
      alert('ข้อมูลถูกแก้ไขแล้ว');
    } catch (err) {
      alert('เกิดข้อผิดพลาด');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} />
      <input type="email" name="email" value={formData.email} onChange={handleChange} />
      <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
      <input type="text" name="address" value={formData.address} onChange={handleChange} />
      <button type="submit">บันทึกการแก้ไข</button>
    </form>
  );
}

export default EditUser;
