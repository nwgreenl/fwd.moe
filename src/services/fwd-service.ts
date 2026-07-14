import type { Fwd, FwdMap, FwdValidationResultError, FwdValidationResultErrorMap } from "../types";

const DEFAULT_FWDS: Fwd[] = [
  { id: "a", url: "https://anilist.co/search" },
  { id: "mal", url: "https://myanimelist.net" },
];
const DEFAULT_FWD_MAP: FwdMap = DEFAULT_FWDS.reduce((fwdMap, fwd) => ({ ...fwdMap, [fwd.id]: fwd }), {});

export default class FwdService {
  static #LOCAL_STORAGE_KEY = "fwdMap";
  static TEMP_FWD_ID = "___temp___.___fwd___";

  static #__fwdMap: FwdMap;
  static #__fwds: Fwd[];

  static get fwdMap(): FwdMap {
    if (!this.#__fwdMap) {
      this.#__fwdMap = this.#loadFwdMap();
    }
    return this.#__fwdMap;
  }
  static set fwdMap(newFwdMap: FwdMap) {
    try {
      const fwdsJson = JSON.stringify(newFwdMap);
      localStorage.setItem(this.#LOCAL_STORAGE_KEY, fwdsJson);
    } catch (e) {
      console.error("Error occured while saving fwdMap to local storage", { error: e, newFwdMap });
      throw e;
    }
    this.#__fwds = Object.values(newFwdMap);
    this.#__fwdMap = newFwdMap;
  }

  static get fwds(): Fwd[] {
    if (!this.#__fwds) {
      this.#__fwds = Object.values(this.fwdMap);
    }
    return this.#__fwds;
  }
  static set fwds(_) {
    throw new Error("cannot set fwds directly as it is calculated from fwdMap");
  }

  static #initFwdMap = (): FwdMap => {
    localStorage.removeItem(this.#LOCAL_STORAGE_KEY);
    localStorage.setItem(this.#LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_FWD_MAP));
    return { ...DEFAULT_FWD_MAP };
  };

  static #loadFwdMap = (): FwdMap => {
    const fwdMap = localStorage.getItem(this.#LOCAL_STORAGE_KEY);
    if (!fwdMap) {
      return this.#initFwdMap();
    }
    try {
      return JSON.parse(fwdMap) as FwdMap;
    } catch (e) {
      const backupKey = `${this.#LOCAL_STORAGE_KEY}.backup`;
      const msg = `Error occured while parsing fwds from local storage, erasing corrupted item and saving to backup key: ${backupKey}`;

      console.error({ error: e, msg, backupKey, value: fwdMap });
      window.alert(msg);

      localStorage.setItem(backupKey, fwdMap);
      return this.#initFwdMap();
    }
  };

  static #sortFwds = (fwds: Fwd[], { asc = true } = {}): Fwd[] => {
    return fwds.sort((fwdA, fwdB) => {
      const [firstFwd, secondFwd] = asc ? [fwdA, fwdB] : [fwdB, fwdA];
      return firstFwd.id.localeCompare(secondFwd.id);
    });
  };

  static getSortedFwds({ asc = true } = {}): Fwd[] {
    return this.#sortFwds(this.fwds, { asc });
  }

  static upsertFwdToMap = (fwd: Fwd, originalFwdId?: Fwd["id"]) => {
    if (this.isTempFwd(fwd.id)) throw new Error("cannot add temp fwd to map");

    const now = Date.now();
    const upsertProps = {
      createdAt: fwd.createdAt ?? now,
      updatedAt: now,
    };

    const newFwd: Fwd = { ...fwd, ...upsertProps };
    const newFwdMap = { ...this.fwdMap, [newFwd.id]: newFwd };

    if (originalFwdId && newFwd.id !== originalFwdId && newFwdMap[originalFwdId]) {
      delete newFwdMap[originalFwdId];
    }

    this.fwdMap = newFwdMap;
  };

  static removeFwdFromMap = (fwdId: string) => {
    const newFwdMap = { ...this.fwdMap };
    delete newFwdMap[fwdId];
    this.fwdMap = newFwdMap;
  };

  static generateTempFwd(): Fwd {
    return { id: this.TEMP_FWD_ID, url: "" };
  }

  static isTempFwd(fwdId: string): boolean {
    return fwdId === this.TEMP_FWD_ID;
  }

  static validateFwdUpdate = (fwd: Fwd, originalFwd: Fwd): FwdValidationResult => {
    const result = new FwdValidationResult();

    if (!fwd.id) {
      result.addError("id", "id must be present");
    } else {
      if (fwd.id === this.TEMP_FWD_ID) {
        result.addError("id", "cannot use reserved id");
      }
      if (fwd.id !== originalFwd.id && fwd.id.toLowerCase() in this.#loadFwdMap()) {
        result.addError("id", "id already taken");
      }
    }

    try {
      new URL(fwd.url);
    } catch (e) {
      console.warn(e);
      result.addError("url", "invalid url");
    }

    return result;
  };
}

class FwdValidationResult {
  errors: FwdValidationResultError[];

  constructor(errors?: FwdValidationResultError[]) {
    this.errors = errors || [];
  }

  get ok(): boolean {
    return this.errors.length === 0;
  }

  addError(
    property: FwdValidationResultError["property"],
    message: FwdValidationResultError["message"],
  ): FwdValidationResultError {
    const error = { property, message };
    this.errors.push(error);
    return error;
  }

  generateErrorMap(): FwdValidationResultErrorMap {
    return this.errors.reduce((errMap, err) => {
      if (err.property in errMap) {
        errMap[err.property].push(err.message);
      } else {
        errMap[err.property] = [err.message];
      }
      return errMap;
    }, {} as FwdValidationResultErrorMap);
  }
}
