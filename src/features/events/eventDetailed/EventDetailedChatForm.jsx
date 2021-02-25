import React from "react";
import { Field, Form, Formik } from "formik";
import { toast } from "react-toastify";
import { addEventChatComment } from "../../../app/firestore/firebaseService";
import { Button, Loader } from "semantic-ui-react";
import * as Yup from "yup";

const EventDetailedChatForm = ({
  eventId,
  parentId,
  closeForm,
  parentComment,
}) => {
  return (
    <Formik
      initialValues={{ comment: "" }}
      validationSchema={Yup.object({
        comment: Yup.string().required(),
      })}
      onSubmit={async (values, { setSubmitting, resetForm }) => {
        try {
          await addEventChatComment(eventId, { ...values, parentId });
          resetForm();
        } catch (error) {
          toast.error(error.message);
        } finally {
          setSubmitting(false);
          closeForm({ open: false, commentId: null });
        }
      }}
    >
      {({ isSubmitting, handleSubmit, isValid }) => (
        <Form className="ui form">
          <Field name="comment">
            {({ field }) => (
              <div style={{ position: "relative" }}>
                <Loader active={isSubmitting} />
                <textarea
                  style={{ maxWidth: parentComment ? "100%" : "570px" }}
                  {...field}
                  rows={parentComment ? 3 : 2}
                  placeholder="Enter your comment (Enter to submit, Shift + Enter for new line)"
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && e.shiftKey) {
                      return;
                    }
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      isValid && handleSubmit();
                    }
                  }}
                ></textarea>
              </div>
            )}
          </Field>
          {parentComment && (
            <Button
              style={{ marginTop: 10 }}
              loading={isSubmitting}
              content="Add reply"
              icon="edit"
              primary
              type="submit"
            />
          )}
        </Form>
      )}
    </Formik>
  );
};

export default EventDetailedChatForm;
