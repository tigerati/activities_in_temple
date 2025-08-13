import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import successAnimation from '../assets/checkmark.json';
import qrImage from '../assets/qr.png';
import { Button } from 'react-bootstrap';

function ActivitySuccess() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <>
      <div className="hero-section d-flex align-items-center justify-content-center"></div>
      <div className="text-center my-5">
        <h2 className="text-success mb-4">คุณได้ลงทะเบียนสำเร็จ!</h2>
        <div style={{ maxWidth: 300, margin: '0 auto' }}>
          <Lottie animationData={successAnimation} loop={false} />
        </div>
        <h3 className="mt-3" style={{ marginBottom: '30px' }}>
          ขอบคุณที่ลงทะเบียนกิจกรรมกับทางวัด
        </h3>
        <p style={{ marginBottom: '50px' }}>
          คุณสามารถใช้ QR Code นี้เพื่อยืนยันการเข้าร่วมกิจกรรม
        </p>
        <img src={qrImage} alt="QR_Code" className="mb-4" style={{ maxWidth: 200 }} />

        {/* Centered button */}
        <div className="mt-4">
          <Button
            variant="primary"
            style={{
              backgroundColor: '#ffa726',
              border: 'none',
              color: 'white',
              padding: '10px 20px',
              fontSize: '1rem',
              borderRadius: '8px',
            }}
            onClick={() => navigate('/')}
          >
            กลับไปหน้าแรก
          </Button>
        </div>
      </div>
    </>
  );
}

export default ActivitySuccess;
