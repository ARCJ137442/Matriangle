import { randInt } from "../../../../common/exMath";
import { iPoint, fPoint } from "../../../../common/geometricTools";
import { randomWithout, randomIn, clearArray } from "../../../../common/utils";
import BonusBoxSymbol from "../../../../display/mods/native/entity/BonusBoxSymbol";
import { uint, int } from "../../../../legacy/AS3Legacy";
import Block from "../../../api/block/Block";
import { iRot } from "../../../general/GlobalRot";
import { alignToGridCenter_P } from "../../../general/PosTransform";
import { randomTickEventF } from "../../../main/GameEventPatcher";
import { PROJECTILES_SPAWN_DISTANCE } from "../../../main/GlobalGameVariables";
import IBatrGame from "../../../main/IBatrGame";
import BlockColored from "../blocks/Colored";
import BlockGate from "../blocks/Gate";
import BonusBox from "../entities/item/BonusBox";
import Player from "../entities/player/Player";
import PlayerTeam from "../entities/player/team/PlayerTeam";
import ThrownBlock from "../entities/projectile/other/ThrownBlock";
import LaserAbsorption from "../entities/projectile/laser/LaserAbsorption";
import LaserBasic from "../entities/projectile/laser/LaserBasic";
import LaserPulse from "../entities/projectile/laser/LaserPulse";
import LaserTeleport from "../entities/projectile/laser/LaserTeleport";
import GameRule_V1 from "../rule/GameRule_V1";
import Tool from "../tool/Tool";
import { MoveableWall, NativeBlockTypes } from "./BlockTypeRegistry";
import { BonusType, NativeBonusTypes } from "./BonusRegistry";
import Projectile from "../entities/projectile/Projectile";
import Wave from "../entities/projectile/other/Wave";
import { NativeTools } from './ToolRegistry';
import IPlayer from "../entities/player/IPlayer";
import AIController from "../entities/player/controller/AIController";
import { KeyCode, keyCodes } from "../../../../common/keyCodes";
import { HSVtoHEX } from "../../../../common/color";
import { uniSaveJSObject, uniLoadJSObject } from "../../../../common/JSObjectify";


/**
 * 所有游戏的「原生逻辑」
 * * 【2023-09-17 16:03:55】现在使用静态函数，实现「bonusBox无关」的Julia风格方法
 * * 用这样一个「事件注册」类承担所有的导入，让「方块」「实体」等类实现轻量化
 * 
 * TODO: 是否「显示事件」也要这样「外包到『事件注册表』中」去？
 */

//================ 主要机制 ================//

/**
 * 当玩家「得到奖励」所用的逻辑
 * 
 * TODO: 似乎应该提取到「游戏逻辑」中，而非放到实体这里
 * 
 * @param host 调用的游戏主体
 * @param player 奖励箱将作用到的玩家
 * @param forcedBonusType 要强制应用的类型（若非空则强制应用此类型的奖励）
 */
