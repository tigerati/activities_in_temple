// src/utils/logout.js
import Swal from "sweetalert2";
import lottie from "lottie-web";
import checkmarkAnim from "../assets/checkmark.json";

export function handleLogout(navigate) {
  Swal.fire({
    title: "ออกจากระบบสำเร็จ",
    html: '<div id="lottie-logout" style="width:120px;height:120px;margin:6px auto 0"></div>',
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
    backdrop: true,
    didOpen: () => {
      // Remove auth immediately
      localStorage.removeItem("token");

      const container = document.getElementById("lottie-logout");
      if (container) {
        lottie.loadAnimation({
          container,
          animationData: checkmarkAnim,
          renderer: "svg",
          loop: false,
          autoplay: true,
        });
      }
    },
    willClose: () => {
      lottie.destroy();
      navigate("/");
    },
  });
}
