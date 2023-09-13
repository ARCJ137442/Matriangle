import { uint } from "../../../legacy/AS3Legacy";
import { CommonIO, CommonIO_IR } from "./CommonIO";

/**
 * * 此文件主要用于对外接收键盘事件并由「游戏主体」分派
 * 
 * TODO: 🏗未完待续……
 */
export class KeyBoardIO extends CommonIO {

}

/**
 * * 控制流/中间语言的通用表示类
 * 
 * TODO: 🏗未完待续……
 */
export abstract class KeyBoardIO_IR extends CommonIO_IR implements KeyboardEvent {

    altKey: boolean;
    charCode: uint;
    code: string;
    ctrlKey: boolean;
    isComposing: boolean;
    key: string;
    keyCode: uint;
    location: uint;
    metaKey: boolean;
    repeat: boolean;
    shiftKey: boolean;
    getModifierState(keyArg: string): boolean {
        throw new Error("Method not implemented.");
    }
    initKeyboardEvent(typeArg: string, bubblesArg?: boolean | undefined, cancelableArg?: boolean | undefined, viewArg?: Window | null | undefined, keyArg?: string | undefined, locationArg?: uint | undefined, ctrlKey?: boolean | undefined, altKey?: boolean | undefined, shiftKey?: boolean | undefined, metaKey?: boolean | undefined): void {
        throw new Error("Method not implemented.");
    }
    DOM_KEY_LOCATION_STANDARD: 0;
    DOM_KEY_LOCATION_LEFT: 1;
    DOM_KEY_LOCATION_RIGHT: 2;
    DOM_KEY_LOCATION_NUMPAD: 3;
    detail: uint;
    view: Window | null;
    which: uint;
    initUIEvent(typeArg: string, bubblesArg?: boolean | undefined, cancelableArg?: boolean | undefined, viewArg?: Window | null | undefined, detailArg?: uint | undefined): void {
        throw new Error("Method not implemented.");
    }
    bubbles: boolean;
    cancelBubble: boolean;
    cancelable: boolean;
    composed: boolean;
    currentTarget: EventTarget | null;
    defaultPrevented: boolean;
    eventPhase: number;
    isTrusted: boolean;
    returnValue: boolean;
    srcElement: EventTarget | null;
    target: EventTarget | null;
    timeStamp: number;
    type: string;
    composedPath(): EventTarget[] {
        throw new Error("Method not implemented.");
    }
    initEvent(type: string, bubbles?: boolean | undefined, cancelable?: boolean | undefined): void {
        throw new Error("Method not implemented.");
    }
    preventDefault(): void {
        throw new Error("Method not implemented.");
    }
    stopImmediatePropagation(): void {
        throw new Error("Method not implemented.");
    }
    stopPropagation(): void {
        throw new Error("Method not implemented.");
    }
    NONE: 0;
    CAPTURING_PHASE: 1;
    AT_TARGET: 2;
    BUBBLING_PHASE: 3;

}