export function playerPickupBonusBox(
    host: IBatrGame, player: IPlayer, bonusBox: BonusBox,
    forcedBonusType: BonusType = bonusBox.bonusType
): void {
    if (player == null)
        return;
    // Deactivate
    bonusBox.isActive = false;
    // Effect
    let buffColor: int = -1;
    switch (forcedBonusType) {
        // Health,Heal&Life
        case NativeBonusTypes.ADD_HEALTH:
            player.addHealth(5 * (1 + randInt(10)), null);
            break;
        case NativeBonusTypes.ADD_HEAL:
            player.heal += 5 * (1 + randInt(25));
            break;
        case NativeBonusTypes.ADD_LIFE:
            if (player.infinityLife || player.isFullHP)
                player.maxHP += host.rule.getRule(GameRule_V1.key_bonusMaxHealthAdditionAmount) as uint; // ! 可能出错
            else
                player.lives++;
            break;
        // Tool
        case NativeBonusTypes.RANDOM_TOOL:
            player.tool = randomWithout(host.rule.getRule(GameRule_V1.key_enabledTools) as Tool[], player.tool);
            break;
        // Attributes
        case NativeBonusTypes.BUFF_RANDOM:
            playerPickupBonusBox(host, player, bonusBox, randomIn(NativeBonusTypes._ABOUT_BUFF));
            return;
        case NativeBonusTypes.BUFF_DAMAGE:
            player.buffDamage += host.rule.getRule(GameRule_V1.key_bonusBuffAdditionAmount) as uint;
            buffColor = BonusBoxSymbol.BUFF_DAMAGE_COLOR;
            break;
        case NativeBonusTypes.BUFF_CD:
            player.buffCD += host.rule.getRule(GameRule_V1.key_bonusBuffAdditionAmount) as uint;
            buffColor = BonusBoxSymbol.BUFF_CD_COLOR;
            break;
        case NativeBonusTypes.BUFF_RESISTANCE:
            player.buffResistance += host.rule.getRule(GameRule_V1.key_bonusBuffAdditionAmount) as uint;
            buffColor = BonusBoxSymbol.BUFF_RESISTANCE_COLOR;
            break;
        case NativeBonusTypes.BUFF_RADIUS:
            player.buffRadius += host.rule.getRule(GameRule_V1.key_bonusBuffAdditionAmount) as uint;
            buffColor = BonusBoxSymbol.BUFF_RADIUS_COLOR;
            break;
        case NativeBonusTypes.ADD_EXPERIENCE:
            player.experience += ((player.level >> 2) + 1) << 2;
            buffColor = BonusBoxSymbol.EXPERIENCE_COLOR;
            break;
        // Team
        case NativeBonusTypes.RANDOM_CHANGE_TEAM:
            host.randomizePlayerTeam(player);
            break;
        case NativeBonusTypes.UNITE_AI:
            host.setATeamToAIPlayer(
                randomIn(host.rule.getRule(GameRule_V1.key_playerTeams) as PlayerTeam[])
            );
            break;
        case NativeBonusTypes.UNITE_PLAYER:
            host.setATeamToNotAIPlayer(
                randomIn(host.rule.getRule(GameRule_V1.key_playerTeams) as PlayerTeam[])
            );
            break;
        // Other
        case NativeBonusTypes.RANDOM_TELEPORT:
            host.spreadPlayer(player, false, true);
            break;
    }
    // 广义的右下角添加效果
    if (buffColor >= 0)
        host.addPlayerLevelupEffect(player.position.copy().addFromSingle(0.5), buffColor, 0.75);
    // Stats Operations
    player.stats.pickupBonusBoxCount++;
    // Remove
    host.entitySystem.remove(bonusBox);
}

//================ 方块随机刻函数 ================//

/**
 * * 事件处理函数API：可访问游戏实例，参与调用游戏API（生成实体、放置其它方块等）
 * 
 * （示例）响应游戏随机刻 @ MoveableWall
 * * 机制：「可移动的墙」在收到一个随机刻时，开始朝周围可以移动的方向进行移动
 * * 原`moveableWallMove`
 * 
 * ? 是否可以放开一点，通过TS合法手段让`block`成为任意`Block`的子类
 * @param host 调用此函数的游戏主体
 * @param block 被调用的方块
 * @param position 被调用方块的位置
 */
export const randomTick_MoveableWall: randomTickEventF = (host: IBatrGame, block: Block, position: iPoint): void => {
    let randomRot: uint, tPoint: fPoint;
    // add laser by owner=null
    let p: ThrownBlock;
    let i: uint = 0;
    do {
        randomRot = host.map.storage.randomForwardDirectionAt(position);
        tPoint = host.map.towardWithRot_FF(position, randomRot);
        if (
            host.map.isInMap_I(position) ||
            !host.map.testCanPass_F(tPoint, false, true, false, false)
        ) continue;
        p = new ThrownBlock(
            null, // 无主
            alignToGridCenter_P(position, _temp_randomTick_MoveableWall),
            Math.random(),
            NativeTools.WEAPON_BLOCK_THROWER.defaultDamage,
            block, // ! 【2023-09-22 22:32:47】现在在构造函数内部会自行拷贝
            randomRot,
        );
        host.map.storage.setVoid(position);
        host.entitySystem.register(p); // TODO: 不区分类型——后期完善实体系统时统一分派
        // console.log('laser at'+'('+p.entityX+','+p.entityY+'),'+p.life,p.length,p.visible,p.alpha,p.owner);
        if ((block as MoveableWall).virus)
            break;
    }
    while (++i < 0x10);
}
const _temp_randomTick_MoveableWall: fPoint = new fPoint();

