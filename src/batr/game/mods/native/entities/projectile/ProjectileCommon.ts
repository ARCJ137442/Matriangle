import { IBatrShape } from "../../../../../display/api/BatrDisplayInterfaces";
import { uint } from "../../../../../legacy/AS3Legacy";
import Entity from "../../../../api/entity/Entity";
import { IEntityActive, IEntityDisplayable, IEntityWithDirection } from "../../../../api/entity/EntityInterfaces";
import IBatrGame from "../../../../main/IBatrGame";
import ToolType from "../../ToolType";
import EntityType from "../../registry/EntityRegistry";
import Player from "../player/Player";

/**
 * 「抛射体」是
 * ①生命周期短的
 * ②会使用并触发游戏逻辑的
 * ③时刻要刷新的
 * // ④对坐标要求精确到浮点数的
 * 高活跃实体
 */
export default class ProjectileCommon extends Entity implements IEntityActive, IEntityWithDirection, IEntityDisplayable {
	//============Instance Variables============//
	protected _owner: Player;
	protected _currentTool: ToolType;

	public damage: uint;

	//============Constructor & Destructor============//
	public constructor(host: IBatrGame, x: number, y: number, owner: Player) {
		super(host, x, y);
		this._owner = owner;
		this._currentTool = ToolType.ABSTRACT;
	}

	//============Instance Getter And Setter============//
	override get type(): EntityType {
		return EntityType.ABSTRACT;
	}

	public get owner(): Player {
		return this._owner;
	}

	public set owner(value: Player) {
		this._owner = value;
		this.drawShape();
	}

	public get currentTool(): ToolType {
		return this._currentTool;
	}

	public get ownerColor(): uint {
		return this._owner == null ? 0 : this._owner.fillColor;
	}

	public get ownerLineColor(): uint {
		return this._owner == null ? 0 : this._owner.lineColor;
	}

	//============Instance Functions============//
	override destructor(): void {
		this._owner = null;
		this._currentTool = null;
		super.destructor();
	}

	override tickFunction(): void {
		this.onProjectileTick();
		super.tickFunction();
	}

	public onProjectileTick(): void {
	}

	public shapeInit(shape: IBatrShape): void { }

	public shapeRefresh(shape: IBatrShape): void { }

	public shapeDestruct(shape: IBatrShape): void { }
}