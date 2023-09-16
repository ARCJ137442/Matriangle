

import Menu from "../main/Menu";
import IBatrMenuElement from "./IBatrMenuElement";

export default class BatrTextInput extends TextField implements IBatrMenuElement {
	//============Static Constructor============//

	//============Static Variables============//

	//============Instance Variables============//

	//============Constructor============//
	public constructor(initialText: string = '', autoSize: string = TextFieldAutoSize.LEFT) {
		super();
		// text
		this.selectable = true;
		this.text = initialText;
		this.type = TextFieldType.INPUT;
		this.border = true;
		// this.multiline=true;
		this.mouseWheelEnabled = true; // available when limited height
		// this.wordWrap = true; //auto newline

		// form
		this.defaultTextFormat = Menu.INPUT_FORMAT;
		this.setTextFormat(Menu.INPUT_FORMAT);
		this.autoSize = autoSize;
	}

	//============Destructor Function============//
	public destructor(): void {
	}

	//============Instance Getter And Setter============//

	//============Instance Functions============//

	public setText(value: string): void {
		this.text = value;
	}

	public setPos(x: number, y: number): BatrTextInput {
		this.x = x;
		this.y = y;
		return this;
	}

	public setBlockPos(x: number, y: number): BatrTextInput {
		this.x = PosTransform.localPosToRealPos(x);
		this.y = PosTransform.localPosToRealPos(y);
		return this;
	}

	public setSize(w: number, h: number): BatrTextInput {
		this.width = w;
		this.height = h;
		return this;
	}

	public setBlockSize(w: number, h: number): BatrTextInput {
		this.width = PosTransform.localPosToRealPos(w);
		this.height = PosTransform.localPosToRealPos(h);
		return this;
	}

	public setFormat(format: TextFormat, lock: boolean = false): BatrTextInput {
		this.defaultTextFormat = format;
		this.setTextFormat(format);
		return this;
	}
}