/**
 * （示例）响应游戏随机刻 @ ColorSpawner
 * * 机制：当「颜色生成器」收到一个随机刻时，随机在「周围曼哈顿距离≤2处」生成一个随机颜色的「颜色块」
 * * 原`colorSpawnerSpawnBlock`
 * 
 * @param host 调用此函数的游戏主体
 * @param block 被调用的方块
 * @param position 被调用方块的位置
 */
export const randomTick_ColorSpawner: randomTickEventF = (host: IBatrGame, block: Block, position: iPoint): void => {
    let randomPoint: iPoint = host.map.storage.randomPoint;
    let newBlock: Block = BlockColored.randomInstance(NativeBlockTypes.COLORED);
    if (!host.map.isInMap_I(randomPoint) && host.map.storage.isVoid(randomPoint)) {
        host.setBlock(randomPoint, newBlock); // * 后续游戏需要处理「方块更新事件」
        host.addBlockLightEffect2(
            alignToGridCenter_P(randomPoint, _temp_randomTick_ColorSpawner),
            newBlock, false
        );
    }
}
const _temp_randomTick_ColorSpawner: fPoint = new fPoint();

/**
 * （示例）响应游戏随机刻 @ LaserTrap
 * * 机制：当「激光陷阱」收到一个随机刻时，随机向周围可发射激光的方向发射随机种类的「无主激光」
 * * 原`laserTrapShootLaser`
 * 
 * ! 性能提示：此处使用copy新建了多维点对象
 * 
 * @param host 调用此函数的游戏主体
 * @param block 被调用的方块
 * @param position 被调用方块的位置
 */
export const randomTick_LaserTrap: randomTickEventF = (
    host: IBatrGame, block: Block, position: iPoint): void => {
    let sourceX = position.x, sourceY = position.y; // TODO: 这里的东西需要等到后期「对实体的多维坐标化」后再实现「多维化」
    let randomR: iRot, entityX: number, entityY: number, laserLength: number = 0;
    // add laser by owner=null
    let p: LaserBasic, tp: fPoint, entityP: fPoint;
    let i: uint = 0;
    do {
        randomR = host.map.storage.randomForwardDirectionAt(position);
        tp = host.map.towardWithRot_FF(
            position,
            randomR, PROJECTILES_SPAWN_DISTANCE
        );
        entityP = alignToGridCenter_P(position, new fPoint()).addFrom(tp);
        entityX = entityP.x;
        entityY = entityP.y;
        if (host.map.isInMap_F(entityP))
            continue;
        laserLength = host.getLaserLength2(position, randomR);
        if (laserLength <= 0)
            continue;
        switch (randInt(4)) {
            case 1:
                p = new LaserTeleport(
                    null, position, randomR,
                    NativeTools.WEAPON_LASER_TELEPORT.defaultDamage,
                    laserLength
                );
                break;
            case 2:
                p = new LaserAbsorption(
                    null, position, randomR,
                    NativeTools.WEAPON_LASER_ABSORPTION.defaultDamage,
                    laserLength
                );
                break;
            case 3:
                p = new LaserPulse(
                    null, position, randomR,
                    NativeTools.WEAPON_LASER_PULSE.defaultDamage,
                    Math.random(),
                    laserLength,
                );
                break;
            default:
                p = new LaserBasic(
                    null, position, randomR,
                    NativeTools.WEAPON_LASER_BASIC.defaultDamage,
                    1.0,
                    laserLength,
                );
                break;
        }
        if (p != null) {
            host.entitySystem.register(p);
            // host.projectileContainer.addChild(p);
            // console.log('laser at'+'('+p.entityX+','+p.entityY+'),'+p.life,p.length,p.visible,p.alpha,p.owner);
        }
    }
    while (laserLength <= 0 && ++i < 0x10);
}

/**
 * （示例）响应游戏随机刻 @ Gate
 * * 机制：当「门」收到一个随机刻且是关闭时，切换其开关状态
 * 
 * @param host 调用此函数的游戏主体
 * @param block 被调用的方块
 * @param position 被调用方块的位置
 */
