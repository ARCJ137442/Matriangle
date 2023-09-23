

import { iPoint } from "../../../../../../common/geometricTools";
import { uint, int } from "../../../../../../legacy/AS3Legacy";
import BlockAttributes from "../../../../../api/block/BlockAttributes";
import Game from "../../../../../main/Game";
import Tool from "../../../registry/Tool";
import Entity from "../../../../../api/entity/Entity";
import BonusBox from "../../item/BonusBox";
import AIPlayer from "../../player/AIPlayer";
import Player from "../../player/Player";
import IAIProgram from "../IAIProgram";

/**
 * Moving uses A*(A Star) algorithm.
 */
export default class AIProgram_Adventurer implements IAIProgram {
	//============Static Variables============//
	public static readonly LABEL: string = 'Adventurer';
	public static readonly LABEL_SHORT: string = 'A';

	public static readonly DEBUG: boolean = false;

	//============Static Functions============//
	/*========AI Criteria========*/
	static toolUseTestWall(owner: Player | null, host: IBatrGame, rot: uint, distance: uint): boolean {
		let vx: int = GlobalRot.towardXInt(rot, 1);
		let vy: int = GlobalRot.towardYInt(rot, 1);
		let cx: int, cy: int;
		let tool: Tool = owner.tool;
		for (let i: uint = 1; i < distance; i++) {
			cx = owner.gridX + vx * i;
			cy = owner.gridY + vy * i;
			if (host.isIntOutOfMap(cx, cy))
				continue;
			if (!host.testIntCanPass(
				cx, cy, tool == Tool.MELEE,
				Tool.isBulletTool(tool) || tool == Tool.BLOCK_THROWER,
				Tool.isLaserTool(tool),
				toolNotThroughPlayer(tool), false
			)
			)
				return false;
		}
		return true;
	}

	static toolNotThroughPlayer(tool: Tool): boolean {
		switch (tool) {
			case Tool.BULLET:
			case Tool.NUKE:
			case Tool.SUB_BOMBER:
			case Tool.TRACKING_BULLET:
			case Tool.BLOCK_THROWER:
			case Tool.MELEE:
			case Tool.LIGHTNING:
				return true;
		}
		return false;
	}

	static toolNeedCarryBlock(tool: Tool): boolean {
		return tool == Tool.BLOCK_THROWER;
	}

	static detectCarryBlock(player: Player): boolean {
		if (toolNeedCarryBlock(player.tool) && !player.isCarriedBlock)
			return false;
		return true;
	}

	static detectBlockCanCarry(player: Player, blockAtt: BlockAttributes): boolean {
		return !player.isCarriedBlock && blockAtt.isCarriable && player.host.testCarriableWithMap(blockAtt, player.host.map);
	}

	/*========A Star Algorithm========*/

	/**
	 * Find the 'best' path in a map with the owner.
	 * The startPos should be (owner.gridX,owner.gridY)
	 * 1. [OpenList],[CloseList]
	 * 2. [F=G+H]
	 * @return	The Path From Target To Start
	 */
	protected static findPath(owner: Player | null, host: IBatrGame, startX: int, startY: int, endX: int, endY: int): PathNode[] {
		// console.log('Name='+owner.customName)
		// Operation
		let openList: PathNode[] = new Array<PathNode>();
		let closeList: PathNode[] = new Array<PathNode>();

		let endNode: PathNode = new PathNode(endX, endY, null);
		let startNode: PathNode = initFGH(new PathNode(startX, startY, null), host, owner, endNode);
		let targetNode: PathNode = initFGH(new PathNode(endX, endY, null), host, owner, endNode);
		let _leastNearbyNode: PathNode;
		let _nearbyNodes: PathNode[];
		let _tempNode: PathNode;

		openList.push(startNode);

		while (openList.length > 0) {
			// Set
			_leastNearbyNode = getLeastFNode(openList);
			// console.log('Set _leastNearbyNode='+_leastNearbyNode,'numO='+openList.length,'numC='+closeList.length)
			// Move
			removeNodeIn(_leastNearbyNode, openList);
			if (closeList.indexOf(_leastNearbyNode) < 0)
				closeList.push(_leastNearbyNode);
			// Find
			_nearbyNodes = getNearbyNodesAndInitFGH(_leastNearbyNode, host, owner, targetNode);
			// Test And Add
			for (_tempNode of _nearbyNodes) {
				// Touch End
				if (_tempNode.equals(targetNode))
					break;
				// Add
				if (!containNode(_tempNode, closeList) && !containNode(_tempNode, openList))
					openList.push(_tempNode);
			}
		}
		// Now the _tempNode instanceof the succeed Node.
		// Return
		return _tempNode == null ? null : _tempNode.pathToRoot;
	}

