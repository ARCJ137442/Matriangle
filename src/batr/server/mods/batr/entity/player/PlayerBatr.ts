import { int, uint } from "../../../../../legacy/AS3Legacy";
import { DEFAULT_SIZE } from "../../../../../display/api/GlobalDisplayVariables";
import PlayerStats from "./stat/PlayerStats";
import Entity from "../../../../api/entity/Entity";
import BonusBox from "../item/BonusBox";
import { iPoint, iPointRef } from "../../../../../common/geometricTools";
import IMatrix from "../../../../main/IMatrix";
import { DisplayLayers, IBatrShape } from "../../../../../display/api/DisplayInterfaces";
import PlayerAttributes from "./attributes/PlayerAttributes";
import { FIXED_TPS, TPS } from "../../../../main/GlobalWorldVariables";
import Tool from "../../tool/Tool";
import { mRot, toOpposite_M } from "../../../../general/GlobalRot";
import IPlayer from "../../../native/entities/player/IPlayer";
import { halfBrightnessTo, turnBrightnessTo } from "../../../../../common/color";
import PlayerTeam from "./team/PlayerTeam";
import { playerMoveInTest, playerLevelUpExperience, handlePlayerHurt, handlePlayerDeath, handlePlayerLocationChanged, handlePlayerLevelup, getPlayers, playerUseTool, respawnPlayer, handlePlayerLocationChange, isAlly, computeFinalCD } from "../../mechanics/NativeMatrixMechanics";
import { NativeDecorationLabel } from "../../../../../display/mods/native/entity/player/DecorationLabels";
import { intMin } from "../../../../../common/exMath";
import { IEntityInGrid } from "../../../../api/entity/EntityInterfaces";
import { ADD_ACTION, EnumPlayerAction, PlayerAction } from "../../../native/entities/player/controller/PlayerAction";
import { NativePlayerEvent } from "../../../native/entities/player/controller/PlayerEvent";
import { NativePlayerEventOptions } from "../../../native/entities/player/controller/PlayerEvent";
import EffectPlayerHurt from "../effect/EffectPlayerHurt";
import MatrixRuleBatr from "../../../native/rule/MatrixRuleBatr";
import PlayerController from "../../../native/entities/player/controller/PlayerController";
import IPlayerBatr from "./IPlayerBatr";
import { BatrPlayerEvent, BatrPlayerEventOptions } from "./BatrPlayerEvent";
import Player_V1 from "../../../native/entities/player/Player_V1";

/**
 * 「Batr玩家」的主类
 * * 承继自AS3版本的「Player」类
 * * 具体特性参考「IPlayerBatr」所实现的各个接口
 * 
 * !【2023-10-08 17:19:26】现在「从接口实现的属性/方法」不再外加访问修饰符，以便和「非接口实现」的属性/方法区分
 */
export default class PlayerBatr extends Player_V1 implements IPlayerBatr {

	// **独有属性** //

	i_batrPlayer: true = true;

	// 队伍 //

	/** 玩家的队伍 */
	protected _team: PlayerTeam;
	/** （玩家档案）队伍ID */
	get teamID(): string { return this._team.id; }
	/** （玩家档案）队伍颜色 */
	get teamColor(): uint { return this.team.color; }
	get team(): PlayerTeam { return this._team; }
	set team(value: PlayerTeam) {
		if (value == this._team)
			return;
		this._team = value;
		// TODO: 更新自身图形
		// this.initColors();
		// this._GUI.updateTeam();
		// host.updateProjectilesColor();
	}

	// 工具 //

	/** 玩家所持有的工具 */
	protected _tool: Tool; // 默认可以是「空工具」
	/** 玩家所持有的工具 */
	get tool(): Tool { return this._tool; }
	/** 更改工具时，触发钩子等 */
	/** Also Reset CD&Charge */
	set tool(value: Tool) {
		if (value !== this._tool) {
			this._tool = value;
			// TODO: 可能需要的「显示更新」如「方块投掷器⇒持有的方块」
		}
	}

