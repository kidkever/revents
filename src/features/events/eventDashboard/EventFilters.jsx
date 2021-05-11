import React from "react";
import { useDispatch, useSelector } from "react-redux";
import Calendar from "react-calendar";
import { Header, Menu } from "semantic-ui-react";
import { setFilter, setStartDate } from "../eventActions";

const EventFilters = ({ loading }) => {
  const dispatch = useDispatch();
  const { authenticated } = useSelector((state) => state.auth);
  const { filter, startDate } = useSelector((state) => state.event);
  return (
    <>
      {authenticated && (
        <Menu vertical size="large" style={{ width: "100%" }}>
          <Header icon="filter" attached color="teal" content="Filters" />
          <Menu.Item
            content="All Events"
            active={filter === "all"}
            onClick={() => dispatch(setFilter("all"))}
            disabled={loading}
          />
          <Menu.Item
            content="I'm going"
            active={filter === "isGoing"}
            onClick={() => dispatch(setFilter("isGoing"))}
            disabled={loading}
          />
          <Menu.Item
            content="I'm hosting"
            active={filter === "isHosting"}
            onClick={() => dispatch(setFilter("isHosting"))}
            disabled={loading}
          />
        </Menu>
      )}
      <Header icon="calendar" attached color="teal" content="Select date" />
      <Calendar
        onChange={(date) => dispatch(setStartDate(date))}
        value={startDate || new Date()}
        tileDisabled={() => loading}
      />
    </>
  );
};

export default EventFilters;