	protected static containNode(node: PathNode, nodes: PathNode[]): boolean {
		if (nodes.indexOf(node) >= 0)
			return true;
		for (let i in nodes) {
			if (node.equals(nodes[i]))
				return true;
		}
		return false;
	}

	protected static removeNodeIn(node: PathNode, nodes: PathNode[]): boolean {
		let i: int = nodes.indexOf(node);
		if (i >= 0) {
			// console.log('remove node'+node,'succeed!')
			nodes.splice(i, 1);
			return true;
		}
		// console.log('remove node'+node,'failed!')
		return false;
	}

	protected static getNearbyNodesAndInitFGH(n: PathNode, host: IBatrGame, owner: Player | null, target: PathNode): PathNode[] {
		// Set Rot in mapDealNode
		return [
			initFGH(mapDealNode(new PathNode(n.x + 1, n.y, n), host, GlobalRot.RIGHT), host, owner, target),
			initFGH(mapDealNode(new PathNode(n.x - 1, n.y, n), host, GlobalRot.LEFT), host, owner, target),
			initFGH(mapDealNode(new PathNode(n.x, n.y + 1, n), host, GlobalRot.DOWN), host, owner, target),
			initFGH(mapDealNode(new PathNode(n.x, n.y - 1, n), host, GlobalRot.UP), host, owner, target)
		];
	}

	protected static getLeastFNode(nodes: PathNode[]): PathNode {
		if (nodes == null)
			return null;
		let _leastNode: PathNode = null;
		let _leastF: int = int.MAX_VALUE;
		for (let node of nodes) {
			if (node == null)
				continue;
			if (node.F < _leastF) {
				_leastNode = node;
				_leastF = node.F;
			}
		}
		return _leastNode;
	}

	protected static initFGH(n: PathNode, host: IBatrGame, owner: Player | null, target: iPoint): PathNode {
		// Set Rot in mapDealNode
		n.G = getPathWeight(n, host, owner);
		n.H = n.getManhattanDistance(target) * 10; // exMath.intAbs((n.x-target.x)*(n.y-target.y))*10;//With Linear distance
		return n;
	}

