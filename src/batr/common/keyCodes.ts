/* eslint-disable @typescript-eslint/no-duplicate-enum-values */
import { uint } from '../legacy/AS3Legacy'

export type KeyCode = uint

//================Key Codes===============//
export enum keyCodes {
	EMPTY = 0,

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
