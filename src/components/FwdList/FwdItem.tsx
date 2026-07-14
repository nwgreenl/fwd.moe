import { useEffect, useRef, useState } from "preact/hooks";
import type { GenericEventHandler, RefObject, TargetedEvent } from "preact";

import { FwdService } from "../../services";

import { focusLoopHandler } from "../../utils";
import type { Fwd, FwdValidationResultErrorMap } from "../../types";

interface FwdItemProps {
  fwd: Fwd;
  onSave(newFwd: Fwd, originalFwdId?: Fwd["id"]): void;
  onDelete(fwdId: Fwd["id"]): void;
}

type FwdPropertyInputElement = Omit<HTMLInputElement, "id"> & { id: keyof Fwd };
interface FwdPropertyInputEvent extends InputEvent {
  target: FwdPropertyInputElement;
}

const FwdItem = ({ fwd, onDelete, onSave }: FwdItemProps) => {
  const isNewFwd = FwdService.isTempFwd(fwd.id);

  const [isEditing, setIsEditing] = useState(isNewFwd);
  const [localFwd, setLocalFwd] = useState(fwd);
  const [errorMap, setErrorsMap] = useState<FwdValidationResultErrorMap | null>(null);

  const idPropertyEditRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (isEditing && idPropertyEditRef.current) idPropertyEditRef.current.focus();
  }, [isEditing]);

  const handleClose = () => {
    setIsEditing(false);
    setErrorsMap(null);
  };

  const handleEditClick = (e: MouseEvent) => {
    e.preventDefault();
    setIsEditing(true);
  };

  const handleDeleteClick = (e: MouseEvent) => {
    e.preventDefault();
    onDelete(fwd.id);
  };

  const handleSaveClick = (e: MouseEvent) => {
    e.preventDefault();

    const fwdCandidate = { ...localFwd };

    const addHttps = !fwdCandidate.url.includes("://") && fwdCandidate.url.includes(".");
    if (addHttps) {
      fwdCandidate.url = `https://${fwdCandidate.url}`;
    }

    const validationResult = FwdService.validateFwdUpdate(fwdCandidate, fwd);
    if (validationResult.ok) {
      if (addHttps) setLocalFwd(fwdCandidate);
      onSave(fwdCandidate, fwd.id);
      handleClose();
      return;
    }
    setErrorsMap(validationResult.generateErrorMap());
  };

  const handleCancelClick = (e: MouseEvent) => {
    e.preventDefault();

    if (isNewFwd) {
      return onDelete(FwdService.TEMP_FWD_ID);
    }

    handleClose();
    setLocalFwd(fwd);
  };

  const handleInput = (e: TargetedEvent<FwdPropertyInputElement, FwdPropertyInputEvent>) => {
    if (!e.target) return;
    setLocalFwd({ ...localFwd, [e.target.id]: e.target.value });
  };

  const relativeUrl = window.location.origin + "/" + localFwd.id;
  const displayView = (
    <a href={relativeUrl} className="cursor-alias group max-h-min" title={`open /${localFwd.id}`}>
      <div className="item px-11 ring-2 ring-indigo-900 group-hover:ring-indigo-600 group-focus:ring-indigo-600 group-focus-within:ring-indigo-600 group-hover:ring-3 group-focus:ring-3 group-focus-within:ring-3 group-hover:scale-101 group-focus:scale-101 group-focus-within:scale-101 transition-transform duration-200">
        <p className="text-slate-400 group-hover:text-inherit group-focus:text-inherit w-full">/{localFwd.id}</p>
        <p className="text-sm text-indigo-600">{localFwd.url}</p>
        <div className="flex gap-4 hidden group-hover:block group-focus:block group-focus-within:block group-hover:text-slate-400 group-focus:text-slate-400 group-focus-within:text-slate-400">
          <button onClick={handleEditClick} title="">
            edit
          </button>
          <button className="caution" onClick={handleDeleteClick} title="">
            delete
          </button>
        </div>
      </div>
    </a>
  );

  const editingView = (
    <div className="item px-8 gap-2 ring-3 ring-indigo-600 text-slate-400" onKeyDown={focusLoopHandler}>
      <FwdPropertyEditInput
        propertyName="id"
        displayName="path (id)"
        fwd={localFwd}
        onChange={handleInput}
        errors={errorMap?.id}
        inputRef={idPropertyEditRef}
      />
      <FwdPropertyEditInput propertyName="url" fwd={localFwd} onChange={handleInput} errors={errorMap?.url} />
      <div className="flex gap-4">
        <button className="caution" onClick={handleCancelClick}>
          cancel
        </button>
        <button onClick={handleSaveClick} disabled={!(localFwd.id && localFwd.url)}>
          save
        </button>
      </div>
    </div>
  );

  return isEditing ? editingView : displayView;
};

interface FwdPropertyEditInputProps {
  fwd: Fwd;
  propertyName: keyof Fwd;
  onChange: GenericEventHandler<HTMLInputElement>;
  displayName?: string;
  errors?: string[];
  inputRef?: RefObject<HTMLInputElement>;
}

function FwdPropertyEditInput({
  fwd,
  propertyName,
  displayName,
  onChange,
  errors,
  inputRef,
}: FwdPropertyEditInputProps) {
  let value = fwd[propertyName]?.toString() || "";
  value = propertyName === "id" && FwdService.isTempFwd(value) ? "" : value;

  const errorStr = errors && errors.length > 0 ? errors.join(", ") : "";
  return (
    <div className="flex flex-col w-full group">
      <label className="text-indigo-800 group-focus-within:text-indigo-600" htmlFor={propertyName}>
        {displayName || propertyName}
      </label>
      <input type="text" id={propertyName} value={value} title={value} onChange={onChange} ref={inputRef} />
      {errorStr && <span className="text-red-700 text-sm">{errorStr}</span>}
    </div>
  );
}

export default FwdItem;
