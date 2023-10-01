import { uint } from "../../../../../../../legacy/AS3Legacy";
import BonusBox from "../../../item/BonusBox";
import AIPlayer from "../../AIPlayer";
import Player from "../../Player";
import { PlayerAction } from "../PlayerAction";

/**
 * Running as a Agent:Perception->Decision->Behavior
 */
export default interface IAIProgram {
	/** 析构函数 */
	destructor(): void;

	/** 名称 */
	get label(): string;
	/** 名称简称（用于显示） */
	get labelShort(): string;
	/** 参考运行速度 */
	get referenceSpeed(): uint;

	/**
	 * TODO: 【2023-10-01 16:51:55】当下计划：整合入`Player.ts`，以「生成迭代」的形式（响应式）请求
	 */
	// 各个「请求事件响应」
	requestActionOnTick(player: AIPlayer): PlayerAction;
	requestActionOnCauseDamage(player: AIPlayer, damage: uint, victim: Player): PlayerAction;
	requestActionOnHurt(player: AIPlayer, damage: uint, attacker: Player): PlayerAction;
	requestActionOnKill(player: AIPlayer, damage: uint, victim: Player): PlayerAction;
	requestActionOnDeath(player: AIPlayer, damage: uint, attacker: Player): PlayerAction;
	requestActionOnRespawn(player: AIPlayer): PlayerAction;

	requestActionOnMapTransform(player: AIPlayer): PlayerAction;

	requestActionOnPickupBonusBox(player: AIPlayer, box: BonusBox): PlayerAction;
}