	// !【2023-09-27 19:44:37】现在废除「根据母体计算CD」这条规则，改为更软编码的「世界根据规则在分派工具时决定」方式
	// !【2023-09-28 17:32:59】💭设置工具使用时间，这个不需要过早优化显示，但若以后的显示方式不是「充能条」，它就需要更新了
	// !【2023-09-30 20:09:21】废除「工具相关函数」，但这使得世界没法在Player层保证「及时更新」，所以需要在外部「设置武器」时及时更新

	// 经验 //

	/** 玩家经验值 */
	protected _experience: uint = 0;
	/**
	 * 玩家经验值
	 *
	 * !【2023-09-28 18:05:47】因「升级⇒特效⇒需要联系主体」，现在不再通过「直接设置值」增加玩家经验了
	 */
	get experience(): uint { return this._experience; }

	/**
	 * 设置经验值
	 * @param host 用于在后续「生成特效」时访问的母体
	 */
	setExperience(host: IMatrix, value: uint): void {
		// 大于「最大经验」⇒升级
		while (value > this.levelupExperience) {
			value -= this.levelupExperience;
			this.level++;
			this.onLevelup(host);
		}
		// 设置经验值
		this._experience = value;
		//TODO: 显示更新
		// if (this._GUI !== null) this._GUI.updateExperience();
	}

	/** 增加经验值 */
	addExperience(host: IMatrix, value: uint): void {
		this.setExperience(host, this.experience + value);
	}

	/** 玩家等级 */
	protected _level: uint = 0;
	/**
	 * 玩家等级
	 * * 【2023-09-28 18:10:26】目前还没有什么用，只是在「升级」时玩家会有属性提升
	 */
	get level(): uint { return this._level; }
	set level(value: uint) { this._level = value; }

	/** 升级所需经验 */
	get levelupExperience(): uint { return playerLevelUpExperience(this._level); }

	/** 经验百分比：当前经验/升级所需经验 */
	get experiencePercent(): number { return this._experience / this.levelupExperience; }

	// 属性（加成） //

	/** 玩家的所有属性 */
	protected _attributes: PlayerAttributes = new PlayerAttributes()
	/** 玩家的所有属性 */
	get attributes(): PlayerAttributes { return this._attributes }

	//============Constructor & Destructor============//
	/**
	 * 构造函数
	 *
	 * 📌根据传入的「填充」「线条」初始化自身颜色
	 * * 填充颜色：渐变（1x亮度→3/4*亮度）
	 * * 线条颜色：0.5/亮度
	 *
	 * @param position 整数位置
	 * @param direction 方向
	 * @param team 队伍
	 * @param isActive （创建时是否已激活）
	 * @param fillColor 填充颜色（默认为队伍颜色）
	 * @param lineColor 线条颜色（默认从队伍颜色中产生）
	 */
	public constructor(
		position: iPoint, direction: mRot,
		isActive: boolean = true,
		team: PlayerTeam,
		tool: Tool,
		fillColor: number = team.color,
		lineColor: number = halfBrightnessTo(fillColor)
	) {
		super(
			position, direction,
			isActive,
			fillColor, lineColor,
		);

		// 独有属性 //
		this._team = team;
		this._tool = tool;

		// 有统计实体 //
		this._stats = new PlayerStats(this);

		// 可显示实体 //
		this._fillColor2 = turnBrightnessTo(fillColor, 0.75);
		// Set Shape
		// this.shapeInit(shape: IBatrShape);
		// Set GUI And Effects
		// this._GUI = new PlayerGUI(this);
		// this.addChildren();

		// ! 控制器不在这里留有引用
	}

	// ! 一些置空的逻辑操作免了……虽然这会导致一堆「顽固引用」
	override destructor(): void {

		// Utils.removeChildIfContains(host.playerGUIContainer, this._GUI);

		// this._customName = null;
		this._tool.usingCD = 0;
		// this._team = null;

		this._stats.destructor();
		// this._stats = null;
		// this._tool = null;
		// this._GUI.destructor();
		// this._GUI = null;

		super.destructor();
	}

	// 活跃实体 //
	readonly i_active: true = true;

