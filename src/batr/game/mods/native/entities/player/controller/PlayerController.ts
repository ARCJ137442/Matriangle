import { uint } from "../../../../../../legacy/AS3Legacy";
import { GameController } from "../../../../../api/control/GameControl";
import IBatrGame from "../../../../../main/IBatrGame";
import BonusBox from "../../item/BonusBox";
import IPlayer from "../IPlayer";
import { PlayerAction } from "./PlayerAction";

/**
 * 「玩家控制器」
 * * 一个专用的用于控制玩家的游戏控制器
 * * 封装了一系列有关玩家的钩子
 */
export default abstract class PlayerController extends GameController {

    /**
     * 在每个游戏刻中被调用
     * 
     * @param host 调用它的「游戏主体」
     * @param self 调用（分派事件过来的）玩家「自身」
     * * 这个参数存在的意义：用于让「与具体实体解耦的控制器」识别
     */
    public abstract onGameTick(self: IPlayer, host: IBatrGame): void;

    // 响应函数：响应所有钩子 //
    // ? 一个疑点：是否要如此地「专用」以至于「每次增加一个新类型的事件，都要在这里新注册一个钩子函数」？至于「需要传递的、明确类型的参数」，有什么好的解决办法？
    /** 在「每个游戏刻」中响应 */
    public abstract reactTick(self: IPlayer, host: IBatrGame): PlayerAction;
    /** 在「受到伤害」时响应（应用如：Novice的「条件反射式回避」） */
    public abstract reactHurt(self: IPlayer, damage: uint, attacker?: IPlayer): PlayerAction;
    /** 在「死亡」时响应（应用如Adventurer的「死亡时清除路径记忆」） */
    public abstract reactDeath(self: IPlayer, damage: uint, attacker?: IPlayer): PlayerAction;
    /** 在「击杀玩家」时响应 */
    public abstract reactKillPlayer(self: IPlayer, victim: IPlayer, damage: uint): PlayerAction;
    /** 在「拾起奖励箱」时响应 */
    public abstract reactPickupBonusBox(self: IPlayer, box: BonusBox): PlayerAction;
    /** 在「重生」时响应（⚠这时候应该已经恢复了状态，比如active参数） */
    public abstract reactRespawn(self: IPlayer): PlayerAction;
    /** 在「地图变换」时响应（这时候地图应已变换完成） */
    public abstract reactMapTransform(self: IPlayer): PlayerAction;

}
