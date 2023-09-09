
// import batr.game.entity.entity.player.*;
// import batr.game.entity.*;
// import batr.game.model.*;
// import batr.game.main.*;

import { uint } from "../../../../legacy/AS3Legacy";
import { IBatrShape } from "../../../../display/BatrDisplayInterfaces";
import Game from "../../../main/Game.1";
import EntityType from "../../../registry/EntityRegistry";
import ToolType from "../../../registry/ToolType";
import EntityCommon from "../../EntityCommon";
import Player from "../player/Player";

export default class ProjectileCommon extends EntityCommon {
	//============Instance Variables============//
	protected _owner: Player;
	protected _currentTool: ToolType;

	public damage: uint;

	//============Constructor & Destructor============//
	public constructor(host: Game, x: number, y: number, owner: Player) {
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

	public shapeInit(shape: IBatrShape): void {
	}
}