import firebase from "../config/firebase";

const db = firebase.firestore();

export const dataFromSnapshot = (snapshot) => {
  if (!snapshot.exists) return undefined;
  const data = snapshot.data();

  for (const prop in data) {
    if (data.hasOwnProperty(prop)) {
      if (data[prop] instanceof firebase.firestore.Timestamp) {
        data[prop] = data[prop].toDate();
      }
    }
  }

  return { ...data, id: snapshot.id };
};

export const fetchEventsFromFirestore = (
  filter,
  startDate,
  limit,
  lastDocSnapshot = null
) => {
  const user = firebase.auth().currentUser;
  let eventsRef = db
    .collection("events")
    .orderBy("date")
    .startAfter(lastDocSnapshot)
    .limit(limit);
  switch (filter) {
    case "isGoing":
      return eventsRef
        .where("attendeeIds", "array-contains", user.uid)
        .where("date", ">=", startDate);
    case "isHosting":
      return eventsRef
        .where("hostUid", "==", user.uid)
        .where("date", ">=", startDate);
    default:
      return eventsRef.where("date", ">=", startDate);
  }
};

export const listenToEventFromFirestore = (eventId) => {
  return db.collection("events").doc(eventId);
};

export const addEventToFirestore = (event) => {
  const user = firebase.auth().currentUser;
  return db.collection("events").add({
    ...event,
    hostUid: user.uid,
    hostedBy: user.displayName,
    hostPhotoURL: user.photoURL || null,
    attendees: firebase.firestore.FieldValue.arrayUnion({
      id: user.uid,
      displayName: user.displayName,
      photoURL: user.photoURL || null,
    }),
    attendeeIds: firebase.firestore.FieldValue.arrayUnion(user.uid),
  });
};

export const updateEventInFirestore = (event) => {
  return db.collection("events").doc(event.id).update(event);
};

export const cancelEventToggle = (event) => {
  return db.collection("events").doc(event.id).update({
    isCancelled: !event.isCancelled,
  });
};

