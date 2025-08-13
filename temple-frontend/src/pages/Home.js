import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner, Button, Container, Row, Col } from "react-bootstrap";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./Home.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

function buildImageUrl(image_url) {
  if (!image_url) return "/images/placeholder.webp";
  return `/images/activity_images/${image_url}`;
}

function ActivityTeaser({ item, reverse, onAction, cta }) {
  const navigate = useNavigate();
  return (
    <Row className="align-items-center mb-5 gy-3 gy-md-0">
      {/* Image */}
      <Col md={6} className={reverse ? "order-md-last" : ""}>
        <div onClick={() => onAction(item.id)} style={{ cursor: "pointer" }}>
          <img
            src={buildImageUrl(item.image_url)}
            alt={item.title}
            className="rounded w-100"
            style={{ height: 260, objectFit: "cover" }}
            loading="lazy"
            onError={(e) => (e.currentTarget.src = "/images/placeholder.webp")}
          />
        </div>
      </Col>

      {/* Text + button */}
      <Col
        md={6}
        className={[
          "d-flex flex-column gap-2",
          // center on mobile
          "align-items-center text-center",
          // desktop: align opposite sides depending on `reverse`
          reverse ? "align-items-md-start text-md-start ps-md-5"
                  : "align-items-md-end text-md-end pe-md-5",
        ].join(" ")}
      >
        <h2 className="m-0 teaser-title">{item.title}</h2>
        {item.description && (
          <p className="m-0 teaser-desc">{item.description}</p>
        )}

        {/* Buttons */}
        <div
          className={[
            "w-100",
            // center on mobile; align by side on desktop
            reverse ? "text-md-start" : "text-md-end",
          ].join(" ")}
        >
          <div
            className={[
              "d-flex flex-wrap gap-2",
              "justify-content-center",                    // mobile center
              reverse ? "justify-content-md-start" : "justify-content-md-end", // desktop
            ].join(" ")}
          >
            <Button className="teaser-cta" onClick={() => onAction(item.id)}>
              {cta}
            </Button>

            <Button
              variant="outline-warning"
              className="teaser-cta"
              onClick={() => navigate(`/legacy/check`)}
            >
              ตรวจสอบรายชื่อสมาชิก
            </Button>
          </div>
        </div>
      </Col>
    </Row>
  );
}

export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [role, setRole] = useState(null); // "admin" | "user" | null
  const navigate = useNavigate();

  // detect role from token
  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) return setRole(null);
    try {
      const { role } = jwtDecode(t);
      setRole(role || null);
    } catch {
      setRole(null);
    }
  }, []);

  // fetch activities
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setErr("");
        setLoading(true);
        const { data } = await axios.get(`${API_BASE}/activity`);
        if (alive) setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        if (alive) setErr(e?.response?.data?.message || "โหลดกิจกรรมไม่สำเร็จ");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // click behavior per role
  const handleAction = (id) => {
    // if (role === "admin") {
    //   navigate(`/admin/activities/${id}/registrants`);
    // } else {
    //   navigate(`/register-legacy`);
    // }
    navigate(`/register-legacy`);
  };

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" role="status" />
        </div>
      );
    }
    if (err) return <div className="alert alert-danger mt-4">{err}</div>;
    if (items.length === 0)
      return <div className="text-center text-muted py-5">ยังไม่มีกิจกรรม</div>;

    const cta = "สมัครสมาชิก";
    return items.map((a, i) => (
      <ActivityTeaser
        key={a.id}
        item={a}
        reverse={i % 2 === 1}
        onAction={handleAction}
        cta={cta}
      />
    ));
  }, [loading, err, items, role]);

  return (
    <>
      <div className="hero-section d-flex align-items-center justify-content-center">
        <h1 className="text-white fw-bold text-center hero-title">กิจกรรมภายในวัด</h1>
      </div>
      <Container className="my-5">{content}</Container>
    </>
  );
}