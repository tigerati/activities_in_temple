import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Lottie from "lottie-react";
import thinking from "../assets/thinking.json";
import { Container, Row, Col, Card, Button, Spinner, Alert, Modal } from "react-bootstrap";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export default function ActivityRegister() {
  const { id: activityId } = useParams();
  const navigate = useNavigate();

  const [activityTitle, setActivityTitle] = useState("");
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  // NEW: control alert visibility
  const [showAlert, setShowAlert] = useState(false);

  const token = useMemo(() => localStorage.getItem("token"), []);

  // Auto-hide alert whenever err changes
  useEffect(() => {
    if (!err) return;
    setShowAlert(true);
    const t = setTimeout(() => setShowAlert(false), 3000); // 3s then hide
    return () => clearTimeout(t);
  }, [err]);

  useEffect(() => {
    if (!token) {
      navigate(`/login?next=/activity/${activityId}/register`, { replace: true });
      return;
    }
    try {
      const decoded = jwtDecode(token);
      setUserId(decoded?.id ?? null);
    } catch {
      navigate(`/login?next=/activity/${activityId}/register`, { replace: true });
    }
  }, [token, activityId, navigate]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setErr("");
        setLoading(true);
        const { data } = await axios.get(`${API_BASE}/activity/${activityId}`);
        if (alive) setActivityTitle(data?.title ?? "");
      } catch (e) {
        if (alive) {
          const msg = e?.response?.data?.message || "ไม่สามารถโหลดข้อมูลกิจกรรมได้ กรุณาลองใหม่อีกครั้ง";
          setErr(msg);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [activityId]);

  const handleOpenConfirm = (e) => {
    e.preventDefault();
    setErr("");              // clear previous errors
    setShowAlert(false);
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    setErr("");
    try {
      await axios.post(
        `${API_BASE}/activity/register`,
        { user_id: userId, activity_id: activityId },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      setShowConfirm(false);
      navigate(`/activity/${activityId}/success`);
    } catch (e) {
      if (e?.response?.status === 409) {
        setErr("คุณได้ลงทะเบียนกิจกรรมนี้แล้ว");
        setShowConfirm(false);
      } else if (e?.response?.status === 401) {
        navigate(`/login?next=/activity/${activityId}/register`, { replace: true });
      } else {
        setErr(e?.response?.data?.message || `เกิดข้อผิดพลาดในการลงทะเบียน (${e?.message || "unknown"})`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <>
      <div
        className="d-flex align-items-center justify-content-center"
        style={{
          minHeight: 180,
          background: "linear-gradient(135deg, #ff9800 0%, #ffa726 40%, #ffcc80 100%)",
        }}
      >
        <h1 className="text-white fw-bold text-center mb-0" style={{ letterSpacing: 0.5 }}>
          ลงทะเบียนกิจกรรม
        </h1>
      </div>

      <div style={{ maxWidth: 300, margin: "0 auto" }}>
        <Lottie animationData={thinking} loop />
      </div>

      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={7}>
            {loading ? (
              <div className="d-flex align-items-center justify-content-center py-5">
                <Spinner animation="border" role="status" />
              </div>
            ) : (
              <Card className="shadow border-0" style={{ borderRadius: 16 }}>
                <Card.Body className="p-4 p-md-5">
                  <div className="mb-3">
                    <div className="text-uppercase text-muted" style={{ fontSize: 12, letterSpacing: 1.2 }}>
                      กิจกรรม
                    </div>
                    <h3 className="mb-0" style={{ color: "#ff6f00" }}>
                      {activityTitle || "กิจกรรม"}
                    </h3>
                  </div>

                  {/* Dismissible + auto-hide alert */}
                  {showAlert && (
                    <Alert
                      variant="danger"
                      className="mb-4"
                      dismissible
                      onClose={() => setShowAlert(false)}
                    >
                      {err}
                    </Alert>
                  )}

                  <p className="text-muted mb-4">
                    ยืนยันว่าคุณต้องการลงทะเบียนเข้าร่วมกิจกรรมนี้ ระบบจะบันทึกข้อมูลของคุณและนำคุณไปยังหน้าสำเร็จการลงทะเบียน
                  </p>

                  <div className="d-flex gap-2">
                    <Button
                      variant="success"
                      onClick={handleOpenConfirm}
                      disabled={submitting || !userId}
                      className="px-4"
                    >
                      {submitting ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          กำลังลงทะเบียน...
                        </>
                      ) : (
                        "ยืนยันการลงทะเบียน"
                      )}
                    </Button>

                    <Button variant="outline-secondary" onClick={() => navigate(-1)} disabled={submitting}>
                      กลับ
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>

      <Modal show={showConfirm} onHide={handleCancel} centered>
        <Modal.Header closeButton>
          <Modal.Title>ยืนยันการลงทะเบียน</Modal.Title>
        </Modal.Header>
        <Modal.Body>คุณแน่ใจหรือไม่ว่าต้องการลงทะเบียนเข้าร่วมกิจกรรมนี้?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancel} disabled={submitting}>
            ยกเลิก
          </Button>
          <Button variant="success" onClick={handleConfirm} disabled={submitting}>
            {submitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                กำลังดำเนินการ...
              </>
            ) : (
              "ยืนยัน"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
