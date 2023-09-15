
// import batr.common.*;
// import batr.general.*;

import { iPoint } from "../../../../../../common/geometricTools";
import { int, uint } from "../../../../../../legacy/AS3Legacy";
import Game from "../../../../../main/Game";
import Entity from "../../../../../api/entity/Entity";
import BonusBox from "../../item/BonusBox";
import AIPlayer from "../../player/AIPlayer";
import Player from "../../player/Player";
import IAIProgram from "../IAIProgram";
import AIProgram_Adventurer from "./AIProgram_Adventurer";

// import batr.game.block.*;
// import batr.game.entity.ai.*;
// import batr.game.model.*;
// import batr.game.entity.*;
// import batr.game.entity.entity.*;
// import batr.game.entity.entity.player.*;
// import batr.game.main.*;
// import batr.game.map.*;

// import flash.utils.Dictionary;

/**
 * Advanced Advancer.
 */
export default class AIProgram_Master implements IAIProgram {
	//============Static Variables============//
	public static readonly LABEL: string = 'Master';
	public static readonly LABEL_SHORT: string = 'M';

	public static readonly DEBUG: boolean = false;

	//============Static Functions============//
	protected static initFGH(n: PathNode, host: IBatrGame, owner: Player | null, target: iPoint): PathNode {
		// Set Rot in mapDealNode
		n.G = getPathWeight(n, host, owner);
		n.H = target == null ? 0 : n.getManhattanDistance(target) * 10 // exMath.intAbs((n.x-target.x)*(n.y-target.y))*10;//With Linear distance
		return n;
	}

	/**
	 * Equals The Variable G's coefficient
	 * @param	node	The node.
	 * @param	host	The host as Game.
	 * @param	player	The player.
	 * @return	A int will be multi with G.
	 */
	protected static getPathWeight(node: PathNode, host: IBatrGame, player: Player): int {
		let damage: int = host.getBlockPlayerDamage(node.x, node.y);
		if (!host.testPlayerCanPass(player, node.x, node.y, true, false))
			return 1000;
		if (damage > 0)
			return damage * 100;
		else if (damage < 0)
			return 0;
		return 0;
	}

	//========Dynamic A* PathFind========//
	static getDynamicNode(start: iPoint, target: iPoint, host: IBatrGame, owner: AIPlayer, remember: Vector.<Boolean[]>): PathNode {
		let nearbyNodes: PathNode[] = [
			initDynamicNode(new PathNode(start.x + 1, start.y).setFromRot(GlobalRot.RIGHT), host, owner, target),
			initDynamicNode(new PathNode(start.x - 1, start.y).setFromRot(GlobalRot.LEFT), host, owner, target),
			initDynamicNode(new PathNode(start.x, start.y + 1).setFromRot(GlobalRot.DOWN), host, owner, target),
			initDynamicNode(new PathNode(start.x, start.y - 1).setFromRot(GlobalRot.UP), host, owner, target)
		];
		let _leastNode: PathNode = null;
		let _leastF: int = int.MAX_VALUE;
		for (let node of nearbyNodes) {
			if (node == null || AIProgram_Adventurer.pointInRemember(node, remember) ||
				host.computeFinalPlayerHurtDamage(owner, node.x, node.y, host.getBlockPlayerDamage(node.x, node.y)) >= owner.health)
				continue;
			if (node.F < _leastF) {
				_leastNode = node;
				_leastF = node.F;
			}
		}
		return _leastNode;
	}

	protected static initDynamicNode(n: PathNode, host: IBatrGame, owner: AIPlayer, target: iPoint): PathNode {
		return initFGH(host.lockIPointInMap(n) as PathNode, host, owner, target);
	}

	//============Instance Variables============//

	/** This matrix contains point where it went. */
	protected _remember: Vector.<Boolean[]>;

	protected _closeTarget: Dictionary;

	protected _lastTarget: Entity;

	// AI Judging about
	protected _pickupWeight: int = exMath.random(50) * exMath.random1();

	//============Constructor & Destructor============//
	public constructor() {
		this._lastTarget = null;
		this._closeTarget = new Dictionary(true);
	}

	//============Destructor Function============//
	public destructor(): void {
		this._lastTarget = null;
		this._closeTarget = null;
	}

	//============Instance Functions============//
	protected initRemember(host: IBatrGame): void {
		this._remember = host.map.getMatrixBoolean();
	}

	protected resetRemember(): void {
		for (let v of this._remember) {
			for (let i in v) {
				v[i] = false;
			}
		}
		// trace('remember resetted!')
	}

	protected changeTarget(owner: AIPlayer, target: Entity): void {
		if (this._lastTarget == target)
			return;
		this._lastTarget = target;
		this.resetRemember();
		if (owner.isPress_Use)
			owner.addActionToThread(AIPlayerAction.RELEASE_KEY_USE);
	}

	protected resetTarget(): void {
		this._lastTarget = null;
		this.resetRemember();
	}

