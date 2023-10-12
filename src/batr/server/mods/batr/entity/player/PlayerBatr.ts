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
import { NativeDecorationLabel } from "../../../../../display/mods/native/entity/player/NativeDecorationLabels";
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

/**
 * 「Batr玩家」的主类
 * * 承继自AS3版本的「Player」类
 * * 具体特性参考「IPlayerBatr」所实现的各个接口
 * 
 * !【2023-10-08 17:19:26】现在「从接口实现的属性/方法」不再外加访问修饰符，以便和「非接口实现」的属性/方法区分
 */
export default class PlayerBatr extends Entity implements IPlayerBatr {

	// 判断「是玩家」标签
	public readonly i_isPlayer: true = true;


	// !【2023-10-01 16:14:36】现在不再因「需要获取实体类型」而引入`NativeEntityTypes`：这个应该在最后才提供「实体类-id」的链接（并且是给母体提供的）

	public static readonly DEFAULT_MAX_HP: int = 100;
	public static readonly DEFAULT_HP: int = PlayerBatr.DEFAULT_MAX_HP;
	public static readonly MAX_DAMAGE_DELAY: uint = 0.5 * FIXED_TPS;

	// **独有属性** //

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

	// 自定义名称 //

	/** 玩家的自定义名称（不受国际化影响） */
	protected _customName: string = 'noname';
	/** 玩家的自定义名称（不受国际化影响） */
	get customName(): string { return this._customName; }
	set customName(value: string) {
		if (value !== this._customName) {
			this._customName = value;
			// this._GUI.updateName(); // TODO: 显示更新
		}
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

	// 生命（有生命实体） //
	readonly i_hasHP: true = true;
	readonly i_hasHPAndHeal: true = true;
	readonly i_hasHPAndLives: true = true;

	/** 玩家内部生命值 */
	protected _HP: uint = PlayerBatr.DEFAULT_HP
	/**
	 * 玩家生命值
	 * 
	 * !【2023-09-28 20:31:19】注意：生命值的更新（触发「伤害」「死亡」等事件）涉及母体，非必要不要走这个setter
	 * * 请转向「专用方法」如`addHP`
	 */
	get HP(): uint { return this._HP; }
	set HP(value: uint) {
		if (value == this._HP) return;
		this._HP = intMin(value, this._maxHP);
		// *【2023-09-28 20:32:49】更新还是要更新的
		// if (this._GUI !== null)
		// this._GUI.updateHP(); // TODO: 显示更新
	}

	/** 玩家内部最大生命值 */
	protected _maxHP: uint = PlayerBatr.DEFAULT_MAX_HP
	/** 玩家生命值 */ // * 设置时无需过母体，故无需只读
	get maxHP(): uint { return this._maxHP; }
	set maxHP(value: uint) {
		if (value == this._maxHP)
			return;
		this._maxHP = value;
		if (value < this._HP)
			this._HP = value;
		// this._GUI.updateHP(); // TODO: 显示更新
	}

	/** 玩家的「治疗值」（储备生命值） */
	protected _heal: uint = 0;
	/** 玩家储备生命值 */ // * 设置时无需过母体，故无需只读
	get heal(): uint { return this._heal; }
	set heal(value: uint) {
		if (value == this._heal) return;
		this._heal = value;
		// this._GUI.updateHP(); // TODO: 显示更新
	}
	/** （衍生）是否满生命值 */
	get isFullHP(): boolean { return this._HP >= this._maxHP; }
	/** （衍生）是否空生命值 */
	get isEmptyHP(): boolean { return this._HP == 0; }
	/** 玩家的「生命百分比」 */
	get HPPercent(): number { return this.HP / this.maxHP; }

	/** 上一个伤害它的玩家（弃用） */
	// protected _lastHurtByPlayer: IPlayer | null = null;
	/** 伤害延时（用于陷阱等「持续伤害玩家」的伤害源） */
	protected _damageDelay: int = 0;
	/** 治疗延时（用于在「储备生命值」治疗玩家时延时） */
	protected _healDelay: uint = 0;

	/**
	 * 增加生命值
	 * * 需要母体以处理「伤害」「死亡」事件
	 */
	addHP(host: IMatrix, value: uint, healer: IPlayer | null = null): void {
		this.HP += value;
		this.onHeal(host, value, healer);
	}

	removeHP(host: IMatrix, value: uint, attacker: IPlayer | null = null): void {
		// 非致死⇒受伤
		if (this.HP > value) {
			this.HP -= value;
			// 触发钩子
			this.onHurt(host, value, attacker);
		}
		// 致死⇒死亡
		else {
			this.HP = 0;
			// 触发钩子
			this.onDeath(host, value, attacker);
		}
	}

	// 生命值文本
	get HPText(): string {
		let HPText: string = `${this._HP}/${this._maxHP}`;
		let healText: string = this._heal === 0 ? '' : `<${this._heal}>`;
		let lifeText: string = this._lifeNotDecay ? '' : `[${this._lives}]`;
		return HPText + healText + lifeText;
	}

	/**
	 * 处理「储备生命值」
	 * * 📌机制：生命百分比越小，回复速度越快
	 */
	dealHeal(): void {
		if (this._heal < 1) return;
		if (this._healDelay > TPS * (0.1 + this.HPPercent * 0.15)) {
			if (this.isFullHP) return;
			this._healDelay = 0;
			this._heal--;
			this.HP++;
		}
		else {
			this._healDelay++;
		}
	}

	/** 玩家的剩余生命数 */
	protected _lives: uint = 0;
	get lives(): uint { return this._lives; }
	set lives(value: uint) {
		if (value !== this._lives) {
			this._lives = value;
			// this._GUI.updateHP(); // TODO: 显示更新
		}
	}

	/** 玩家剩余生命数是否会随「死亡」而减少 */
	protected _lifeNotDecay: boolean = false;
	get lifeNotDecay(): boolean { return this._lifeNotDecay; }
	set lifeNotDecay(value: boolean) {
		if (value !== this._lifeNotDecay) {
			this._lifeNotDecay = value;
			// this._GUI.updateHP(); // TODO: 显示更新
		}
	}

	/**
	 * 重生刻
	 * * `-1`意味着「不在重生时」
	 */
	protected _respawnTick: int = -1;
	/** 玩家是否在重生 */
	get isRespawning(): boolean { return this._respawnTick >= 0; }

	/** 
	 * （原`isCertainlyOut`）玩家是否「耗尽生命」
	 * * 机制：剩余生命值=0 && 剩余生命数=0
	 */
	get isNoLives(): boolean {
		return (
			this.HP == 0 &&
			this.lives == 0
		);
	}

	/**
	 * 以整数设置生命
	 * * 负数⇒无限
	 * 
	 * @param lives 生命数
	 */
	setLifeByInt(lives: int): void {
		// 负数⇒无限
		if (lives < 0) {
			this._lifeNotDecay = true;
		}
		// 非负⇒有限
		else {
			this._lifeNotDecay = false;
			this._lives = lives;
		}
	}

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

	// 控制器 // TODO: 模仿AI玩家，实现其「操作缓冲区」「自动执行」等

	// !【2023-09-28 18:13:17】现不再在「玩家」一侧绑定「控制器」链接，改由「母体⇒控制器⇒玩家」的调用路线


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
	constructor(
		position: iPoint, direction: mRot,
		isActive: boolean = true,
		team: PlayerTeam,
		tool: Tool,
		fillColor: number = team.color,
		lineColor: number = halfBrightnessTo(fillColor)
	) {
		super();
		this._isActive = isActive;

		// 独有属性 //
		this._team = team;
		this._tool = tool;

		// 有方向实体 & 格点实体 //
		this._position.copyFrom(position);
		this._direction = direction

		// 有统计实体 //
		this._stats = new PlayerStats(this);

		// 可显示实体 //
		this._fillColor = fillColor;
		this._fillColor2 = turnBrightnessTo(fillColor, 0.75);
		this._lineColor = lineColor;
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

	// 格点实体 //
	// readonly i_inGrid: true = true;

	protected _position: iPoint = new iPoint();
	get position(): iPoint { return this._position }
	setPosition(host: IMatrix, position: iPoint, needHook: boolean): void {
		// * 原Entity中`setXY`、`setPosition`的事 * //
		// !【2023-10-08 17:13:08】在涉及「设置内部状态」的地方，统一调用钩子函数，不处理涉及母体的逻辑
		// 位置更改前
		if (needHook) this.onLocationChange(host, this._position)
		// 更改位置
		if (position === this._position)
			console.trace('不建议「先变更位置」，再`setPosition`的「先斩后奏」方法')
		this._position.copyFrom(position);
		// 位置更改后
		if (needHook) this.onLocationChanged(host, this._position)
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

	// 有方向实体 //
	protected _direction: mRot;
	get direction(): mRot { return this._direction; }
	set direction(value: mRot) { this._direction = value; }

	// 有统计 //
	readonly i_hasStats: true = true;

	protected _stats: PlayerStats;
	get stats(): PlayerStats { return this._stats }

	// 可显示实体 // TODO: 【2023-09-28 18:22:42】这是不是要移出去。。。

	/** 显示时的像素大小 */
	static readonly SIZE: number = 1 * DEFAULT_SIZE;
	/** 线条粗细 */
	static readonly LINE_SIZE: number = DEFAULT_SIZE / 96;
	/** 所持有方块（若武器有🤔）的透明度 */
	static readonly CARRIED_BLOCK_ALPHA: number = 1 / 4;

	/** 线条颜色 */
	protected _lineColor: uint = 0x888888;
	get lineColor(): uint { return this._lineColor; }
	/** 填充颜色1 */
	protected _fillColor: uint = 0xffffff;
	get fillColor(): uint { return this._fillColor; }
	/** 填充颜色2（用于渐变） */
	protected _fillColor2: uint = 0xcccccc;
	/** 用于判断「装饰类型」的标记 */
	decorationLabel: NativeDecorationLabel = NativeDecorationLabel.EMPTY;

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

		// 通知控制器
	}

	onLevelup(host: IMatrix): void {
		handlePlayerLevelup(host, this);

		// 通知控制器
	}

	//====Functions About World====//

	// get carriedBlock(): Block {return this._carriedBlock;}
	// get isCarriedBlock(): boolean {return this._carriedBlock !== null && this._carriedBlock.visible;}

	onPositedBlockUpdate(host: IMatrix, ignoreDelay: boolean = false, isLocationChange: boolean = false): void {
		this.dealMoveInTest(host, ignoreDelay, isLocationChange);
	}

	dealMoveInTest(host: IMatrix, ignoreDelay: boolean = false, isLocationChange: boolean = false): void {
		// 忽略（强制更新）伤害延迟⇒立即开始判定
		if (ignoreDelay) {
			playerMoveInTest(host, this, isLocationChange); // !原`Game.moveInTestPlayer`，现在已经提取到「原生世界机制」中
			this._damageDelay = PlayerBatr.MAX_DAMAGE_DELAY;
		}
		// 否则，若「伤害延迟」未归零⇒伤害延迟递减
		else if (this._damageDelay > 0) {
			this._damageDelay--;
		}
		// 否则，「伤害延迟」归零 && 方块对玩家执行了副作用⇒「伤害延迟」重置（&&继续）
		else if (this._damageDelay == 0 && playerMoveInTest(host, this, isLocationChange)) { // !原`Game.moveInTestPlayer`，现在已经提取到「原生世界机制」中
			this._damageDelay = PlayerBatr.MAX_DAMAGE_DELAY;
		}
		// 否则⇒停止状态检测
		else if (this._damageDelay > -1) {
			this._damageDelay = -1;
		}
	}

	protected _temp_testCanGoForward_P: iPoint = new iPoint();
	testCanGoForward(host: IMatrix, rotatedAsRot?: number | undefined, avoidHurt?: boolean | undefined, avoidOthers?: boolean | undefined, others?: IEntityInGrid[] | undefined): boolean {
		return this.testCanGoTo(host,
			host.map.towardWithRot_II(
				this._temp_testCanGoForward_P.copyFrom(this.position),
				this._direction, 1
			),
			avoidHurt,
			avoidOthers, others
		);
	}

	testCanGoTo(
		host: IMatrix, p: iPointRef,
		avoidHurt: boolean = false,
		avoidOthers: boolean = true,
		others: IEntityInGrid[] = [],
	): boolean {
		return host.map.testCanPass_I(
			p,
			true, false, false,
			avoidHurt,
			avoidOthers, others,
		)
	}

	// !【2023-09-30 13:21:34】`Game.testFullPlayerCanPass`移动到此，并被移除

	//====Functions About Respawn====//
	/**
	 * 处理重生
	 * * 重生后「剩余生命值」递减
	 */
	dealRespawn(host: IMatrix): void {
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
	/**
	 * 主要职责：管理玩家的「基本操作」「行为缓冲区」，与外界操作（控制器等）进行联络
	 * * 目前一个玩家对应一个「控制器」
	 * 
	 */

	/**
	 * 缓存玩家「正在使用工具」的状态
	 * * 目的：保证玩家是「正常通过『冷却&充能』的方式使用工具」的
	 */
	protected _isUsing: boolean = false;
	get isUsing(): boolean { return this._isUsing; }

	// !【2023-09-23 16:53:17】把涉及「玩家基本操作」的部分留下（作为接口），把涉及「具体按键」的部分外迁
	// !【2023-09-27 20:16:04】现在移除这部分的所有代码到`KeyboardController`中
	// ! 现在这里的代码尽可能地使用`setter`
	// TODO: 【2023-09-27 22:34:09】目前这些「立即执行操作」还需要以「PlayerIO」的形式重构成「读取IO⇒根据读取时传入的『母体』行动」
	/**
	 * 控制这个玩家的世界控制器
	 */
	protected _controller: PlayerController | null = null;
	get controller(): PlayerController | null { return this._controller; }

	// !【2023-10-04 22:52:46】原`Game.movePlayer`已被内置至此
	moveForward(host: IMatrix): void {
		// 能前进⇒前进 // !原`host.movePlayer`
		if (this.testCanGoForward(
			host, this._direction,
			false, true, getPlayers(host)
		))
			// 向前移动
			this.setPosition(
				host,
				// 不能在
				host.map.towardWithRot_II(
					this._temp_moveForward.copyFrom(this.position),
					this._direction,
					1
				),
				true
			)
		// !【2023-10-04 22:55:35】原`onPlayerMove`已被取消
		// TODO: 显示更新
	}
	protected _temp_moveForward: iPoint = new iPoint();

	turnTo(host: IMatrix, direction: number): void {
		this._direction = direction
		// TODO: 显示更新
	}

	turnBack(host: IMatrix): void {
		this.direction = toOpposite_M(this._direction);
		// TODO: 显示更新
	}

	// 可选
	turnRelative(host: IMatrix): void {

	}

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

	moveToward(host: IMatrix, direction: mRot): void {
		// host.movePlayer(this, direction, this.moveDistance);
		this.turnTo(host, direction); // 使用setter以便显示更新
		this.moveForward(host);
	}

	/**
	 * 连接到一个控制器
	 */
	connectController(controller: PlayerController): void {
		// 设置对象
		this._controller = controller;
		// 添加订阅
		this._controller.addSubscriber(this);
	}

	/**
	 * 与当前控制器断开
	 */
	disconnectController(): void {
		// 移除订阅
		this._controller?.removeSubscriber(this);
		// 设置对象
		this._controller = null;
	}

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
	 * 玩家动作缓冲区
	 * * 用于对「控制器异步输入的行为」进行缓存
	 * * 正常情况下应该是空的——即没有「被阻塞」，所有事件在一送进来后便执行
	 */
	protected readonly _actionBuffer: PlayerAction[] = [];
	/**
	 * 处理「缓存的玩家操作」
	 * * 逻辑：一次执行完所有缓冲的「玩家动作」，然后清空缓冲区
	 */
	protected dealCachedActions(host: IMatrix): void {
		if (this._actionBuffer.length === 0) return;
		else {
			this.runAllActions(host);
			this.clearActionBuffer();
		}
	}

	/**
	 * 执行玩家动作
	 * * 参见`PlayerAction`
	 */
	protected runAction(host: IMatrix, action: PlayerAction): void {
		// 整数⇒处理转向相关
		if (typeof action === 'number') {
			// 非负⇒转向
			if (action >= 0) {
				this.turnTo(host, action);
			}
			// 负数⇒转向&移动
			else {
				this.moveToward(host, -action - 1);
			}
		}
		// 其它枚举类
		else switch (action) {
			case EnumPlayerAction.DISABLE_CHARGE:
				if (this._isUsing) {
					this.stopUsingTool(host);
					this.startUsingTool(host);
				}
				break;
			case EnumPlayerAction.NULL:
				break;
			case EnumPlayerAction.MOVE_FORWARD:
				this.moveForward(host);
				break;
			case EnumPlayerAction.START_USING:
				this.startUsingTool(host);
				break;
			case EnumPlayerAction.STOP_USING:
				this.stopUsingTool(host);
				break;
			case EnumPlayerAction.MOVE_BACK:
				this.turnBack(host);
				this.moveForward(host);
				break;
		}
	}

	/**
	 * 执行所有已缓冲的玩家动作
	 * * 执行所有的玩家动作
	 * 
	 * ! 不会清空「动作缓冲区」
	 */
	protected runAllActions(host: IMatrix): void {
		for (this._temp_runAllActions_i = 0; this._temp_runAllActions_i < this._actionBuffer.length; this._temp_runAllActions_i++) {
			this.runAction(host, this._actionBuffer[this._temp_runAllActions_i]);
		}
	}
	protected _temp_runAllActions_i: uint = 0;

	/**
	 * 清除所有的玩家动作
	 * * 技术原理：直接设置length属性
	 */
	protected clearActionBuffer(): void {
		this._actionBuffer.length = 0;
	}

	/**
	 * 实现：从「收到世界事件」到「缓冲操作」再到「执行操作」
	 * * 功能：
	 *   * 「添加行为」⇒直接添加到「缓存的行为」中
	 * 
	 * @param type 
	 * @param args 
	 */
	onReceive(type: string, action: PlayerAction | undefined = undefined): void {
		switch (type) {
			// 增加待执行的行为
			case ADD_ACTION:
				if (action === undefined) throw new Error('未指定要缓存的行为！');
				this._actionBuffer.push(action as PlayerAction);
				break;
		}
	}

}