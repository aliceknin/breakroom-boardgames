import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Home from "./Home";
import Room from "./Room";

import "../styles/Global.scss";

const RouterContainer = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        <Route path="/room/:roomName">
          <Room />
        </Route>
      </Switch>
    </Router>
  );
};

export default RouterContainer;
