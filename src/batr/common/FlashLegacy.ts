import { int, uint } from "./AS3Legacy";

declare module flash {

    module utils {
        class ByteArray {
            writeObject(object: any): void;
            position: uint;
            readObject(): object;

        }
        function getTimer(): any
    }

    module geom {
        class Point {
            // Properties
            x: number;
            y: number;
            constructor(x?: number, y?: number);
            // Methods
            clone(): flash.geom.Point;
            copyFrom(sourcePoint: flash.geom.Point): void;
            equals(toCompare: flash.geom.Point): boolean;
            offset(dx: number, dy: number): void;
            setTo(xa: number, ya: number): void;
            toString(): string;
        }
    }

    module display {
        class DisplayObject { }
        class DisplayObjectContainer extends DisplayObject {

            addChild(child: flash.display.DisplayObject): void
            addChildAt(child: flash.display.DisplayObject, index: uint): void

            removeChildAt(index: uint): void
            removeChild(child: flash.display.DisplayObject): void

            contains(child: flash.display.DisplayObject): boolean

            get numChildren(): uint
        }
    }
}
export { flash }
