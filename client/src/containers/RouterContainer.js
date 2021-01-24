import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import App from "../App";
import Home from "./Home";
import Room from "./Room";

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
        <Route path="/ex">
          <App />
        </Route>
      </Switch>
    </Router>
  );
};

export default RouterContainer;