	onTick(host: IMatrix): void {
		// 在重生过程中⇒先处理重生
		if (this.isRespawning)
			this.dealRespawn(host);
		// 然后再处理其它
		else {
			this.dealCachedActions(host);
			this.dealController(host);
			this.dealUsingTime(host);
			this.dealMoveInTest(host, false, false);
			this.dealHeal();
		}
	}

	// 有统计 //
	readonly i_hasStats: true = true;

	protected _stats: PlayerStats;
	get stats(): PlayerStats { return this._stats }

	// 可显示实体 // TODO: 【2023-09-28 18:22:42】这是不是要移出去。。。

	/** 填充颜色2（用于渐变） */
	protected _fillColor2: uint = 0xcccccc;

	/** 显示时的像素大小 */
	static readonly SIZE: number = 1 * DEFAULT_SIZE;
	/** 线条粗细 */
	static readonly LINE_SIZE: number = DEFAULT_SIZE / 96;
	/** 所持有方块（若武器有🤔）的透明度 */
	static readonly CARRIED_BLOCK_ALPHA: number = 1 / 4;

	// TODO: 继续思考&处理「显示依赖」的事。。。
	// protected _GUI: IPlayerGUI;
	// get gui(): IPlayerGUI { return this._GUI; }
	// /** 用于实现玩家的GUI显示 */ // TODO: 留给日后显示？实际上就是个「通知更新」的翻版？存疑。。。
	// get guiShape(): IPlayerGUI { return this._GUI };

	readonly i_displayable: true = true;

	/** 堆叠覆盖层级：默认是「玩家」层级 */
	protected _zIndex: uint = DisplayLayers.PLAYER;
	get zIndex(): uint { return this._zIndex }
	set zIndex(value: uint) { this._zIndex = value }

	// TODO: 这个有些过于涉及显示实现了，到底要不要尾大不掉地放在这儿？本身跟逻辑毫无关系的代码，为什么还要有这样的冗余。。。
	shapeInit(shape: IBatrShape): void {
		let realRadiusX: number = (PlayerBatr.SIZE - PlayerBatr.LINE_SIZE) / 2;
		let realRadiusY: number = (PlayerBatr.SIZE - PlayerBatr.LINE_SIZE) / 2;
		shape.graphics.clear();
		shape.graphics.lineStyle(PlayerBatr.LINE_SIZE, this._lineColor);
		shape.graphics.beginFill(this._fillColor, 1.0);
		// TODO: 渐变填充
		// !【2023-09-28 20:14:05】暂时不使用渐变填充，使用普通填充代替
		/* let m: Matrix = new Matrix();
		m.createGradientBox(
			DEFAULT_SIZE, DEFAULT_SIZE,
			0,
			-realRadiusX, -realRadiusX
		);
		shape.graphics.beginGradientFill(GradientType.LINEAR,
			[this._fillColor, this._fillColor2],
			[1.0, 1.0], // 透明度完全填充
			[63, 255], // 亮度渐变：1/4~1
			m,
			SpreadMethod.PAD,
			InterpolationMethod.RGB,
			1
		); */
		shape.graphics.moveTo(-realRadiusX, -realRadiusY);
		shape.graphics.lineTo(realRadiusX, 0);
		shape.graphics.lineTo(-realRadiusX, realRadiusY);
		shape.graphics.lineTo(-realRadiusX, -realRadiusY);
		// shape.graphics.drawCircle(0,0,10);
		shape.graphics.endFill();
	}

	/** TODO: 待实现的「更新」函数 */
	shapeRefresh(shape: IBatrShape): void {
		throw new Error("Method not implemented.");
	}

	/** TODO: 待实现的「析构」函数 */
	shapeDestruct(shape: IBatrShape): void {
		throw new Error("Method not implemented.");
	}

	//============Instance Getter And Setter============//

	// !【2023-09-27 23:36:42】删去「面前坐标」

	//============Instance Functions============//
	//====Functions About Hook====//
	/**
	 * 钩子函数的作用：
	 * * 直接向控制器发送信息，作为「外界环境」的一部分传递事件
	 * * 处理各自的触发事件
	 * 
	 * ! 🎯代码全部迁移到「原生世界机制」中，除「涉及内部变量设置」（如「向内部控制器发信息」「重生刻重置」）
	 */

