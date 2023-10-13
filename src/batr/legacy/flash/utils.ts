import { uint } from '../AS3Legacy'

export declare class ByteArray {
	writeObject(object: unknown): void
	position: uint
	readObject(): object
}
export declare function getTimer(): unknown
