import "animate.css";

import { Col, Row } from "antd";
import styles from "./index.module.scss";

const AnimateCard = () => {
  const animateList = [
    "animate__bounce",
    "animate__flash",
    "animate__pulse",
    "animate__rubberBand",
    "animate__shakeX",
    "animate__shakeY",
    "animate__headShake",
    "animate__swing",
    "animate__tada",
    "animate__wobble",
    "animate__jello",
    "animate__heartBeat",
    "animate__backInDown",
    "animate__backInLeft",
    "animate__backInRight",
    "animate__backInUp",
    "animate__backOutDown",
    "animate__backOutLeft",
    "animate__backOutRight",
    "animate__backOutUp",
    "animate__bounceIn",
    "animate__bounceInDown",
    "animate__bounceInLeft",
    "animate__bounceInRight",
    "animate__bounceInUp",
    "animate__bounceOut",
    "animate__bounceOutDown",
    "animate__bounceOutLeft",
    "animate__bounceOutRight",
    "animate__bounceOutUp",
    "animate__fadeIn",
    "animate__fadeInDown",
    "animate__fadeInDownBig",
    "animate__fadeInLeft",
    "animate__fadeInLeftBig",
    "animate__fadeInRight",
    "animate__fadeInRightBig",
    "animate__fadeInUp",
    "animate__fadeInUpBig",
    "animate__fadeInTopLeft",
    "animate__fadeInTopRight",
    "animate__fadeInBottomLeft",
    "animate__fadeInBottomRight",
    "animate__fadeOut",
    "animate__fadeOutDown",
    "animate__fadeOutDownBig",
    "animate__fadeOutLeft",
    "animate__fadeOutLeftBig",
    "animate__fadeOutRight",
    "animate__fadeOutRightBig",
    "animate__fadeOutUp",
    "animate__fadeOutUpBig",
    "animate__fadeOutTopLeft",
    "animate__fadeOutTopRight",
    "animate__fadeOutBottomRight",
    "animate__fadeOutBottomLeft",
    "animate__Flippers",
    "animate__flip",
    "animate__flipInX",
    "animate__flipInY",
    "animate__flipOutX",
    "animate__flipOutY",
    "animate__Lightspeed",
    "animate__lightSpeedInRight",
    "animate__lightSpeedInLeft",
    "animate__lightSpeedOutRight",
    "animate__lightSpeedOutLeft",
    "animate__rotateIn",
    "animate__rotateInDownLeft",
    "animate__rotateInDownRight",
    "animate__rotateInUpLeft",
    "animate__rotateInUpRight",
    "animate__rotateOut",
    "animate__rotateOutDownLeft",
    "animate__rotateOutDownRight",
    "animate__rotateOutUpLeft",
    "animate__rotateOutUpRight",
    "animate__Specials",
    "animate__hinge",
    "animate__jackInTheBox",
    "animate__rollIn",
    "animate__rollOut",
    "animate__zoomIn",
    "animate__zoomInDown",
    "animate__zoomInLeft",
    "animate__zoomInRight",
    "animate__zoomInUp",
    "animate__zoomOut",
    "animate__zoomOutDown",
    "animate__zoomOutLeft",
    "animate__zoomOutRight",
    "animate__zoomOutUp",
    "animate__slideInDown",
    "animate__slideInLeft",
    "animate__slideInRight",
    "animate__slideInUp",
    "animate__slideOutDown",
    "animate__slideOutLeft",
    "animate__slideOutRight",
    "animate__slideOutUp"
  ];

  const onMouseOver = (event, animate) => {
    event.stopPropagation();
    event.preventDefault();
    event.target.removeAttribute("class");
    event.target.setAttribute("class", `animateContainer animate__animated ${animate}`);
  };

  const onMouseOut = event => {
    event.stopPropagation();
    event.preventDefault();
    if (event.target.getAttribute("data-sorce")) {
      event.target.setAttribute("class", "animateContainer");
    } else {
      event.target.firstChild.setAttribute("class", `animateContainer`);
    }
  };
  return (
    <div className={styles.container}>
      <Row gutter={[12, 12]}>
        {animateList.map(v => {
          return (
            <Col xs={12} sm={12} md={8} lg={4} xl={4} xxl={4} onMouseLeave={event => onMouseOut(event)} key={v}>
              <div data-sorce="1" onMouseEnter={event => onMouseOver(event, v)} className="animateContainer">
                {v}
              </div>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default AnimateCard;
