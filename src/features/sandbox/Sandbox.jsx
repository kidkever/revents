import React, { useState } from "react";
import { Button } from "semantic-ui-react";
import { useSelector, useDispatch } from "react-redux";
import { INCREMENT_COUNTER } from "./testReducer";
import { openModal } from "../../app/common/modals/modalReducer";
import TestPlaceInput from "./TestPlaceInput";
import TestMap from "./TestMap";

const Sandbox = () => {
  const dispatch = useDispatch();
  const data = useSelector((state) => state.data);
  const defaultProps = {
    center: {
      lat: 59.95,
      lng: 30.33,
    },
    zoom: 11,
  };
  const [location, setLocation] = useState(defaultProps);
  const handleSetLocation = (latLang) => {
    setLocation({
      ...location,
      center: { lat: latLang.lat, lng: latLang.lng },
    });
  };

  return (
    <>
      <h1>Testing 123...</h1>
      <h3>The data is : {data} </h3>
      <Button
        content="increment"
        color="green"
        onClick={() => dispatch({ type: INCREMENT_COUNTER })}
      />
      <Button
        onClick={() =>
          dispatch(openModal({ modalType: "TestModal", modalProps: { data } }))
        }
        content="open modal"
        color="teal"
      />

      <TestPlaceInput setLocation={handleSetLocation} />
      <TestMap location={location} />
    </>
  );
};

export default Sandbox;
