import { flash } from '../legacy/FlashLegacy';

type Stage = flash.display.Stage
const Stage = flash.display.Stage

type KeyboardEvent = flash.events.KeyboardEvent
const KeyboardEvent = flash.events.KeyboardEvent

// key map
interface KeyMap {
	[key: number]: boolean;
}

// Class
export default class KeyListener {
	//============Static Variables============//

	//============Static Function============//

	//============Instance Variables============//
	protected _listenTo: Stage | null = null;
	protected _pressedKeys: KeyMap = {};
	// protected pressedKeys:uint[]=new uint[]
	protected _ctrlKey: boolean = false;
	protected _shiftKey: boolean = false;
	protected _altKey: boolean = false;

	//============Constructor & Destructor============//
	public constructor(listens: Stage) {
		this.listens = listens;
	}

	//============Destructor Function============//
	public destructor(): void {
		this.listens = null;

		for (let k in this._pressedKeys) {
			delete this._pressedKeys[k];
		}
		this._altKey = false;
		this._ctrlKey = false;
		this._shiftKey = false;
	}

	//============Instance Getter And Setter============//
	public get listens(): Stage | null {
		return this._listenTo;
	}

	public set listens(stage: Stage | null) {
		// Detect
		if (this._listenTo == stage)
			return;

		// Set Old
		if (this._listenTo != null) {
			if (this._listenTo.hasEventListener(KeyboardEvent.KEY_DOWN)) {
				this._listenTo.removeEventListener(KeyboardEvent.KEY_DOWN, this.onKeyDown);
			}
			if (this._listenTo.hasEventListener(KeyboardEvent.KEY_UP)) {
				this._listenTo.removeEventListener(KeyboardEvent.KEY_UP, this.onKeyUp);
			}
		}
		// Set Variable
		this._listenTo = stage;

		// Set New
		if (this._listenTo == null) return;

		// Add Event Listeners
		this._listenTo.addEventListener(KeyboardEvent.KEY_DOWN, this.onKeyDown);
		this._listenTo.addEventListener(KeyboardEvent.KEY_UP, this.onKeyUp);
	}

	public get shiftKey(): boolean {
		return this._shiftKey;
	}

	public get ctrlKey(): boolean {
		return this._ctrlKey;
	}

	public get altKey(): boolean {
		return this._altKey;
	}

	//============Instance Functions============//
	// Public Functions
	public isKeyDown(code: number): boolean {
		return this._pressedKeys[code];

		// return Key.pressedKeys.some((c,i,v):boolean{return code==c})
	}

	public isKeyUp(code: number): boolean {
		return !this.isKeyDown(code);
	}

	public isAnyKeyPress(): boolean {
		for (let k in this._pressedKeys) {
			if (this._pressedKeys[k])
				return true;
		}
		return false;

		// return Key.pressedKeys==null?false:Key.pressedKeys.length>0
	}

	// Listener Functions
	protected onKeyDown(E: KeyboardEvent): void {
		this.onKeyDeal(E);

		// Key.pressedKeys.push(Number(E.keyCode))
		this._pressedKeys[E.keyCode] = true;
	}

	protected onKeyUp(E: KeyboardEvent): void {
		this.onKeyDeal(E);

		if (this._pressedKeys[E.keyCode] != undefined) // Key.pressedKeys.splice(Key.pressedKeys.indexOf(E.keyCode),1)
			this._pressedKeys[E.keyCode] = false;
	}

	protected onKeyDeal(E: KeyboardEvent): void {
		this._ctrlKey = E.ctrlKey;
		this._shiftKey = E.shiftKey;
		this._altKey = E.altKey;
	}
}