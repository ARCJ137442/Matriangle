import { ReLU_I, intMax, intMin, randInt } from "../../../../common/exMath";
import { iPoint, fPoint, iPointRef, fPointRef } from "../../../../common/geometricTools";
import { randomWithout, randomIn, clearArray } from "../../../../common/utils";
import BonusBoxSymbol from "../../../../display/mods/native/entity/BonusBoxSymbol";
import { uint, int, uint$MAX_VALUE, int$MIN_VALUE, int$MAX_VALUE } from "../../../../legacy/AS3Legacy";
import Block, { BlockType } from "../../../api/block/Block";
import { iRot } from "../../../general/GlobalRot";
import { alignToGridCenter_P } from "../../../general/PosTransform";
import { randomTickEventF } from "../../../api/control/BlockEventTypes";
import { PROJECTILES_SPAWN_DISTANCE } from "../../../main/GlobalGameVariables";
import IBatrMatrix from "../../../main/IBatrMatrix";
import BlockColored from "../blocks/Colored";
import BlockGate from "../blocks/Gate";
import BonusBox from "../entities/item/BonusBox";
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
import { KeyCode, keyCodes } from "../../../../common/keyCodes";
import { HSVtoHEX } from "../../../../common/color";
import { uniSaveJSObject, uniLoadJSObject } from "../../../../common/JSObjectify";
import IGameRule from "../../../rule/IGameRule";
import BlockAttributes from "../../../api/block/BlockAttributes";
import { IEntityInGrid } from "../../../api/entity/EntityInterfaces";
import PlayerStats from "../stat/PlayerStats";
import EffectPlayerHurt from "../entities/effect/EffectPlayerHurt";
import EffectPlayerDeathLight from "../entities/effect/EffectPlayerDeathLight";
import EffectPlayerDeathFadeout from "../entities/effect/EffectPlayerDeathFadeout";


/**
 * 所有游戏的「原生逻辑」
 * * 【2023-09-17 16:03:55】现在使用静态函数，实现「bonusBox无关」的Julia风格方法
 * * 用这样一个「事件注册」类承担所有的导入，让「方块」「实体」等类实现轻量化
 * 
 * TODO: 是否「显示事件」也要这样「外包到『事件注册表』中」去？
 */

//================🎛️游戏加载================//

/**
 * 按照「游戏规则」初始化玩家变量
 * * 如：生命值，最大生命值等
 * 
 * !【2023-09-28 20:27:56】有关「设置生命值可能导致的『显示更新』副作用」，或许可以需要通过「外部屏蔽更新/玩家未激活时」等方式避免
 * * 主打：避免Player类中出现与「游戏母体」耦合的代码
 * 
 */
export function initPlayersByRule(players: IPlayer[], rule: IGameRule): void {
    // 处理工具
    let defaultTool: Tool | string = rule.safeGetRule<Tool | string>(GameRule_V1.key_defaultTool);
    switch (defaultTool) {
        // 统一随机
        case 'u-random':
            // 随机选一个
            defaultTool = randomIn<Tool>(
                rule.safeGetRule<Tool[]>(GameRule_V1.key_enabledTools)
            );
            break;
        // 完全随机
        case 'c-random':
            defaultTool = '' // ! 设置为空串，到时好比对（💭用函数式搞一个闭包也不是不行，但这会拖慢其它模式的初始化速度）
            break;
        // 固定武器：没啥事做
        default:
            break;
    }
    // 开始逐个玩家分派属性
    for (const player of players) {
        // 生命 //
        player.HP = rule.safeGetRule<uint>(GameRule_V1.key_defaultHP);
        player.maxHP = rule.safeGetRule<uint>(GameRule_V1.key_defaultMaxHP);

        // TODO: 下面的「判断是否AI」留给创建者。。。
        // player.setLifeByInt(player instanceof AIPlayer ? rule.remainLivesAI : rule.remainLivesPlayer);

        // 分派工具 //
        // 空串⇒完全随机，否则直接设置成之前的武器
        player.tool = (
            defaultTool === '' ?
                randomIn<Tool>(
                    rule.safeGetRule<Tool[]>(GameRule_V1.key_enabledTools)
                ) :
                defaultTool as Tool
        );
    }
    // TODO: 后续还有至少是「生命条数」没有初始化的……留给在「创建玩家」时做（只有那时候才能分辨「哪个是人类，哪个是AI」）
}

