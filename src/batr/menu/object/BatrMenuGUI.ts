package batr.menu.objects {

	import batr.common.*;
	import batr.general.*;
	import batr.menu.main.*;
	import batr.menu.events.*;
	import batr.menu.object.*;
	import batr.menu.events.*;

	import flash.display.*;
	import flash.events.*;

	export default class BatrMenuGUI extends Sprite implements IBatrMenuElement {
		//============Static Variables============//

		//============Instance Variables============//

		//============Constructor Function============//
		public BatrMenuGUI(listener: boolean = true): void {
			super();
			if (listener)
				this.addEventListeners();
		}

		//============Destructor Function============//
		public destructor(): void {
			// RemoveEventListener
			this.removeEventListener(Event.ADDED_TO_STAGE, this.onAddedToStage);
			this.removeEventListener(MouseEvent.ROLL_OVER, this.onMouseRollOver);
			this.removeEventListener(MouseEvent.ROLL_OUT, this.onMouseRollOut);
			this.removeEventListener(MouseEvent.MOUSE_DOWN, this.onMouseHold);
			this.removeEventListener(MouseEvent.MOUSE_UP, this.onMouseRelease);
			this.removeEventListener(MouseEvent.CLICK, this.onClick);
		}

		//============Instance Getter And Setter============//

		//============Instance Functions============//
		protected addEventListeners(): void {
			// AddEventListener
			this.addEventListener(Event.ADDED_TO_STAGE, this.onAddedToStage);
			this.addEventListener(MouseEvent.ROLL_OVER, this.onMouseRollOver);
			this.addEventListener(MouseEvent.ROLL_OUT, this.onMouseRollOut);
			this.addEventListener(MouseEvent.MOUSE_DOWN, this.onMouseHold);
			this.addEventListener(MouseEvent.MOUSE_UP, this.onMouseRelease);
			this.addEventListener(MouseEvent.CLICK, this.onClick);
		}

		public setName(value: string): BatrMenuGUI {
			this.name = value;
			return this;
		}

		protected sP(x: number, y: number): void {
			this.x = x;
			this.y = y;
		}

		protected sBP(x: number, y: number): void {
			this.x = PosTransform.localPosToRealPos(x);
			this.y = PosTransform.localPosToRealPos(y);
		}

		protected onAddedToStage(event: Event): void {
			this.removeEventListener(Event.ADDED_TO_STAGE, this.onAddedToStage);
		}

		protected drawShape(): void {
		}

		protected onClick(event: MouseEvent): void {
			dispatchEvent(new BatrGUIEvent(BatrGUIEvent.CLICK, this));
		}

		protected onMouseRollOver(event: MouseEvent): void {
		}

		protected onMouseRollOut(event: MouseEvent): void {
		}

		protected onMouseHold(event: MouseEvent): void {
		}

		protected onMouseRelease(event: MouseEvent): void {
		}
	}
}