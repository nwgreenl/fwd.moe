import { render } from "preact";
import App from "./App";

import "./index.css";

console.info(
  "hey (─‿‿─)~\n\nsource → https://github.com/nwgreenl/fwd.moe\nsupport → https://buymeacoffee.com/nwgreenl",
);

render(<App />, document.getElementById("app")!);
