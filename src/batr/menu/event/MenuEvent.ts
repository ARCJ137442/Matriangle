package batr.menu.events {

	import batr.common.*;
	import batr.general.*;
	import batr.menu.main.*;
	import batr.menu.events.*;
	import batr.menu.object.*;

	import flash.events.Event;

	export default class MenuEvent extends Event {
		//============Static Variables============//
		public static const TITLE_SHOWEN: string = 'MenuEvent:titleShowen';

		//============Instance Variables============//

		//============Constructor Function============//
		public MenuEvent(type: string, bubbles: boolean = false, cancelable: boolean = false): void {
			super(type, bubbles, cancelable);
		}

		//============Instance Getter And Setter============//

		//============Instance Functions============//
		public override function clone(): Event {
			return new MenuEvent(type, bubbles, cancelable);
		}

		public override function toString(): string {
			return formatToString('MenuEvent', 'type', 'bubbles', 'cancelable', 'eventPhase');
		}
	}
}