export const randomTick_Gate: randomTickEventF = (host: IBatrGame, block: Block, position: iPoint): void => {
    let newBlock: BlockGate = block.clone() as BlockGate // ! 原方块的状态不要随意修改！
    newBlock.open = true;
    host.setBlock(position, newBlock);
}

/**
 * 根据「队伍id」判断「是否互为敌方」
 * @param player 其中一个玩家
 * @param other 另一个玩家
 * @returns 是否「互为敌方」
 */
export function isEnemy(player: IPlayer, other: IPlayer): boolean {
    return player.team.id != other.team.id;
}

/**
 * 根据「队伍id」判断「是否互为友方」
 * @param player 其中一个玩家
 * @param other 另一个玩家
 * @returns 是否「互为友方」
 */
export function isAlly(player: IPlayer, other: IPlayer): boolean {
    return player.team.id == other.team.id;
}

/**
 * 判断「玩家发射的抛射体是否能伤害另一位玩家」
 * * 重定向至「玩家是否能伤害玩家」，并使用抛射体自身属性
 * @param projectile 抛射体
 * @param other 可能被伤害的玩家
 * @returns 「是否能伤害」
 */
export function projectileCanHurtOther(
    projectile: Projectile, other: IPlayer,
): boolean {
    return playerCanHurtOther(
        projectile.owner, other,
        projectile.canHurtEnemy,
        projectile.canHurtSelf,
        projectile.canHurtAlly
    );
}

/**
 * 判断「玩家(发射的抛射物/使用的武器)是否能伤害另一位玩家」
 * * 逻辑：要么为空「无主⇒可伤害任何玩家」，要么根据配置判断
 * @param player 可能造成伤害的玩家
 * @param other 可能被伤害的玩家
 * @param canHurtEnemy 是否允许伤害敌方
 * @param canHurtSelf 是否允许伤害自身 
 * @param canHurtAlly 是否允许伤害友方
 * @returns 「是否能伤害」
 */
export function playerCanHurtOther(
    player: IPlayer | null, other: IPlayer,
    canHurtEnemy: boolean,
    canHurtSelf: boolean,
    canHurtAlly: boolean,
): boolean {
    return player == null || (
        isEnemy(player, other) && canHurtEnemy || // 敌方
        player === other && canHurtSelf || // 自己（使用全等运算符）
        isAlly(player, other) && canHurtAlly // 友方
    );
}

// 抛射物逻辑 //

/**
 * 抛射体「波浪」伤害玩家的逻辑
 * @param host 游戏主体
 * @param wave 在其中运行的抛射体「波浪」
 */
export function waveHurtPlayers(host: IBatrGame, wave: Wave): void {
    /** 引用 */
    let base: fPoint = wave.position;
    /** Wave的尺寸即为其伤害半径 */
    let radius: number = wave.nowScale;
    // 开始遍历所有玩家
    for (let victim of host.entitySystem.players) {
        // FinalDamage
        if (projectileCanHurtOther(wave, victim)) {
            if (base.getDistance(victim.position) <= radius) {
                victim.removeHealth(wave.attackerDamage, wave.owner);
            }
        }
    }
}

/**
 * （原「是否为AI玩家」）判断一个玩家是否「受AI操控」
 * * 原理：使用「控制器是否为『AI控制器』」判断
 */
export function isAIControl(player: IPlayer): boolean {
    return player.controller instanceof AIController;
}

/**
 * 【玩家】获取一个玩家升级所需的经验
 * * 算法：(等级+1)*5 + floor(等级/2)
 * 
 * 【2023-09-23 11:18:56】经验表：
 * ```
 * 0 => 5
 * 1 => 10
 * 2 => 16
 * 3 => 21
 * 4 => 27
 * ```
 * 
 * @param level 所基于的等级
 * @returns 该等级的最大经验（升级所需经验-1）
 */
export function getLevelUpExperience(level: uint): uint {
    return (level + 1) * 5 + (level >> 1);
}

// 键盘控制相关 //