//================⚙️实体管理================//

// 特效 //

// 
/* export function addPlayerHurtEffect(host: IBatrMatrix, player: IPlayer, reverse: boolean = false): void {
    host.addEntity(
        EffectPlayerHurt.fromPlayer(host, player, reverse)
    );
}

export function addSpawnEffect(host: IBatrMatrix, position: fPointRef): void {
    this._effectSystem.addEffect(new EffectSpawn(this, x, y));
}

export function addTeleportEffect(host: IBatrMatrix, position: fPointRef): void {
    this._effectSystem.addEffect(new EffectTeleport(this, x, y));
}

export function addPlayerDeathLightEffect(host: IBatrMatrix, position: fPointRef, color: uint, rot: uint, aiPlayer: AIPlayer = null, reverse: boolean = false): void {
    this._effectSystem.addEffect(new EffectPlayerDeathLight(this, x, y, rot, color, aiPlayer == null ? null : aiPlayer.decorationLabel, reverse));
}

export function addPlayerDeathFadeoutEffect(host: IBatrMatrix, position: fPointRef, color: uint, rot: uint, aiPlayer: AIPlayer = null, reverse: boolean = false): void {
    this._effectSystem.addEffect(new EffectPlayerDeathFadeout(this, x, y, rot, color, aiPlayer == null ? null : aiPlayer.decorationLabel, reverse));
}

export function addPlayerDeathLightEffect(host: IBatrMatrix, position: fPointRef, player: IPlayer, reverse: boolean = false): void {
    this._effectSystem.addEffect(EffectPlayerDeathLight.fromPlayer(this, x, y, player, reverse));
}

export function addPlayerDeathFadeoutEffect(host: IBatrMatrix, position: fPointRef, player: IPlayer, reverse: boolean = false): void {
    this._effectSystem.addEffect(EffectPlayerDeathFadeout.fromPlayer(this, x, y, player, reverse));
}

export function addPlayerLevelupEffect(host: IBatrMatrix, position: fPointRef, color: uint, scale: number): void {
    this._effectSystem.addEffect(new EffectPlayerLevelup(this, x, y, color, scale));
}

export function addBlockLightEffect(host: IBatrMatrix, position: fPointRef, color: uint, alpha: uint, reverse: boolean = false): void {
    this._effectSystem.addEffect(new EffectBlockLight(this, x, y, color, alpha, reverse));
}

export function addBlockLightEffect2(host: IBatrMatrix, position: fPointRef, block: Block, reverse: boolean = false): void {
    this._effectSystem.addEffect(EffectBlockLight.fromBlock(this, x, y, block, reverse));
} */


//================🕹️玩家================//

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
 * 当玩家「得到奖励」所用的逻辑
 * 
 * @param host 调用的游戏母体
 * @param player 奖励箱将作用到的玩家
 * @param forcedBonusType 要强制应用的类型（若非空则强制应用此类型的奖励）
 */