	// *【2023-09-28 21:14:49】为了保留逻辑，还是保留钩子函数（而非内联
	onHeal(host: IMatrix, amount: uint, healer: IPlayer | null = null): void {
		// 通知控制器
		this._controller?.reactPlayerEvent<NativePlayerEventOptions, NativePlayerEvent.HEAL>(
			NativePlayerEvent.HEAL,
			this, host, {
			healer: healer,
			amount: amount
		});
	}

	/**
	 * @implements 对于「更新统计」，因涉及「同时控制双方逻辑」，所以放入「母体逻辑」中
	 */
	onHurt(host: IMatrix, damage: uint, attacker: IPlayer | null = null): void {
		// this._hurtOverlay.playAnimation();
		host.addEntity(
			EffectPlayerHurt.fromPlayer(this.position, this, false/* 淡出 */)
		);
		handlePlayerHurt(host, attacker, this, damage);

		// 通知控制器
		this._controller?.reactPlayerEvent<NativePlayerEventOptions, NativePlayerEvent.HURT>(
			NativePlayerEvent.HURT,
			this, host, {
			attacker: attacker,
			damage: damage
		});
	}

	/**
	 * @implements 对于「更新统计」，因涉及「同时控制双方逻辑」，所以放入「母体逻辑」中
	 */
	onDeath(host: IMatrix, damage: uint, attacker: IPlayer | null = null): void {
		// 清除「储备生命值」 //
		this.heal = 0;

		// 重置「工具使用状态」 //
		this.tool.resetUsingState();

		// 通知控制器 // !【2023-10-10 00:22:13】必须在「母体处理」（坐标移动）之前通知控制器，否则可能会有「非法坐标」报错
		this._controller?.reactPlayerEvent<NativePlayerEventOptions, NativePlayerEvent.DEATH>(
			NativePlayerEvent.DEATH,
			this, host, {
			attacker: attacker,
			damage: damage
		});

		// 触发击杀者的「击杀玩家」事件 // !【2023-10-10 00:45:52】必须在「设置重生」之前
		if (attacker !== null && !attacker.isRespawning/* 不能在重生 */)
			attacker.onKillOther(host, this, damage);

		// 处理「重生」「生命数」 //
		// 重置「重生刻」
		this._respawnTick = host.rule.safeGetRule<uint>(MatrixRuleBatr.key_defaultRespawnTime);
		// 检测「生命耗尽」 // !【2023-10-05 18:21:43】死了就是死了：生命值耗尽⇒通知世界移除自身
		if (!this.lifeNotDecay && this._lives <= 0) {// ! 生命数是在重生的时候递减的
			console.log(`${this.customName} 生命耗尽，通知母体移除自身`);
			host.removeEntity(this);
		}

		// 通知母体处理 //
		handlePlayerDeath(host, attacker, this, damage);

		// TODO: 显示更新 //
		// this.visible = false; // !【2023-10-03 21:09:59】交给「显示端」
		// this.gui.visible = false;
	}

	onKillOther(host: IMatrix, victim: IPlayer, damage: uint): void {
		// 击杀玩家，经验++
		if (victim != this && !this.isRespawning)
			this.setExperience(host, this.experience + 1);

		// 通知控制器
		this._controller?.reactPlayerEvent<NativePlayerEventOptions, NativePlayerEvent.KILL_PLAYER>(
			NativePlayerEvent.KILL_PLAYER,
			this, host, {
			victim: victim,
			damage: damage
		});
	}

	onRespawn(host: IMatrix,): void {
		// 通知控制器
		this._controller?.reactPlayerEvent<NativePlayerEventOptions, NativePlayerEvent.RESPAWN>(
			NativePlayerEvent.RESPAWN,
			this, host, undefined
		);
	}

	onMapTransform(host: IMatrix,): void {
		// 地图切换后，武器状态清除
		this._tool.resetUsingState();

		// 通知控制器
		this._controller?.reactPlayerEvent<BatrPlayerEventOptions, BatrPlayerEvent.MAP_TRANSFORM>(
			BatrPlayerEvent.MAP_TRANSFORM,
			this, host,
			undefined
		);
		// TODO: 显示更新
	}

