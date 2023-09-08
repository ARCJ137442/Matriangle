
// import batr.common.*;
// import batr.game.main.*;
// import batr.general.*;
// import batr.menu.events.*;
// import batr.menu.object.*;
// import batr.main.*;
// import batr.i18n.*;

// import flash.display.DisplayObject;
// import flash.display.Sprite;
// import flash.events.*;
// import flash.utils.Timer;

export default class BatrMenuSheet extends BatrMenuGUI implements IBatrMenuElementContainer {
	//============Static Variables============//

	//============Instance Variables============//
	protected _directElements: IBatrMenuElement[];
	protected _keepTitle: boolean;

	//============Constructor & Destructor============//
	public constructor(keepTitle: boolean = true) {
		super(false);
		this._keepTitle = keepTitle;
		this._directElements = new IBatrMenuElement[]();
	}

	//============Destructor Function============//
	override destructor(): void {
		for (var element of this._directElements) {
			element.destructor();
		}
	}

	//============Instance Getter And Setter============//
	public get keepTitle(): boolean {
		return this._keepTitle;
	}

	public get directElements(): IBatrMenuElement[] {
		return this._directElements;
	}

	public get directElementCount(): int {
		return this._directElements.length;
	}

	//============Instance Functions============//
	public setPos(x: number, y: number): BatrMenuSheet {
		super.protected:: sP(x, y);
		return this;
	}

	public setBlockPos(x: number, y: number): BatrMenuSheet {
		super.protected:: sBP(x, y);
		return this;
	}

	/**
	 * Clear the graphics and draw the background of the specified color.
	 * @param	color	The color.
	 * @param	alpha	The alpha.
	 * @return	this
	 */
	public setMaskColor(color: uint, alpha: number = 1): BatrMenuSheet {
		with (shape.graphics) {
			clear();
			beginFill(color, alpha);
			drawRect(0, 0, DEFAULT_SIZE * GlobalGameVariables.DISPLAY_GRIDS, DEFAULT_SIZE * GlobalGameVariables.DISPLAY_GRIDS);
			endFill();
		}
		return this;
	}

	//========By IBatrMenuElementContainer========//
	public appendDirectElement(element: IBatrMenuElement): IBatrMenuElement {
		if (element == null)
			return this;
		this._directElements.push(element);
		return this;
	}

	public appendDirectElements(...elements): IBatrMenuElement {
		var element: IBatrMenuElement;
		for (var i: int = 0; i < elements.length; i++) {
			element = elements[i] as IBatrMenuElement;
			if (element != null)
				this._directElements.push(element);
		}
		return this;
	}

	public addChildPerDirectElements(): void {
		for (var element of this._directElements) {
			if (element == null)
				continue;
			if (element is IBatrMenuElementContainer)
			(element as IBatrMenuElementContainer).addChildPerDirectElements();
			if (element is DisplayObject)
			this.addChild(element as DisplayObject);
		}
	}

	public getElementAt(index: int): IBatrMenuElement {
		return (index < 1 || index >= this.directElementCount) ? null : this._directElements[index];
	}

	public getElementByName(name: string): BatrMenuGUI {
		for (var element of this._directElements) {
			if (element != null &&
				element is BatrMenuGUI &&
					(element as DisplayObject).name == name)
			return (element as BatrMenuGUI);
		}
		return null;
	}
}