import { useRef, useState } from "preact/hooks";

import { FwdList, InfoIcon } from "./components";
import { FwdService } from "./services";
import { isKeypressMouseEvent } from "./utils";

const TITLE_CSS_CLASS = "group-hover:underline";
const SPIN_CSS_CLASSES = ["animate-spin", "hover:cursor-progress"];

const App = () => {
  const paths = window.location.pathname.slice(1).split("/");
  if (paths.length > 0 && paths[0]) {
    const { fwdMap } = FwdService;

    let fwd = null;
    let extraPaths = "";

    for (let i = 0; i < paths.length; i++) {
      const lastPath = paths.length - i;
      const pathname = paths.slice(0, lastPath).join("/");

      fwd = fwdMap[pathname.toLowerCase()];
      if (fwd) {
        extraPaths = paths.slice(lastPath).join("/");
        break;
      }
    }

    if (fwd) {
      const url = new URL(fwd.url);
      if (extraPaths) url.pathname += extraPaths;

      location.replace(url.href);
      return <>fwding... (＾▽＾)ﾉ~~~</>;
    }
    console.warn("No fwd found for current path", { pathname: window.location.pathname });
  }

  /* eslint-disable react-hooks/rules-of-hooks */
  const showInfoRef = useRef<HTMLButtonElement>(null);
  const [showInfo, setShowInfo] = useState(false);
  const handleShowInfo = (e: MouseEvent) => {
    if (showInfo && !isKeypressMouseEvent(e)) {
      showInfoRef.current?.blur();
    }
    setShowInfo(!showInfo);
  };

  const fwdChanRef = useRef<HTMLImageElement>(null);
  const toggleFwdChanSpin = () => {
    if (!fwdChanRef.current) return;

    const classListMutation = fwdChanRef.current.classList.contains(SPIN_CSS_CLASSES[0])
      ? fwdChanRef.current.classList.remove
      : fwdChanRef.current.classList.add;

    for (const cssClass of SPIN_CSS_CLASSES) {
      classListMutation.bind(fwdChanRef.current.classList)(cssClass);
    }
  };

  const title = (
    <>
      <span className={TITLE_CSS_CLASS}>f</span>
      or
      <span className={TITLE_CSS_CLASS}>w</span>
      ar
      <span className={TITLE_CSS_CLASS}>d</span>s
    </>
  );

  const info = (
    <div className="flex flex-col text-slate-400 text-sm my-2 gap-2 justify-center">
      <p>paths are case-insensitive</p>
      <p>query params are preserved</p>
      <p>any paths following a match are preserved</p>
      <p>longest match takes precedence</p>
    </div>
  );

  return (
    <div className="mb-6 flex flex-col gap-2 items-center text-center mt-2">
      <div className="group">
        <div className="flex max-w-lg justify-center items-center gap-2 mb-1">
          <h1 className="text-shadow-indigo-700 text-shadow-lg">fwd.moe</h1>
          <img
            src="/fwd-chan.png"
            className="h-26 w-26 hover:cursor-alias"
            onClick={toggleFwdChanSpin}
            alt="A drawing of a girl with purple twin tails is smiling with her mouth open. Her left eye is open and her right eye is closed to look like she is winking. She has a forward arrow as a hair clip on the right side of her head."
            title="fwd-chan"
            ref={fwdChanRef}
          />
        </div>
        <div className="flex justify-center items-center gap-2">
          <p>path-based {title} (redirects)</p>
          <button ref={showInfoRef} onClick={handleShowInfo}>
            <InfoIcon />
          </button>
        </div>
        {showInfo && info}
      </div>
      <FwdList />
    </div>
  );
};

export default App;
