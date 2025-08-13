import React, { useState } from 'react';
import axios from 'axios';
import qr from '../assets/qr.png';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Replace this with your actual endpoint or logic
      await axios.post('http://localhost:5000/contact', formData);
      alert('ส่งข้อความเรียบร้อยแล้ว!');
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      alert('เกิดข้อผิดพลาด โปรดลองอีกครั้ง');
    }
  };

  return (
    <>
        <div className="hero-section d-flex align-items-center justify-content-center">
            <h1 className="text-white display-6 fw-bold text-center">ติดต่อเรา</h1>
        </div>
        <div className="container mt-5">
            <figure className="text-center mb-4">
                <img src={qr} style={{ marginBottom: '30px' }} className="img-fluid img-thumbnail rounded mx-auto d-block"/>
                <figcaption className="mt-2">สแกน QR Code สำหรับติดต่อสอบถามเพิ่มผ่านทาง Line OA</figcaption>
            </figure>
        </div>
        <footer className="text-center mt-5"></footer>
    </>
  );
}

export default Contact;
