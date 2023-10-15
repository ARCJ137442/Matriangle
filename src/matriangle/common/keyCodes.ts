/* eslint-disable @typescript-eslint/no-duplicate-enum-values */

export type KeyCode = string

//================Key Codes===============//
/**
 * 来自MDN文档的「key」
 * * [参考：MDN文档](https://developer.mozilla.org/zh-CN/docs/Web/API/KeyboardEvent/code)
 */ export enum MDNCodes {
	UNIDENTIFIED = 'Unidentified',

	ALT_LEFT = 'AltLeft',
	ALT_RIGHT = 'AltRight',
	BACKQUOTE = 'Backquote',
	BACKSLASH = 'Backslash',
	BACKSPACE = 'Backspace',
	BRACKET_LEFT = 'BracketLeft',
	BRACKET_RIGHT = 'BracketRight',
	CAPS_LOCK = 'CapsLock',
	COMMA = 'Comma',
	CONTROL_LEFT = 'ControlLeft',
	CONTEXT_MENU = 'ContextMenu',
	DELETE = 'Delete',

	DIGIT_0 = 'Digit0',
	DIGIT_1 = 'Digit1',
	DIGIT_2 = 'Digit2',
	DIGIT_3 = 'Digit3',
	DIGIT_4 = 'Digit4',
	DIGIT_5 = 'Digit5',
	DIGIT_6 = 'Digit6',
	DIGIT_7 = 'Digit7',
	DIGIT_8 = 'Digit8',
	DIGIT_9 = 'Digit9',

	END = 'End',
	ENTER = 'Enter',
	EQUAL = 'Equal',
	ESCAPE = 'Escape',
	F11 = 'F11',
	HOME = 'Home',
	INSERT = 'Insert',

	KEY_A = 'KeyA',
	KEY_B = 'KeyB',
	KEY_C = 'KeyC',
	KEY_D = 'KeyD',
	KEY_E = 'KeyE',
	KEY_F = 'KeyF',
	KEY_G = 'KeyG',
	KEY_H = 'KeyH',
	KEY_I = 'KeyI',
	KEY_J = 'KeyJ',
	KEY_K = 'KeyK',
	KEY_L = 'KeyL',
	KEY_M = 'KeyM',
	KEY_N = 'KeyN',
	KEY_O = 'KeyO',
	KEY_P = 'KeyP',
	KEY_Q = 'KeyQ',
	KEY_R = 'KeyR',
	KEY_S = 'KeyS',
	KEY_T = 'KeyT',
	KEY_U = 'KeyU',
	KEY_V = 'KeyV',
	KEY_W = 'KeyW',
	KEY_X = 'KeyX',
	KEY_Y = 'KeyY',
	KEY_Z = 'KeyZ',

	META_RIGHT = 'MetaRight',
	META_LEFT = 'MetaLeft',
	MINUS = 'Minus',

	NUM_LOCK = 'NumLock',
	NUMPAD_0 = 'Numpad0',
	NUMPAD_1 = 'Numpad1',
	NUMPAD_2 = 'Numpad2',
	NUMPAD_3 = 'Numpad3',
	NUMPAD_4 = 'Numpad4',
	NUMPAD_5 = 'Numpad5',
	NUMPAD_6 = 'Numpad6',
	NUMPAD_7 = 'Numpad7',
	NUMPAD_8 = 'Numpad8',
	NUMPAD_9 = 'Numpad9',
	NUMPAD_ADD = 'NumpadAdd',
	NUMPAD_DECIMAL = 'NumpadDecimal',
	NUMPAD_DIVIDE = 'NumpadDivide',
	NUMPAD_ENTER = 'NumpadEnter',
	NUMPAD_MULTIPLY = 'NumpadMultiply',
	NUMPAD_SUBTRACT = 'NumpadSubtract',

	PAUSE = 'Pause',
	PERIOD = 'Period',
	QUOTE = 'Quote',
	SEMICOLON = 'Semicolon',
	SHIFT_LEFT = 'ShiftLeft',
	SHIFT_RIGHT = 'ShiftRight',
	SLASH = 'Slash',
	SPACE = 'Space',
	TAB = 'Tab',
	ARROW_UP = 'ArrowUp',
	ARROW_DOWN = 'ArrowDown',
	ARROW_LEFT = 'ArrowLeft',
	ARROW_RIGHT = 'ArrowRight',
}

/**
 * 来自MDN文档的「key」
 * * 这里的「按键值」大多与输入的字符直接相关
 *   * 如`Shift+4`直接对应`$`
 * * [参考：MDN文档](https://developer.mozilla.org/zh-CN/docs/Web/API/KeyboardEvent/key)
 *
 */
