import React from "react";
import {
  Button,
  Grid,
  Header,
  Segment,
  Divider,
  Icon,
} from "semantic-ui-react";
import { Formik, Form } from "formik";
import cuid from "cuid";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createEvent, updateEvent } from "../eventActions";
import * as Yup from "yup";
import MyTextInput from "../../../app/common/form/MyTextInput";
import MyTextArea from "../../../app/common/form/MyTextArea";
import MySelectInput from "../../../app/common/form/MySelectInput";
import { categoryData } from "../../../app/api/categoryOptions";
import MyDateInput from "../../../app/common/form/MyDateInput";

const EventForm = ({ match, history }) => {
  const dispatch = useDispatch();
  const selectedEvent = useSelector((state) =>
    state.event.events.find((evt) => evt.id === match.params.id)
  );

  const initialValues = selectedEvent ?? {
    title: "",
    category: "",
    description: "",
    city: "",
    venue: "",
    date: "",
  };

  const handleFormSubmit = (values) => {
    selectedEvent
      ? dispatch(updateEvent({ ...selectedEvent, ...values }))
      : dispatch(
          createEvent({
            ...values,
            id: cuid(),
            hostedBy: "Bob",
            attendees: [],
            hostPhotoURL: "/assets/user.png",
          })
        );
    history.push("/events");
  };

  const validationSchema = Yup.object({
    title: Yup.string().required("You must provide a title"),
    category: Yup.string().required("You must provide a category"),
    description: Yup.string().required(),
    city: Yup.string().required(),
    venue: Yup.string().required(),
    date: Yup.string().required(),
  });

  return (
    <Grid centered>
      <Grid.Column width={8}>
        <Segment clearing>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={(values) => handleFormSubmit(values)}
          >
            {({ isSubmitting, isValid, dirty }) => (
              <Form className="ui form">
                <Divider horizontal>
                  <Header sub color="teal">
                    <Icon name="group" />
                    Event Details
                  </Header>
                </Divider>
                <MyTextInput name="title" placeholder="Event Title" />
                <MySelectInput
                  name="category"
                  placeholder="Category"
                  options={categoryData}
                />
                <MyTextArea
                  name="description"
                  placeholder="Description"
                  rows={3}
                />

                <br />
                <Divider horizontal>
                  <Header sub color="teal">
                    <Icon name="location arrow" />
                    Event Location
                  </Header>
                </Divider>
                <MyTextInput name="city" placeholder="City" />
                <MyTextInput name="venue" placeholder="Venue" />
                <MyDateInput
                  name="date"
                  placeholderText="Date"
                  timeFormat="HH:mm"
                  showTimeSelect
                  timeCaption="time"
                  dateFormat="MMMM d, yyyy h:mm a"
                />

                <br />
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <Button
                    disabled={isSubmitting}
                    type="submit"
                    content="Cancel"
                    as={Link}
                    to={`/events/`}
                  />
                  <Button
                    loading={isSubmitting}
                    disabled={!isValid || !dirty || isSubmitting}
                    type="submit"
                    positive
                    content="Submit"
                  />
                </div>
              </Form>
            )}
          </Formik>
        </Segment>
      </Grid.Column>
    </Grid>
  );
};

export default EventForm;
