import React from "react";
import { useDispatch } from "react-redux";
import { Divider, Label } from "semantic-ui-react";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import ModalWrapper from "../../app/common/modals/ModalWrapper";
import MyTextInput from "../../app/common/form/MyTextInput";
import { Button } from "semantic-ui-react";
import { closeModal } from "../../app/common/modals/modalReducer";
import { signInWithEmail } from "../../app/firestore/firebaseService";
import SocialLogin from "./SocialLogin";

const LoginForm = () => {
  const dispatch = useDispatch();

  return (
    <ModalWrapper size="mini" header="Sign in to Re-vents">
      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={Yup.object({
          email: Yup.string().required().email(),
          password: Yup.string().required(),
        })}
        onSubmit={async (values, { setSubmitting, setErrors }) => {
          try {
            await signInWithEmail(values);
            setSubmitting(false);
            dispatch(closeModal());
          } catch (error) {
            setErrors({ auth: "username or password is incorrect" });
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting, isValid, dirty, errors }) => (
          <Form className="ui form">
            <MyTextInput
              name="email"
              placeholder="Email Address"
              type="email"
            />
            <MyTextInput
              name="password"
              placeholder="Password"
              type="password"
            />
            {errors.auth && (
              <Label
                size="small"
                pointing
                style={{ marginBottom: 10, marginTop: 0 }}
                content={errors.auth}
              />
            )}
            <Button
              loading={isSubmitting}
              disabled={!isValid || isSubmitting || !dirty}
              type="submit"
              fluid
              size="large"
              color="teal"
              content="Login"
            />
            <Divider horizontal>Or</Divider>
            <SocialLogin />
          </Form>
        )}
      </Formik>
    </ModalWrapper>
  );
};

export default LoginForm;
