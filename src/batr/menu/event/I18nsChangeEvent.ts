package batr.menu.event {

	import batr.common.*;
	import batr.general.*;
	import batr.menu.main.*;
	import batr.menu.events.*;
	import batr.menu.object.*;
	import batr.i18n.*;

	import flash.events.Event;

	public class I18nsChangeEvent extends Event {
		//============Static Variables============//
		public static const TYPE: String = 'I18nsChangeEvent';

		//============Instance Variables============//
		protected var _nowI18ns: I18ns;
		protected var _oldI18ns: I18ns;

		//============Constructor Function============//
		public function I18nsChangeEvent(nowI18ns: I18ns, oldI18ns: I18ns = null, bubbles: Boolean = false, cancelable: Boolean = false): void {
			super(I18nsChangeEvent.TYPE, bubbles, cancelable);
			this._nowI18ns = nowI18ns;
			this._oldI18ns = oldI18ns;
		}

		//============Instance Getter And Setter============//
		public function get nowI18ns(): I18ns {
			return this._nowI18ns;
		}

		public function get oldI18ns(): I18ns {
			return this._oldI18ns;
		}

		//============Instance Functions============//
		public override function clone(): Event {
			return new I18nsChangeEvent(this._nowI18ns, this._oldI18ns, this.bubbles, this.cancelable);
			;
		}

		public override function toString(): String {
			return formatToString('I18nChangeEvent', 'type', 'gui', 'bubbles', 'cancelable', 'eventPhase');
		}
	}
}