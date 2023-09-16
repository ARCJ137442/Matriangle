

import { int } from "../../legacy/AS3Legacy";
import { DEFAULT_SIZE } from "../../display/api/GlobalDisplayVariables";
import BatrButton from "./BatrButton";
import BatrMenuGUI from "./BatrMenuGUI";
import IBatrMenuElement from "./IBatrMenuElement";
import IBatrMenuElementContainer from "./IBatrMenuElementContainer";

export default class BatrButtonList extends BatrMenuGUI implements IBatrMenuElementContainer {
	//============Static Variables============//
	public static readonly DEFAULT_DISTANCE: number = DEFAULT_SIZE;

	//============Instance Variables============//
	protected _buttons: BatrButton[] = new Array<BatrButton>();
	protected _verticalDistance = DEFAULT_DISTANCE;

	//============Constructor & Destructor============//
	public constructor(verticalDistance: number = BatrButtonList.DEFAULT_DISTANCE) {
		super(false);
		this.verticalDistance = verticalDistance;
		this.initDisplay();
	}

	//============Destructor Function============//
	override destructor(): void {
		for (let button of this._buttons) {
			button.destructor();
		}
		this._buttons = null;
	}

	//============Instance Getter And Setter============//
	// Button
	public get buttons(): BatrButton[] {
		return this._buttons;
	}

	public get buttonCount(): int {
		return this._buttons.length;
	}

	// verticalDistance
	public get verticalDistance(): number {
		return this._verticalDistance;
	}

	public set verticalDistance(value: number) {
		this._verticalDistance = value;
	}

	//============Instance Functions============//
	public setPos(x: number, y: number): BatrButtonList {
		super.protected:: sP(x, y);
		return this;
	}

	public setBlockPos(x: number, y: number): BatrButtonList {
		super.protected:: sBP(x, y);
		return this;
	}

	protected initDisplay(): void {
		if (this.buttonCount < 1)
			return;
		let dy: number = 0;
		for (let i: int = 0; i < this._buttons.length; i++) {
			let button: BatrButton = this._buttons[i];
			button.x = 0;
			button.y = dy;
			dy += this.verticalDistance + button.displayHeight;
			this.addChild(button);
		}
	}

	public refreshDisplay(): void {
		this.initDisplay();
	}

	//========By IBatrMenuElementContainer========//
	public appendDirectElement(element: IBatrMenuElement): IBatrMenuElement {
		if (element is BatrButton)
		this._buttons.push(element as BatrButton);
		return this;
	}

	public appendDirectElements(...elements): IBatrMenuElement {
		let button: BatrButton;
		for (let i: int = 0; i < elements.length; i++) {
			button = elements[i] as BatrButton;
			if (button != null)
				this._buttons.push(button);
		}
		return this;
	}

	public addChildPerDirectElements(): void {
		this.initDisplay();
	}

	public getElementAt(index: int): IBatrMenuElement {
		return (index < 1 || index >= this.buttonCount) ? null : (this._buttons[index] as IBatrMenuElement);
	}

	public getElementByName(name: string): BatrMenuGUI {
		for (let button of this._buttons) {
			if (button != null && button.name == name)
				return (button as BatrMenuGUI);
		}
		return null;
	}
}