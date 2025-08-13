import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Button, Spinner, Alert, Form, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

const isDigits = (s) => /^\d+$/.test(s);
const isFullName = (s) => s.trim().split(/\s+/).filter(Boolean).length >= 2;
const isValid = (q) => {
  const t = q.trim();
  if (!t) return false;
  const digits = t.replace(/\D/g, "");
  return (digits.length >= 6 && isDigits(digits)) || isFullName(t);
};

export default function LegacyMemberCheck() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [invalid, setInvalid] = useState("");
  const [exists, setExists] = useState(null); // null | true | false
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();
  const canSearch = useMemo(() => isValid(q), [q]);

  // Open modal automatically when not found
  useEffect(() => {
    if (exists === false) setShowModal(true);
  }, [exists]);

  const submit = async (e) => {
    e.preventDefault();
    if (!canSearch) {
      setInvalid("กรุณากรอก ชื่อ-นามสกุล หรือ หมายเลขบัตร/หมายเลขโทรศัพท์ (อย่างน้อย 6 หลัก)");
      return;
    }
    setInvalid("");
    setErr("");
    setExists(null);
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE}/legacy/members/check`, { q });
      setExists(!!data?.exists);
    } catch (e) {
      console.error("check error:", e);
      setErr(e?.response?.data?.message || e?.message || "ตรวจสอบไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const goRegister = () => {
    setShowModal(false);
    navigate("/register-legacy");
  };

  return (
    <>
      {/* Hero */}
      <div className="hero-gradient d-flex align-items-center justify-content-center">
        <h1 className="text-white fw-bold text-center mb-0 hero-title">ตรวจสอบรายชื่อระบบเดิม</h1>
      </div>

      <Container className="py-5">
        {/* Search */}
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <Card className="glass shadow-lg border-0">
              <Card.Body className="p-4 p-md-5">
                <Form onSubmit={submit} className="d-flex gap-2 flex-column flex-md-row">
                  <Form.Control
                    type="text"
                    className="rounded-pill px-4 py-3 fs-6"
                    placeholder="พิมพ์ ชื่อ-นามสกุล หรือ หมายเลขบัตร/โทรศัพท์ (เฉพาะตัวเลข)"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    isInvalid={!!invalid}
                  />
                  <Button
                    type="submit"
                    className="primary-btn rounded-pill px-5 py-3 btn-lg text-nowrap flex-shrink-0"
                    disabled={loading || !canSearch}
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        กำลังตรวจสอบ...
                      </>
                    ) : (
                      "ตรวจสอบ"
                    )}
                  </Button>
                </Form>
                <div className="small text-muted mt-2">
                  • เพื่อความปลอดภัย ระบบจะแสดงเพียงผลการมีชื่อในระบบเดิมเท่านั้น
                </div>
                {invalid && <div className="text-danger mt-2">{invalid}</div>}
                {err && (
                  <Alert variant="danger" className="mt-3 mb-0">
                    {err}
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Result card shows only when we have a definitive answer and no error */}
        {exists !== null && !err && (
          <Row className="justify-content-center mt-4">
            <Col md={10} lg={8}>
              <Card className="status-card shadow-sm border-0 fade-up">
                <Card.Body className="p-4 text-center">
                  {exists ? (
                    <div className="d-inline-flex align-items-center gap-3">
                      <div className="fs-5 fw-semibold text-success">พบข้อมูลของคุณในระบบเดิม</div>
                    </div>
                  ) : (
                    <div className="d-inline-flex align-items-center gap-3">
                      <div className="fs-5 fw-semibold text-warning">ไม่พบข้อมูลในระบบเดิม</div>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>

      {/* Centered modal opens when exists === false */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>ไม่พบข้อมูล</Modal.Title>
        </Modal.Header>
        <Modal.Body>ต้องการลงทะเบียนสมาชิกใหม่หรือไม่?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            ยกเลิก
          </Button>
          <Button variant="success" onClick={goRegister}>
            ลงทะเบียน
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