export const setUserProfileData = (user) => {
  return db
    .collection("users")
    .doc(user.uid)
    .set({
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL || null,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
};

export const getUserProfile = (userId) => {
  return db.collection("users").doc(userId);
};

export const updateUserProfile = async (profile) => {
  const user = firebase.auth().currentUser;
  const today = new Date();
  const eventDocQuery = db
    .collection("events")
    .where("attendeeIds", "array-contains", user.uid)
    .where("date", ">=", today);

  const userFollowingRef = db
    .collection("following")
    .doc(user.uid)
    .collection("userFollowing");

  const userFollowersRef = db
    .collection("following")
    .doc(user.uid)
    .collection("userFollowers");

  const batch = db.batch();

  batch.update(db.collection("users").doc(user.uid), profile);
  try {
    const eventsQuerySnap = await eventDocQuery.get();
    for (let i = 0; i < eventsQuerySnap.docs.length; i++) {
      let eventDoc = eventsQuerySnap.docs[i];
      // host profile name
      if (eventDoc.data().hostUid === user.uid) {
        batch.update(eventsQuerySnap.docs[i].ref, profile);
      }
      // attendee profile name
      batch.update(eventsQuerySnap.docs[i].ref, {
        attendees: eventDoc.data().attendees.filter((attendee) => {
          if (attendee.id === user.uid) {
            attendee.displayName = profile.displayName;
          }
          return attendee;
        }),
      });

      // chat profile name
      let eventId = eventDoc.id;
      var query = firebase.database().ref(`chat/${eventId}`);
      query.once("value").then((snapshot) => {
        snapshot.forEach((childSnapshot) => {
          var key = childSnapshot.key;
          var childData = childSnapshot.val();
          if (childData.uid === user.uid) {
            firebase.database().ref(`chat/${eventId}/${key}`).update(profile);
          }
        });
      });
    }

    // follower/following on other profiles
    const userFollowingSnap = await userFollowingRef.get();
    userFollowingSnap.docs.forEach((docRef) => {
      let followingDocRef = db
        .collection("following")
        .doc(docRef.id)
        .collection("userFollowers")
        .doc(user.uid);
      batch.update(followingDocRef, profile);
    });

    const userFollowersSnap = await userFollowersRef.get();
    userFollowersSnap.docs.forEach((docRef) => {
      let followersDocRef = db
        .collection("following")
        .doc(docRef.id)
        .collection("userFollowing")
        .doc(user.uid);
      batch.update(followersDocRef, profile);
    });

    await batch.commit();

    return await user.updateProfile(profile);
  } catch (error) {
    throw error;
  }
};

export const updateUserProfilePhoto = async (downloadURL, filename) => {
  const user = firebase.auth().currentUser;
  const userDocRef = db.collection("users").doc(user.uid);
  try {
    const userDoc = await userDocRef.get();
    if (!userDoc.data().photoURL) {
      await db.collection("users").doc(user.uid).update({
        photoURL: downloadURL,
      });
      await user.updateProfile({
        photoURL: downloadURL,
      });
    }
    return await db.collection("users").doc(user.uid).collection("photos").add({
      name: filename,
      url: downloadURL,
    });
  } catch (error) {
    throw error;
  }
};

export const getUserPhotos = (userUid) => {
  return db.collection("users").doc(userUid).collection("photos");
};

export const setMainPhoto = async (photo) => {
  const user = firebase.auth().currentUser;
  const today = new Date();
  const eventDocQuery = db
    .collection("events")
    .where("attendeeIds", "array-contains", user.uid)
    .where("date", ">=", today);

  const userFollowingRef = db
    .collection("following")
    .doc(user.uid)
    .collection("userFollowing");

  const userFollowersRef = db
    .collection("following")
    .doc(user.uid)
    .collection("userFollowers");

  const batch = db.batch();

  batch.update(db.collection("users").doc(user.uid), {
    photoURL: photo.url,
  });
  try {
    const eventsQuerySnap = await eventDocQuery.get();
    for (let i = 0; i < eventsQuerySnap.docs.length; i++) {
      let eventDoc = eventsQuerySnap.docs[i];
      // host photo
      if (eventDoc.data().hostUid === user.uid) {
        batch.update(eventsQuerySnap.docs[i].ref, {
          hostPhotoURL: photo.url,
        });
      }
      // attendee photo
      batch.update(eventsQuerySnap.docs[i].ref, {
        attendees: eventDoc.data().attendees.filter((attendee) => {
          if (attendee.id === user.uid) {
            attendee.photoURL = photo.url;
          }
          return attendee;
        }),
      });

      // chat photo
      let eventId = eventDoc.id;
      var query = firebase.database().ref(`chat/${eventId}`);
      query.once("value").then((snapshot) => {
        snapshot.forEach((childSnapshot) => {
          var key = childSnapshot.key;
          var childData = childSnapshot.val();
          if (childData.uid === user.uid) {
            firebase
              .database()
              .ref(`chat/${eventId}/${key}`)
              .update({ photoURL: photo.url });
          }
        });
      });
    }

    // follower/following on other profiles
    const userFollowingSnap = await userFollowingRef.get();
    userFollowingSnap.docs.forEach((docRef) => {
      let followingDocRef = db
        .collection("following")
        .doc(docRef.id)
        .collection("userFollowers")
        .doc(user.uid);
      batch.update(followingDocRef, { photoURL: photo.url });
    });

    const userFollowersSnap = await userFollowersRef.get();
    userFollowersSnap.docs.forEach((docRef) => {
      let followersDocRef = db
        .collection("following")
        .doc(docRef.id)
        .collection("userFollowing")
        .doc(user.uid);
      batch.update(followersDocRef, { photoURL: photo.url });
    });

    await batch.commit();

    return await user.updateProfile({
      photoURL: photo.url,
    });
  } catch (error) {
    throw error;
  }
};

export const deletePhotoFromCollection = (photoId) => {
  const userUid = firebase.auth().currentUser.uid;
  return db
    .collection("users")
    .doc(userUid)
    .collection("photos")
    .doc(photoId)
    .delete();
};

export const addUserAttendance = (event) => {
  const user = firebase.auth().currentUser;
  return db
    .collection("events")
    .doc(event.id)
    .update({
      attendees: firebase.firestore.FieldValue.arrayUnion({
        id: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL || null,
      }),
      attendeeIds: firebase.firestore.FieldValue.arrayUnion(user.uid),
    });
};

export const cancelUserAttendance = async (event) => {
  const user = firebase.auth().currentUser;
  try {
    const eventDoc = await db.collection("events").doc(event.id).get();
    return db
      .collection("events")
      .doc(event.id)
      .update({
        attendees: eventDoc
          .data()
          .attendees.filter((attendee) => attendee.id !== user.uid),
        attendeeIds: firebase.firestore.FieldValue.arrayRemove(user.uid),
      });
  } catch (error) {
    throw error;
  }
};

export const getUserEventsQuery = (activeTab, userUid) => {
  let eventsRef = db.collection("events");
  const today = new Date();
  switch (activeTab) {
    case 1: // past events
      return eventsRef
        .where("attendeeIds", "array-contains", userUid)
        .where("date", "<=", today)
        .orderBy("date", "desc");
    case 2: // hosting
      return eventsRef.where("hostUid", "==", userUid).orderBy("date");
    default:
      // future events
      return eventsRef
        .where("attendeeIds", "array-contains", userUid)
        .where("date", ">=", today)
        .orderBy("date");
  }
};

export const followUser = async (profile) => {
  const user = firebase.auth().currentUser;
  const batch = db.batch();
  try {
    batch.set(
      db
        .collection("following")
        .doc(user.uid)
        .collection("userFollowing")
        .doc(profile.id),
      {
        displayName: profile.displayName,
        photoURL: profile.photoURL,
        uid: profile.id,
      }
    );

    batch.update(db.collection("users").doc(user.uid), {
      followingCount: firebase.firestore.FieldValue.increment(1),
    });

    return await batch.commit();
  } catch (error) {
    throw error;
  }
};

export const unfollowUser = async (profile) => {
  const user = firebase.auth().currentUser;
  const batch = db.batch();
  try {
    batch.delete(
      db
        .collection("following")
        .doc(user.uid)
        .collection("userFollowing")
        .doc(profile.id)
    );

    batch.update(db.collection("users").doc(user.uid), {
      followingCount: firebase.firestore.FieldValue.increment(-1),
    });

    return await batch.commit();
  } catch (error) {
    throw error;
  }
};

export const getFollowersCollection = (profileId) => {
  return db.collection("following").doc(profileId).collection("userFollowers");
};

export const getFollowingCollection = (profileId) => {
  return db.collection("following").doc(profileId).collection("userFollowing");
};

export const getFollowingDoc = (profileId) => {
  const userUid = firebase.auth().currentUser.uid;
  return db
    .collection("following")
    .doc(userUid)
    .collection("userFollowing")
    .doc(profileId)
    .get();
};
