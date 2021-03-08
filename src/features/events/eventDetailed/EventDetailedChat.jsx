import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Segment, Comment, Header } from "semantic-ui-react";
import {
  firebaseObjectToArray,
  getEventChatRef,
} from "../../../app/firestore/firebaseService";
import { listenToEventChat } from "../eventActions";
import EventDetailedChatForm from "./EventDetailedChatForm";
import { formatDistance } from "date-fns";
import ScrollableFeed from "react-scrollable-feed";
import { CLEAR_COMMENTS } from "../eventConstants";
import { createDataTree } from "../../../app/common/util/util";

const EventDetailedChat = ({ eventId }) => {
  const dispatch = useDispatch();
  const [showReplyForm, setShowReplyForm] = useState({
    open: false,
    commentId: null,
  });
  const { comments } = useSelector((state) => state.event);
  const { authenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    getEventChatRef(eventId).on("value", (snapshot) => {
      if (!snapshot.exists()) return;
      dispatch(listenToEventChat(firebaseObjectToArray(snapshot.val())));
    });
    return () => {
      dispatch({ type: CLEAR_COMMENTS });
      getEventChatRef().off();
    };
  }, [dispatch, eventId]);

  const handleCloseReplyForm = () => {
    setShowReplyForm({ open: false, commentId: null });
  };

  return (
    <>
      <Segment
        textAlign="center"
        attached="top"
        inverted
        color="teal"
        style={{ border: "none" }}
      >
        <Header>
          {authenticated ? "Chat about this event" : "Sign in to view and chat"}
        </Header>
      </Segment>

      {authenticated && (
        <Segment attached>
          <Comment.Group style={{ maxHeight: 300, maxWidth: "100%" }}>
            <ScrollableFeed>
              {createDataTree(comments).map((comment) => (
                <Comment key={comment.id}>
                  <Comment.Avatar
                    src={comment.photoURL || "/assets/user.png"}
                  />
                  <Comment.Content>
                    <Comment.Author as={Link} to={`/profile/${comment.uid}`}>
                      {comment.displayName}
                    </Comment.Author>
                    <Comment.Metadata>
                      <div>{formatDistance(comment.date, new Date())}</div>
                    </Comment.Metadata>
                    <Comment.Text>
                      {comment.text.split("\n").map((text, i) => (
                        <span key={i}>
                          {text}
                          <br />
                        </span>
                      ))}
                    </Comment.Text>
                    <Comment.Actions>
                      <Comment.Action
                        onClick={() =>
                          setShowReplyForm({
                            open: true,
                            commentId: comment.id,
                          })
                        }
                      >
                        Reply
                      </Comment.Action>
                      {showReplyForm.open &&
                        showReplyForm.commentId === comment.id && (
                          <EventDetailedChatForm
                            eventId={eventId}
                            parentId={comment.id}
                            closeForm={handleCloseReplyForm}
                            parentComment={false}
                          />
                        )}
                    </Comment.Actions>
                  </Comment.Content>
                  {comment.childNodes.length > 0 && (
                    <Comment.Group>
                      {comment.childNodes.map((child) => (
                        <Comment key={child.id}>
                          <Comment.Avatar
                            src={child.photoURL || "/assets/user.png"}
                          />
                          <Comment.Content>
                            <Comment.Author
                              as={Link}
                              to={`/profile/${child.uid}`}
                            >
                              {child.displayName}
                            </Comment.Author>
                            <Comment.Metadata>
                              <div>
                                {formatDistance(child.date, new Date())}
                              </div>
                            </Comment.Metadata>
                            <Comment.Text>
                              {child.text.split("\n").map((text, i) => (
                                <span key={i}>
                                  {text}
                                  <br />
                                </span>
                              ))}
                            </Comment.Text>
                            <Comment.Actions>
                              <Comment.Action
                                onClick={() =>
                                  setShowReplyForm({
                                    open: true,
                                    commentId: child.id,
                                  })
                                }
                              >
                                Reply
                              </Comment.Action>
                              {showReplyForm.open &&
                                showReplyForm.commentId === child.id && (
                                  <EventDetailedChatForm
                                    eventId={eventId}
                                    parentId={child.parentId}
                                    closeForm={handleCloseReplyForm}
                                    parentComment={false}
                                  />
                                )}
                            </Comment.Actions>
                          </Comment.Content>
                        </Comment>
                      ))}
                    </Comment.Group>
                  )}
                </Comment>
              ))}
            </ScrollableFeed>
          </Comment.Group>
          <EventDetailedChatForm
            eventId={eventId}
            parentId={0}
            closeForm={handleCloseReplyForm}
            parentComment={true}
          />
        </Segment>
      )}
    </>
  );
};

export default EventDetailedChat;
