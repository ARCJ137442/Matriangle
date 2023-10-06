import { randInt } from "../../../../../../common/exMath";
import { uint } from "../../../../../../legacy/AS3Legacy";
import { TPS } from "../../../../../main/GlobalWorldVariables";
import IBatrMatrix from "../../../../../main/IBatrMatrix";
import IPlayer from "../IPlayer";
import { ADD_ACTION, EnumPlayerAction, PlayerAction } from "./PlayerAction";
import PlayerController from "./PlayerController";

/**
 * 「AI控制器」
 * * 继承自原先的「AI玩家」与「AI程序」，融合其一部分特性并与玩家代码解耦
 *   * 如：现在不再是「AI玩家以固定周期执行动作」而是「AI控制器以固定周期发送缓冲的动作」
 * 
 * !【2023-10-01 23:09:08】现在是一个抽象类，其原先的「Program」被重新描述为「抽象基类-实现方法的子类」
 * * 原先「使用Program」的方法，现将用一个「AIControllerGenerator」以「可替换的生成器函数」等效实现
 *   * 📜理论上来说，一个Controller就是一个「连入Matrix的玩家/NPC」，而这里面的各个「生成器」相当于其「人格部分」，控制其各方面表现的行为（每个行为都可以有一个专门应对的Generator，所谓「行为生成器」）
 * 
 * ! 📌现在「具体的AI程序」（像是先前的Dummy、Novice、Adventurer和Master）交由「世界内部机制」这个函数库所生成
 */
export default abstract class AIController extends PlayerController {

    /** 默认的运行速度（AI刻/秒） */
    public static readonly DEFAULT_AI_RUN_SPEED: number = 2; // !【2023-10-01 23:03:55】暂时调慢了
    /** AI运行的延时（时钟变量） */
    protected _AIRunDelay: uint = 0;
    /** AI运行的最大延时 */
    protected _AIRunMaxDelay: uint = uint(TPS / AIController.DEFAULT_AI_RUN_SPEED); // 默认值：0.5秒

    /**
     * AI的运行速度
     * * 相当于「每秒执行AI刻」的次数
     */
    public get AIRunSpeed(): number {
        return TPS / this._AIRunDelay;
    }

    public set AIRunSpeed(speed: number) {
        if (speed == this.AIRunSpeed)
            return;

        if (isNaN(speed))
            speed = AIController.DEFAULT_AI_RUN_SPEED; // NaN means randomly speed

        this._AIRunMaxDelay = isFinite(speed) ? TPS / speed : 0; // Infinite means max speed
        this.initAITick();
    }

    /**
     * 初始化自身AI刻
     * * 功能：设置AI刻到一个随机值
     * * 📌为何要设置到一个随机值而非`0`：**让AI之间看起来没有「同步行动」的诡异感**
     */
    public initAITick(): void {
        this._AIRunDelay = randInt(this._AIRunMaxDelay);
    }

    /**
     * 重置AI刻
     * * 功能：将AI刻设置到「最大AI刻」
     */
    public resetAITick(): void {
        this._AIRunDelay = this._AIRunMaxDelay;
    }

    /**
     * 处理AI刻
     * * 这个方式与玩家中处理「储备生命值」「武器冷却」的机制类似
     * 
     * !【2023-10-01 23:15:11】但注意：这个所谓「AI刻」只是「AI's 」
     * @returns 是否「可以发动AI操作」
     */
    protected dealAITick(): boolean {
        if (this._AIRunDelay > 0) {
            this._AIRunDelay--;
            return false;
        }
        else {
            this._AIRunDelay = this._AIRunMaxDelay;
            return true;
        }
    }

    protected temp_add_action: PlayerAction[] = [];
    /**
     * 实现：计算AI刻，并分派钩子
     * 
     * ! 注意：并非对应的「钩子函数」——它会计算AI刻并执行
     * 
     * ? 这个「AI刻」存在的意义是什么
     */
    public onPlayerTick(player: IPlayer, host: IBatrMatrix): void {
        // 先处理世界刻
        this.temp_add_action[0] = this.reactTick(player, host);
        // 2: 事件非空⇒向事件订阅者（玩家）分派「添加动作」的事件
        if (this.temp_add_action[0] !== EnumPlayerAction.NULL) this.dispatchEvent(
            ADD_ACTION,
            this.temp_add_action // ! 复用以避免创建大量数组
        )
        // 然后处理AI刻
        if (this.dealAITick()) {
            // 1: 获取AI刻行为
            this.temp_add_action[0] = this.reactAITick(player, host);
            // 2: 事件非空⇒向事件订阅者（玩家）分派「添加动作」的事件
            if (this.temp_add_action[0] !== EnumPlayerAction.NULL) this.dispatchEvent(
                ADD_ACTION,
                this.temp_add_action // ! 复用以避免创建大量数组
            )
        }
    }

    /** 🆕AI控制器独有：在「每个AI刻」中响应（一般用于「更人性化执行」的动作） */
    public abstract reactAITick(self: IPlayer, host: IBatrMatrix): PlayerAction;

}
