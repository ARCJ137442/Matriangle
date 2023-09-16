

import { int } from "../../../legacy/AS3Legacy";
import BatrSubject from "../../../main/BatrSubject";
import { DEFAULT_SIZE } from "../../../display/api/GlobalDisplayVariables";
import BatrGUIEvent from "../../event/BatrGUIEvent";
import I18nsChangeEvent from "../../event/I18nsChangeEvent";
import Menu from "../../main/Menu";
import BatrMenuGUI from "../BatrMenuGUI";
import BatrTextField from "../BatrTextField";
import IBatrMenuElement from "../IBatrMenuElement";
import IBatrMenuElementContainer from "../IBatrMenuElementContainer";
import BatrSelector from "./BatrSelector";
import BatrSelectorContent from "./BatrSelectorContent";

export default class BatrSelectorList extends BatrMenuGUI implements IBatrMenuElementContainer {
	//============Static Variables============//
	public static readonly DEFAULT_DISTANCE_H: number = DEFAULT_SIZE * 8;
	public static readonly DEFAULT_DISTANCE_V: number = DEFAULT_SIZE;

	//============Instance Variables============//
	protected _selectors: BatrSelector[] = new Array<BatrSelector>();
	protected _selectTextFields: BatrTextField[] = new Array<BatrTextField>();

	/** Distance Between selector And selector. */
	protected _verticalDistance = BatrSelectorList.DEFAULT_DISTANCE_V;

	/** Distance Between Text And selector. */
	protected _horizontalDistance = BatrSelectorList.DEFAULT_DISTANCE_H;

	//============Constructor & Destructor============//
	public constructor(horizontalDistance: number = BatrSelectorList.DEFAULT_DISTANCE_H, verticalDistance: number = BatrSelectorList.DEFAULT_DISTANCE_V) {
		super(false);
		this.setDistance(horizontalDistance, verticalDistance);
	}

	//============Destructor Function============//
	override destructor(): void {
		for (let selector of this._selectors) {
			selector.destructor();
		}
		this._selectors = null;
		for (let textField of this._selectTextFields) {
			textField.destructor();
		}
		this._selectTextFields = null;
	}

	//============Instance Getter And Setter============//
	// selector
	public get selectors(): BatrSelector[] {
		return this._selectors;
	}

	public get selectorCount(): int {
		return this._selectors.length;
	}

	// Text
	public get selectTextFields(): BatrTextField[] {
		return this._selectTextFields;
	}

	public get selectTextFieldCount(): int {
		return this._selectTextFields.length;
	}

	// verticalDistance
	public get horizontalDistance(): number {
		return this._horizontalDistance;
	}

	public set horizontalDistance(value: number) {
		this._horizontalDistance = value;
		this.refreshDisplay();
	}

	// verticalDistance
	public get verticalDistance(): number {
		return this._verticalDistance;
	}

	public set verticalDistance(value: number) {
		this._verticalDistance = value;
		this.refreshDisplay();
	}

	//============Instance Functions============//
	public setPos(x: number, y: number): BatrSelectorList {
		super.protected:: this.sP(x, y);
		return this;
	}

	public setBlockPos(x: number, y: number): BatrSelectorList {
		super.protected:: this.sBP(x, y);
		return this;
	}

	protected initDisplay(): void {
		let dy: number, i: int;
		if (this.selectTextFieldCount > 0) {
			let textField: BatrTextField;
			for (dy = i = 0; i < this.selectTextFieldCount; i++) {
				textField = this._selectTextFields[i];
				if (textField == null) {
					dy += this.verticalDistance;
					continue;
				}
				textField.x = 0;
				textField.y = dy;
				dy += this.verticalDistance;
				this.addChild(textField);
			}
		}
		if (this.selectorCount > 0) {
			let selector: BatrSelector;
			for (dy = i = 0; i < this.selectorCount; i++) {
				selector = this._selectors[i];
				if (selector == null) {
					dy += this.verticalDistance;
					continue;
				}
				selector.x = this.horizontalDistance;
				selector.y = dy + DEFAULT_SIZE / 2;
				dy += this.verticalDistance;
				this.addChild(selector);
			}
		}
	}

	public refreshDisplay(): BatrSelectorList {
		this.initDisplay();
		return this;
	}

	public setPosAndRefresh(x: number, y: number): BatrSelectorList {
		this.x = x;
		this.y = y;
		this.refreshDisplay();
		return this;
	}

	public setDistance(H: number, V: number): BatrSelectorList {
		this._horizontalDistance = H;
		this._verticalDistance = V;
		this.initDisplay();
		return this;
	}

	//========By IBatrMenuElementContainer========//

	/** Unfinished. */
	public appendDirectElement(element: IBatrMenuElement): IBatrMenuElement {
		this.functionNotFound();
		return null;
	}

	/** Unfinished. */
	public appendDirectElements(...elements): IBatrMenuElement {
		this.functionNotFound();
		return null;
	}

	/** Unfinished. */
	public addChildPerDirectElements(): void {
		this.initDisplay();
	}

	/** Unfinished. */
	public getElementAt(index: int): IBatrMenuElement {
		this.functionNotFound();
		return null;
	}

	/** Unfinished. */
	public getElementByName(name: string): BatrMenuGUI {
		this.functionNotFound();
		return null;
	}

	protected functionNotFound(): void {
		throw new Error('Function Not Found!');
	}

	//========True Functions About selectors========//
	public appendSelectorAndText(host: BatrSubject, selector: BatrSelector, tKey: string, shiftEmptyLine: boolean = false): BatrSelectorList {
		// Empty Line
		if (shiftEmptyLine)
			this.AddNewEmptyLine();
		// selector
		this._selectors.push(selector);
		// Text
		let textField: BatrTextField = BatrTextField.fromKey(host.translations, tKey);
		textField.initFormatAsMenu();
		this._selectTextFields.push(textField);
		host.addEventListener(I18nsChangeEvent.TYPE, textField.onI18nChange);
		// Return
		return this;
	}

	protected AddNewEmptyLine(): void {
		this._selectors.push(null);
		this._selectTextFields.push(null);
	}

	public getSelectorByName(name: string): BatrSelector {
		for (let selector of this._selectors) {
			if (selector != null && selector.name == name)
				return selector;
		}
		return null;
	}

	public quickAppendSelector(menu: Menu, content: BatrSelectorContent, keyName: string, shiftEmptyLine: boolean = false, clickListener: Function = null, minTextBlockWidth: number = 0.5): BatrSelectorList {
		let selector: BatrSelector = new BatrSelector(content, PosTransform.localPosToRealPos(minTextBlockWidth));
		selector.setName(keyName);
		menu.subject.addEventListener(I18nsChangeEvent.TYPE, selector.onI18nChange);
		if (clickListener != null)
			selector.addEventListener(BatrGUIEvent.CLICK, clickListener);
		this.appendSelectorAndText(menu.subject, selector, keyName, shiftEmptyLine);
		return this;
	}
}