	protected static mapDealNode(n: PathNode, host: IBatrGame, fromRot: uint): PathNode {
		n.fromRot = fromRot;
		return host.lockIPointInMap(n) as PathNode;
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
			if (node == null || pointInRemember(node, remember) ||
				host.isKillZone(node.x, node.y))
				continue;
			if (node.F < _leastF) {
				_leastNode = node;
				_leastF = node.F;
			}
		}
		return _leastNode;
	}

	static pointInRemember(p: iPoint, r: Vector.<Boolean[]>): boolean {
		if (p == null || r == null || r.length < 1)
			return false;
		return r[p.x][p.y];
	}

	static writeRemember(remember: Vector.<Boolean[]>, x: uint, y: uint, value: boolean): void {
		remember[x][y] = value;
	}

	static writeRememberPoint(remember: Vector.<Boolean[]>, p: iPoint, value: boolean): void {
		remember[p.x][p.y] = value;
	}

	static getEntityName(target: Entity): string {
		if (target == null)
			return 'null';
		if (target instanceof Player)
			return (target as Player).customName;
		return target.toString();
	}

	/**
	 * Trace if DEBUG=true.
	 * @param	owner	the owner.
	 * @param	message	the text without AIPlayer name.
	 */
	static traceLog(owner: Player | null, message: string): void {
		if (DEBUG)
			console.log(owner.customName + ':', message);
	}

	protected static initDynamicNode(n: PathNode, host: IBatrGame, owner: AIPlayer, target: iPoint): PathNode {
		return initFGH(host.lockIPointInMap(n) as PathNode, host, owner, target);
	}

	//============Instance Variables============//

	/**
	 * This matrix contains point where it went.
	 */
	protected _remember: Vector.<Boolean[]>;

	protected _closeTarget: Entity[];

	protected _lastTarget: Entity;

	// AI Judging about
	protected _pickupFirst: boolean = true;

	//============Constructor & Destructor============//
	public constructor() {
		this._lastTarget = null;
		this._closeTarget = new Array<Entity>();
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
		// console.log('remember resetted!')
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
		return this._closeTarget.indexOf(target) >= 0;
	}

	protected addCloseTarget(target: Entity): void {
		if (!this.inCloseTarget(target))
			this._closeTarget.push(target);
	}

	protected resetCloseTarget(): void {
		this._closeTarget.splice(0, this._closeTarget.length);
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
	public get label(): String {
		return AIProgram_Adventurer.LABEL;
	}

	public get labelShort(): String {
		return AIProgram_Adventurer.LABEL_SHORT;
	}

	public get referenceSpeed(): uint {
		return 5 * (1 + exMath.random(6));
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
			}
			//====Dynamic A*====//
			// If Invalid Target,Get New Target
			if (this._lastTarget == null || this._lastTarget == player) {
				//========Find BonusBox========//
				let target: Entity = null;
				// set Player as Target
				target = this._pickupFirst ? getNearestBonusBox(ownerPoint, host) : getNearestEnemy(player, host);
				// if cannot find player
				if (target == null) {
					if (!this._pickupFirst && host.entitySystem.bonusBoxCount > 0)
						target = getNearestBonusBox(ownerPoint, host);
					else
						target = getNearestEnemy(player, host);
				}
				if (target != null) {
					this.changeTarget(player, target);
					traceLog(player, 'turn target to ' + getEntityName(this._lastTarget));
				}
				// If all available target closed
				else {
					this.resetCloseTarget();
				}
			}
			else {
				let tempRot: uint = GlobalRot.fromLinearDistance(this._lastTarget.entityX - player.entityX, this._lastTarget.entityY - player.entityY);
				// Attack Enemy
				if (GlobalRot.isValidRot(tempRot) &&
					detectCarryBlock(player) &&
					lastTargetPlayer != null &&
					toolUseTestWall(player, host, tempRot, ownerPoint.getManhattanDistance(lastTargetPlayerPoint)) &&
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
					traceLog(player, 'attack target ' + getEntityName(this._lastTarget));
				}
				// Carry Block
				else if (!detectCarryBlock(player) &&
					detectBlockCanCarry(player, host.getBlockAttributes(player.getFrontIntX(), player.getFrontIntY()))) {
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
						traceLog(player, 'finalNode==null,forget target');
					}
					// Find Success
					else {
						writeRememberPoint(this._remember, finalNode, true);
						writeRememberPoint(this._remember, ownerPoint, true);
						player.addActionToThread(
							AIPlayerAction.getMoveActionFromEntityRot(
								finalNode.fromRot
							)
						);
						traceLog(player, 'findPath(' + getEntityName(this._lastTarget) + ') success!writeRememberAt:' + finalNode + ',' + ownerPoint);
					}
				}
			}
		}
		return AIPlayerAction.NULL;
	}

	public requestActionOnCauseDamage(player: AIPlayer, damage: uint, victim: Player): AIPlayerAction {
		return AIPlayerAction.NULL;
	}

	public requestActionOnHurt(player: AIPlayer, damage: uint, attacker: Player): AIPlayerAction {
		// Hurt By Target
		if (attacker != null && attacker != this._lastTarget && attacker != player &&
			player.canUseToolHurtPlayer(attacker, player.tool)) {
			this.changeTarget(player, attacker);
		}
		return AIPlayerAction.NULL;
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
		return AIPlayerAction.NULL;
	}
}
}

class PathNode extends iPoint {
	public parent: PathNode;

	/** From GlobalRot(U,D,L,R) */
	public fromRot: uint = GlobalRot.NULL;

	public G: int = 0;
	public H: int = 0;

	public get F(): int {
		return this.G + this.H;
	}

	public get hasParent(): boolean {
		return this.parent != null;
	}

	public get hasFromRot(): boolean {
		return GlobalRot.isValidRot(this.fromRot);
	}

	public get rootParent(): PathNode {
		let p: PathNode = this.parent;
		while (p.parent != null && p.parent != this) {
			p = p.parent;
		}
		return p;
	}

