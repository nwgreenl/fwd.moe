import { useRef, useState } from "preact/hooks";

import FwdItem from "./FwdItem";

import { SortIcon } from "../icons";
import { FwdService } from "../../services";
import { isKeypressMouseEvent } from "../../utils";

import type { Fwd } from "../../types";

const FwdList = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [sortAsc, setSortAsc] = useState(true);

  const addNewBtnRef = useRef<HTMLButtonElement>(null);
  const sortBtnRef = useRef<HTMLButtonElement>(null);

  const handleFwdSave = (newFwd: Fwd, originalFwdId?: Fwd["id"]) => {
    FwdService.upsertFwdToMap(newFwd, originalFwdId);
    setFwds(FwdService.getSortedFwds({ asc: sortAsc }));
    setIsAdding(false);
    setTimeout(() => addNewBtnRef.current?.focus(), 10);
  };

  const handleFwdDelete = (fwdId: Fwd["id"]) => {
    if (FwdService.isTempFwd(fwdId)) {
      setFwds(fwds.slice(1));
      setIsAdding(false);
      return;
    }

    FwdService.removeFwdFromMap(fwdId);

    const remainingFwds = FwdService.getSortedFwds({ asc: sortAsc });
    if (isAdding) remainingFwds.unshift(fwds[0]);

    setFwds(remainingFwds);
  };

  const [fwds, setFwds] = useState(FwdService.getSortedFwds({ asc: sortAsc }));
  const handleNewFwd = () => {
    setIsAdding(true);
    setFwds((fwds) => [FwdService.generateTempFwd(), ...fwds]);
  };

  const handleFwdSort = (e: MouseEvent) => {
    setFwds(FwdService.getSortedFwds({ asc: sortAsc }));
    setSortAsc(!sortAsc);
    if (!isKeypressMouseEvent(e)) {
      sortBtnRef.current?.blur();
    }
  };

  const handleImFeelingLucky = () => {
    const fwd = fwds[Math.floor(Math.random() * fwds.length)];
    window.open(fwd.url, "_self");
  };

  const sortFwdBtn = (
    <button
      ref={sortBtnRef}
      onClick={handleFwdSort}
      disabled={isAdding}
      title={`sort fwds by path/id (${sortAsc ? "desc" : "asc"})`}
    >
      <SortIcon asc={sortAsc} />
    </button>
  );

  const imFeelingLuckyBtn = (
    <button
      className="hover:text-indigo-600 focus:text-indigo-600 hover:font-bold focus:text-bold hover:animate-pulse focus:animate-pulse"
      onClick={handleImFeelingLucky}
      title="i'm feeling lucky"
      disabled={isAdding}
      tabIndex={0}
    >
      ¯\(ツ)/¯
    </button>
  );

  const fwdItems = (
    <div className="flex flex-wrap gap-4 mx-auto max-w-full">
      {fwds.map((fwd) => (
        <FwdItem fwd={fwd} onSave={handleFwdSave} onDelete={handleFwdDelete} key={fwd.id} />
      ))}
    </div>
  );

  const numFwds = isAdding ? fwds.length - 1 : fwds.length;
  return (
    <div className="w-full flex flex-col gap-4 items-center px-4">
      <div className="flex flex-col items-center group">
        <div className="flex gap-3">
          <button
            className="bg-indigo-600 hover:bg-indigo-700 hover:text-slate-200 w-32"
            onClick={handleNewFwd}
            disabled={isAdding}
            ref={addNewBtnRef}
          >
            add new
          </button>
          {numFwds > 1 && sortFwdBtn}
        </div>
        {numFwds > 0 && (
          <div className="hidden text-slate-400 text-sm mt-1 justify-center items-center group-hover:flex group-focus-within:flex">
            <div>
              found {numFwds.toLocaleString()} fwd{numFwds !== 1 && "s"}
            </div>
            {numFwds > 1 && imFeelingLuckyBtn}
          </div>
        )}
      </div>
      {numFwds > 0 || isAdding ? fwdItems : <p className="text-slate-400">no fwds found... T_T</p>}
    </div>
  );
};

export default FwdList;
