import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Confirm,
  Icon,
  Item,
  Label,
  List,
  Segment,
} from "semantic-ui-react";
import EventListAttendee from "./EventListAttendee";
import { format } from "date-fns";
import { cancelEventToggle } from "../../../app/firestore/firestoreService";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const EventListItem = ({ event }) => {
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { currentUser } = useSelector((state) => state.auth);
  const isHost = event?.hostUid === currentUser?.uid;

  const handleCancelToggle = async (event) => {
    setConfirmOpen(false);
    setLoadingCancel(true);
    try {
      await cancelEventToggle(event);
      setLoadingCancel(false);
      window.location.reload();
    } catch (error) {
      setLoadingCancel(true);
      toast.error(error.message);
    }
  };

  return (
    <Segment.Group>
      <Segment>
        <Item.Group>
          <Item>
            <Item.Image size="tiny" circular src={event.hostPhotoURL} />
            <Item.Content>
              <Item.Header content={event.title} />
              <Item.Description>
                Hosted{" "}
                <Link to={`/profile/${event.hostUid}`}> {event.hostedBy}</Link>
              </Item.Description>
              {event.isCancelled && (
                <Label
                  style={{ top: "-40px" }}
                  ribbon="right"
                  color="red"
                  content="This event has been cancelled"
                />
              )}
            </Item.Content>
          </Item>
        </Item.Group>
      </Segment>
      <Segment>
        <span>
          <Icon name="clock" />
          {format(event.date, "MMMM d, yyyy h:mm a")} | <Icon name="marker" />
          {event.venue.address}
        </span>
      </Segment>
      <Segment secondary>
        <List horizontal>
          {event.attendees.map((attendee) => (
            <EventListAttendee key={attendee.id} attendee={attendee} />
          ))}
        </List>
      </Segment>
      <Segment clearing>
        <p>{event.description}</p>
        {isHost && (
          <Button
            loading={loadingCancel}
            type="button"
            floated="left"
            color={event.isCancelled ? "green" : "orange"}
            content={event.isCancelled ? "Reactivate event" : "Cancel event"}
            onClick={() => setConfirmOpen(true)}
          />
        )}

        <Button
          color="teal"
          floated="right"
          content="View"
          as={Link}
          to={`/events/${event.id}`}
        />
        <Confirm
          content={
            event?.isCancelled
              ? "This will reactivate the event - are you sure?"
              : "This will cancel the event - are you sure?"
          }
          open={confirmOpen}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => handleCancelToggle(event)}
        />
      </Segment>
    </Segment.Group>
  );
};

export default EventListItem;