export type nativeControlKeyConfig = {
    // 移动键（多个） // ! 注意：是根据「任意维整数角」排列的，方向为「右左下上」
    move: KeyCode[],
    // 使用键
    use: KeyCode,
    // 选择键（WIP）
    // select_left:KeyCode,
    // select_right:KeyCode,
}

export type nativeControlKeyConfigs = {
    [n: uint]: nativeControlKeyConfig
}

/**
 * 存储（靠键盘操作的）玩家默认的「控制按键组」
 */
export const DEFAULT_PLAYER_CONTROL_KEYS: nativeControlKeyConfigs = {
    // P1: WASD, Space 
    1: {
        move: [
            keyCodes.D, // 右
            keyCodes.A, // 左
            keyCodes.S, // 下
            keyCodes.W, // 上
        ],
        use: keyCodes.SPACE, // 用
    },
    // P2: ↑←↓→, numpad_0
    2: {
        move: [
            keyCodes.RIGHT, // 右
            keyCodes.LEFT,  // 左
            keyCodes.DOWN,  // 下
            keyCodes.UP,    // 上
        ],
        use: keyCodes.NUMPAD_0, // 用
    },
    // P3: UHJK, ]
    3: {
        move: [
            keyCodes.K, // 右
            keyCodes.H, // 左
            keyCodes.J, // 下
            keyCodes.U, // 上
        ],
        use: keyCodes.RIGHT_BRACKET, // 用
    },
    // P4: 8456, +
    4: {
        move: [
            keyCodes.NUMPAD_6, // 右
            keyCodes.NUMPAD_4, // 左
            keyCodes.NUMPAD_5, // 下
            keyCodes.NUMPAD_8, // 上
        ],
        use: keyCodes.NUMPAD_ADD, // 用
    },
}

// 游戏规则相关 //

/**
 * 加载基本的玩家队伍
 * * 内容：多个「色调均匀分布」的彩色队伍，与多个「亮度均匀分布」的灰度队伍
 * * 【2023-09-24 16:22:42】现在是「原生游戏机制」中的内容，而非内置在「游戏规则」之中
 * * 📌先前代码：`GameRule_V1.initPlayerTeams([], 3, 8)`
 */
export function initBasicPlayerTeams(parent: PlayerTeam[], coloredTeamCount: uint, grayscaleTeamCount: uint): PlayerTeam[] {
    // let parent: PlayerTeam[] = new Array<PlayerTeam>();
    clearArray(parent);

    let h: uint, s: number, v: number, color: uint;
    let i: uint;
    // 黑白色队伍
    h = 0;
    s = 0;
    for (i = 0; i < grayscaleTeamCount; i++) {
        v = i / (grayscaleTeamCount - 1) * 100;
        color = HSVtoHEX(h, s, v);
        parent.push(new PlayerTeam(color));
    }
    h = 0;
    s = 100;
    v = 100;
    // Colored Team
    for (i = 0; i < coloredTeamCount; i++) {
        h = 360 * i / coloredTeamCount;
        color = HSVtoHEX(h, s, v);
        parent.push(new PlayerTeam(color));
    }
    return parent;
}

/**
 * （用于菜单背景）「游戏初始化」时产生的固定规则
 * * 八个AI
 * * 随机武器
 * * 不断切换的地图
 * * 混战
 */
export const MENU_BACKGROUND: GameRule_V1 = loadAsBackgroundRule(new GameRule_V1());

/**
 * 获取作为「菜单背景」的游戏规则
 */
export function loadAsBackgroundRule(rule: GameRule_V1): GameRule_V1 {
    rule.playerCount = 0;
    rule.AICount = 8;
    rule.defaultTool = 'c-random'; // 完全随机
    rule.remainLivesPlayer = -1;
    rule.remainLivesAI = -1;
    // 加载玩家队伍
    initBasicPlayerTeams(rule.playerTeams, 3, 8); // 扩展只读属性
    return rule;
}


console.log(
    new GameRule_V1(),
    GameRule_V1.TEMPLATE,
    GameRule_V1.TEMPLATE.allKeys,
    uniSaveJSObject(GameRule_V1.TEMPLATE),
    uniLoadJSObject(new GameRule_V1(), uniSaveJSObject(GameRule_V1.TEMPLATE)),
)

console.log("It's done.")
