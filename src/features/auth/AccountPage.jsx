import React from "react";
import { Segment, Header, Button, Label, Grid } from "semantic-ui-react";
import { Form, Formik } from "formik";
import { Link } from "react-router-dom";
import * as Yup from "yup";
import MyTextInput from "../../app/common/form/MyTextInput";
import { useSelector } from "react-redux";
import { updateUserPassword } from "../../app/firestore/firebaseService";

const AccountPage = () => {
  const { currentUser } = useSelector((state) => state.auth);

  return (
    <Grid centered>
      <Grid.Column width={8}>
        <Segment>
          <Header dividing size="large" content="Account" />
          {currentUser.providerId === "password" && (
            <>
              <Header
                color="teal"
                sub
                content="Change Password"
                style={{ marginBottom: 15, marginTop: 10 }}
              />
              <Formik
                initialValues={{ newPassword1: "", newPassword2: "" }}
                validationSchema={Yup.object({
                  newPassword1: Yup.string().required("Password is required"),
                  newPassword2: Yup.string().oneOf(
                    [Yup.ref("newPassword1"), null],
                    "Passwords don't match"
                  ),
                })}
                onSubmit={async (values, { setSubmitting, setErrors }) => {
                  try {
                    await updateUserPassword(values);
                    setSubmitting(false);
                  } catch (error) {
                    setErrors({ auth: error.message });
                    setSubmitting(false);
                  }
                }}
              >
                {({ errors, isSubmitting, isValid, dirty }) => (
                  <Form className="ui form">
                    <MyTextInput
                      name="newPassword1"
                      type="password"
                      placeholder="New Password"
                    />
                    <MyTextInput
                      name="newPassword2"
                      type="password"
                      placeholder="Confirm Password"
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
                      style={{ display: "block" }}
                      type="submit"
                      disabled={!isValid || isSubmitting || !dirty}
                      loading={isSubmitting}
                      size="large"
                      positive
                      content="Update Password"
                    />
                  </Form>
                )}
              </Formik>
            </>
          )}
          {currentUser.providerId === "facebook.com" && (
            <>
              <Header color="teal" sub content="Facebook account" />
              <p>Please visit Facebook to update your account</p>
              <Button
                icon="facebook"
                color="facebook"
                as={Link}
                to="https://facebook.com"
                content="Go to Facebook"
              />
            </>
          )}
          {currentUser.providerId === "google.com" && (
            <>
              <Header color="teal" sub content="Google account" />
              <Header as="h5" block color="grey">
                Please visit Google to update your account
              </Header>
              <Button
                icon="google"
                color="google plus"
                as={Link}
                to="https://google.com"
                content="Go to Google"
              />
            </>
          )}
        </Segment>
      </Grid.Column>
    </Grid>
  );
};

export default AccountPage;
