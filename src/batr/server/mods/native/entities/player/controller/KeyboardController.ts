import KeyListener from "../../../../../../common/KeyListener";
import { uint, int } from "../../../../../../legacy/AS3Legacy";
import { MatrixController } from "../../../../../api/control/MatrixControl";
import { FIXED_TPS } from "../../../../../main/GlobalWorldVariables";
import { DEFAULT_PLAYER_CONTROL_KEYS, NativeControlKeyConfig } from "../../../../batr/mechanics/NativeMatrixMechanics";
import IPlayer from "../IPlayer";

/**
 * 一个接受键盘信号，解析并以此控制玩家的控制器
 * 
 * !【2023-10-06 21:56:17】现在因为能直接使用HTTP/WebSocket发送操作，这个程序接近废弃
 */
export default class KeyboardController extends MatrixController {

    protected _listener: KeyListener;
    /** 控制器所控制的玩家 */
    protected _owner: IPlayer;
    /** 控制器的按键配置 */
    protected _keyConfig: NativeControlKeyConfig = DEFAULT_PLAYER_CONTROL_KEYS[0] // 0=占位符

    //====Control Variables====//
    // ControlDelay //
    public controlDelay_Move: uint = FIXED_TPS * 0.5;

    // public controlDelay_Use:uint=TPS/4
    // public controlDelay_Select:uint=TPS/5

    // KeyDelay 控制在「初次按键」到「第二次移动」的间隔
    public keyDelay_Move: int = 0;
    // public keyDelay_Use:int;
    // public keyDelay_Select:int;

    // ControlLoop // 控制「第二次移动」后「每次移动」的间隔
    public controlLoop_Move: uint = FIXED_TPS * 0.05;

    // public controlLoop_Use:uint=TPS/25
    // public controlLoop_Select:uint=TPS/40

    // ControlKey //
    public controlKey_Up: uint = 0;
    public controlKey_Down: uint = 0;
    public controlKey_Left: uint = 0;
    public controlKey_Right: uint = 0;
    public controlKey_Use: uint = 0;
    // public ControlKey_Select_Left:uint;
    // public ControlKey_Select_Right:uint;

    // isPress //
    public isPress_Up: boolean = false;
    public isPress_Down: boolean = false;
    public isPress_Left: boolean = false;
    public isPress_Right: boolean = false;
    public isPress_Use: boolean = false;
    // public isPress_Select_Left:Boolean;
    // public isPress_Select_Right:Boolean;

    //============Constructor & Destructor============//
    public constructor(
        label: string,
        owner: IPlayer,
        listener: KeyListener,
    ) {
        super(label);
        this._owner = owner;
        this._listener = listener;
    }

    /** 析构函数 */
    public destructor(): void { }

    // ! 这部分代码从`Player.ts`移植过来 ! //

    // Key&Control
    public get someKeyDown(): boolean {
        return (this.isPress_Up ||
            this.isPress_Down ||
            this.isPress_Left ||
            this.isPress_Right ||
            this.isPress_Use /*||
					this.isPress_Select_Left||
					this.isPress_Select_Right*/);
    }

    public get someMoveKeyDown(): boolean {
        return (this.isPress_Up ||
            this.isPress_Down ||
            this.isPress_Left ||
            this.isPress_Right);
    }
    /*
    public get someSelectKeyDown():Boolean {
        return (this.isPress_Select_Left||this.isPress_Select_Right)
    }*/

    public set isUsing(turn: boolean) { this.isPress_Use = turn; }
    public set pressLeft(turn: boolean) { this.isPress_Left = turn; }
    public set pressRight(turn: boolean) { this.isPress_Right = turn; }
    public set pressUp(turn: boolean) { this.isPress_Up = turn; }
    public set pressDown(turn: boolean) { this.isPress_Down = turn; }
    public set pressUse(turn: boolean) { this.isPress_Use = turn; }
    // public set pressLeftSelect(turn: Boolean) { this.isPress_Select_Left = turn }
    // public set pressRightSelect(turn: Boolean) { this.isPress_Select_Right = turn }

    public turnAllKeyUp(): void {
        this.isPress_Up = false;
        this.isPress_Down = false;
        this.isPress_Left = false;
        this.isPress_Right = false;
        this.isPress_Use = false;
        // this.isPress_Select_Left=false;
        // this.isPress_Select_Right=false;
        this.keyDelay_Move = 0;
        this.controlDelay_Move = FIXED_TPS * 0.5;
        // this.controlDelay_Select=TPS/5;
        this.controlLoop_Move = FIXED_TPS * 0.05;
        // this.controlLoop_Select=TPS/40;
    }

    public updateKeyDelay(): void {
        // console.log(this.keyDelay_Move,this.controlDelay_Move,this.controlLoop_Move);
        //==Set==//
        // Move
        if (this.someMoveKeyDown) {
            this.keyDelay_Move++;
            if (this.keyDelay_Move >= this.controlLoop_Move) {
                this.keyDelay_Move = 0;
            }
        }
        else {
            this.keyDelay_Move = -this.controlDelay_Move;
        }
    }

    public dealKeyControl(): void {
        if (!this._owner.isActive || this._owner.isRespawning)
            return;
        if (this.someKeyDown) {
            // Move
            if (this.keyDelay_Move == 0) {
                // Up
                if (this.isPress_Up) {
                    // this._owner.moveToward(2); // y+
                    // TODO: 应该是「向缓冲区添加操作」（但似乎有延迟问题）
                }
                // Down
                else if (this.isPress_Down) {
                    // this._owner.moveToward(3); // y-
                    // TODO: 应该是「向缓冲区添加操作」（但似乎有延迟问题）
                }
                // Left
                else if (this.isPress_Left) {
                    // this._owner.moveToward(1); // x-
                    // TODO: 应该是「向缓冲区添加操作」（但似乎有延迟问题）
                }
                // Right
                else if (this.isPress_Right) {
                    // this._owner.moveToward(0); // x+
                    // TODO: 应该是「向缓冲区添加操作」（但似乎有延迟问题）
                }
            } /*
				//Select_Left
				if(this.keyDelay_Select==0) {
					//Select_Right
					if(this.isPress_Select_Right) {
						this.SelectRight();
					}
					else if(this.isPress_Select_Left) {
						this.SelectLeft();
					}
				}*/
        }
    }
}
