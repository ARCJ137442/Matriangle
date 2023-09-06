import { uint } from "../AS3Legacy";

export abstract class DisplayObject {
    public abstract hasEventListener(name: string): boolean;
    public abstract removeEventListener(name: string, listener: Function): void;
    public abstract addEventListener(name: string, listener: Function): void;
}

export abstract class InteractiveObject extends DisplayObject { }

export abstract class DisplayObjectContainer extends InteractiveObject {

    abstract addChild(child: DisplayObject): void
    abstract addChildAt(child: DisplayObject, index: uint): void

    abstract removeChildAt(index: uint): void
    abstract removeChild(child: DisplayObject): void

    abstract contains(child: DisplayObject): boolean

    abstract get numChildren(): uint
}

export abstract class Stage extends DisplayObjectContainer {

}