export enum MDNKeys {
	ALT = 'Alt',
	ARROW_DOWN = 'ArrowDown',
	ARROW_LEFT = 'ArrowLeft',
	ARROW_RIGHT = 'ArrowRight',
	ARROW_UP = 'ArrowUp',
	AUDIO_VOLUME_MUTE = 'AudioVolumeMute',
	BACKSPACE = 'Backspace',
	CAPS_LOCK = 'CapsLock',
	CLEAR = 'Clear',
	CONTEXTMENU = 'ContextMenu',
	CONTROL = 'Control',
	DELETE = 'Delete',
	END = 'End',
	ENTER = 'Enter',
	ESCAPE = 'Escape',
	F1 = 'F1',
	F2 = 'F2',
	F3 = 'F3',
	F4 = 'F4',
	F5 = 'F5',
	F6 = 'F6',
	F7 = 'F7',
	F8 = 'F8',
	F9 = 'F9',
	F10 = 'F10',
	F11 = 'F11',
	F12 = 'F12',
	HOME = 'Home',
	INSERT = 'Insert',
	META = 'Meta',
	NUM_LOCK = 'NumLock',
	PAGE_DOWN = 'PageDown',
	PAGE_UP = 'PageUp',
	PAUSE = 'Pause',
	SHIFT = 'Shift',
	TAB = 'Tab',
}

/** AS3@Flash 版本遗留 */
export enum keyCodes_Flash {
	UNIDENTIFIED = 0,

	BACKSPACE = 8,
	TAB = 9,
	ENTER = 13,
	SHIFT = 16,
	CTRL = 17,
	ALT = 18,
	PAUSE_BREAK = 19,
	CAPS_LOCK = 20,
	ESC = 27,
	SPACE = 32,
	PAGE_UP = 33,
	PAGE_DOWN = 34,
	END = 35,
	HOME = 36,
	LEFT = 37,
	UP = 38,
	RIGHT = 39,
	DOWN = 40,
	PRINT_SCREEN = 44,
	INSERT = 45,
	DELETE = 46,

	NUM_0 = 48,
	NUM_1 = 49,
	NUM_2 = 50,
	NUM_3 = 51,
	NUM_4 = 52,
	NUM_5 = 53,
	NUM_6 = 54,
	NUM_7 = 55,
	NUM_8 = 56,
	NUM_9 = 57,

	A = 65,
	B = 66,
	C = 67,
	D = 68,
	E = 69,
	F = 70,
	G = 71,
	H = 72,
	I = 73,
	J = 74,
	K = 75,
	L = 76,
	M = 77,
	N = 78,
	O = 79,
	P = 80,
	Q = 81,
	R = 82,
	S = 83,
	T = 84,
	U = 85,
	V = 86,
	W = 87,
	X = 88,
	Y = 89,
	Z = 90,

	LEFT_WINDOWS = 91,
	RIGHT_WINDOWS = 92,
	APPLICATION = 93,
	SLEEP = 95,

	NUMPAD_0 = 96,
	NUMPAD_1 = 97,
	NUMPAD_2 = 98,
	NUMPAD_3 = 99,
	NUMPAD_4 = 100,
	NUMPAD_5 = 101,
	NUMPAD_6 = 102,
	NUMPAD_7 = 103,
	NUMPAD_8 = 104,
	NUMPAD_9 = 105,

	NUMPAD_TIMES = 106, // *
	NUMPAD_ADD = 107, // +
	NUMPAD_ENTER = 13,
	NUMPAD_DOT = 109, // .
	NUMPAD_MINUS = 110, // -
	NUMPAD_DIVIDE = 111, // /
	F1 = 112,
	F2 = 113,
	F4 = 115,
	F5 = 116,
	F6 = 117,
	F7 = 118,
	F8 = 119,
	F9 = 120,
	F10 = 121,
	F11 = 122,
	F12 = 123,

	NUM_LOCK = 144,
	SCROLL_LOCK = 145,

	COLON = 186, // ;:
	ADD = 187, //=+
	COMMA = 188, // ,<
	MINUS = 189, // -_
	POINT = 190, // .>
	DIVIDE = 191, // /?
	BACK_QUOTES = 192, // `~
	LEFT_BRACKET = 219, // [{
	BACK_SLASH = 220, // \|
	RIGHT_BRACKET = 221, // ]}
	QUOTES = 222, // ''

	WAKE_UP = 255,
	POWER = 255,
}
