package batr.menu.event {

	import batr.menu.object.*;

	import flash.events.Event;

	export default class BatrGUIEvent extends Event {
		//============Static Variables============//
		public static readonly CLICK: string = 'BatrButtonEvent:click';
		public static readonly CLICK_LEFT: string = 'BatrButtonEvent:left_click';
		public static readonly CLICK_RIGHT: string = 'BatrButtonEvent:right_click';

		//============Instance Variables============//
		protected _gui: BatrMenuGUI;

		//============Constructor & Destructor============//
		public constructor(type: string, gui: BatrMenuGUI, bubbles: boolean = false, cancelable: boolean = false) {
			super(type, bubbles, cancelable);
			this._gui = gui;
		}

		//============Instance Getter And Setter============//
		public get gui(): BatrMenuGUI {
			return this._gui;
		}

		//============Instance Functions============//
		override clone(): Event {
			return new BatrGUIEvent(this.type, this._gui, this.bubbles, this.cancelable);
			;
		}

		override toString(): string {
			return formatToString('BatrButtonEvent', 'type', 'gui', 'bubbles', 'cancelable', 'eventPhase');
		}
	}
}
