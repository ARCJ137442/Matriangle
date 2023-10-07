import { uint } from "../../../../../../legacy/AS3Legacy";
import { MatrixController } from "../../../../../api/control/MatrixControl";
import { MatrixProgramLabel } from "../../../../../api/control/MatrixProgram";
import { IEntityActive } from "../../../../../api/entity/EntityInterfaces";
import IMatrix from "../../../../../main/IMatrix";
import BonusBox from "../../item/BonusBox";
import IPlayer from "../IPlayer";
import { PlayerAction } from "./PlayerAction";

/**
 * 「玩家控制器」
 * * 一个专用的用于控制玩家的世界控制器
 * * 封装了一系列有关玩家的钩子
 */
export default abstract class PlayerController extends MatrixController implements IEntityActive {

    // 活跃实体 //
    public readonly i_active: true = true;

    /**
     * 在每个玩家「调用世界刻」时调用
     * * 参见`Player.dealController`
     * 
     * @param host 调用它的母体
     * @param player 调用（分派事件过来的）玩家「自身」
     * * 这个参数存在的意义：用于让「与具体实体解耦的控制器」识别
     */
    public abstract onPlayerTick(player: IPlayer, host: IMatrix): void;

    /**
     * 作为实体处理一个世界刻
     */
    public onTick(host: IMatrix): void {
        /* for (const subscriber of this.subscribers) {
            // 给每个玩家分派
            if (subscriber instanceof Entity && isPlayer(subscriber)) {

            }
        } */
    };

    /**
     * 构造函数
     */
    public constructor(
        /**
         * 母体程序标签
         */
        label: MatrixProgramLabel,
        /**
         * 订阅者列表：订阅者只能是玩家
         */
        public readonly subscribers: IPlayer[] = [],
    ) {
        super(label, subscribers);
    }

    // 重构：只接受玩家订阅者 //
    override addSubscriber(subscriber: IPlayer): void { return super.addSubscriber(subscriber); }
    override removeSubscriber(subscriber: IPlayer): boolean { return super.removeSubscriber(subscriber); }
    override hasSubscriber(subscriber: IPlayer): boolean { return super.hasSubscriber(subscriber); }

    // 响应函数：响应所有钩子 //
    // ? 一个疑点：是否要如此地「专用」以至于「每次增加一个新类型的事件，都要在这里新注册一个钩子函数」？至于「需要传递的、明确类型的参数」，有什么好的解决办法？
    /** 在「每个世界刻」中响应 */
    public abstract reactTick(self: IPlayer, host: IMatrix): PlayerAction;
    /** 在「受到伤害」时响应（应用如：Novice的「条件反射式回避」） */
    public abstract reactHurt(self: IPlayer, host: IMatrix, damage: uint, attacker?: IPlayer): PlayerAction;
    /** 在「死亡」时响应（应用如Adventurer的「死亡时清除路径记忆」） */
    public abstract reactDeath(self: IPlayer, host: IMatrix, damage: uint, attacker?: IPlayer): PlayerAction;
    /** 在「击杀玩家」时响应 */
    public abstract reactKillPlayer(self: IPlayer, host: IMatrix, victim: IPlayer, damage: uint): PlayerAction;
    /** 在「拾起奖励箱」时响应 */
    public abstract reactPickupBonusBox(self: IPlayer, host: IMatrix, box: BonusBox): PlayerAction;
    /** 在「重生」时响应（⚠️这时候应该已经恢复了状态，比如active参数） */
    public abstract reactRespawn(self: IPlayer, host: IMatrix): PlayerAction;
    /** 在「地图变换」时响应（这时候地图应已变换完成） */
    public abstract reactMapTransform(self: IPlayer, host: IMatrix): PlayerAction;

}
