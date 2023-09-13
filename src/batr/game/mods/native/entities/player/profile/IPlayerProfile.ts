import { uint } from "../../../../../../legacy/AS3Legacy";

/**
 * ...
 * @author ARCJ137442
 */
export default interface IPlayerProfile {
	get customName(): String;
	get experience(): uint;
	get level(): uint;
	get teamColor(): uint;
}