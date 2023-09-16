

import I18ns from "../../display/api/i18n/I18ns";

export default class I18nsChangeEvent extends Event {
	//============Static Variables============//
	public static readonly TYPE: string = 'I18nsChangeEvent';

	//============Instance Variables============//
	protected _nowI18ns: I18ns;
	protected _oldI18ns: I18ns;

	//============Constructor & Destructor============//
	public constructor(nowI18ns: I18ns, oldI18ns: I18ns = null, bubbles: boolean = false, cancelable: boolean = false) {
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
	override clone(): Event {
		return new I18nsChangeEvent(this._nowI18ns, this._oldI18ns, this.bubbles, this.cancelable);
		;
	}

	override toString(): string {
		return formatToString('I18nChangeEvent', 'type', 'gui', 'bubbles', 'cancelable', 'eventPhase');
	}
}