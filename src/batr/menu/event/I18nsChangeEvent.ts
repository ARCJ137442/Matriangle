package batr.menu.event {

	import batr.common.*;
	import batr.general.*;
	import batr.menu.main.*;
	import batr.menu.events.*;
	import batr.menu.object.*;
	import batr.i18n.*;

	import flash.events.Event;

	export default class I18nsChangeEvent extends Event {
		//============Static Variables============//
		public static const TYPE: string = 'I18nsChangeEvent';

		//============Instance Variables============//
		protected _nowI18ns: I18ns;
		protected _oldI18ns: I18ns;

		//============Constructor Function============//
		public I18nsChangeEvent(nowI18ns: I18ns, oldI18ns: I18ns = null, bubbles: boolean = false, cancelable: boolean = false): void {
			super(I18nsChangeEvent.TYPE, bubbles, cancelable);
			this._nowI18ns = nowI18ns;
			this._oldI18ns = oldI18ns;
		}

		//============Instance Getter And Setter============//
		public get nowI18ns(): I18ns {
			return this._nowI18ns;
		}

		public get oldI18ns(): I18ns {
			return this._oldI18ns;
		}

		//============Instance Functions============//
		public override function clone(): Event {
			return new I18nsChangeEvent(this._nowI18ns, this._oldI18ns, this.bubbles, this.cancelable);
			;
		}

		public override function toString(): string {
			return formatToString('I18nChangeEvent', 'type', 'gui', 'bubbles', 'cancelable', 'eventPhase');
		}
	}
}