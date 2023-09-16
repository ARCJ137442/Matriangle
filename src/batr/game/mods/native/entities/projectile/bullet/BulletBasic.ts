import { fPoint } from "../../../../../../common/geometricTools";
import { FIXED_TPS } from "../../../../../main/GlobalGameVariables";
import IBatrGame from "../../../../../main/IBatrGame";
import Player from "../../player/Player";
import Bullet from "./Bullet";

/**
 * 普通子弹
 */
export default class BulletBasic extends Bullet {

	/** 默认的子弹飞行速度（格/秒） */
	public static readonly DEFAULT_SPEED: number = 16 / FIXED_TPS;
	/** 默认的子弹爆炸半径（格） */
	public static readonly DEFAULT_EXPLODE_RADIUS: number = 1;

	public constructor(
		position: fPoint,
		owner: Player | null,
		speed: number = BulletBasic.DEFAULT_SPEED,
		defaultExplodeRadius: number = BulletBasic.DEFAULT_EXPLODE_RADIUS,
	) {
		super(position, owner, speed, defaultExplodeRadius)
	}

	/** 覆盖：通知「游戏主体」创建爆炸 */
	override explode(host: IBatrGame): void {
		// TODO: 待完善游戏接口再使用——* 创建爆炸（+效果但不仅仅效果）* 移除自身
		// host.toolCreateExplode(this._position, this.finalExplodeRadius, this.damage, this, 0xffff00, 1);
		// 超类逻辑：移除自身
		super.explode(host);
	}

}