	/** Didn't include the root */
	public get pathToRoot(): PathNode[] {
		let result: PathNode[] = new Array<PathNode>(this);
		let p: PathNode = this.parent;
		while (p != this && p.parent && p.hasFromRot && p.parent.hasFromRot) {
			p = p.parent;
			result.push(p);
		}
		return result;
	}

	// Constructor
	public constructor(x: int, y: int, parent: PathNode = null) {
		super(x, y);
		this.parent = parent;
	}

	// Static Constructor
	public static fromPoint(p: iPoint): PathNode {
		return new PathNode(p.x, p.y, null);
	}

	// Methods
	public getFromRot(from: PathNode): uint {
		return GlobalRot.fromLinearDistance(this.x - from.x, this.y - from.y);
	}

	public autoSetFromRot(): void {
		if (this.hasParent) {
			this.fromRot = this.getFromRot(this.parent);
		}
	}

	/**
	 * @param	parent	A Point
	 * @return	This point
	 */
	public setParentAndFromRot(parent: PathNode): PathNode {
		this.parent = parent;
		this.autoSetFromRot();
		return this;
	}

	public setFromRot(rot: uint): PathNode {
		this.fromRot = rot;
		return this;
	}

	override toString(): string {
		return '[pos=' + super.toString() + ',F=' + this.F + ',G=' + this.G + ',H=' + this.H + ']';
	}
}

class NodeHeap {
	/**
	 * @param	i	index start at 0
	 * @return	The index start at 0
	 */
	protected static getLeftIndex(i: uint): uint {
		return ((i + 1) << 1) - 1;
	}

	/**
	 * @param	i	index start at 0
	 * @return	The index start at 0
	 */
	protected static getRightIndex(i: uint): uint {
		return (i + 1) << 1;
	}

	/**
	 * @param	i	index start at 0
	 * @return	The index start at 0
	 */
	protected static getParentIndex(i: uint): uint {
		return ((i + 1) >> 1) - 1;
	}

	protected const _list: PathNode[] = new Array<PathNode>();

	public get length(): uint {
		return this._list.length;
	}

	public get leastF(): PathNode {
		return this._list[0];
	}

	public constructor() {
	}

	public add(node: PathNode): void {
		if (node == null)
			return;
		this._list.push(node);
		let index: uint = this.length - 1;
		while (index > 0 && hasParent(index) && this._list[getParentIndex(index)].F > node.F) {
			swapNode(index, getParentIndex(index));
			index = getParentIndex(index);
		}
	}

	public remove(): void {
		swapNode(0, this.length - 1);
		this._list.length--;
		let index: uint = 0;
		while (index > 0 && hasNode(index) && this._list[index].F > leastChildF(index)) {
			swapNode(index, getParentIndex(index));
			index = getParentIndex(index);
		}
	}

	protected getLastNode(): PathNode {
		return this._list[this.length - 1];
	}

	protected setNode(n: PathNode, i: uint): void {
		if (n == null)
			return;
		if (this.length < i)
			this._list.length = i + 1;
		this._list[i] = n;
	}

	protected hasNode(i: uint): boolean {
		return this.length > i && this._list[i] != null;
	}

	protected hasParent(i: uint): boolean {
		if (i == 0)
			return false;
		return hasNode(getParentIndex(i));
	}

	protected hasChild(i: uint): boolean {
		return hasNode(getLeftIndex(i)) && hasNode(getRightIndex(i));
	}

	protected getLeftChildF(i: uint): uint {
		return hasNode(getLeftIndex(i)) ? this._list[getLeftIndex(i)].F : 0;
	}

	protected getRightChildF(i: uint): uint {
		return hasNode(getRightIndex(i)) ? this._list[getRightIndex(i)].F : 0;
	}

	protected getChildF(i: uint): uint {
		return hasNode(i) ? this._list[i].F : 0;
	}

	protected leastChildF(i: uint): uint {
		if (!this.hasChild(i))
			return 0;
		return exMath.intMin(getChildF(getLeftIndex(i)), getChildF(getRightIndex(i)));
	}

	protected swapNode(i1: uint, i2: uint): void {
		if (i1 < this.length && i2 < this.length) {
			let temp: PathNode = this._list[i1];
			this._list[i1] = this._list[i2];
			this._list[i2] = temp;
		}
	}
