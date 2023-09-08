
// import batr.common.*;
// import batr.general.*;

import { int } from "../../../legacy/AS3Legacy";
import { DEFAULT_SIZE } from "../../../render/GlobalRenderVariables";
import BatrGUIEvent from "../../event/BatrGUIEvent";
import I18nsChangeEvent from "../../event/I18nsChangeEvent";
import Menu from "../../main/Menu";
import BatrMenuGUI from "../BatrMenuGUI";
import BatrTextField from "../BatrTextField";
import IBatrMenuElement from "../IBatrMenuElement";
import BatrSelectorContent from "./BatrSelectorContent";

// import batr.game.block.*;
// import batr.game.map.*;
// import batr.game.main.*;
// import batr.game.model.*;

// import batr.menu.main.*;
// import batr.menu.events.*;
// import batr.menu.object.*;

// import batr.main.*;
// import batr.fonts.*;
// import batr.i18n.*;

// import flash.text.*;
// import flash.display.*;
// import flash.events.MouseEvent;

export default class BatrSelector extends BatrMenuGUI implements IBatrMenuElement {
	//============Static Variables============//
	protected static readonly ARROW_OFFSET: number = DEFAULT_SIZE / 10;

	//============Static Functions============//

	/**
	 * set a relative link between these selector.
	 * @param	selector1	the first selector carries content.
	 * @param	selector2	the second selector that will lost its content.
	 */
	public static setRelativeLink(selector1: BatrSelector, selector2: BatrSelector): void {
		selector1.setLinkTarget(selector2, false);
		selector2.setLinkTarget(selector1, false);
	}

	//============Instance Variables============//
	protected _leftArrow: BatrSelectorArrow;
	protected _rightArrow: BatrSelectorArrow;
	protected _textField: BatrTextField;
	protected _minTextWidth: number;

	protected _Content: BatrSelectorContent;

	/**
	 * A reference to other selector,and constantly copy content from its link target
	 * When its value update,the target's value also update
	 */
	protected _linkTarget: BatrSelector = null;

	//============Constructor & Destructor============//
	public constructor(content: BatrSelectorContent,
		minTextWidth: number = 2 * DEFAULT_SIZE): void {
		super();
		this._Content = content;
		this._minTextWidth = minTextWidth;
		// Left
		this._leftArrow = new BatrSelectorArrow();
		this._leftArrow.scaleX = -1;
		// Right
		this._rightArrow = new BatrSelectorArrow();
		// Text
		this._textField = BatrTextField.fromKey(null, null);
		// AddEventListener
		this._leftArrow.clickFunction = this.onClickLeft;
		this._rightArrow.clickFunction = this.onClickRight;
		// Init
		this.initDisplay();
	}

	//============Destructor Function============//
	override destructor(): void {
		this._leftArrow.destructor();
		this._rightArrow.destructor();
		this._textField.destructor();
		this._Content.destructor();
		super.destructor();
	}

	//============Instance Getter And Setter============//
	public get content(): BatrSelectorContent {
		return this._Content;
	}

	// Int:value,Enum:index
	public get currentValue(): int {
		return this._Content.currentValue;
	}

	public get linkTarget(): BatrSelector {
		return this._linkTarget;
	}

	public set linkTarget(value: BatrSelector) {
		{ // if(isValidTarget(value))
			this._linkTarget = value;
			this.copyContentTo(this._linkTarget);
		}
	}

	//============Instance Functions============//
	public setPos(x: number, y: number): BatrSelector {
		super.protected:: sP(x, y);
		return this;
	}

	public setBlockPos(x: number, y: number): BatrSelector {
		super.protected:: sBP(x, y);
		return this;
	}

	protected isValidTarget(other: BatrSelector): boolean {
		while (other != null) {
			if (other.linkTarget == this)
				return false;
			other = other.linkTarget;
		}
		return true;
	}

	protected setLinkTarget(other: BatrSelector, callee: boolean = true): BatrSelector {
		this._linkTarget = other;
		this.copyContentTo(this._linkTarget, callee);
		return this;
	}

	/**
	 * Let the other selector copy content from this
	 * @param	num	the other selector
	 * @param	callee	the boolean determines to callee
	 */
	protected copyContentTo(other: BatrSelector, callee: boolean = true): void {
		if (other == null)
			return;
		if (this._Content != null)
			other.setContent(this._Content);
		if (!callee)
			return;
		while (other != null && other._linkTarget != null) {
			if (other._linkTarget == this)
				break;
			other._linkTarget._Content = other._Content;
			other._linkTarget.updateTextByContent();
			other._linkTarget.copyContentTo(other, false);
			other = other._linkTarget;
		}
	}

	protected initDisplay(): void {
		this.updateTextByContent();
		this._textField.initFormatAsMenu();
		// Add Children
		this.addChild(this._leftArrow);
		this.addChild(this._rightArrow);
		this.addChild(this._textField);
	}

	protected updateText(): void {
		this._textField.setTextFormat(Menu.TEXT_FORMAT);
		this._textField.width = this._textField.textWidth + DEFAULT_SIZE / 10;
		this._textField.height = this._textField.textHeight + DEFAULT_SIZE / 20;
		this._textField.x = -this._textField.width / 2;
		this._textField.y = -this._textField.height / 2;
		this._leftArrow.x = -Math.max(this._textField.textWidth + this._leftArrow.displayWidth, this._minTextWidth) / 2 - ARROW_OFFSET;
		this._rightArrow.x = Math.max(this._textField.textWidth + this._rightArrow.displayWidth, this._minTextWidth) / 2 + ARROW_OFFSET;
		this._leftArrow.y = this._rightArrow.y = 0;
	}

	public updateTextByContent(): BatrSelector {
		if (this._Content == null)
			return this;
		this._textField.setText(this._Content.currentText);
		this.updateText();
		return this;
	}

	override drawShape(): void {
	}

	public setLinkTo(target: BatrSelector): BatrSelector {
		this.linkTarget = target;
		return this;
	}

	public setContent(content: BatrSelectorContent): void {
		this._Content = content;
		this.updateTextByContent();
	}

	// Event
	protected onClickLeft(E: MouseEvent): void {
		this.turnSelectLeft();
	}

	protected onClickRight(E: MouseEvent): void {
		this.turnSelectRight();
	}

	public onI18nChange(E: I18nsChangeEvent): void {
		/* trace(this.name,this._textField.text,this._Content);
		 * The Player selector in Game Result Menu doesn't has content when INITIAL LOAD! */
		if (this._Content == null)
			return;
		this._Content.alignI18nsFrom(E.nowI18ns);
		this.updateTextByContent();
	}

	// Select
	public turnSelectTo(index: int): BatrSelector {
		this._Content.currentValue = index;
		return this;
	}

	public turnSelectLeft(): void {
		// Check
		if (this._Content == null)
			return;
		// Select
		this._Content.currentValue--;
		// Update
		this.updateTextByContent();
		this.copyContentTo(this._linkTarget);
		// Event
		this.dispatchEvent(new BatrGUIEvent(BatrGUIEvent.CLICK_LEFT, this));
	}

	public turnSelectRight(): void {
		// Check
		if (this._Content == null)
			return;
		// Select
		this._Content.currentValue++;
		// Update
		this.updateTextByContent();
		this.copyContentTo(this._linkTarget);
		// Event
		this.dispatchEvent(new BatrGUIEvent(BatrGUIEvent.CLICK_RIGHT, this));
	}
}