	onPickupBonusBox(host: IMatrix, box: BonusBox): void {
		// 通知控制器
		this._controller?.reactPlayerEvent<BatrPlayerEventOptions, BatrPlayerEvent.PICKUP_BONUS_BOX>(
			BatrPlayerEvent.PICKUP_BONUS_BOX,
			this, host,
			{ box: box }
		);
	}

	onLocationChange(host: IMatrix, oldP: iPoint): void {
		// moveOutTestPlayer(host, this, oldP); // !【2023-10-08 17:09:48】现在统一把逻辑放在`setPosition`中 //! 【2023-10-03 23:34:22】原先的`preHandlePlayerLocationChange`
		handlePlayerLocationChange(host, this, this.position); // !【2023-10-08 17:17:26】原先的`moveOutTestPlayer`

		// 通知控制器
	}

	onLocationChanged(host: IMatrix, newP: iPoint): void {
		handlePlayerLocationChanged(host, this, newP); // !【2023-10-08 17:09:48】现在统一把逻辑放在`setPosition`中
		// 方块事件处理完后，开始处理「方块伤害」等逻辑
		this.dealMoveInTest(host, true, true); // ! `dealMoveInTestOnLocationChange`只是别名而已

		// 通知控制器
	}

	onLevelup(host: IMatrix): void {
		handlePlayerLevelup(host, this);

		// 通知控制器
	}

	onPositedBlockUpdate(host: IMatrix, ignoreDelay: boolean = false, isLocationChange: boolean = false): void {
		this.dealMoveInTest(host, ignoreDelay, isLocationChange);
	}

	//====Functions About World====//

	/*
	! 【2023-09-23 16:52:31】`carriedBlock`、`isCarriedBlock`将拿到「工具」中，不再在这里使用
	* 会在「方块投掷器」中使用，然后在显示的时候调用
	TODO: 目前计划：作为一种存储了状态的「特殊武器」对待
	*/

	// get carriedBlock(): Block {return this._carriedBlock;}
	// get isCarriedBlock(): boolean {return this._carriedBlock !== null && this._carriedBlock.visible;}

	// !【2023-09-30 13:21:34】`Game.testFullPlayerCanPass`移动到此，并被移除

	//====Functions About Respawn====//
	/**
	 * 处理「重生」
	 * * 功能：实现玩家在「死后重生」的等待时间
	 * * 重生后「剩余生命值」递减
	 * 
	 * 逻辑：
	 * * 「重生延时」递减
	 * * 到一定程度后⇒处理「重生」
	 *   * 重置到「未开始计时」状态
	 *   * 自身「剩余生命数」递减
	 *   * 调用世界机制代码，设置玩家在世界内的状态
	 *	 * 寻找并设置坐标在「合适的重生点」
	 *	 * 生成一个「重生」特效
	 *   * 发送事件「重生时」
	 */
	protected dealRespawn(host: IMatrix): void {
		if (this._respawnTick > 0)
			this._respawnTick--;
		else {
			this._respawnTick = -1;
			if (!this._lifeNotDecay && this._lives > 0)
				this._lives--;
			// 自身回满血
			this._HP = this._maxHP; // ! 无需显示更新
			// 触发母体响应：帮助安排位置、添加特效等
			respawnPlayer(host, this);
			this.onRespawn(host);
		}
	}

	//====Functions About Tool====//
	onToolChange(oldT: Tool, newT: Tool): void {
		// TODO: 不再使用（待迁移）
	}

