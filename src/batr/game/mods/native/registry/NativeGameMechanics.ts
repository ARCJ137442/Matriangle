import { randInt } from "../../../../common/exMath";
import { iPoint, fPoint } from "../../../../common/geometricTools";
import { randomWithout, randomIn } from "../../../../common/utils";
import BonusBoxSymbol from "../../../../display/mods/native/entity/BonusBoxSymbol";
import { uint, int } from "../../../../legacy/AS3Legacy";
import Block from "../../../api/block/Block";
import { iRot } from "../../../general/GlobalRot";
import { alignToEntity, alignToEntity_P } from "../../../general/PosTransform";
import { randomTickEventF } from "../../../main/GameEventPatcher";
import { PROJECTILES_SPAWN_DISTANCE } from "../../../main/GlobalGameVariables";
import IBatrGame from "../../../main/IBatrGame";
import BlockColored from "../blocks/Colored";
import BlockGate from "../blocks/Gate";
import BonusBox from "../entities/item/BonusBox";
import Player from "../entities/player/Player";
import PlayerTeam from "../entities/player/team/PlayerTeam";
import ThrownBlock from "../entities/projectile/ThrownBlock";
import LaserAbsorption from "../entities/projectile/laser/LaserAbsorption";
import LaserBasic from "../entities/projectile/laser/LaserBasic";
import LaserPulse from "../entities/projectile/laser/LaserPulse";
import LaserTeleport from "../entities/projectile/laser/LaserTeleport";
import GameRule_V1 from "../rule/GameRule_V1";
import Tool from "../tool/Tool";
import { MoveableWall, NativeBlockTypes } from "./BlockTypeRegistry";
import { BonusType, NativeBonusTypes } from "./BonusRegistry";


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
    host: IBatrGame, player: Player, bonusBox: BonusBox,
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
            player.addHealth(5 * (1 + randInt(10)));
            break;
        case NativeBonusTypes.ADD_HEAL:
            player.heal += 5 * (1 + randInt(25));
            break;
        case NativeBonusTypes.ADD_LIFE:
            if (player.infinityLife || player.isFullHealth)
                player.maxHealth += host.rule.getRule(GameRule_V1.name_bonusMaxHealthAdditionAmount) as uint; // ! 可能出错
            else
                player.lives++;
            break;
        // Tool
        case NativeBonusTypes.RANDOM_TOOL:
            player.tool = randomWithout(host.rule.getRule(GameRule_V1.name_enabledTools) as Tool[], player.tool);
            break;
        // Attributes
        case NativeBonusTypes.BUFF_RANDOM:
            playerPickupBonusBox(host, player, bonusBox, randomIn(NativeBonusTypes._ABOUT_BUFF));
            return;
        case NativeBonusTypes.BUFF_DAMAGE:
            player.buffDamage += host.rule.getRule(GameRule_V1.name_bonusBuffAdditionAmount) as uint;
            buffColor = BonusBoxSymbol.BUFF_DAMAGE_COLOR;
            break;
        case NativeBonusTypes.BUFF_CD:
            player.buffCD += host.rule.getRule(GameRule_V1.name_bonusBuffAdditionAmount) as uint;
            buffColor = BonusBoxSymbol.BUFF_CD_COLOR;
            break;
        case NativeBonusTypes.BUFF_RESISTANCE:
            player.buffResistance += host.rule.getRule(GameRule_V1.name_bonusBuffAdditionAmount) as uint;
            buffColor = BonusBoxSymbol.BUFF_RESISTANCE_COLOR;
            break;
        case NativeBonusTypes.BUFF_RADIUS:
            player.buffRadius += host.rule.getRule(GameRule_V1.name_bonusBuffAdditionAmount) as uint;
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
                randomIn(host.rule.getRule(GameRule_V1.name_playerTeams) as PlayerTeam[])
            );
            break;
        case NativeBonusTypes.UNITE_PLAYER:
            host.setATeamToNotAIPlayer(
                randomIn(host.rule.getRule(GameRule_V1.name_playerTeams) as PlayerTeam[])
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
const randomTick_MoveableWall: randomTickEventF = (host: IBatrGame, block: Block, position: iPoint): void => {
    let randomRot: uint, tPoint: fPoint;
    // add laser by owner=null
    let p: ThrownBlock;
    let i: uint = 0;
    do {
        randomRot = host.map.storage.randomForwardDirectionAt(position);
        tPoint = host.map.logic.towardWithRot_FF(position, randomRot);
        if (
            host.map.logic.isInMap_I(position) ||
            !host.map.logic.testCanPass_F(tPoint, false, true, false, false)
        ) continue;
        p = new ThrownBlock(
            alignToEntity_P(position, _temp_randomTick_MoveableWall),
            null,
            block.clone(),
            randomRot,
            Math.random()
        );
        host.map.storage.setVoid(position);
        host.entitySystem.register(p); // TODO: 不区分类型——后期完善实体系统时统一分派
        // trace('laser at'+'('+p.entityX+','+p.entityY+'),'+p.life,p.length,p.visible,p.alpha,p.owner);
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
const randomTick_ColorSpawner: randomTickEventF = (host: IBatrGame, block: Block, position: iPoint): void => {
    let randomPoint: iPoint = host.map.storage.randomPoint;
    let newBlock: Block = BlockColored.randomInstance(NativeBlockTypes.COLORED);
    if (!host.map.logic.isInMap_I(randomPoint) && host.map.storage.isVoid(randomPoint)) {
        host.setBlock(randomPoint, newBlock); // * 后续游戏需要处理「方块更新事件」
        host.addBlockLightEffect2(
            alignToEntity_P(randomPoint, _temp_randomTick_ColorSpawner),
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
const randomTick_LaserTrap: randomTickEventF = (
    host: IBatrGame, block: Block, position: iPoint): void => {
    let sourceX = position.x, sourceY = position.y; // TODO: 这里的东西需要等到后期「对实体的多维坐标化」后再实现「多维化」
    let randomR: iRot, entityX: number, entityY: number, laserLength: number = 0;
    // add laser by owner=null
    let p: LaserBasic, tp: fPoint, entityP: fPoint;
    let i: uint = 0;
    do {
        randomR = host.map.storage.randomForwardDirectionAt(position);
        tp = host.map.logic.towardWithRot_FF(
            position,
            randomR, PROJECTILES_SPAWN_DISTANCE
        );
        entityP = alignToEntity_P(position, new fPoint()).addFrom(tp);
        entityX = entityP.x;
        entityY = entityP.y;
        if (host.map.logic.isInMap_F(entityP))
            continue;
        laserLength = host.getLaserLength2(position, randomR);
        if (laserLength <= 0)
            continue;
        switch (randInt(4)) {
            case 1:
                p = new LaserTeleport(position, null, laserLength);
                break;
            case 2:
                p = new LaserAbsorption(position, null, laserLength);
                break;
            case 3:
                p = new LaserPulse(position, null, laserLength);
                break;
            default:
                p = new LaserBasic(position, null, laserLength, 1);
                break;
        }
        if (p != null) {
            p.direction = randomR;
            host.entitySystem.register(p);
            // host.projectileContainer.addChild(p);
            // trace('laser at'+'('+p.entityX+','+p.entityY+'),'+p.life,p.length,p.visible,p.alpha,p.owner);
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
const randomTick_Gate: randomTickEventF = (host: IBatrGame, block: Block, position: iPoint): void => {
    let newBlock: BlockGate = block.clone() as BlockGate // ! 原方块的状态不要随意修改！
    newBlock.open = true;
    host.setBlock(position, newBlock);
}
