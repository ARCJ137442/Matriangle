import { int, uint } from 'matriangle-legacy/AS3Legacy'
import Laser, { IDisplayDataEntityStateLaser } from './Laser'
import { FIXED_TPS } from 'matriangle-api/server/main/GlobalWorldVariables'
import { iPoint } from 'matriangle-common/geometricTools'
import IMatrix from 'matriangle-api/server/main/IMatrix'
import {
	mRot,
	mRot2axis,
	toOpposite_M,
} from 'matriangle-api/server/general/GlobalRot'
import IPlayer from 'matriangle-mod-native/entities/player/IPlayer'
import { typeID } from 'matriangle-api/server/registry/IWorldRegistry'

/** 特有的「显示数据」：增加`isPull`属性 */
export interface IDisplayDataEntityStateLaserPulse
	extends IDisplayDataEntityStateLaser {
	/** 决定是「回拽」还是「前推」 */
	isPull: boolean
}

/**
 * 「脉冲激光」
 * * + 控制玩家位置「拉/推」
 * * + 分为「回拽激光」与「前推激光」
 *   * 其中「前推激光」可以把受伤害实体一路推到不能推为止，并且**每次前推都会造成伤害**
 */
export default class LaserPulse extends Laser<IDisplayDataEntityStateLaserPulse> {
	//============Static Variables============//
	/** ID */
	public static readonly ID: typeID = 'LaserPulse'

	public static readonly LIFE: number = FIXED_TPS * 0.25

	//============Instance Variables============//

	// 类型注册 //	// !【2023-10-01 16:14:36】现在不再因「需要获取实体类型」而引入`NativeEntityTypes`：这个应该在最后才提供「实体类-id」的链接（并且是给母体提供的）

	//============Constructor & Destructor============//
	public constructor(
		owner: IPlayer | null,
		position: iPoint,
		direction: mRot,
		length: uint,
		attackerDamage: uint,
		extraDamageCoefficient: uint,
		/** 决定这个激光是「回拽激光」还是「前推激光」 */
		public isPull: boolean
	) {
		super(
			LaserPulse.ID,
			owner,
			position,
			direction,
			length,
			LaserPulse.LIFE,
			attackerDamage,
			extraDamageCoefficient,
			1 // ! 「充能百分比」仅用于「决定子类型」而不用于决定伤害/生命周期
		)
		/**
		 * 📝必须自己更新显示数据，不能仅通过「覆盖`syncDisplayProxy`方法」
		 * * 构造函数参数中的「实例属性」在super之后才初始化
		 * * （属性）初始化顺序
		 *   * 1. 父类构造函数
		 * 	 * 2. 父类构造函数中的方法
		 *   * 3. 子类构造函数的方法（取决于其中`super`的位置）
		 *   * 4. 子类构造函数的属性
		 *   * 5. 子类构造函数（super后的部分）
		 *
		 * @example 测试样例
		 * class A {
		 *     constructor() {
		 *         console.log('A');
		 *         this.A()
		 *     }
		 *     A(){
		 *         console.log('A.A');
		 *     }
		 * }
		 *
		 * class B extends A {
		 *     constructor(
		 *         public b: string
		 *     ) {
		 *         super();
		 *         console.log('B',this.b);
		 *     }
		 *     override A(){
		 *         super.A();
		 *         console.log('B.A',this.b);
		 *     }
		 * }
		 *
		 * new B('1')
		 *
		 * `输出：
		 * A
		 * A.A
		 * B.A undefined
		 * B 1`
		 */
		// * 附加显示更新
		this._proxy.storeState('isPull', this.isPull)
	}

	/** @override 增加一个状态的更新 */
	syncDisplayProxy(): void {
		// 超类逻辑
		super.syncDisplayProxy()
		// 附加更新 // ! 这时isPull可能还没初始化（在构造时）
		if (this.isPull !== undefined)
			this._proxy.storeState('isPull', this.isPull)
	}

	//============Instance Getter And Setter============//

	//============World Mechanics============//
	override onTick(host: IMatrix): void {
		if (!this.hasDamaged) this.hurtPlayers(host)
		super.onTick(host) // ! 超类逻辑：处理生命周期
	}

	/** @override 非致死伤害⇒直接让玩家在自身（反，若为「回拽激光」）方向「平行前进」⇒往复直到「无法移动玩家」 */
	override hitAPlayer(
		host: IMatrix,
		player: IPlayer,
		canHurt: boolean,
		finalDamage: number
	): void {
		// 暂记轴向
		this._temp_movePlayer_mRotAxis = mRot2axis(this.direction)
		// 若为「前推激光」，一次前进到底
		do {
			// 伤害玩家
			if (canHurt) super.hitAPlayer(host, player, canHurt, finalDamage)
			// 暂记位置
			this._temp_movePlayer_pointerL =
				player.position[this._temp_movePlayer_mRotAxis]
			// 平行前进
			player.moveParallel(
				host,
				this.isPull ? toOpposite_M(this.direction) : this.direction
			)
		} while (
			// 玩家不在重生状态（可能中途致死）
			!player.isRespawning &&
			// 坐标发生了变化
			player.position[this._temp_movePlayer_mRotAxis] !=
				this._temp_movePlayer_pointerL
		)
	}
	protected _temp_movePlayer_mRotAxis?: mRot
	protected _temp_movePlayer_pointerL?: int
}
