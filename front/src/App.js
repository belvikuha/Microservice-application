import "./App.css";
import { useRef, useEffect, useState } from "react";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageURLs, setImageURLs] = useState([]); // Используем массив для хранения URL изображений

  const containerRef = useRef();

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  useEffect(() => {
    if (imageURLs.length > 0 && imageURLs.length % 2 === 0) {
      window.scrollTo({
        top: document.documentElement.scrollHeight + "600",
        behavior: "smooth",
      });
    }
  }, [imageURLs]);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      await fetch("http://localhost:5000/api", {
        method: "POST",
        body: formData,
      });
    } catch (error) {
      console.error("Error uploading the image:", error);
      alert("Error uploading the image");
    }
  };

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8099");

    ws.onopen = () => {
      console.log("Connected to the ws server");
    };

    ws.onmessage = (event) => {
      if (event.data instanceof Blob) {
        const url = URL.createObjectURL(event.data);
        setImageURLs((prevURLs) => [...prevURLs, url]); // Добавляем URL в массив
      } else {
        console.error("Received data is not an image");
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="app" ref={containerRef}>
      <div className="upload-controls">
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={!selectedFile}>
          Upload
        </button>
      </div>
      <div className="images-container">
        {imageURLs.map((url, index) => (
          <img key={index} src={url} alt={`Received ${index + 1}`} />
        ))}
      </div>
    </div>
  );
}

export default App;
