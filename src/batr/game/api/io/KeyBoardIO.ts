import { KeyCode } from "../../../common/keyCodes";
import { uint } from "../../../legacy/AS3Legacy";
import { CommonIO, CommonIO_IR } from "./CommonIO";

/**
 * * 此文件主要用于对外接收键盘事件并由「游戏母体」分派
 * 
 * TODO: 🏗未完待续……
 */
export class KeyBoardIO extends CommonIO {

}

/**
 * * 控制流/中间语言的通用表示类
 * 
 * TODO: 🏗未完待续……
 * 
 * ? 💭为何还要沿用Flash那一套？
 */
export abstract class KeyBoardIO_IR extends CommonIO_IR {

    public constructor(
        public altKey: boolean,
        public code: KeyCode,
        public ctrlKey: boolean,
        public shiftKey: boolean,
        public type: 'press' | 'release',
    ) {
        super();
    }

}