import { iPoint } from "../../../../../common/geometricTools";
import { DEFAULT_SIZE } from "../../../../../display/api/GlobalDisplayVariables";
import { uint } from "../../../../../legacy/AS3Legacy";
import EntityType from "../../../../api/entity/EntityType";
import { TPS } from "../../../../main/GlobalGameVariables";
import IBatrGame from "../../../../main/IBatrGame";
import BonusBox from "../item/BonusBox";
import Player from "./Player";
import { PlayerAction } from "./controller/PlayerAction";
import IAIProgram from "./controller/ai/IAIProgram";
import AIProgram_Adventurer from "./controller/ai/programs/AIProgram_Adventurer";
import AIProgram_Dummy from "./controller/ai/programs/AIProgram_Dummy";
import AIProgram_Master from "./controller/ai/programs/AIProgram_Master";
import AIProgram_Novice from "./controller/ai/programs/AIProgram_Novice";
import PlayerTeam from "./team/PlayerTeam";

// TODO: 此类即将废弃，转变为「使用AI控制器的玩家」（但相关控制代码如「缓冲区机制」会存留）
export default class AIPlayer extends Player {
	//============Static Variables============//
	public static readonly LINE_SIZE: number = DEFAULT_SIZE / 32;
	public static readonly DEFAULT_AI_RUN_SPEED: number = 12;

	//============Static Functions============//
	public static randomAIProgram(): IAIProgram {
		switch (exMath.random(4)) {
			case 1:
				return new AIProgram_Novice();
			case 2:
				return new AIProgram_Adventurer();
			case 3:
				return new AIProgram_Master();
			default:
				return new AIProgram_Dummy();
		}
	}

	//============Instance Variables============//
	protected _AIProgram: IAIProgram;

	protected _AIRunDelay: uint;
	protected _AIRunMaxDelay: uint;
	protected _actionThread: PlayerAction[] = new PlayerAction[];

	//============Constructor & Destructor============//
	public constructor(
		host: IBatrGame,
		position: iPoint,
		team: PlayerTeam,
		isActive: boolean = true,
		program: IAIProgram = null,
		fillColor: number = NaN,
		lineColor: number = NaN): void {
		super(position, team, 0, isActive, fillColor, lineColor);
		this._AIProgram = program == null ? AIPlayer.randomAIProgram() : program;
		this.AIRunSpeed = Math.random() < 0.01 ? 100 : this._AIProgram.referenceSpeed;
	}

	//============Destructor Function============//
	override destructor(): void {
		this._AIRunDelay = this._AIRunMaxDelay = 0;
		this._AIProgram = null;

		super.destructor();
	}

	//============Instance Getter And Setter============//
	override get type(): EntityType {
		return EntityType.AI_PLAYER;
	}

	public get AIProgram(): IAIProgram {
		return this._AIProgram;
	}

	public get AIRunSpeed(): number {
		return TPS / this._AIRunDelay;
	}

	public set AIRunSpeed(speed: number) {
		if (speed == this.AIRunSpeed)
			return;

		if (isNaN(speed))
			speed = DEFAULT_AI_RUN_SPEED; // NaN means randomly speed
		this._AIRunMaxDelay = isFinite(speed) ? TPS / speed : 0; // Infinite means max speed
		this.initAITick();
	}

	public get hasAction(): boolean {
		return this._actionThread != null && this._actionThread.length > 0;
	}

	public get decorationLabel(): string {
		return this._AIProgram == null ? null : this._AIProgram.label;
	}

	public get ActionThread(): PlayerAction[] {
		return this._actionThread;
	}

	//============Instance Functions============//
	public initAITick(): void {
		this._AIRunDelay = exMath.random(this._AIRunMaxDelay);
	}

	public resetAITick(): void {
		this._AIRunDelay = this._AIRunMaxDelay;
	}

	// AI Shape
	override drawShape(Alpha: number = 1): void {
		// Basic Body
		let realRadiusX: number = (SIZE - LINE_SIZE) / 2;
		let realRadiusY: number = (SIZE - LINE_SIZE) / 2;
		graphics.clear();
		graphics.lineStyle(LINE_SIZE, this._lineColor);
		graphics.beginFill(this._fillColor, Alpha);
		graphics.moveTo(-realRadiusX, -realRadiusY);
		graphics.lineTo(realRadiusX, 0);
		graphics.lineTo(-realRadiusX, realRadiusY);
		graphics.lineTo(-realRadiusX, -realRadiusY);
		// Shape By AI
		AIPlayer.drawAIDecoration(shape.graphics, this._AIProgram.label);
		graphics.endFill();
	}

	// AI Tick
	override tickFunction(): void {
		if (!_isActive)
			return;
		super.tickFunction();
		if (this._AIRunDelay > 0)
			this._AIRunDelay--;
		else {
			this._AIRunDelay = this._AIRunMaxDelay;
			AIControl();
		}
	}

	// AI Trigger
	override onHurt(damage: uint, attacker: Player = null): void {
		// super
		super.onHurt(damage, attacker);
		// act
		let action: PlayerAction = this.AIProgram.requestActionOnHurt(this, damage, attacker);
		this.runAction(action);
	}

	override onDeath(damage: uint, attacker: Player = null): void {
		// super
		super.onDeath(damage, attacker);
		// act
		let action: PlayerAction = this.AIProgram.requestActionOnDeath(this, damage, attacker);
		this.runAction(action);
	}

	override onKillPlayer(victim: Player, damage: uint): void {
		// super
		super.onKillPlayer(victim, damage);
		// act
		let action: PlayerAction = this.AIProgram.requestActionOnKill(this, damage, victim);
		this.runAction(action);
	}

	override onPickupBonusBox(box: BonusBox): void {
		// super
		super.onPickupBonusBox(box);
		// act
		let action: PlayerAction = this.AIProgram.requestActionOnPickupBonusBox(this, box);
		this.runAction(action);
	}

	override onRespawn(): void {
		// super
		super.onRespawn();
		// act
		let action: PlayerAction = this.AIProgram.requestActionOnRespawn(this);
		this.runAction(action);
	}

	override onMapTransform(): void {
		// super
		super.onMapTransform();
		// act
		let action: PlayerAction = this.AIProgram.requestActionOnMapTransform(this);
		this.runAction(action);
	}

	//========AI Control:The main auto-control of AI========//
	protected AIControl(): void {
		// Tick
		let action: PlayerAction;

		action = this.AIProgram.requestActionOnTick(this);

		this.runAction(action);

		// Thread
		if (this.hasAction) {
			action = this._actionThread.shift();

			this.runAction(action);
		}
	}

	// !【2023-10-01 18:31:50】`runAction`已有
	// !【2023-10-01 18:35:10】`runActions`暂无必要
	// !【2023-10-01 18:35:10】`runActions2`暂无必要
	// !【2023-10-01 18:35:10】`addActionToThread`暂无必要
	// !【2023-10-01 18:35:10】`addActionsToThread`暂无必要
	// !【2023-10-01 18:35:10】`addActionToThreadAtFirst`暂无必要
	// !【2023-10-01 18:35:10】`addActionsToThreadAtFirst`暂无必要
	// !【2023-10-01 18:35:10】`shiftActionToThread`暂无必要
	// !【2023-10-01 18:35:10】`popActionInThread`暂无必要
	// !【2023-10-01 18:35:10】`reverseActionThread`暂无必要
	// !【2023-10-01 18:35:10】`repeatActionThread`暂无必要
	// !【2023-10-01 18:35:10】`clearActionThread`暂无必要
	// !【2023-10-01 18:41:19】`runAllActionsOfThreadImmediately`已移植
}