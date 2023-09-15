import { IBatrShape } from "../../../../../display/api/BatrDisplayInterfaces";
import { uint } from "../../../../../legacy/AS3Legacy";
import Entity from "../../../../api/entity/Entity";
import { IEntityActive, IEntityDisplayable, IEntityShortLived, IEntityWithDirection } from "../../../../api/entity/EntityInterfaces";
import { mRot } from "../../../../general/GlobalRot";
import IBatrGame from "../../../../main/IBatrGame";
import Tool from "../../tool/Tool";
import EntityType from "../../registry/EntityRegistry";
import Player from "../player/Player";

/**
 * 「抛射体」是
 * * 生命周期短的
 * * 活跃的
 * * 有方向的
 * * 可显示的
 * * 与某个「所有者」（可空）以及「抛射武器」（可为默认值）绑定的
 * 实体
 */
export default abstract class Projectile extends Entity implements IEntityActive, IEntityWithDirection, IEntityDisplayable, IEntityShortLived {

	//============Basic Properties============//
	/** 实体的「实体类型」标签 */
	public abstract get type(): EntityType
	/**
	 * 记录「抛射它的玩家」
	 * * 可为空，表示「无主玩家」 // ? 这个或许有待商量：其实游戏可以创建一个「伪玩家」（或者「大自然」「母体」等「虚拟玩家」）来实现这种事情
	 */
	protected _owner: Player | null;

	/** 公开的「所有者」属性 */
	public get owner(): Player | null { return this._owner; }
	public set owner(value: Player | null) {
		this._owner = value;
		// this.drawShape(); // TODO: 回调「重绘函数」
	}

	/**
	 * 记录「抛射时使用的工具」
	 * * 现在使用readonly+抽象方法，锁定其为只读对象（一个类的实例只能由一个对应的Weapon引用）
	 * 
	 * ! 【20230915 15:29:03】目前不会留空：始终为「调用它的武器」
	 */
	public readonly abstract ownerTool: Tool;

	//============Constructor & Destructor============//
	public constructor(owner: Player | null) {
		super();
		this._owner = owner;
	}

	override destructor(): void {
		this._owner = null;
		// this._ownerTool = null;
		super.destructor();
	}

	//============Interface Methods============//
	// 活跃 //
	readonly i_active: true = true;

	/**
	 * 游戏刻更新函数
	 *  * 可被子类多次&任意顺序的`super.onTick`调用
	 * 
	 * @param host 调用它的「游戏主体」
	 */
	public onTick(host: IBatrGame): void { }

	// 朝向 //
	readonly i_hasDirection: true = true;
	/** 基本朝向实现 */
	protected _direction: mRot = 0;
	/**
	 * 对外暴露的方向属性
	 * 
	 * ? 可能会在「被修改」时调用显示更新（因为这再也不是Flash内置的了）
	 */
	get direction(): mRot { return this._direction; }
	set direction(value: mRot) { this._direction = value; }

	// 显示 //
	readonly i_displayable: true = true;
	/** （二维）显示覆盖优先级 */
	protected _zIndex: uint = 0;
	/**
	 * （公开的）显示覆盖优先级
	 * 
	 * ? 或许在设置的时候，也需要更新：不再由Flash管理
	 */
	public get zIndex(): uint { return this._zIndex; }
	public set zIndex(value: uint) { this._zIndex = value; }

	public abstract shapeInit(shape: IBatrShape): void
	public abstract shapeRefresh(shape: IBatrShape): void
	public abstract shapeDestruct(shape: IBatrShape): void

	public get ownerColor(): uint {
		return this._owner == null ? 0 : this._owner.fillColor;
	}

	public get ownerLineColor(): uint {
		return this._owner == null ? 0 : this._owner.lineColor;
	}

	// 短周期 //
	readonly i_shortLived: true = true;

}