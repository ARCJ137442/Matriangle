

import { uint } from "../../../../../../legacy/AS3Legacy";
import Block from "../../../../../api/block/Block";
import EntityType from "../../../../../api/entity/EntityType";
import Player from "../../player/Player";
import Projectile from "../Projectile";
import { fPoint, iPoint } from "../../../../../../common/geometricTools";
import { IBatrShape } from "../../../../../../display/api/BatrDisplayInterfaces";
import { FIXED_TPS } from "../../../../../main/GlobalGameVariables";
import IBatrGame from "../../../../../main/IBatrGame";
import { IEntityOutGrid } from "../../../../../api/entity/EntityInterfaces";
import { mRot } from "../../../../../general/GlobalRot";
import { NativeEntityTypes } from "../../../registry/EntityRegistry";
import { alignToGridCenter_P, alignToGrid_P } from "../../../../../general/PosTransform";
import { NativeBlockAttributes } from "../../../registry/BlockAttributesRegistry";

export default class ThrownBlock extends Projectile implements IEntityOutGrid {

	override get type(): EntityType { return NativeEntityTypes.THROWN_BLOCK }

	//============Static Variables============//
	public static readonly MAX_SPEED: number = 15 / FIXED_TPS;
	public static readonly MIN_SPEED: number = 1 / 3 * ThrownBlock.MAX_SPEED;

	//============Instance Variables============//

	public readonly i_OutGrid: true = true;

	/**
	 * 存储浮点位置（在方块之间移动）
	 * ! 注意：这里的「浮点位置」是与「方块座标系」对齐的——统一以左上角为坐标
	 * * 纯逻辑的一致性追求：原先AS3版本更多是在显示上「要在中心方便旋转」的妥协
	 */
	protected _position: fPoint = new fPoint();
	public get position(): fPoint { return this._position; }
	public set position(value: fPoint) { this._position.copyFrom(value); }

	/** 这个「掷出的方块」所包含的方块 */
	protected _carriedBlock: Block; // ! 【2023-09-22 22:28:28】你必需有一个方块，哪怕是「空」也好，都不要引入null，谢谢
	public get carriedBlock(): Block { return this._carriedBlock; }

	/**
	 * 这个「掷出的方块」飞行的速度
	 * 
	 * ! 【2023-09-22 20:41:07】原先是矢量，现在只表示大小
	 */
	// protected _speed: fPoint;
	protected _speed: number;

	//============Constructor & Destructor============//
	/**
	 * 构造函数
	 * 
	 * ! 其坐标位置有其特殊性：与方块的坐标计算方法一致——均处于「网格交点」而非「网格中心」
	 * * 例：在生成时，坐标在玩家前方一格处，与「方块坐标」相同（但是浮点数）
	 * 
	 * 📌图例：
	 * ```
	 * + - # - % → x+
	 * | > | $ |
	 * % - % - %
	 * ↓
	 * y+
	 * ```
	 * 其中：
	 * * `>`: 玩家在显示上的「位置」（看起来像在「网格中心」）
	 * * `+`: 玩家在逻辑上的位置（相对「浮点坐标」而言，属于「左上角」）
	 * * `#`: 将以「浮点坐标」生成的「掷出的方块」位置
	 * * `$`: 实体「掷出的方块」在显示上的位置（看起来像在「网格中心」）
	 * 
	 * @param owner 所有者
	 * @param position 初始位置（中心同其它抛射体一样，是在「网格中心」）
	 * @param speed 飞行速率
	 * @param attackerDamage 攻击者伤害
	 * @param block 所包含的方块
	 * @param direction 飞行方向
	 * @param chargePercent 充能大小（用于修订伤害）
	 */
	public constructor(
		owner: Player | null,
		position: fPoint,
		speed: number,
		attackerDamage: uint,
		block: Block,
		direction: mRot,
		chargePercent: number = 1
	) {
		super(
			owner,
			// exMath.getDistance2(GlobalRot.towardIntX(rot, chargePercent), GlobalRot.towardIntY(rot, chargePercent)) * attackerDamage
			uint(2 * chargePercent ** 2) * attackerDamage, // ? ↑不知道上面那个在做什么😂
		);
		// * 复制方块实例 //
		this._carriedBlock = block.clone(); // ! 会复制出一个新实例，而非沿用原先的实例
		// * 位置、速度等物理变量 //
		this._position.copyFrom(position);
		// this.speed.copyFrom(speed); // ! 【2023-09-22 20:23:52】现在不再存储「速度」这个变量，而是在游戏刻中直接使用方向进行即时计算
		this._speed = speed;
		this._direction = direction
		// ? ↑这里的设置仍然有「通用性」的牺牲：这使得「抛出的方块」无法沿任意方向移动
		// this.shapeInit(shape: IBatrShape);
	}

