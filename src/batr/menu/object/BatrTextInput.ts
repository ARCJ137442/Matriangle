package batr.menu.objects {

	import batr.common.*;
	import batr.general.*;

	import batr.menu.main.*;
	import batr.menu.events.*;
	import batr.menu.object.*;
	import batr.menu.object.selector.*;

	import batr.main.*;
	import batr.fonts.*;
	import batr.i18n.*;

	import flash.text.*;

	export default class BatrTextInput extends TextField implements IBatrMenuElement {
		//============Static Constructor============//

		//============Static Variables============//

		//============Instance Variables============//

		//============Constructor============//
		public BatrTextInput(initialText: string = '', autoSize: string = TextFieldAutoSize.LEFT): void {
			super();
			// text
			this.selectable = true;
			this.text = initialText;
			this.type = TextFieldType.INPUT;
			this.border = true;
			// this.multiline=true;
			this.mouseWheelEnabled = true; // avaliable when limited height
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

		public setFormat(formet: TextFormat, lock: boolean = false): BatrTextInput {
			this.defaultTextFormat = formet;
			this.setTextFormat(formet);
			return this;
		}
	}
}