	protected inCloseTarget(target: Entity): boolean {
		return Boolean(this._closeTarget[target]);
	}

	protected addCloseTarget(target: Entity): void {
		this._closeTarget[target] = true;
	}

	protected resetCloseTarget(): void {
		for (let i in this._closeTarget) {
			delete this._closeTarget[i];
		}
	}

	/*========AI Tools========*/
	public getNearestBonusBox(ownerPoint: iPoint, host: IBatrGame): BonusBox {
		// getManhattanDistance
		let _nearestBox: BonusBox = null;
		let _nearestDistance: int = int.MAX_VALUE;
		let _tempDistance: int;
		for (let box of host.entitySystem.bonusBoxes) {
			if (box == null || this.inCloseTarget(box))
				continue;
			_tempDistance = exMath.intAbs(box.gridX - ownerPoint.x) + exMath.intAbs(box.gridY - ownerPoint.y);
			if (_tempDistance < _nearestDistance) {
				_nearestBox = box;
				_nearestDistance = _tempDistance;
			}
		}
		return _nearestBox;
	}

	public getNearestEnemy(owner: Player | null, host: IBatrGame): Player {
		// getManhattanDistance
		let _nearestEnemy: Player = null;
		let _nearestDistance: int = int.MAX_VALUE;
		let _tempDistance: int;
		let players: Player[] = host.getAlivePlayers();
		for (let player of players) {
			if (player == owner || !owner.canUseToolHurtPlayer(player, owner.tool) ||
				player == null || this.inCloseTarget(player))
				continue;
			_tempDistance = iPoint.getLineTargetDistance2(owner.gridX, owner.gridY, player.gridX, player.gridY);
			if (_tempDistance < _nearestDistance) {
				_nearestEnemy = player;
				_nearestDistance = _tempDistance;
			}
		}
		return _nearestEnemy;
	}

	/*====INTERFACE batr.Game.AI.IAIPlayerAI====*/
	/*========AI Getter And Setter========*/
	public get label(): string {
		return AIProgram_Master.LABEL;
	}

	public get labelShort(): string {
		return AIProgram_Master.LABEL_SHORT;
	}

	public get referenceSpeed(): uint {
		return 5 * (1 + exMath.random(6));
	}

	protected get pickBonusFirst(): boolean {
		return this._pickupWeight < 0;
	}

