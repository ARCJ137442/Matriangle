
// import batr.common.*;
// import batr.general.*;
// import batr.game.entity.*;
// import batr.game.entity.ai.*;
// import batr.game.entity.ai.programs.*;
// import batr.game.entity.entity.*;
// import batr.game.entity.entity.player.*;
// import batr.game.model.*;
// import batr.game.main.*;

// import flash.display.Graphics;

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

	/**
	 * The Function betweens beginFill and endFill.
	 * @param	AILabel	The Label that determine shape.
	 * @param	radius	The scale of decoration.
	 */
	public static drawAIDecoration(graphics: Graphics, AILabel: string, radius: number = SIZE / 10): void {
		switch (AILabel) {
			case AIProgram_Dummy.LABEL:
				graphics.drawCircle(0, 0, radius);
				break;
			case AIProgram_Novice.LABEL:
				graphics.drawRect(-radius, -radius, radius * 2, radius * 2);
				break;
			case AIProgram_Adventurer.LABEL:
				graphics.moveTo(-radius, -radius);
				graphics.lineTo(radius, 0);
				graphics.lineTo(-radius, radius);
				graphics.lineTo(-radius, -radius);
				break;
			case AIProgram_Master.LABEL:
				graphics.moveTo(-radius, 0);
				graphics.lineTo(0, radius);
				graphics.lineTo(radius, 0);
				graphics.lineTo(0, -radius);
				graphics.lineTo(-radius, -0);
				break;
		}
	}

	//============Instance Variables============//
	protected _AIProgram: IAIProgram;

	protected _AIRunDelay: uint;
	protected _AIRunMaxDelay: uint;
	protected _actionThread: AIPlayerAction[] = new AIPlayerAction[];

	//============Constructor & Destructor============//
	public constructor(
		host: IBatrGame,
		x: number, y: number,
		team: PlayerTeam,
		isActive: boolean = true,
		program: IAIProgram = null,
		fillColor: number = NaN,
		lineColor: number = NaN): void {
		this._AIProgram = program == null ? AIPlayer.randomAIProgram() : program;
		this.AIRunSpeed = Math.random() < 0.01 ? 100 : this._AIProgram.referenceSpeed;
		super(host, x, y, team, 0, isActive, fillColor, lineColor);
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
		return GlobalGameVariables.TPS / this._AIRunDelay;
	}

	public set AIRunSpeed(speed: number) {
		if (speed == this.AIRunSpeed)
			return;

		if (isNaN(speed))
			speed = DEFAULT_AI_RUN_SPEED; // NaN means randomly speed
		this._AIRunMaxDelay = isFinite(speed) ? GlobalGameVariables.TPS / speed : 0; // Infinite means max speed
		this.initAITick();
	}

	public get hasAction(): boolean {
		return this._actionThread != null && this._actionThread.length > 0;
	}

	public get AILabel(): string {
		return this._AIProgram == null ? null : this._AIProgram.label;
	}

	public get ActionThread(): AIPlayerAction[] {
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
		let action: AIPlayerAction = this.AIProgram.requestActionOnHurt(this, damage, attacker);
		this.runAction(action);
	}

	override onDeath(damage: uint, attacker: Player = null): void {
		// super
		super.onDeath(damage, attacker);
		// act
		let action: AIPlayerAction = this.AIProgram.requestActionOnDeath(this, damage, attacker);
		this.runAction(action);
	}

	override onKillPlayer(victim: Player, damage: uint): void {
		// super
		super.onKillPlayer(victim, damage);
		// act
		let action: AIPlayerAction = this.AIProgram.requestActionOnKill(this, damage, victim);
		this.runAction(action);
	}

	override onPickupBonusBox(box: BonusBox): void {
		// super
		super.onPickupBonusBox(box);
		// act
		let action: AIPlayerAction = this.AIProgram.requestActionOnPickupBonusBox(this, box);
		this.runAction(action);
	}

	override onRespawn(): void {
		// super
		super.onRespawn();
		// act
		let action: AIPlayerAction = this.AIProgram.requestActionOnRespawn(this);
		this.runAction(action);
	}

	override onMapTransform(): void {
		// super
		super.onMapTransform();
		// act
		let action: AIPlayerAction = this.AIProgram.requestActionOnMapTransform(this);
		this.runAction(action);
	}

	//========AI Control:The main auto-control of AI========//
	protected AIControl(): void {
		// Tick
		let action: AIPlayerAction;

		action = this.AIProgram.requestActionOnTick(this);

		this.runAction(action);

		// Thread
		if (this.hasAction) {
			action = this._actionThread.shift();

			this.runAction(action);
		}
	}

	public runAction(action: AIPlayerAction): void {
		if (this.isRespawning)
			return;
		switch (action) {
			case AIPlayerAction.MOVE_UP:
				this.moveUp();

				break;
			case AIPlayerAction.MOVE_DOWN:
				this.moveDown();

				break;
			case AIPlayerAction.MOVE_LEFT_ABS:
				this.moveLeft();

				break;
			case AIPlayerAction.MOVE_RIGHT_ABS:
				this.moveRight();

				break;
			case AIPlayerAction.MOVE_FORWARD:
				this.moveForward();

				break;
			case AIPlayerAction.MOVE_BACK:
				this.turnBack(), this.moveForward();

				break;
			case AIPlayerAction.MOVE_LEFT_REL:
				this.turnRelativeLeft(), this.moveForward();

				break;
			case AIPlayerAction.MOVE_RIGHT_REL:
				this.turnRelativeRight(), this.moveForward();

				break;
			case AIPlayerAction.TURN_UP:
				this.turnUp();

				break;
			case AIPlayerAction.TURN_DOWN:
				this.turnDown();

				break;
			case AIPlayerAction.TURN_LEFT_ABS:
				this.turnAbsoluteLeft();

				break;
			case AIPlayerAction.TURN_RIGHT_ABS:
				this.turnAbsoluteRight();

				break;
			case AIPlayerAction.TURN_BACK:
				this.turnBack();

				break;
			case AIPlayerAction.TURN_LEFT_REL:
				this.turnRelativeLeft();

				break;
			case AIPlayerAction.TURN_RIGHT_REL:
				this.turnRelativeRight();

				break;
			case AIPlayerAction.USE_TOOL:
				this.useTool();

				break;
			case AIPlayerAction.PRESS_KEY_UP:
				this.pressUp = true;

				break;
			case AIPlayerAction.PRESS_KEY_DOWN:
				this.pressDown = true;

				break;
			case AIPlayerAction.PRESS_KEY_LEFT:
				this.pressLeft = true;

				break;
			case AIPlayerAction.PRESS_KEY_RIGHT:
				this.pressRight = true;

				break;
			case AIPlayerAction.PRESS_KEY_USE:
				this.pressUse = true;

				break;
			case AIPlayerAction.RELEASE_KEY_UP:
				this.pressUp = false;

				break;
			case AIPlayerAction.RELEASE_KEY_DOWN:
				this.pressDown = false;

				break;
			case AIPlayerAction.RELEASE_KEY_LEFT:
				this.pressLeft = false;

				break;
			case AIPlayerAction.RELEASE_KEY_RIGHT:
				this.pressRight = false;

				break;
			case AIPlayerAction.RELEASE_KEY_USE:
				this.pressUse = false;

				break;
			case AIPlayerAction.DISABLE_CHARGE:
				this.onDisableCharge();

				break;
		}
	}

	public runActions(actions: AIPlayerAction[]): void {
		for (let i: uint = 0; i < actions.length; i++) {
			runAction(actions[i]);
		}
	}

	public runActions2(...actions): void {
		let runV: AIPlayerAction[] = new AIPlayerAction[];

		for (let i: uint = 0; i < actions.length; i++) {
			if (actions[i] is AIPlayerAction) {
				runAction(actions[i] as AIPlayerAction);
			}
		}
	}

	public addActionToThread(action: AIPlayerAction): void {
		this._actionThread.push(action);
	}

	public addActionsToThread(actions: AIPlayerAction[]): void {
		this._actionThread = this._actionThread.concat(actions);
	}

	public addActionToThreadAtFirst(action: AIPlayerAction): void {
		this._actionThread.unshift(action);
	}

	public addActionsToThreadAtFirst(actions: AIPlayerAction[]): void {
		this._actionThread = actions.concat(this._actionThread);
	}

	public shiftActionToThread(): AIPlayerAction {
		return this._actionThread.shift();
	}

	public popActionInThread(): AIPlayerAction {
		return this._actionThread.pop();
	}

	public reverseActionThread(): void {
		this._actionThread = this._actionThread.reverse();
	}

	public repeatActionThread(count: uint = 1): void {
		// this._actionThread*=(count+1)
		if (count < 1)
			return;

		else if (count == 1) {
			this._actionThread = this._actionThread.concat(this._actionThread);
		}
		else {
			let tempActions: AIPlayerAction[] = this._actionThread.concat();

			for (let i: uint = 0; i < count; i++) {
				this._actionThread = this._actionThread.concat(tempActions);
			}
		}
	}

	public clearActionThread(): void {
		this._actionThread.splice(0, this._actionThread.length);
	}

	public runAllActionsOfThreadImmediately(): void {
		if (this._actionThread.length < 1)
			return;

		this.runActions(this._actionThread);

		this.clearActionThread();
	}
}