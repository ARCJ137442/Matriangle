import KeyListener from "../../../../../common/KeyListener";
import PlayerController from "./PlayerController";

/**
 * A type of controller uses keyboard to control players
 * 
 * * Equals the former class `Player`
 */
export default class KeyboardController extends PlayerController {

    protected _listener: KeyListener;

    public constructor(listener: KeyListener) {
        super();
        this._listener = listener;
    }
}
