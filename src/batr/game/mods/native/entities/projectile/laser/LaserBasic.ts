
import { uint } from "../../../../../../legacy/AS3Legacy";
import { DEFAULT_SIZE } from "../../../../../../display/api/GlobalDisplayVariables";
import Player from "../../player/Player";
import { FIXED_TPS } from "../../../../../main/GlobalGameVariables";
import { iPoint } from "../../../../../../common/geometricTools";
import { IBatrShape } from "../../../../../../display/api/BatrDisplayInterfaces";
import { NativeTools } from "../../../registry/ToolRegistry";
import Laser from "./Laser";
import IBatrGame from "../../../../../main/IBatrGame";
import Weapon from "../../../tool/Weapon";
import EntityType from "../../../registry/EntityRegistry";

/**
 * 「基础激光」
 * * - 需要充能
 * * + 充能后瞬间造成伤害
 * * + 完全充能的「基础激光」伤害在所有同类激光中最高
 */
export default class LaserBasic extends Laser {

	//============Static Variables============//
	public static readonly LIFE: number = FIXED_TPS; // ! 默认存活时间：1s
	public static readonly WIDTH: number = DEFAULT_SIZE / 2; // ! 默认宽度：半格
	public static readonly LENGTH: uint = 32; // ! 默认长度：32格

	// 类型注册 //
	override get type(): EntityType { return EntityType.LASER_BASIC; }
	override readonly ownerTool: Weapon = NativeTools.WEAPON_LASER;

	//============Constructor & Destructor============//
	public constructor(
		position: iPoint, owner: Player | null,
		length: number = LaserBasic.LENGTH,
		chargePercent: number = 1
	) {
		super(
			position, owner,
			length, LaserBasic.LIFE,
			NativeTools.WEAPON_LASER.defaultDamage, // !因为「只读实例变量」只能在构造后访问，所以这里只能复用常量
			chargePercent
		);
	}

	//============Instance Functions============//

	/** 覆盖：没有伤害过玩家，就触发「游戏主体」计算伤害 */
	override onTick(host: IBatrGame): void {
		if (!this.hasDamaged)
			host.laserHurtPlayers(this);
		super.onTick(host); // ! 超类逻辑：处理生命周期
	}

	//============Display Implements============//
	/** 覆盖：先绘制，再拉伸 */
	override shapeInit(shape: IBatrShape): void {
		// 先绘制
		for (let i: uint = 0; i < 3; i++) { // 0,1,2
			this.drawOwnerLine(
				shape.graphics,
				-LaserBasic.WIDTH / Math.pow(2, i + 1),
				LaserBasic.WIDTH / Math.pow(2, i + 1), i * 0.1 + 0.5
			);
		}
		// 再拉伸
		super.shapeInit(shape);
	}

	/** 
	 * 覆盖：按照自身「生命周期百分比」压缩短轴长
	 * * 模拟「光束变窄然后消失」的效果
	 * 
	 * ? 无需重绘图形：无需考虑玩家颜色
	 */
	override shapeRefresh(shape: IBatrShape): void {
		super.shapeRefresh(shape);
		shape.scaleY = this.lifePercent;
	}

}
