import React from "react";
import "./styles.css";
import Button from "../../common/Button";
import iphone from "../../../assets/phone.png";
import gradient from "../../../assets/gradient.png";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { RWebShare } from "react-web-share";

const MainComponent = () => {
  return (
    <div className="flex-info">
      <div className="left-component">
        <motion.h1
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="track-crypto-heading"
        >
          Track Crypto
        </motion.h1>
        <motion.h1
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="real-time-heading"
        >
          Real Time.
        </motion.h1>
        <motion.p
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          Track crypto through a public API in real time. Visit the dashboard to
          do so!
        </motion.p>
        <motion.div
          className="btn-flex"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.5 }}
        >
          <Link to={"/dashboard"}>
            <Button buttonText={"Dashboard"} />
          </Link>
          <RWebShare
            data={{
              text: "Crypto Hunter",
              url: "https://crypto-hunter-three.vercel.app/",
              title: "Crypto Hunter",
            }}
          >
            <div>
              <Button buttonText={"Share"} outlined={true} />
            </div>
          </RWebShare>
        </motion.div>
      </div>
      <div className="phone-container">
        <motion.img
          initial={{ y: -10 }}
          animate={{ y: 10 }}
          transition={{
            type: "smooth",
            repeatType: "mirror",
            duration: 2,
            repeat: Infinity,
          }}
          src={iphone}
          alt=""
          className="iphone"
        />
        <img src={gradient} alt="" className="gradient" />
      </div>
    </div>
  );
};

export default MainComponent;
