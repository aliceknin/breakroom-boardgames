import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
//   useParams,
//   useRouteMatch,
} from "react-router-dom";

import App from "../App";
import Home from "./Home";

const RouterContainer = () => {
    return (
        <Router>
            <Switch>
                <Route exact path="/">
                    <Home />
                </Route>
                <Route path="/room/:roomName"></Route>
                <Route path="/ex">
                    <App />
                </Route>
            </Switch>
        </Router>
    )
}

export default RouterContainer;