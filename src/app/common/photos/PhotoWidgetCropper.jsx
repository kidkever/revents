import React, { useRef } from "react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";

const PhotoWidgetCropper = ({ setImage, imagePreview }) => {
  const cropperRef = useRef(null);

  // const onCrop = () => {
  //   const imageElement: any = cropperRef?.current;
  //   const cropper: any = imageElement?.cropper;
  //   console.log(cropper.getCroppedCanvas().toDataURL());
  // };

  const cropImage = () => {
    const imageElement: any = cropperRef?.current;
    const cropper: any = imageElement?.cropper;
    if (typeof cropper.getCroppedCanvas() === "undefined") {
      return;
    }
    cropper.getCroppedCanvas().toBlob((blob) => {
      setImage(blob);
    }, "image/jpeg");
  };

  return (
    <Cropper
      src={imagePreview}
      style={{ height: 200, width: "100%" }}
      // Cropper.js options
      initialAspectRatio={1}
      preview=".img-preview"
      guides={false}
      viewMode={1}
      dragMode="move"
      scalable={true}
      cropBoxMovable={true}
      cropBoxResizable={true}
      crop={cropImage}
      ref={cropperRef}
    />
  );
};

export default PhotoWidgetCropper;
