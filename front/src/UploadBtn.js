import React, { useRef } from "react";

const UploadBtn = ({ setFile }) => {
  const filePickerRef = useRef();
  // const [file, setFile] = useState();

  const getFileArray = (fileList) => {
    return Array.from(fileList);
  };

  const handleFileChange = (event) => {
    const arrFiles = getFileArray(event.target.files);
    const file = arrFiles.length ? arrFiles[0] : undefined;
    if (!file) return;
    setFile(file);
  };

  return (
    <div>
      <div
        href=""
        class="gradient-button"
        onClick={() => {
          filePickerRef.current.click();
        }}
      >
        Pick Image
      </div>
      <input
        type={"file"}
        name={"image"}
        ref={filePickerRef}
        onChange={(event) => {
          handleFileChange(event, event.values);
        }}
      ></input>
    </div>
  );
};

export default UploadBtn;
