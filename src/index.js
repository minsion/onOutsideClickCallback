import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { ThemeProvider } from '@material-ui/core/styles';
import Themes from "./themes";

const rootElement = document.getElementById("root");
ReactDOM.render(
    <ThemeProvider theme={Themes.default}>
      <App />
    </ThemeProvider>,
  rootElement
);
