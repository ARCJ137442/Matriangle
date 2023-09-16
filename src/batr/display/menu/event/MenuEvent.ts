

export default class MenuEvent extends Event {
	//============Static Variables============//
	public static readonly TITLE_SHOWN: string = 'MenuEvent:titleShown';

	//============Instance Variables============//

	//============Constructor & Destructor============//
	public constructor(type: string, bubbles: boolean = false, cancelable: boolean = false) {
		super(type, bubbles, cancelable);
	}

	//============Instance Getter And Setter============//

	//============Instance Functions============//
	override clone(): Event {
		return new MenuEvent(type, bubbles, cancelable);
	}

	override toString(): string {
		return formatToString('MenuEvent', 'type', 'bubbles', 'cancelable', 'eventPhase');
	}
}