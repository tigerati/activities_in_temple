// src/pages/Profile.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import defaultAvatar from "../assets/default-avatar.png";
import "./Profile.css";
import normalizeUser from "../components/NormalizeUser"; // Assuming you have a utility to normalize user data
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Button,
  Placeholder,
  Badge,
} from "react-bootstrap";


const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login?next=/profile", { replace: true });
      return;
    }

    let alive = true;
    (async () => {
      try {
        setErr("");
        setLoading(true);
        const { data } = await axios.get(`${API_BASE}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (alive) setUser(normalizeUser(data));
      } catch (e) {
        if (!alive) return;
        if (e?.response?.status === 401) {
          navigate("/login?next=/profile", { replace: true });
        } else {
          setErr(e?.response?.data?.message || "ไม่สามารถโหลดโปรไฟล์ได้");
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [navigate]);

  const fullName =
    (user?.first_name ? user.first_name : "") +
    (user?.last_name ? ` ${user.last_name}` : "");

  const maskedId = user?.id_number
    ? String(user.id_number).replace(/\d(?=\d{4})/g, "•")
    : "-";

  const fmtDate = (d) => {
    if (!d) return "-";
    try {
      // ensure no TZ shift by appending midnight if a bare YYYY-MM-DD comes in
      const dateObj = /^\d{4}-\d{2}-\d{2}$/.test(d) ? new Date(`${d}T00:00:00`) : new Date(d);
      return new Intl.DateTimeFormat("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(dateObj);
    } catch {
      return d;
    }
  };

  return (
    <>
      {/* Hero */}
      <div
        className="d-flex align-items-center justify-content-center"
        style={{
          minHeight: 180,
          background:
            "linear-gradient(135deg, #ff9800 0%, #ffa726 40%, #ffcc80 100%)",
        }}
      >
        <h1 className="text-white fw-bold text-center mb-0">โปรไฟล์</h1>
      </div>

      <Container className="py-5">
        {err && <Alert variant="danger" className="mb-4">{err}</Alert>}

        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <Card className="shadow-sm border-0 modern-card">
              <Card.Body className="p-4 p-md-5 text-center">

                {/* Avatar */}
                <div className="avatar-circle-large mx-auto mb-3">
                  {loading ? (
                    <Spinner animation="border" size="lg" />
                  ) : (
                    <img
                      src={user?.profile_image_url || defaultAvatar}
                      alt="User Avatar"
                      className="avatar-img"
                      onError={(e) => (e.currentTarget.src = defaultAvatar)}
                    />
                  )}
                </div>

                {/* Name & role */}
                {loading ? (
                  <Placeholder as="h4" animation="wave" className="mb-2">
                    <Placeholder xs={6} />
                  </Placeholder>
                ) : (
                  <h4 className="mb-1" style={{ color: "#ff6f00" }}>
                    {fullName || "-"}
                  </h4>
                )}
                {!loading && (
                  <Badge bg="secondary" className="rounded-pill mb-4">
                    ผู้ใช้งาน
                  </Badge>
                )}

                {/* Edit button */}
                <div className="mb-4">
                  <Button
                    style={{ backgroundColor: "#ffa726", border: "none" }}
                    onClick={() => navigate("/profile/edit")}
                    disabled={loading}
                  >
                    แก้ไขโปรไฟล์
                  </Button>
                </div>

                {/* Details */}
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <div className="row mb-3" key={i}>
                      <div className="col-sm-4 text-muted">
                        <Placeholder animation="wave"><Placeholder xs={5} /></Placeholder>
                      </div>
                      <div className="col-sm-8">
                        <Placeholder animation="wave"><Placeholder xs={8} /></Placeholder>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <DetailRow label="ชื่อ" value={user?.first_name || "-"} />
                    <DetailRow label="นามสกุล" value={user?.last_name || "-"} />
                    <DetailRow label="อีเมล" value={user?.email || "-"} />
                    <DetailRow label="เบอร์โทร" value={user?.phone || "-"} />
                    <DetailRow label="ที่อยู่" value={user?.address || "-"} />
                    <DetailRow label="เลขบัตรประชาชน/พาสปอร์ต" value={maskedId} />
                    <DetailRow label="วันเกิด" value={fmtDate(user?.birthdate)} />
                    <DetailRow label="วันที่สมัครใช้งาน" value={fmtDate(user?.created_at)} />
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="row mb-3 text-start">
      <div className="col-sm-4 text-muted">{label}</div>
      <div className="col-sm-8">{value}</div>
    </div>
  );
}
