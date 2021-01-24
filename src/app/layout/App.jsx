import React from "react";
import { Container } from "semantic-ui-react";
import { Route } from "react-router-dom";
import EventDashboard from "../../features/events/eventDashboard/EventDashboard";
import EventForm from "../../features/events/eventForm/EventForm";
import HomePage from "../../features/home/HomePage";
import EventDetailedPage from "../../features/events/eventDetailed/EventDetailedPage";
import NavBar from "../../features/nav/NavBar";

const App = () => {
  return (
    <>
      <Route path="/" component={HomePage} exact />
      <Route
        path={"/(.+)"}
        render={() => (
          <>
            <NavBar />
            <Container className="main">
              <Route path="/events" component={EventDashboard} exact />
              <Route path="/events/:id" component={EventDetailedPage} />
              <Route
                path={["/createEvent", "/manage/:id"]}
                component={EventForm}
              />
            </Container>
          </>
        )}
      />
    </>
  );
};

export default App;
