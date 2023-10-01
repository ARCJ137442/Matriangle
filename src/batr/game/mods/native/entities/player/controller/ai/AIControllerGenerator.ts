import IBatrGame from "../../../../../../main/IBatrGame";
import BonusBox from "../../../item/BonusBox";
import IPlayer from "../../IPlayer";
import AIController from "../AIController";
import { PlayerAction, PlayerEvent } from "../PlayerAction";

/**
 * 「AI行为生成器」
 * * 输入「事件类型」（通过「内部状态」传参）
 *   * 会通过其中self变量的`currentPlayer:IPlayer`进行「当前自我接入」
 * * 输出「玩家行为」
 */
export type AIActionGenerator = Generator<PlayerAction, undefined, PlayerEvent>;

/** 「AI行为生成器」的生成函数 */
export type AIActionGeneratorF = (self: AIControllerGenerator) => AIActionGenerator;

/**
 * 基于「行为生成器」的AI控制器
 * * 每个钩子都对应一个生成器
 * * 每个生成器都对应一个生成函数
 */
export default class AIControllerGenerator extends AIController {

    /**
     * 大一统的「行为生成器」
     * * 在每次事件发生后yield一个行为
     * * 每一次next都会传入一个「事件类型」参数
     * * 📌所有「事件类型」以外的参数，都（将自身视作一个状态机）以「控制器实例属性」的方式提供
     *   * 变通一点：既然实体的`host`能从「实例属性」退化到「函数参数」，那反其道而行之，
     *   * 所谓「函数传参」也可以变成「设置局部变量，然后在后续的调用中保证『这就是你要的参数』」来避免「含参事件的参数传递」问题
     *   * 例如：在触发生成器next前，设置一个「lastHurtBy:IPlayer」，然后保证在调用next前不更改它⇒于是next函数中看到的「局部变量」就是其自身了
     *   * 
     */
    protected _actionGenerator: AIActionGenerator;

    /**
     * 构造函数
     * @param label 标志
     * @param actionGeneratorF 初始化所用的「生成函数」
     */
    public constructor(
        label: string,
        actionGeneratorF: AIActionGeneratorF,
    ) {
        super(label)
        this._actionGenerator = actionGeneratorF(this);
    }

    // 一些AI用的公开实例变量（在使用前是undefined，但这绝对不会在调用后发生）
    /** 存储「当前事件处理时的『自我』玩家」 */
    public _temp_currentPlayer?: IPlayer;
    /** 存储「当前事件处理时的『当前所在游戏主体』」 */
    public _temp_currentHost?: IBatrGame;

    protected _lastYieldedAction: PlayerAction | undefined = undefined;
    /**
     * 用指定的「事件类型」请求「生成函数」给出应答
     * * 其它「要传入的参数」已经内置到「控制器实例属性」中了，只需要读取即可
     *   * 但这要尽可能避免读取「未涉及的、作为参数的实例属性」
     */
    protected requestAction(event: PlayerEvent): PlayerAction {
        this._lastYieldedAction = this._actionGenerator.next(
            event
        ).value;
        if (this._lastYieldedAction === undefined) throw new Error("生成器未正常执行");
        return this._lastYieldedAction;
    }

    // 钩子函数
    public reactAITick(self: IPlayer, host: IBatrGame): PlayerAction {
        this._temp_currentPlayer = self;
        this._temp_currentHost = host;
        return this.requestAction(PlayerEvent.AI_TICK);
    }
    public reactTick(self: IPlayer, host: IBatrGame): PlayerAction {
        this._temp_currentPlayer = self;
        this._temp_currentHost = host;
        return this.requestAction(PlayerEvent.TICK);
    } // TODO: 【2023-10-02 00:49:53】链接到「生成函数」中去
    public reactHurt(self: IPlayer, damage: number, attacker?: IPlayer | undefined): PlayerAction {
        throw new Error("Method not implemented.");
    }
    public reactDeath(self: IPlayer, damage: number, attacker?: IPlayer | undefined): PlayerAction {
        throw new Error("Method not implemented.");
    }
    public reactKillPlayer(self: IPlayer, victim: IPlayer, damage: number): PlayerAction {
        throw new Error("Method not implemented.");
    }
    public reactPickupBonusBox(self: IPlayer, box: BonusBox): PlayerAction {
        throw new Error("Method not implemented.");
    }
    public reactRespawn(self: IPlayer): PlayerAction {
        throw new Error("Method not implemented.");
    }
    public reactMapTransform(self: IPlayer): PlayerAction {
        throw new Error("Method not implemented.");
    }

}