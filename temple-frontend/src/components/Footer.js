import React from "react";
import "./Footer.css";
import lineLogo from "../assets/line_logo.png";

function Footer() {
  return (
    <footer className="footer text-white py-3">
      <div className="container">
        <p className="mb-1">
          วัดมเหยงคณ์<br />
          95 ม.2 ต.หันตรา อ.พระนครศรีอยุธยา จ.พระนครศรีอยุธยา 13000
        </p>

        {/* Line contact bar */}
        <a
          href="https://line.me/R/ti/p/@013ikhbn"
          target="_blank"
          rel="noopener noreferrer"
          className="line-contact-bar text-decoration-none mt-2 d-inline-flex align-items-center"
        >
          <img src={lineLogo} alt="LINE" className="line-icon me-2" />
          <span className="line-text">
            Line วิปัสสนาวิชชาลัย (สำหรับติดต่อ การปฏิบัติธรรม)
          </span>
        </a>
      </div>
    </footer>
  );
}

export default Footer;
