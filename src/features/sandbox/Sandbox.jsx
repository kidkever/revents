import React from "react";
import { Button } from "semantic-ui-react";
import { useSelector, useDispatch } from "react-redux";
import { INCREMENT_COUNTER } from "./testReducer";

const Sandbox = () => {
  const dispatch = useDispatch();
  const data = useSelector((state) => state.data);

  return (
    <>
      <h1>Testing 123...</h1>
      <h3>The data is : {data} </h3>
      <Button
        content="increment"
        color="green"
        onClick={() => dispatch({ type: INCREMENT_COUNTER })}
      />
    </>
  );
};

export default Sandbox;