	/*========AI Program Main========*/
	public requestActionOnTick(player: AIPlayer): AIPlayerAction {
		if (player == null)
			return AIPlayerAction.NULL;
		// Set Variables
		let host: IBatrGame = player.host;
		let ownerPoint: iPoint = player.gridPoint;
		let lastTargetPlayer: Player = this._lastTarget as Player;
		let lastTargetPlayerPoint: iPoint = lastTargetPlayer == null ? null : lastTargetPlayer.gridPoint;
		// Init remember
		if (this._remember == null) {
			this.initRemember(host);
		}
		// Act
		if (!player.hasAction) {
			// Clear Invalid Target
			if (this._lastTarget != null && !this._lastTarget.isActive ||
				lastTargetPlayer != null && (!player.canUseToolHurtPlayer(lastTargetPlayer, player.tool) ||
					lastTargetPlayer != null && lastTargetPlayer.isRespawning)) {
				this.resetTarget();
				AIProgram_Adventurer.traceLog(player, 'Clear invalid target!');
			}
			/*//Change target when weak
			else if(lastTargetPlayer!=null&&player.health<lastTargetPlayer.health) {
				if((this._pickupWeight++)<0) {
					this.addCloseTarget(this._lastTarget);
					AIProgram_Adventurer.traceLog(player,'close target when wreak:'+getEntityName(this._lastTarget));
					this.resetTarget();
				}
			}*/
			//====Dynamic A*====//
			// If Invalid Target,Get New Target
			if (this._lastTarget == null || this._lastTarget == player) {
				//========Find BonusBox========//
				let target: Entity = null;
				// set Player as Target
				target = this.pickBonusFirst ? getNearestBonusBox(ownerPoint, host) : getNearestEnemy(player, host);
				// if cannot find box/player
				if (target == null) {
					if (!this.pickBonusFirst && host.entitySystem.bonusBoxCount > 0)
						target = getNearestBonusBox(ownerPoint, host);
					else
						target = getNearestEnemy(player, host);
				}
				if (target != null) {
					this.changeTarget(player, target);
					AIProgram_Adventurer.traceLog(player, 'turn target to ' + AIProgram_Adventurer.getEntityName(this._lastTarget));
				}
				// If all available target closed
				else
					this.resetCloseTarget();
			}
			else {
				let tempRot: uint = GlobalRot.fromLinearDistance(this._lastTarget.entityX - player.entityX, this._lastTarget.entityY - player.entityY);
				// Attack Enemy
				if (GlobalRot.isValidRot(tempRot) &&
					AIProgram_Adventurer.detectCarryBlock(player) &&
					lastTargetPlayer != null &&
					AIProgram_Adventurer.toolUseTestWall(player, host, tempRot, ownerPoint.getManhattanDistance(lastTargetPlayerPoint)) &&
					player.canUseToolHurtPlayer(lastTargetPlayer, player.tool)) {
					// Reset
					this.resetRemember();
					// Turn
					if (player.rot != tempRot)
						player.addActionToThread(AIPlayerAction.getTurnActionFromEntityRot(tempRot));
					// Press Use
					if (player.toolReverseCharge) {
						if (player.chargingPercent >= 1)
							return AIPlayerAction.PRESS_KEY_USE;
						else if (player.isPress_Use)
							return AIPlayerAction.RELEASE_KEY_USE;
					}
					else if (!player.isPress_Use)
						return AIPlayerAction.PRESS_KEY_USE;
					AIProgram_Adventurer.traceLog(player, 'attack target ' + AIProgram_Adventurer.getEntityName(this._lastTarget));
				}
				// Carry Block
				else if (!AIProgram_Adventurer.detectCarryBlock(player) &&
					AIProgram_Adventurer.detectBlockCanCarry(player, host.getBlockAttributes(player.getFrontIntX(), player.getFrontIntY()))) {
					// Press Use
					player.clearActionThread();
					if (!player.isPress_Use)
						return AIPlayerAction.PRESS_KEY_USE;
				}
				// Find Path
				else {
					//==Release Use==//
					if (player.isPress_Use)
						return AIPlayerAction.RELEASE_KEY_USE;
					;
					//==Decision==//
					// Find Path
					let finalNode: PathNode;
					// Attack player
					if (lastTargetPlayer != null) {
						finalNode = getDynamicNode(
							ownerPoint,
							iPoint.getLineTargetPoint2(
								player.gridX, player.gridY, this._lastTarget.gridX, this._lastTarget.gridY, true
							),
							host,
							player,
							this._remember
						);
					}
					else { // Default as Bonus
						finalNode = host.lockIPointInMap(
							getDynamicNode(
								ownerPoint,
								this._lastTarget.gridPoint,
								host, player, this._remember
							)
						) as PathNode;
					}
					//==Execute==//
					// Find Failed
					if (finalNode == null) {
						this.addCloseTarget(this._lastTarget);
						this.resetTarget();
						AIProgram_Adventurer.traceLog(player, 'finalNode==null,forget target');
					}
					// Find Success
					else {
						AIProgram_Adventurer.writeRememberPoint(this._remember, finalNode, true);
						AIProgram_Adventurer.writeRememberPoint(this._remember, ownerPoint, true);
						player.addActionToThread(
							AIPlayerAction.getMoveActionFromEntityRot(
								finalNode.fromRot
							)
						);
						AIProgram_Adventurer.traceLog(player, 'findPath(' + AIProgram_Adventurer.getEntityName(this._lastTarget) + ') success!writeRememberAt:' + finalNode + ',' + ownerPoint);
					}
				}
			}
		}
		return AIPlayerAction.NULL;
	}

	public requestActionOnCauseDamage(player: AIPlayer, damage: uint, victim: Player): AIPlayerAction {
		this._pickupWeight += damage;
		return AIPlayerAction.NULL;
	}

	public requestActionOnHurt(player: AIPlayer, damage: uint, attacker: Player): AIPlayerAction {
		// Run
		if (player.healthPercent < 0.5) {
			if (this._pickupWeight > 0)
				this._pickupWeight = -this._pickupWeight;
			if (attacker != null)
				this.addCloseTarget(attacker);
			this.resetTarget();
		}
		// Hurt By Target
		else if (attacker != null && attacker != this._lastTarget && attacker != player &&
			player.canUseToolHurtPlayer(attacker, player.tool)) {
			this._pickupWeight -= damage;
			this.changeTarget(player, attacker);
		}
		// Release Tool
		if (player.isCharging)
			player.runAction(AIPlayerAction.RELEASE_KEY_USE);
		// random move beside on under attack<From AI-N>
		if (Utils.randomBoolean())
			return AIPlayerAction.MOVE_LEFT_REL;
		else
			return AIPlayerAction.MOVE_RIGHT_REL;
	}

	public requestActionOnKill(player: AIPlayer, damage: uint, victim: Player): AIPlayerAction {
		this.resetTarget();
		this.resetCloseTarget();
		return AIPlayerAction.NULL;
	}

	public requestActionOnDeath(player: AIPlayer, damage: uint, attacker: Player): AIPlayerAction {
		return AIPlayerAction.NULL;
	}

	public requestActionOnRespawn(player: AIPlayer): AIPlayerAction {
		this.resetTarget();
		return AIPlayerAction.NULL;
	}

	public requestActionOnMapTransform(player: AIPlayer): AIPlayerAction {
		this.resetTarget();
		return AIPlayerAction.NULL;
	}

	public requestActionOnPickupBonusBox(player: AIPlayer, box: BonusBox): AIPlayerAction {
		this._pickupWeight -= 5;
		return AIPlayerAction.NULL;
	}
}