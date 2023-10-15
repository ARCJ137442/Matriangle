import { uint } from '../AS3Legacy'

export abstract class Event extends Object {
	public abstract get bubbles(): boolean
	public abstract get cancelable(): boolean
	public abstract get currentTarget(): EventDispatcher
	public abstract get eventPhase(): uint
	public abstract get target(): EventDispatcher
	public abstract get type(): string

	// public constructor(type: string, bubbles?: boolean, cancelable?: boolean);
	public abstract clone(): Event
	public abstract formatToString(
		className: string,
		...args: unknown[]
	): string
	public abstract isDefaultPrevented(): boolean
	public abstract preventDefault(): void
	public abstract stopImmediatePropagation(): void
	public abstract stopPropagation(): void
	public abstract toString(): string

	public static ACTIVATE: string = 'activate'
	public static ADDED: string = 'added'
	public static ADDED_TO_STAGE: string = 'addedToStage'
	public static BROWSER_ZOOM_CHANGE: string = 'browserZoomChange'
	public static CANCEL: string = 'cancel'
	public static CHANGE: string = 'change'
	public static CHANNEL_MESSAGE: string = 'channelMessage'
	public static CHANNEL_STATE: string = 'channelState'
	public static CLEAR: string = 'clear'
	public static CLOSE: string = 'close'
	public static CLOSING: string = 'closing'
	public static COMPLETE: string = 'complete'
	public static CONNECT: string = 'connect'
	public static CONTEXT3D_CREATE: string = 'context3DCreate'
	public static COPY: string = 'copy'
	public static CUT: string = 'cut'
	public static DEACTIVATE: string = 'deactivate'
	public static DISPLAYING: string = 'displaying'
	public static ENTER_FRAME: string = 'enterFrame'
	public static EXIT_FRAME: string = 'exitFrame'
	public static EXITING: string = 'exiting'
	public static FRAME_CONSTRUCTED: string = 'frameConstructed'
	public static FRAME_LABEL: string = 'frameLabel'
	public static FULL_SCREEN: string = 'fullScreen'
	public static HTML_BOUNDS_CHANGE: string = 'htmlBoundsChange'
	public static HTML_DOM_INITIALIZE: string = 'htmlDOMInitialize'
	public static HTML_RENDER: string = 'htmlDisplay'
	public static ID3: string = 'id3'
	public static INIT: string = 'init'
	public static LOCATION_CHANGE: string = 'locationChange'
	public static MOUSE_LEAVE: string = 'mouseLeave'
	public static NETWORK_CHANGE: string = 'networkChange'
	public static OPEN: string = 'open'
	public static PASTE: string = 'paste'
	public static PREPARING: string = 'preparing'
	public static REMOVED: string = 'removed'
	public static REMOVED_FROM_STAGE: string = 'removedFromStage'
	public static RENDER: string = 'display'
	public static RESIZE: string = 'resize'
	public static SCROLL: string = 'scroll'
	public static SELECT: string = 'select'
	public static SELECT_ALL: string = 'selectAll'
	public static SOUND_COMPLETE: string = 'soundComplete'
	public static STANDARD_ERROR_CLOSE: string = 'standardErrorClose'
	public static STANDARD_INPUT_CLOSE: string = 'standardInputClose'
	public static STANDARD_OUTPUT_CLOSE: string = 'standardOutputClose'
	public static SUSPEND: string = 'suspend' // @AdobeAir
	public static TAB_CHILDREN_CHANGE: string = 'tabChildrenChange'
	public static TAB_ENABLED_CHANGE: string = 'tabEnabledChange'
	public static TAB_INDEX_CHANGE: string = 'tabIndexChange'
	public static TEXT_INTERACTION_MODE_CHANGE: string =
		'textInteractionModeChange'
	public static TEXTURE_READY: string = 'textureReady'
	public static UNLOAD: string = 'unload'
	public static USER_IDLE: string = 'userIdle'
	public static USER_PRESENT: string = 'userPresent'
	public static VIDEO_FRAME: string = 'videoFra'
	public static WORKER_STATE: string = 'workerState'
}

export abstract class KeyboardEvent extends Event {
	static readonly KEY_DOWN: string = 'keyDown'
	static readonly KEY_UP: string = 'keyUp'

	abstract altKey: boolean
	abstract commandKey: boolean
	abstract controlKey: boolean
	abstract ctrlKey: boolean
	abstract shiftKey: boolean

	abstract charCode: uint
	abstract keyCode: uint
	abstract keyLocation: uint

	// public constructor(
	//	 type: string,
	//	 bubbles?: boolean, cancelable?: boolean,
	//	 charCodeValue?: uint, keyCodeValue?: uint, keyLocationValue?: uint,
	//	 ctrlKeyValue?: boolean, altKeyValue?: boolean, shiftKeyValue?: boolean, controlKeyValue?: boolean, commandKeyValue?: boolean
	// )

	public abstract override clone(): Event
	public abstract override toString(): string
	public abstract updateAfterEvent(): void
}

export interface IEventDispatcher {
	addEventListener(
		type: string,
		listener: Function,
		useCapture?: boolean,
		priority?: number,
		useWeakReference?: boolean
	): void
	dispatchEvent(event: Event): boolean
	hasEventListener(type: string): boolean
	removeEventListener(
		type: string,
		listener: Function,
		useCapture?: boolean
	): void
	willTrigger(type: string): boolean
}

export abstract class EventDispatcher implements IEventDispatcher {
	// not extends Object
	abstract addEventListener(
		type: string,
		listener: Function,
		useCapture?: boolean,
		priority?: number,
		useWeakReference?: boolean
	): void
	abstract dispatchEvent(event: Event): boolean
	abstract hasEventListener(type: string): boolean
	abstract removeEventListener(
		type: string,
		listener: Function,
		useCapture?: boolean
	): void
	abstract willTrigger(type: string): boolean
}
