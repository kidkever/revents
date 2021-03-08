import React from "react";
import { Container } from "semantic-ui-react";
import { Route, useLocation } from "react-router-dom";
import EventDashboard from "../../features/events/eventDashboard/EventDashboard";
import EventForm from "../../features/events/eventForm/EventForm";
import HomePage from "../../features/home/HomePage";
import EventDetailedPage from "../../features/events/eventDetailed/EventDetailedPage";
import NavBar from "../../features/nav/NavBar";
import Sandbox from "../../features/sandbox/Sandbox";
import ModalManager from "../common/modals/ModalManager";
import { ToastContainer } from "react-toastify";
import ErrorComponent from "../common/errors/ErrorComponent";
import AccountPage from "../../features/auth/AccountPage";
import { useSelector } from "react-redux";
import LoadingComponent from "./LoadingComponent";
import ProfilePage from "../../features/profiles/profilePage/ProfilePage";
import PrivateRoute from "./PrivateRoute";

const App = () => {
  const { key } = useLocation();
  const { initialized } = useSelector((state) => state.async);

  if (!initialized) return <LoadingComponent content="Loading app..." />;

  return (
    <>
      <ModalManager />
      <ToastContainer position="bottom-right" />
      <Route path="/" component={HomePage} exact />
      <Route
        path={"/(.+)"}
        render={() => (
          <>
            <NavBar />
            <Container className="main">
              <Route path="/events" component={EventDashboard} exact />
              <Route path="/events/:id" component={EventDetailedPage} />
              <Route path="/sandbox" component={Sandbox} />
              <PrivateRoute
                path={["/createEvent", "/manage/:id"]}
                component={EventForm}
                key={key}
              />
              <PrivateRoute path="/account" component={AccountPage} />
              <PrivateRoute path="/profile/:id" component={ProfilePage} />
              <Route path="/error" component={ErrorComponent} />
            </Container>
          </>
        )}
      />
    </>
  );
};

export default App;
