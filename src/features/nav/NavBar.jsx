import React, { useState } from "react";
import { NavLink, useHistory } from "react-router-dom";
import { Button, Container, Menu } from "semantic-ui-react";
import SignedInMenu from "./SignedInMenu";
import SignedOutMenu from "./SignedOutMenu";

const NavBar = ({ setFormOpen }) => {
  const history = useHistory();

  const [authenticated, setAuthenticated] = useState(false);

  const handleSignOut = () => {
    setAuthenticated(false);
    history.push("/");
  };

  return (
    <Menu inverted fixed="top">
      <Container>
        <Menu.Item as={NavLink} to="/" exact header>
          <img src="/assets/logo.png" alt="logo" style={{ marginRight: 15 }} />
          Re-vents
        </Menu.Item>
        <Menu.Item as={NavLink} to="/events" name="Events" />
        {authenticated ? (
          <>
            <Menu.Item as={NavLink} to="/createEvent">
              <Button positive inverted content="Create Event" />
            </Menu.Item>
            <SignedInMenu signOut={handleSignOut} />
          </>
        ) : (
          <SignedOutMenu setAuthenticated={setAuthenticated} />
        )}
      </Container>
    </Menu>
  );
};

export default NavBar;
