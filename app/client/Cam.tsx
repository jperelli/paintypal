"use client";

import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, RefreshCw } from 'react-feather';
import Webcam from "react-webcam";

enum CameraFacing {
  USER = "user",
  ENVIRONMENT = "environment"
}

const palettes = [
  {
    name: "QOR - Introductory set",
    slug: "qor",
  },
  {
    name: "Daniel Smith - Essentials set",
    slug: "daniel-smith",
  },
  {
    name: "White Nights - Set botanica",
    slug: "white-nights",
  },
  {
    name: "Winsor & Newton - Cotman set",
    slug: "winsor-newton",
  },
  {
    name: "Kuretake - Nuance",
    slug: "kuretake",
  },
]


export default function Cam() {
  const [color, setColor] = useState("");
  const webcamRef = useRef<Webcam>(null);
  const [windowHeigth, setWindowHeight] = useState(window?.innerHeight);
  const [windowWidth, setWindowWidth] = useState(window?.innerWidth);
  const [cameraFacing, setCameraFacing] = useState(CameraFacing.ENVIRONMENT);
  const [palette, setPalette] = useState(palettes[0].slug);

  const [instructions, setInstructions] = useState(false);
  const [errorInstructions, setErrorInstructions] = useState("");
  const [loadingInstructions, setLoadingInstructions] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const handleWindowResize = () => {
      setWindowHeight(window.innerHeight);
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);
  const capture = useCallback(
    () => {
      const canvas = webcamRef.current?.getCanvas();
      // get color in the center of the canvas
      const ctx = canvas?.getContext("2d");
      // get the coordinates of the center of the canvas
      const x = Math.trunc((canvas?.width || 0) / 2);
      const y = Math.trunc((canvas?.height || 0) / 2);
      // get the color of the pixel at the center of the canvas
      const imageData = ctx?.getImageData(x, y, 1, 1).data;
      const color = `rgb(${imageData?.[0]}, ${imageData?.[1]}, ${imageData?.[2]})`;
      setColor(color);
    },
    [webcamRef]
  );

  const getInstructions = () => {
    const getAsyncInstructions = async () => {
      // get instructions from the server, send the color as a body json parameter to the api /api/instructions
      try {
        const res = await axios.post("/api/instructions", { color, palette })
        if (res.status !== 200) {
          throw new Error(`Error getting instructions: ${res.data}`);
        }
        setInstructions(res.data);
        setLoadingInstructions(false);
      }
      catch (e) {
        if (axios.isAxiosError(e)) {
          setErrorInstructions(e.response?.data || e.message);
        }
        else {
          setErrorInstructions('Error getting instructions');
        }
        setLoadingInstructions(false);
      }
    };
    setModalOpen(true);
    setLoadingInstructions(true);
    getAsyncInstructions();
  };

  return (
    <>
      <div style={{ position: "relative", height: '100%', width: '100%' }}>

        {/* camera */}
        <Webcam
          audio={false}
          height={windowHeigth}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width={windowWidth}
          mirrored
          videoConstraints={{
            facingMode: cameraFacing,
          }}
          onClick={capture}
        />

        {/* dropdown of palettes */}
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            right: "10px",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "white",
          }}
        >
          <div>Select Palette</div>
          <select
            value={palette}
            onChange={(e) => {
              setPalette(e.target.value);
            }}
          >
            {palettes.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Buttons */}

        {/* sample color at crosshair button */}
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            right: "10px",
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            backgroundColor: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.75)"
          }}
          onClick={capture}
        >
          <Camera />
        </div>

        {/* change camera front/back button */}
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            left: "10px",
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            backgroundColor: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.75)"
          }}
          onClick={() => {
            setCameraFacing(cameraFacing === CameraFacing.ENVIRONMENT ? CameraFacing.USER : CameraFacing.ENVIRONMENT);
          }}
        >
          <RefreshCw />
        </div>


        {/* crosshair */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            border: "1px solid red"
          }}
        ></div>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "1px",
            height: "10px",
            backgroundColor: "red"
          }}
        ></div>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "10px",
            height: "1px",
            backgroundColor: "red"
          }}
        ></div>
      </div>

      {/* buttons */}
      <div
        style={{
          position: "fixed",
          bottom: "10px",
          right: "70px",
          left: "70px",
          height: "50px",
          display: "flex",
          justifyContent: "space-around",
          backgroundColor: color,
          borderRadius: "10px",
          alignItems: "center",
        }}
        onClick={getInstructions}>
        <div>
          Get instructions to make this color
        </div>
      </div>

      {/* fullscreen modal for the instructions */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: modalOpen ? "flex" : "none",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <div
          style={{
            width: "80%",
            height: "80%",
            backgroundColor: "white",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              padding: "10px",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>Instructions</div>
            <button onClick={() => setModalOpen(false)}>&times;</button>
          </div>
          <div
            style={{
              whiteSpace: "pre-wrap",
              padding: "10px"
            }}
          >
            {loadingInstructions ? 
              (
                <div>Loading...</div>
              ):
              errorInstructions ? (
                <div>{errorInstructions}</div>
              ):
                <div>{instructions}</div>
            }
          </div>
        </div>
      </div>

    </>
  );
}
