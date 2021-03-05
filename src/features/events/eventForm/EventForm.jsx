/* global google */
import React, { useState } from "react";
import {
  Button,
  Grid,
  Header,
  Segment,
  Divider,
  Icon,
  Confirm,
} from "semantic-ui-react";
import { Formik, Form } from "formik";
import { Link, Redirect } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { listenToSelectedEvent } from "../eventActions";
import * as Yup from "yup";
import MyTextInput from "../../../app/common/form/MyTextInput";
import MyTextArea from "../../../app/common/form/MyTextArea";
import MySelectInput from "../../../app/common/form/MySelectInput";
import { categoryData } from "../../../app/api/categoryOptions";
import MyDateInput from "../../../app/common/form/MyDateInput";
import MyPlaceInput from "../../../app/common/form/MyPlaceInput";
import useFirestoreDoc from "../../../app/hooks/useFirestoreDoc";
import {
  addEventToFirestore,
  cancelEventToggle,
  listenToEventFromFirestore,
  updateEventInFirestore,
} from "../../../app/firestore/firestoreService";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { toast } from "react-toastify";

const EventForm = ({ match, history }) => {
  const dispatch = useDispatch();

  const [loadingCancel, setLoadingCancel] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { selectedEvent } = useSelector((state) => state.event);
  const { loading, error } = useSelector((state) => state.async);

  const initialValues = selectedEvent ?? {
    title: "",
    category: "",
    description: "",
    city: {
      address: "",
      latLng: null,
    },
    venue: {
      address: "",
      latLng: null,
    },
    date: "",
  };

  const handleFormSubmit = async (values, setSubmitting) => {
    try {
      selectedEvent
        ? await updateEventInFirestore(values)
        : await addEventToFirestore(values);
      setSubmitting(false);
      history.push("/events");
    } catch (error) {
      toast.error(error.message);
      setSubmitting(false);
    }
  };

  const handleCancelToggle = async (event) => {
    setConfirmOpen(false);
    setLoadingCancel(true);
    try {
      await cancelEventToggle(event);
      setLoadingCancel(false);
    } catch (error) {
      setLoadingCancel(true);
      toast.error(error.message);
    }
  };

  const validationSchema = Yup.object({
    title: Yup.string().required("You must provide a title"),
    category: Yup.string().required("You must provide a category"),
    description: Yup.string().required(),
    city: Yup.object().shape({
      address: Yup.string().required("City is required"),
    }),
    venue: Yup.object().shape({
      address: Yup.string().required("Venue is required"),
    }),
    date: Yup.string().required(),
  });

  useFirestoreDoc({
    shouldExcute: !!match.params.id,
    query: () => listenToEventFromFirestore(match.params.id),
    data: (event) => dispatch(listenToSelectedEvent(event)),
    deps: [match.params.id, dispatch],
  });

  if (loading) return <LoadingComponent content="Loading event..." />;

  if (error) return <Redirect to="/error" />;

  return (
    <Grid centered>
      <Grid.Column width={8}>
        <Segment clearing>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={(values, { setSubmitting }) =>
              handleFormSubmit(values, setSubmitting)
            }
          >
            {({ isSubmitting, isValid, dirty, values }) => (
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
                <MyPlaceInput name="city" placeholder="City" />
                <MyPlaceInput
                  name="venue"
                  disabled={!values.city.latLng}
                  placeholder="Venue"
                  options={{
                    location: new google.maps.LatLng(values.city.latLng),
                    radius: 1000,
                    types: ["establishment"],
                  }}
                />
                <MyDateInput
                  name="date"
                  placeholderText="Date"
                  timeFormat="HH:mm"
                  showTimeSelect
                  timeCaption="time"
                  dateFormat="MMMM d, yyyy h:mm a"
                />

                <br />
                {selectedEvent && (
                  <Button
                    loading={loadingCancel}
                    type="button"
                    floated="left"
                    color={selectedEvent.isCancelled ? "green" : "red"}
                    content={
                      selectedEvent.isCancelled
                        ? "Reactivate event"
                        : "Cancel event"
                    }
                    onClick={() => setConfirmOpen(true)}
                  />
                )}
                <Button
                  loading={isSubmitting}
                  disabled={!isValid || !dirty || isSubmitting}
                  type="submit"
                  floated="right"
                  positive
                  content="Submit"
                />
                <Button
                  disabled={isSubmitting}
                  type="submit"
                  floated="right"
                  content="Cancel"
                  as={Link}
                  to={`/events`}
                />
              </Form>
            )}
          </Formik>
          <Confirm
            content={
              selectedEvent?.isCancelled
                ? "This will reactivate the event - are you sure?"
                : "This will cancel the event - are you sure?"
            }
            open={confirmOpen}
            onCancel={() => setConfirmOpen(false)}
            onConfirm={() => handleCancelToggle(selectedEvent)}
          />
        </Segment>
      </Grid.Column>
    </Grid>
  );
};

export default EventForm;
