import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Feed, Header, Segment } from "semantic-ui-react";
import {
  firebaseObjectToArray,
  getUserFeedRef,
} from "../../../app/firestore/firebaseService";
import { listenToFeed } from "../../profiles/profileActions";
import EventFeedItem from "./EventFeedItem";

const EventsFeed = () => {
  const dispatch = useDispatch();
  const { feed } = useSelector((state) => state.profile);

  useEffect(() => {
    getUserFeedRef().on("value", (snapshot) => {
      if (!snapshot.exists()) return;
      const feed = firebaseObjectToArray(snapshot.val()).reverse();
      dispatch(listenToFeed(feed));
      console.log(feed);
    });
    return () => getUserFeedRef().off();
  }, [dispatch]);

  return (
    <>
      <Header attached color="teal" icon="newspaper" content="News feed" />
      <Segment attached="bottom">
        <Feed>
          {feed.length === 0 ? (
            <Header as="h3" color="grey" textAlign="center">
              No activities yet...
            </Header>
          ) : (
            feed.map((post) => <EventFeedItem key={post.id} post={post} />)
          )}
        </Feed>
      </Segment>
    </>
  );
};

export default EventsFeed;
