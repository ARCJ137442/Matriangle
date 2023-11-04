/**
 * The Class called Color instanceof use for transform color between RGB,HSV,HEX
 * * all of these number are integer
 * 0<=R<=255,0<=G<=255,0<=B<=255
 * 0<=H<=360,0<=S<=100,0<=V<=100
 * 0x000000<=HEX<=0xffffff
 * */

import { uint } from '../legacy/AS3Legacy'

//========================Variables========================//

/**
 * 0xRrGgBb
 */
const defaultHEX: uint = 0x000000

/**
 * vec[R=0~255,G=0~255,B=0~255]
 */
const defaultRGB: [uint, uint, uint] = HEXtoRGB(defaultHEX)

/**
 * vec[H=0~360,S=0~100,V=0~100]
 */
const defaultHSV: [uint, uint, uint] = RGBtoHSV2(defaultRGB)

//========================Functions========================//
//====RGB >> HEX====//
export function RGBtoHEX(R: uint, G: uint, B: uint): uint {
	if (isNaN(R + G + B)) return defaultHEX
	return (snapRGBtoUint(R) << 16) | (snapRGBtoUint(G) << 8) | snapRGBtoUint(B)
}

export function RGBtoHEX2(RGB: [uint, uint, uint]): uint {
	if (RGB === null || RGB.length != 3) return defaultHEX
	return RGBtoHEX(RGB[0], RGB[1], RGB[2])
}

//====HEX >> RGB====//
export function HEXtoRGB(I: uint): [uint, uint, uint] {
	return [
		snapRGB(I >> 16),
		snapRGB((I & 0x00ff00) >> 8),
		snapRGB(I & 0x0000ff),
	]
}

//====RGB >> HSV====//
export function RGBtoHSV(R: uint, G: uint, B: uint): [uint, uint, uint] {
	// Define Variables
	// Lash Color To 0~100
	const Re: uint = snapRGB(R) / 2.55
	const Gr: uint = snapRGB(G) / 2.55
	const Bl: uint = snapRGB(B) / 2.55
	// Get Report
	const max: uint = Math.max(Re, Gr, Bl)
	const min: uint = Math.min(Re, Gr, Bl)
	const max_m_min: uint = max - min
	let H: uint = 0,
		S: uint = 0,
		V: uint = 0
	// Set Hue
	if (max_m_min == 0) H = NaN
	// Set Saturation
	if (isNaN(H)) S = 0
	else if (max == Re && Gr >= Bl) H = (60 * (Gr - Bl)) / max_m_min + 0
	else if (max == Re && Gr < Bl) H = (60 * (Gr - Bl)) / max_m_min + 360
	else if (max == Gr) H = (60 * (Bl - Re)) / max_m_min + 120
	else if (max == Bl) H = (60 * (Re - Gr)) / max_m_min + 240
	S = (max_m_min / max) * 100
	// Reset Hue
	if (S == 0) H = NaN
	// Set Brightness
	V = max
	// Set Return
	return [snapH(H), snapS(S), snapV(V)]
}

export function RGBtoHSV2(RGB: [uint, uint, uint]): [uint, uint, uint] {
	if (RGB === null || RGB.length != 3) return defaultHSV
	return RGBtoHSV(...RGB /* R,G,B */)
}

//====HSV >> RGB====//
export function HSVtoRGB(H: uint, S: uint, V: uint): [uint, uint, uint] {
	// Define Variables
	let r: uint, g: uint, b: uint
	// Get Report
	const hu: uint = snapH(H)
	const sa: uint = snapS(S)
	const va: uint = snapV(V)
	if (isNaN(hu)) r = g = b = va / 100
	else {
		const i: uint = Math.floor(hu / 60)
		const f: uint = hu / 60 - i
		const h: uint = va / 100
		const p: uint = h * (1 - sa / 100)
		const q: uint = h * (1 - (f * sa) / 100)
		const t: uint = h * (1 - ((1 - f) * sa) / 100)
		switch (i) {
			case 0:
				r = h
				g = t
				b = p
				break
			case 1:
				r = q
				g = h
				b = p
				break
			case 2:
				r = p
				g = h
				b = t
				break
			case 3:
				r = p
				g = q
				b = h
				break
			case 4:
				r = t
				g = p
				b = h
				break
			case 5:
				r = h
				g = p
				b = q
				break
			default:
				throw '没有足够的颜色匹配！'
		}
	}
	r *= 255
	g *= 255
	b *= 255
	// Set Return
	return [snapRGB(r), snapRGB(g), snapRGB(b)]
}

export function HSVtoRGB2(HSV: [uint, uint, uint]): [uint, uint, uint] {
	if (HSV === null || HSV.length != 3) return defaultRGB
	return HSVtoRGB(...HSV /* H,S,V */)
}

//====HEX >> HSV====//
export function HEXtoHSV(I: uint): [uint, uint, uint] {
	return RGBtoHSV2(HEXtoRGB(I))
}

//====HSV >> HEX====//
export function HSVtoHEX(H: uint, S: uint, V: uint): uint {
	return RGBtoHEX2(HSVtoRGB(H, S, V))
}

export function HSVtoHEX2(HSV: [uint, uint, uint]): uint {
	return RGBtoHEX2(HSVtoRGB2(HSV))
}

//====Color Transform====//
export function turnBrightnessTo(I: uint, brightness: number): uint {
	return (
		((((I & 0xff0000) >> 16) * brightness) << 16) |
		((((I & 0x00ff00) >> 8) * brightness) << 8) |
		((I & 0x0000ff) * brightness)
	)
}

export function halfBrightnessTo(I: uint): uint {
	/* return (
		uint(((I & 0xff0000) >> 16) >> 1) << 16 |
		uint(((I & 0x00ff00) >> 8) >> 1) << 8 |
		uint(((I & 0x0000ff)) >> 1)
	); */
	/* return (
		uint(((I & 0xff0000)) >> 17) << 16 |
		uint(((I & 0x00ff00)) >> 9) << 8 |
		uint(((I & 0x0000ff)) >> 1)
	); */
	return (
		uint((I & 0b111111100000000000000000) >> 1) |
		uint((I & 0b000000001111111000000000) >> 1) |
		uint((I & 0b000000000000000011111110) >> 1)
	)
}

export function hueShift4Hex(I: uint, degree360: uint): uint {
	const HSB: [uint, uint, uint] = HEXtoHSV(I)
	return HSVtoHEX((HSB[0] + degree360) % 360, HSB[1], HSB[2])
}

//====Some Internal Other Function====//
//======RGB======//
function snapRGB(value: uint): uint {
	if (isNaN(value)) return 0
	return Math.min(Math.max(0, value), 255)
}

function snapRGBtoUint(value: uint): uint {
	if (isNaN(value)) return 0
	return Math.min(Math.max(0, Math.round(value)), 255)
}

//======HSV======//
function snapH(value: uint): uint {
	if (isNaN(value)) return NaN
	return Math.min(Math.max(0, value % 360), 360)
}

function snapS(value: uint): uint {
	if (isNaN(value)) return 0
	return Math.min(Math.max(0, value), 100)
}

function snapV(value: uint): uint {
	return snapS(value)
}
