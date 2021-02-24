import React, { useState } from "react";
import { Button, Grid, Header } from "semantic-ui-react";
import cuid from "cuid";
import PhotoWidgetCropper from "./PhotoWidgetCropper";
import PhotoWidgetDropzone from "./PhotoWidgetDropzone";
import { getFileExtension } from "../util/util";
import { uploadToFirebaseStorage } from "../../firestore/firebaseService";
import { toast } from "react-toastify";
import { updateUserProfilePhoto } from "../../firestore/firestoreService";

const PhotoUploadWidget = ({ setEditMode }) => {
  const [files, setFiles] = useState([]);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUploadImage = () => {
    setLoading(false);
    const filename = cuid() + "." + getFileExtension(files[0].name);
    const uploadTask = uploadToFirebaseStorage(image, filename);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("upload is " + progress + "% done");
      },
      (error) => {
        toast.error(error.message);
      },
      () => {
        uploadTask.snapshot.ref
          .getDownloadURL()
          .then((downloadURL) => {
            updateUserProfilePhoto(downloadURL, filename).then(() => {
              setLoading(false);
              handleCancelCrop();
              setEditMode(false);
            });
          })
          .catch((error) => {
            toast.error(error.message);
            setLoading(false);
          });
      }
    );
  };

  const handleCancelCrop = () => {
    setFiles([]);
    setImage(null);
  };

  return (
    <Grid>
      <Grid.Column width={4}>
        <Header
          style={{ textAlign: "center", marginBottom: 15 }}
          color="teal"
          sub
          content="Step 1 - Add photo"
        />
        <PhotoWidgetDropzone setFiles={setFiles} />
      </Grid.Column>
      <Grid.Column width={1} />
      <Grid.Column width={4}>
        <Header
          style={{ textAlign: "center", marginBottom: 15 }}
          color="teal"
          sub
          content="Step 2 - Resize"
        />
        {files.length > 0 && (
          <PhotoWidgetCropper
            setImage={setImage}
            imagePreview={files[0].preview}
          />
        )}
      </Grid.Column>
      <Grid.Column width={1} />
      <Grid.Column width={4}>
        <Header
          style={{ textAlign: "center", marginBottom: 15 }}
          color="teal"
          sub
          content="Step 3 - Preview & upload"
        />
        {files.length > 0 && (
          <>
            <div
              className="img-preview"
              style={{ minHeight: 200, minWidth: 200, overflow: "hidden" }}
            />
            <Button.Group>
              <Button
                loading={loading}
                onClick={handleUploadImage}
                style={{ width: 100 }}
                positive
                icon="check"
              />
              <Button
                disabled={loading}
                onClick={handleCancelCrop}
                style={{ width: 100 }}
                icon="close"
              />
            </Button.Group>
          </>
        )}
      </Grid.Column>
    </Grid>
  );
};

export default PhotoUploadWidget;
