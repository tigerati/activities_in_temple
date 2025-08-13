import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Lottie from "lottie-react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  Spinner,
  Alert,
  Placeholder,
} from "react-bootstrap";
import non_data_found from "../assets/non_data_found.json";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export default function RegisteredActivities() {
  const navigate = useNavigate();
  const token = useMemo(() => localStorage.getItem("token"), []);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login?next=/me/registered-activities", { replace: true });
      return;
    }
    let alive = true;
    (async () => {
      try {
        setErr("");
        setLoading(true);
        const { data } = await axios.get(
          `${API_BASE}/users/registered-activities`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (alive) setActivities(Array.isArray(data) ? data : []);
      } catch (e) {
        if (alive)
          setErr(
            e?.response?.data?.message || "ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่"
          );
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [token, navigate]);

  const formatDate = (d) => {
    if (!d) return "";
    try {
      return new Intl.DateTimeFormat("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(d));
    } catch {
      return d;
    }
  };

  return (
    <>
      {/* Gradient hero */}
      <div
        className="d-flex align-items-center justify-content-center"
        style={{
          minHeight: 180,
          background:
            "linear-gradient(135deg, #ff9800 0%, #ffa726 40%, #ffcc80 100%)",
        }}
      >
        <h1 className="text-white fw-bold text-center mb-0">
          กิจกรรมที่ลงทะเบียนแล้ว
        </h1>
      </div>

      <Container className="py-5">
        {/* Error state */}
        {err && (
          <Alert variant="danger" className="mb-4">
            {err}
          </Alert>
        )}

        {/* Loading state with skeletons */}
        {loading ? (
          <Row className="g-4">
            {[...Array(4)].map((_, i) => (
              <Col key={i} xs={12} md={6} lg={4}>
                <Card className="shadow-sm border-0 h-100 modern-card">
                  <Card.Body>
                    <Placeholder as={Card.Title} animation="wave">
                      <Placeholder xs={8} />
                    </Placeholder>
                    <Placeholder as={Card.Text} animation="wave" className="mb-2">
                      <Placeholder xs={5} /> <Placeholder xs={3} />
                    </Placeholder>
                    <Placeholder.Button xs={4} aria-hidden="true" />
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : activities.length === 0 ? (
          // Empty state
          <div className="d-flex flex-column align-items-center py-5">
            <div style={{ maxWidth: 320 }}>
              <Lottie animationData={non_data_found} loop />
            </div>
            <h5 className="mt-3 text-muted text-center">
              ขออภัย คุณยังไม่ได้ลงทะเบียนกิจกรรมใด ๆ
            </h5>
            <Button
              className="mt-3"
              style={{ backgroundColor: "#ff6f00", border: "none" }}
              onClick={() => navigate("/")}
            >
              ไปที่หน้ากิจกรรม
            </Button>
          </div>
        ) : (
          // List
          <Row className="g-4">
            {activities.map((a, i) => (
              <Col key={`${a.id || i}`} xs={12} md={6} lg={4}>
                <Card className="shadow-sm border-0 h-100 modern-card">
                  <Card.Body className="d-flex flex-column">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <Badge bg="success" className="rounded-pill">
                        ลงทะเบียนแล้ว
                      </Badge>
                      {/* If you have status later, show different colors */}
                    </div>
                    <Card.Title className="mb-2" style={{ color: "#ff6f00" }}>
                      {a.title}
                    </Card.Title>
                    {a.date && (
                      <div className="text-muted mb-3">
                        <i className="bi bi-calendar-event me-2" />
                        วันที่: {formatDate(a.date)}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </>
  );
}