	/**
	 * 处理玩家工具的使用时间（冷却+充能）
	 * * 每个世界刻调用一次
	 * * 逻辑：
	 *   * CD未归零⇒CD递减 + GUI更新CD
	 *   * CD已归零⇒
	 *	 * 无需充能⇒在使用⇒使用工具
	 *	 * 需要充能⇒正向充能|反向充能（现在因废弃掉`-1`的状态，不再需要「初始化充能」了）
	 * * 【2023-09-26 23:55:48】现在使用武器自身的数据，但「使用逻辑」还是在此处
	 *   * 一个是为了显示更新方便
	 *   * 一个是为了对接逻辑方便
	 * 
	 * ! 注意：因为「使用武器」需要对接母体，所以需要传入母体参数
	*/
	protected dealUsingTime(host: IMatrix): void {
		// *逻辑：要么「无需冷却」，要么「冷却方面已允许自身使用」
		if (!this._tool.needsCD || this._tool.dealCD(this._isUsing)) {
			// this._GUI.updateCD(); // TODO: 显示更新冷却
			// *逻辑：需要充能⇒必定能使用
			if (!this._tool.needsCharge || this.tool.dealCharge(this._isUsing)) {
				// 使用工具
				this.directUseTool(host);
				// 使用之后再重置
				this._tool.resetUsingState(
					// * 现在加入「冷却减免」参数
					computeFinalCD(
						this._tool.baseCD,
						this.attributes.buffCD,
					)
				);
				// this._GUI.updateCharge(); // TODO: 显示更新
			}
		}
	}

	//====Functions About Graphics====//

	// TODO: 日后呈现时可能会用到这段代码
	/* setCarriedBlock(block: Block, copyBlock: boolean = true): void {
		if (block === null) {
			this._carriedBlock.visible = false;
		}
		else {
			if (this._carriedBlock !== null && this.contains(this._carriedBlock))
				this.removeChild(this._carriedBlock);
			this._carriedBlock = copyBlock ? block.copy() : block;
			this._carriedBlock.x = DEFAULT_SIZE / 2;
			this._carriedBlock.y = -DEFAULT_SIZE / 2;
			this._carriedBlock.alpha = Player.CARRIED_BLOCK_ALPHA;
			this.addChild(this._carriedBlock);
		}
	} */

	/* protected addChildren(): void {
		host.playerGUIContainer.addChild(this._GUI);
	} */

	//====Control Functions====//

	// *独有* //
	startUsingTool(host: IMatrix): void {
		this._isUsing = true;
	}

	stopUsingTool(host: IMatrix): void {
		this._isUsing = false;
	}

	directUseTool(host: IMatrix): void {
		// ! 一般来说，「直接使用工具」都是在「无冷却」的时候使用的
		// this._tool.onUseByPlayer(host, this); // !【2023-10-05 17:17:26】现在使用注册表，因此废弃
		playerUseTool(
			host,
			this, this._direction,
			this._tool.chargingPercent
		);
		// // 工具使用后⇒通知GUI更新
		// if (this.toolNeedsCharge) // TODO: 待显示模块完善
		// 	this._GUI.updateCharge();
	}

	/**
	 * 主要职责：管理玩家的「基本操作」「行为缓冲区」，与外界操作（控制器等）进行联络
	 * * 目前一个玩家对应一个「控制器」
	 */

	/**
	 * 缓存玩家「正在使用工具」的状态
	 * * 目的：保证玩家是「正常通过『冷却&充能』的方式使用工具」的
	 */
	protected _isUsing: boolean = false;
	get isUsing(): boolean { return this._isUsing; }

	/**
	 * 处理与「控制器」的关系
	 */
	protected dealController(host: IMatrix): void {
		if (this._controller !== undefined) {
			// *【2023-10-09 21:19:27】现在也使用「事件分派」而非「特定名称函数」通知控制器了
			this._controller?.reactPlayerEvent<NativePlayerEventOptions, NativePlayerEvent.TICK>(
				NativePlayerEvent.TICK,
				this,
				host,
				undefined
			)
		}
	}

	/**
	 * @override 覆盖增加有关「工具使用」的动作类型
	 */
	override runAction(host: IMatrix, action: PlayerAction): boolean {
		// 超类逻辑
		if (super.runAction(host, action)) return true;
		// 其它枚举类
		else switch (action) {
			case EnumPlayerAction.DISABLE_CHARGE:
				if (this._isUsing) {
					this.stopUsingTool(host);
					this.startUsingTool(host);
				}
				return true;
			case EnumPlayerAction.START_USING:
				this.startUsingTool(host);
				return true;
			case EnumPlayerAction.STOP_USING:
				this.stopUsingTool(host);
				return true;
		}
		// 没有动作被执行
		return false;
	}

}