	//============Destructor Function============//
	/* override destructor(): void {
		// this._carriedBlock = null; // ! 【2023-09-22 20:29:31】因为这里的方块是新建的，只有自身持有引用，故无需释放引用以便GC

		super.destructor();
	} */

	//============Instance Getter And Setter============//


	//============Game Mechanics============//
	override onTick(host: IBatrGame): void {
		super.onTick(host);
		// 在地图内&可通过&没碰到玩家：继续飞行
		if (
			// 在地图内
			host.map.logic.isInMap_F(this._position) &&
			// 可通过
			host.map.logic.testCanPass_F(
				this.position, // ! 【2023-09-22 20:34:44】现在直接使用
				false, true, false, false
			) &&
			// 没碰到玩家
			!host.isHitAnyPlayer_F(this._position)
		) {
			host.map.logic.towardWithRot_FF(this._position, this._direction, this._speed);
		}
		else {
			console.log('Block hit at', this._position);
			// * 如果不是伤害到玩家，就后退（被外部阻挡的情形）
			if (!host.isHitAnyPlayer_F(this._position))
				host.map.logic.towardWithRot_FF(this._position, this._direction, -this._speed);
			this.onBlockHit(host);
		}
	}

	protected onBlockHit(host: IBatrGame): void {
		// 将坐标位置对齐到网格
		let _temp_iPoint: iPoint = new iPoint();
		alignToGrid_P(this._position, _temp_iPoint);
		// 尝试伤害玩家 // TODO: 有待迁移
		host.thrownBlockHurtPlayer(this);
		// 放置判断
		if (host.map.logic.isBlockBreakable(_temp_iPoint, NativeBlockAttributes.VOID)) {
			// 放置
			host.setBlock(_temp_iPoint, this._carriedBlock);
			// 特效
			host.addBlockLightEffect2(
				this._position, // ! 非格点实体的「坐标」
				this.carriedBlock, false
			);
		}
		else {
			// ! 会更改自身坐标：复用自身坐标，更改为「将要生成的特效坐标」
			host.addBlockLightEffect2(
				alignToGridCenter_P(this._position, this._position),
				this.carriedBlock, false
			);
		}
		// Remove
		host.entitySystem.remove(this);
	}

	//============Display Implements============//
	/**
	 * 实现：初始化方块的位置
	 * 
	 * ! 【2023-09-22 22:27:00】现在其显示直接复用相应方块的显示
	 * * 坐标系统也一并对齐（采用「左上角布局」）
	 */
	public shapeInit(blockShape: IBatrShape): void {
		// 内部方块的显示
		return this._carriedBlock?.shapeInit(blockShape)
		/* if (this._carriedBlock != null) {
			// ↓ 现在采用了新坐标系统
			// this._carriedBlock.x = -this._carriedBlock.width / 2;
			// this._carriedBlock.y = -this._carriedBlock.height / 2;
			// shape.addChild(blockShape);
		} */
	}

	/**
	 * 💭一般情况下不会再更新了
	 * * 除非「位置」
	 */
	public shapeRefresh(shape: IBatrShape): void { }

	/** 实现：清除图形 */
	public shapeDestruct(shape: IBatrShape): void {
		shape.graphics.clear()
	}
}