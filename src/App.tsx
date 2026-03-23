import React from "react";
import { Route } from "react-router-dom";
import { AnimationRoutes } from "zmp-ui";
import HomePage from "./pages/home";

const App = () => {
  return (
    <AnimationRoutes>
      <Route path="/" element={<HomePage />}></Route>
    </AnimationRoutes>
  );
};
export default App;