export function playerPickupBonusBox(
    host: IBatrMatrix, player: IPlayer, bonusBox: BonusBox,
    forcedBonusType: BonusType = bonusBox.bonusType
): void {
    if (player == null)
        return;
    // Deactivate
    bonusBox.isActive = false;
    // Effect
    let buffColor: int = -1;
    switch (forcedBonusType) {
        // HP,Heal&Life
        case NativeBonusTypes.ADD_HP:
            // 随机
            player.addHP(host, uint(player.HP * (0.05 * (1 + randInt(10)))), null);
            break;
        case NativeBonusTypes.ADD_HEAL:
            player.heal += 5 * (1 + randInt(25));
            break;
        case NativeBonusTypes.ADD_LIFE:
            if (player.lifeNotDecay || player.isFullHP)
                player.maxHP += host.rule.getRule(GameRule_V1.key_bonusMaxHPAdditionAmount) as uint; // ! 可能出错
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
            player.attributes.buffDamage += host.rule.getRule(GameRule_V1.key_bonusBuffAdditionAmount) as uint;
            buffColor = BonusBoxSymbol.BUFF_DAMAGE_COLOR;
            break;
        case NativeBonusTypes.BUFF_CD:
            player.attributes.buffCD += host.rule.getRule(GameRule_V1.key_bonusBuffAdditionAmount) as uint;
            buffColor = BonusBoxSymbol.BUFF_CD_COLOR;
            break;
        case NativeBonusTypes.BUFF_RESISTANCE:
            player.attributes.buffResistance += host.rule.getRule(GameRule_V1.key_bonusBuffAdditionAmount) as uint;
            buffColor = BonusBoxSymbol.BUFF_RESISTANCE_COLOR;
            break;
        case NativeBonusTypes.BUFF_RADIUS:
            player.attributes.buffRadius += host.rule.getRule(GameRule_V1.key_bonusBuffAdditionAmount) as uint;
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
    host.removeEntity(bonusBox);
}


/**
 * 当每个玩家「移动到某个方块」时，在移动后的测试
 * * 测试位置即为玩家「当前位置」（移动后！）
 * * 有副作用：用于处理「伤害玩家的方块」
 * 
 * @param host 检测所在的游戏母体
 * @param player 被检测的玩家
 * @param isLocationChange 是否是「位置变更」所需要的（false用于「陷阱检测」）
 * @returns 这个函数是否执行了某些「副作用」（比如「伤害玩家」「旋转玩家」等），用于「陷阱伤害延迟」
 */
export function playerMoveInTest(
    host: IBatrMatrix, player: IPlayer,
    isLocationChange: Boolean = false
): boolean {
    // 非激活&无属性⇒不检测（返回）
    if (!player.isActive) return false;
    let attributes: BlockAttributes | null = host.map.storage.getBlockAttributes(player.position);
    if (attributes === null) return false;

    let returnBoo: boolean = false;
    // 开始计算
    let finalPlayerDamage: int = computeFinalBlockDamage(
        player.maxHP,
        host.rule.safeGetRule<int>(GameRule_V1.key_playerAsphyxiaDamage),
        attributes.playerDamage
    );
    // int$MIN_VALUE⇒无伤害
    if (finalPlayerDamage !== int$MIN_VALUE)
        // 负数⇒治疗
        if (finalPlayerDamage < 0) {
            if (!isLocationChange)
                player.isFullHP ?
                    player.heal += finalPlayerDamage : // 满生命值⇒加「储备生命值」
                    player.addHP(host, finalPlayerDamage, null); // 否则直接加生命值
        }
        // 正数⇒伤害
        else player.removeHP(
            host,
            finalPlayerDamage,
            null,
        );
    // 附加的「旋转」效果
    if (attributes.rotateWhenMoveIn) {
        // 玩家向随机方向旋转
        player.turnTo(
            host,
            host.map.storage.randomRotateDirectionAt(
                player.position,
                player.direction,
                1
            )
        );
        returnBoo = true;
    }
    return returnBoo;
}

/**
 * 综合「玩家最大生命值」「规则的『窒息伤害』」「方块的『玩家伤害』」计算「最终方块伤害」
 * * 返回负数以包括「治疗」的情况
 * 
 * 具体规则：
 * * [-inf, -1) -> playerDamage+1（偏置后的治疗值）
 * * -1 -> 重定向到「使用规则伤害作『方块伤害』」
 * * [0,100] -> player.maxHP * playerDamage/100（百分比）
 * * (100...] -> playerDamage-100（偏置后的实际伤害值）
 * * int.MAX_VALUE -> uint.MAX_VALUE
 * @return 最终计算好的「方块伤害」
 */
export const computeFinalBlockDamage = (
    playerMaxHP: uint,
    ruleAsphyxiaDamage: int,
    playerDamage: int
): uint => (
    playerDamage < -1 ?
        playerDamage + 1 :
        playerDamage == -1 ?
            computeFinalBlockDamage(playerMaxHP, 0, ruleAsphyxiaDamage) : // 为了避免「循环递归」的问题，这里使用了硬编码0
            playerDamage == 0 ?
                0 :
                playerDamage <= 100 ?
                    playerMaxHP * playerDamage / 100 :
                    playerDamage == int$MAX_VALUE ?
                        uint$MAX_VALUE :
                        playerDamage - 100
);

// TODO: 后续完善实体系统后，再进行处理
export function testCanGoTo(
    host: IBatrMatrix, p: iPointRef,
    avoidHurt: boolean = false,
    avoidOthers: boolean = true,
    others: IEntityInGrid[] = [],
): boolean {
    throw new Error("Method not implemented.");
}

// TODO: 后续完善实体系统后，再进行处理
export function testCanGoForward(
    host: IBatrMatrix, rotatedAsRot: uint | -1 = -1,
    avoidHurt: boolean = false,
    avoidOthers: boolean = true,
    others: IEntityInGrid[] = [],
): boolean {
    throw new Error("Method not implemented.");
}

/**
 * 根据（使用武器的）玩家与（被玩家使用的）武器计算「攻击者伤害」
 * * 应用：玩家发射抛射体，伤害&系数均转移到抛射体上
 * 
 * * 📌攻击者伤害 = 武器基础伤害 + 玩家「伤害加成」 * 武器「附加伤害系数」
 * 
 * ? 似乎确实是导出一个箭头函数就足够了
 * 
 * @param baseDamage （来自武器的）基础伤害
 * @param buffDamage （来自使用者的）伤害加成
 * @param extraDamageCoefficient （来自武器的）伤害提升系数
 * @returns 攻击者伤害：已经由攻击者完全提供，后续计算不再与攻击者有关的伤害
 */
export const computeAttackerDamage = (
    baseDamage: uint,
    buffDamage: uint,
    extraDamageCoefficient: uint,
): uint => baseDamage + buffDamage * extraDamageCoefficient

/**
 * 根据（已得到攻击者「攻击伤害」加成的）「攻击者伤害」与「玩家抗性」「抗性系数」计算「最终伤害」（整数）
 * * 应用：抛射体伤害玩家
 * 
 * * 📌最终伤害 = Max{攻击者伤害 - 玩家「伤害减免」 * 武器「抗性减免系数」, 1}
 * 
 * ! 相比AS3版本的变动：
 * * 对「抛射体伤害玩家」的逻辑：现在不传入「攻击者所用工具」（从抛射体处已移除），在计算上直接使用「攻击者伤害」
 * 
 * @param attackerDamage （已把「伤害加成」算入内的）攻击者伤害
 * @param buffResistance （来自被攻击者的）伤害减免
 * @param extraResistanceCoefficient （来自武器/抛射体的）抗性减免系数
 * @returns 
 */
export const computeFinalDamage = (
    attackerDamage: uint,
    buffResistance: uint,
    extraResistanceCoefficient: uint,
): uint => intMax(
    attackerDamage - buffResistance * extraResistanceCoefficient,
    1 // ! 保证不能有「无敌」的情况发生
);

/**
* 用于结合玩家特性计算「最终CD」
* @param baseCD （来自武器的）基础冷却
* @param buffCD （来自玩家的）冷却减免
* @returns 最终冷却时间：最小为1
*/
export const computeFinalCD = (
    baseCD: uint,
    buffCD: uint,
): uint => Math.ceil( // 使用向上取整保证最小为1
    baseCD / (1 + buffCD / 10)
);

/**
 * 计算（武器的）影响半径
 * * 应用：给抛射体作参考，如「子弹爆炸」「波浪大小」……
 * 
 * * 📌最终半径 = 基础半径 * (1 + Min{范围加成/16, 3})
 * 
 * @param baseRadius （来自武器的）基础半径（浮点数）
 * @returns 计算好的「最终半径」（浮点数）
 */
export const computeFinalRadius = (
    baseRadius: number,
    buffRadius: uint,
): number => baseRadius * (1 + Math.min(buffRadius / 16, 3))

/**
 * 计算（用于「闪电」武器的）最终闪电能量
 * * 应用：给「闪电」抛射体作参考
 * 
 * * 📌最终闪电能量 = 基础能量 * Min{1 + 伤害加成 / 20 + 范围加成 / 10, 10}
 * 
 * @param baseEnergy （来自武器/抛射体内置的）基础能量
 * @param buffDamage （来自玩家的）伤害加成
 * @param buffRadius （来自玩家的）范围加成
 * @returns 最终的「闪电能量」（整数）
 */
export const computeFinalLightningEnergy = (
    baseEnergy: uint,
    buffDamage: uint, buffRadius: uint,
): uint => (
    baseEnergy * intMin(1 + buffDamage / 20 + buffRadius / 10, 10)
)

/**
 * 计算玩家的「总游戏分数」
 * * 应用：衡量一个玩家在游戏中的「一般表现」
 * * 逻辑：经验+击杀/死亡+伤害
 */
export const computeTotalPlayerScore = (stats: PlayerStats): uint => ReLU_I(
    // 经验等级
    + (stats.profile?.level ?? 0) * 50
    + (stats.profile?.experience ?? 0) * 5
    // 击杀/死亡
    // + stats.killAllyCount // !【2023-10-01 15:09:10】现在击杀友方不计分
    + stats.killCount * 2
    - stats.deathCount * 2
    // - stats.suicideCount // !【2023-10-01 15:09:10】现在自杀不计分
    + stats.pickupBonusBoxCount * 10
    // 伤害
    + stats.causeDamage
    - stats.damageBy
);

// 玩家钩子函数（from`Game.as`） //

export function handlePlayerMove(host: IBatrMatrix, player: IPlayer): void {
}

export function handlePlayerUse(host: IBatrMatrix, player: IPlayer, rot: uint, distance: number): void {
}

/**
 * 处理「玩家伤害」事件
 * @param host 所处的「游戏母体」
 * @param attacker 攻击者
 * @param victim 受害者
 * @param damage 伤害
 */
export function handlePlayerHurt(host: IBatrMatrix, attacker: IPlayer | null, victim: IPlayer, damage: uint): void {
    // 存入统计信息
    if (host.rule.getRule<boolean>(GameRule_V1.key_recordPlayerStats)) {
        // 受害者の统计
        victim.stats.damageBy += damage;
        victim.stats.addDamageByPlayerCount(attacker, damage);
        // 攻击者の统计
        if (attacker !== null) {
            attacker.stats.causeDamage += damage;
            // 对特定玩家的统计
            attacker.stats.addCauseDamagePlayerCount(victim, damage);
            // 伤害自身
            if (victim === attacker)
                victim.stats.causeDamageOnSelf += damage;
            // 伤害友方
            if (isAlly(attacker, victim)) {
                victim.stats.damageByAlly += damage;
                attacker.stats.causeDamageOnAlly += damage;
            }
        }
    }
}

/**
 * 处理「玩家死亡」
 * @param host 所处的「游戏母体」
 * @param attacker 攻击者
 * @param victim 受害者
 * @param damage 致死的伤害
 */
export function handlePlayerDeath(host: IBatrMatrix, attacker: IPlayer | null, victim: IPlayer, damage: uint): void {
    // 清除「储备生命值」 //
    victim.heal = 0;
    // 特效 //
    // 死亡光效
    host.addEntities(
        EffectPlayerDeathLight.fromPlayer(
            victim.position,
            victim, false/* 淡出 */
        ),
        EffectPlayerDeathFadeout.fromPlayer(
            victim.position,
            victim, false/* 淡出 */
        )
    );

    // Set Victim
    // victim.visible = false; // !【2023-10-03 21:09:59】交给「显示端」

    // 取消激活
    victim.isActive = false;
    // 工具使用状态重置
    victim.tool.resetUsingState();

    // 重生 //
    // 重置重生时间
    // 保存死亡点，在后续生成奖励箱时使用
    let deadP: iPoint = victim.position.copy();
    // 移动受害者到指定地方
    victim.position = host.rule.safeGetRule<iPoint>(GameRule_V1.key_deadPlayerMoveTo);
    // TODO: 统一设置位置？

    // victim.gui.visible = false; // TODO: 显示更新

    // Store Stats
    if (host.rule.safeGetRule<boolean>(GameRule_V1.key_recordPlayerStats)) {
        // 总体死亡数据
        victim.stats.deathCount++;
        // 总体死亡
        victim.stats.deathByPlayer++;
        victim.stats.addDeathByPlayerCount(attacker);
        // 击杀者非空
        if (attacker !== null) {
            // 自杀
            if (victim === attacker)
                victim.stats.suicideCount++;
            // 击杀者
            attacker.stats.killCount++;
            attacker.stats.addKillPlayerCount(victim);
            // 友方
            if (isAlly(attacker, victim)) {
                attacker.stats.killAllyCount++;
                victim.stats.deathByAllyCount++;
            }
        }
    }
    // 死后在当前位置生成奖励箱
    if (host.rule.bonusBoxSpawnAfterPlayerDeath &&
        (host.rule.bonusBoxMaxCount < 0 || host._entitySystem.bonusBoxCount < host.rule.bonusBoxMaxCount) &&
        host.testCanPass(deadX, deadY, true, false, true, true, true)) {
        host.addBonusBox(deadX, deadY, host.rule.randomBonusEnable);
    }
    // 触发击杀者的「击杀玩家」事件
    if (attacker !== null)
        attacker.onKillPlayer(host, this, damage);
    // 检测「游戏结束」 // TODO: 
    host.testGameEnd();
}

/**
 * 当一个玩家首次调用「重生」时
 * * 逻辑：恢复生命⇒（打开显示⇒）特效&坐标分派
 * @param host 所涉及的「游戏母体」
 * @param player 重生的玩家
 */
export function handlePlayerRespawn(host: IBatrMatrix, player: IPlayer): void {
    // Active
    player.HP = player.maxHP;
    player.isActive = true;
    /* // Visible // !【2023-10-03 23:37:11】弃置，留给「显示端」
    player.visible = true;
    player.gui.visible = true; */
    // Spread&Effect
    host.respawnPlayer(player);
}

/**
 * 在玩家移出方块之前
 */
export function moveOutTestPlayer(host: IBatrMatrix, player: IPlayer, oldP: iPointRef = player.position): void {
    if (!player.isActive) return;
    // TODO: 这里应该是要分派一个方块事件，而非把专用代码塞里头
    // let type: BlockType | null = host.map.storage.getBlockType(oldP);
    // let attr: BlockAttributes | null = host.map.storage.getBlockAttributes(oldP);
    let block: Block | null = host.map.storage.getBlock(oldP);
    // 一个逻辑：「打开的门」在玩家移走（后）关闭
    if (block instanceof BlockGate) {
        (block as BlockGate).open = false;
        // ? 直接修改方块属性是否靠谱？利不利于游戏响应（特别是显示端）
    }
}

/**
 * 在玩家位置改变时
 * * TODO: 理清整个「位置改变」的思路——代码一片片的摸不着头脑
 */
export function handlePlayerLocationChange(host: IBatrMatrix, player: IPlayer, newP: iPointRef): void {
    // Detect
    if (!player.isActive || !player.visible)
        return;
    // TODO: 「锁定地图位置」已移交至MAP_V1的`limitPoint`中
    player.dealMoveInTest(host, true, true); // ! `dealMoveInTestOnLocationChange`只是别名而已
    // 测试「是否拾取到奖励箱」
    bonusBoxTest(host, player, newP);
}

/**
 * 用于获取一个「游戏母体」内所有的奖励箱
 * * 特殊高效分派逻辑：使用「约定属性」`bonusBoxes`（可以是getter）
 * 
 * 📌JS知识：`in`能匹配getter，而`hasOwnProperty`不行
 * 
 * @param host 所在的「游戏母体」
 * @returns 所有奖励箱的列表
 */
export function getBonusBoxes(host: IBatrMatrix): BonusBox[] {
    // 💭【2023-10-03 23:44:22】根据类型做分派，但要导入「具体类型」……
    // 📌【2023-10-03 23:46:04】约定使用特殊的「bonusBoxes」属性做「特殊化」
    if ('bonusBoxes' in host) {
        return (host as any).bonusBoxes;
    }
    // 否则用最笨的方法
    else {
        return host.entities.filter(
            (e) => e instanceof BonusBox
        ) as BonusBox[];
    }
}

/**
 * 测试玩家「拾取奖励箱」的逻辑
 * 
 * ? 💭母体需要额外「专门化」去获取一个「所有奖励箱」吗？？？
 */
export function bonusBoxTest(host: IBatrMatrix, player: IPlayer, at: iPointRef = player.position): boolean {
    if (!player.isActive) return false;
    for (let bonusBox of getBonusBoxes(host)) {
        if (host.hitTestPlayer(player, at)) { // TODO: 【2023-10-03 23:55:46】断点
            playerPickupBonusBox(host, player, bonusBox);
            player.onPickupBonusBox(host, bonusBox);
            host.testGameEnd();
            return true;
        }
    }
    return false;
}

export function handlePlayerTeamsChange(host: IBatrMatrix/* , event: GameRuleEvent */): void {
    randomizeAllPlayerTeam(host);
}

export function handlePlayerLevelup(host: IBatrMatrix, player: IPlayer): void {
    let color: uint;
    let i: uint = 0;
    let nowE: uint = exMath.random(4);
    // Add buff of cd,resistance,radius,damage
    while (i < 3) {
        switch (nowE) {
            case 1:
                color = BonusBoxSymbol.BUFF_CD_COLOR;
                player.buffCD += host.rule.bonusBuffAdditionAmount;
                break;
            case 2:
                color = BonusBoxSymbol.BUFF_RESISTANCE_COLOR;
                player.buffResistance += host.rule.bonusBuffAdditionAmount;
                break;
            case 3:
                color = BonusBoxSymbol.BUFF_RADIUS_COLOR;
                player.buffRadius += host.rule.bonusBuffAdditionAmount;
                break;
            default:
                color = BonusBoxSymbol.BUFF_DAMAGE_COLOR;
                player.buffDamage += host.rule.bonusBuffAdditionAmount;
        }
        nowE = (nowE + 1) & 3;
        i++;
        // Add Effect
        host.addPlayerLevelupEffect(player.entityX + (i & 1) - 0.5, player.entityY + (i >> 1) - 0.5, color, 0.75);
    }
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
 * @param host 调用此函数的游戏母体
 * @param block 被调用的方块
 * @param position 被调用方块的位置
 */
export const randomTick_MoveableWall: randomTickEventF = (host: IBatrMatrix, block: Block, position: iPoint): void => {
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
            randomRot,
            Math.random(),
            block, // ! 【2023-09-22 22:32:47】现在在构造函数内部会自行拷贝
            NativeTools.WEAPON_BLOCK_THROWER.baseDamage,
            NativeTools.WEAPON_BLOCK_THROWER.extraResistanceCoefficient,
            1, // 始终完全充能
        );
        host.map.storage.setVoid(position);
        host.addEntity(p);
        // 所谓「病毒模式」就是「可能会传播的模式」，这个只会生成一次
        if (!(block as MoveableWall)?.virus)
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
 * @param host 调用此函数的游戏母体
 * @param block 被调用的方块
 * @param position 被调用方块的位置
 */
export const randomTick_ColorSpawner: randomTickEventF = (host: IBatrMatrix, block: Block, position: iPoint): void => {
    // TODO: 新位置寻址逻辑
    let randomPoint: iPoint = host.map.storage.randomPoint;
    let newBlock: Block = BlockColored.randomInstance(NativeBlockTypes.COLORED);
    if (!host.map.isInMap_I(randomPoint) && host.map.storage.isVoid(randomPoint)) {
        host.map.storage.setBlock(randomPoint, newBlock); // * 后续游戏需要处理「方块更新事件」
        host.addBlockLightEffect(
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
 * @param host 调用此函数的游戏母体
 * @param block 被调用的方块
 * @param position 被调用方块的位置
 */
export const randomTick_LaserTrap: randomTickEventF = (
    host: IBatrMatrix, block: Block, position: iPoint): void => {
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
                    NativeTools.WEAPON_LASER_TELEPORT.baseDamage,
                    laserLength
                );
                break;
            case 2:
                p = new LaserAbsorption(
                    null, position, randomR,
                    NativeTools.WEAPON_LASER_ABSORPTION.baseDamage,
                    laserLength
                );
                break;
            case 3:
                p = new LaserPulse(
                    null, position, randomR,
                    NativeTools.WEAPON_LASER_PULSE.baseDamage,
                    Math.random(),
                    laserLength,
                );
                break;
            default:
                p = new LaserBasic(
                    null, position, randomR,
                    NativeTools.WEAPON_LASER_BASIC.baseDamage,
                    1.0,
                    laserLength,
                );
                break;
        }
        if (p !== null) {
            host.addEntity(p);
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
 * @param host 调用此函数的游戏母体
 * @param block 被调用的方块
 * @param position 被调用方块的位置
 */
export const randomTick_Gate: randomTickEventF = (host: IBatrMatrix, block: Block, position: iPoint): void => {
    // 已经打开的不要管
    if (block instanceof BlockGate && (block as BlockGate).open) return;
    // 关闭的「门」随着随机刻打开
    let newBlock: BlockGate = block.clone() as BlockGate // ! 原方块的状态不要随意修改！
    newBlock.open = true;
    host.setBlock(position, newBlock);
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

// 抛射物逻辑 //

/**
 * 抛射体「波浪」伤害玩家的逻辑
 * @param host 游戏母体
 * @param wave 在其中运行的抛射体「波浪」
 */
export function waveHurtPlayers(host: IBatrMatrix, wave: Wave): void {
    /** 引用 */
    let base: fPoint = wave.position;
    /** Wave的尺寸即为其伤害半径 */
    let radius: number = wave.nowScale;
    // 开始遍历所有玩家
    for (let victim of host.getPlayers()) { // TODO: 如何在保持通用性的同时，保证专用性与效率。。。（过滤和遍历已经是一种方案了）
        // FinalDamage
        if (projectileCanHurtOther(wave, victim)) {
            if (base.getDistance(victim.position) <= radius) {
                victim.removeHP(host, wave.attackerDamage, wave.owner);
            }
        }
    }
}

// /**
//  * （原「是否为AI玩家」）判断一个玩家是否「受AI操控」
//  * * 原理：使用「控制器是否为『AI控制器』」判断
//  */
// export function isAIControl(player: IPlayer): boolean {
//     return player.controller instanceof AIController;
// }
// !【2023-09-27 23:49:23】↑现在不知道要不要「如此主观地判断」——好像「玩家和AI的区分」就那么理所当然一样

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
export function playerLevelUpExperience(level: uint): uint {
    return (level + 1) * 5 + (level >> 1);
}

// 键盘控制相关 //

export type NativeControlKeyConfig = {
    // 移动键（多个） // ! 注意：是根据「任意维整数角」排列的，方向为「右左下上」
    move: KeyCode[],
    // 使用键
    use: KeyCode,
    // 选择键（WIP）
    // select_left:KeyCode,
    // select_right:KeyCode,
}

export type NativeControlKeyConfigs = {
    [n: uint]: NativeControlKeyConfig
}

/**
 * 存储（靠键盘操作的）玩家默认的「控制按键组」
 */
export const DEFAULT_PLAYER_CONTROL_KEYS: NativeControlKeyConfigs = {
    // P0: 占位符 
    0: {
        move: [
            keyCodes.EMPTY, // 右
            keyCodes.EMPTY, // 左
            keyCodes.EMPTY, // 下
            keyCodes.EMPTY, // 上
        ],
        use: keyCodes.EMPTY, // 用
    },
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
