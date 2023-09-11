import { randInt } from "../../common/exMath";
import { fPoint, iPoint } from "../../common/geometricTools";
import { PROJECTILES_SPAWN_DISTANCE } from "../../general/GlobalGameVariables";
import { iRot } from "../../general/GlobalRot";
import { alignToEntity } from "../../general/PosTransform";
import { int, uint } from "../../legacy/AS3Legacy";
import BlockCommon from "../block/BlockCommon";
import BlockColored from "../block/blocks/Colored";
import BlockGate from "../block/blocks/Gate";
import LaserAbsorption from "../entity/entities/projectile/LaserAbsorption";
import LaserBasic from "../entity/entities/projectile/LaserBasic";
import LaserPulse from "../entity/entities/projectile/LaserPulse";
import LaserTeleport from "../entity/entities/projectile/LaserTeleport";
import ThrownBlock from "../entity/entities/projectile/ThrownBlock";
import { randomTickEventF } from "../main/GameEventPatcher";
import IBatrGame from "../main/IBatrGame";
import { MoveableWall, NativeBlockTypes } from "./BlockTypeRegistry";

/**
 * 所有游戏内置「事件处理」的注册表
 * 
 * * 用这样一个「事件注册」类承担所有的导入，让「方块」「实体」等类实现轻量化
 * 
 * TODO: 是否「显示事件」也要这样「外包到『事件注册表』中」去？
 */
export module NativeGameEvents {

    /**
     * * 事件处理函数API：可访问游戏实例，参与调用游戏API（生成实体、放置其它方块等）
     * 
     * （示例）响应游戏随机刻 @ MoveableWall
     * * 机制：「可移动的墙」在收到一个随机刻时，开始朝周围可以移动的方向进行移动
     * * 原`moveableWallMove`
     * 
     * ? 是否可以放开一点，通过TS合法手段让`block`成为任意`BlockCommon`的子类
     * @param host 调用此函数的游戏主体
     * @param block 被调用的方块
     * @param position 被调用方块的位置
     */
    const randomTick_MoveableWall: randomTickEventF = (host: IBatrGame, block: BlockCommon, position: iPoint): void => {
        let randomRot: uint, tPoint: iPoint;
        let sourceX = position.x, sourceY = position.y; // TODO: 这里的东西需要等到后期「对实体的多维坐标化」后再实现「多维化」
        let entityX: number, entityY: number;
        // add laser by owner=null
        let p: ThrownBlock;
        let i: uint = 0;
        do {
            randomRot = host.map.storage.randomForwardDirectionAt_2d(sourceX, sourceY);
            tPoint = host.map.logic.towardWithRot(sourceX, sourceY, randomRot);
            entityX = tPoint.x;
            entityY = tPoint.y;
            if (
                host.map.logic.isInMap_I2d(entityX, entityY) ||
                !host.map.logic.testIntCanPass(entityX, entityY, false, true, false, false)
            ) continue;
            p = new ThrownBlock(
                host,
                alignToEntity(sourceX), alignToEntity(sourceY),
                null,
                block.clone(),
                randomRot,
                Math.random()
            );
            host.map.storage.setVoid_2d(sourceX, sourceY); // TODO: 建议统一管理
            host.entitySystem.registerProjectile(p);
            // TODO: 推荐 host.entitySystem.addProjectile(p); // 坐标存储在实体自身中
            // host.map.logic._projectileContainer.addChild(p);
            // trace('laser at'+'('+p.entityX+','+p.entityY+'),'+p.life,p.length,p.visible,p.alpha,p.owner);
            if ((block as MoveableWall).virus)
                break;
        }
        while (++i < 0x10);
    }

    /**
     * （示例）响应游戏随机刻 @ ColorSpawner
     * * 机制：当「颜色生成器」收到一个随机刻时，随机在「周围曼哈顿距离≤2处」生成一个随机颜色的「颜色块」
     * * 原`colorSpawnerSpawnBlock`
     * 
     * @param host 调用此函数的游戏主体
     * @param block 被调用的方块
     * @param position 被调用方块的位置
     */
    const randomTick_ColorSpawner: randomTickEventF = (host: IBatrGame, block: BlockCommon, position: iPoint): void => {
        let randomPoint: iPoint = host.map.storage.randomPoint;
        let x: int = randomPoint.x, y: int = randomPoint.y; // TODO: 这里的东西需要等到后期「对实体的多维坐标化」后再实现「多维化」
        let newBlock: BlockCommon = BlockColored.randomInstance(NativeBlockTypes.COLORED);
        if (!host.map.logic.isInMap_F2d(x, y) && host.map.storage.isVoid_2d(x, y)) {
            host.setBlock(x, y, newBlock); // * 后续游戏需要处理「方块更新事件」
            host.addBlockLightEffect2(
                alignToEntity(x),
                alignToEntity(y),
                newBlock, false
            );
        }
    }

    /**
     * （示例）响应游戏随机刻 @ LaserTrap
     * * 机制：当「激光陷阱」收到一个随机刻时，随机向周围可发射激光的方向发射随机种类的「无主激光」
     * * 原`laserTrapShootLaser`
     * 
     * @param host 调用此函数的游戏主体
     * @param block 被调用的方块
     * @param position 被调用方块的位置
     */
    const randomTick_LaserTrap: randomTickEventF = (host: IBatrGame, block: BlockCommon, position: iPoint): void => {
        let sourceX = position.x, sourceY = position.y; // TODO: 这里的东西需要等到后期「对实体的多维坐标化」后再实现「多维化」
        let randomR: iRot, entityX: number, entityY: number, laserLength: number = 0;
        // add laser by owner=null
        let p: LaserBasic, tp: fPoint;
        let i: uint = 0;
        do {
            randomR = host.map.storage.randomForwardDirectionAt_2d(sourceX, sourceY);
            tp = host.map.logic.towardWithRot(
                alignToEntity(sourceX), alignToEntity(sourceY),
                randomR, PROJECTILES_SPAWN_DISTANCE
            );
            entityX = alignToEntity(sourceX) + tp.x;
            entityY = alignToEntity(sourceY) + tp.y;
            if (host.map.logic.isInMap_F2d(entityX, entityY))
                continue;
            laserLength = host.getLaserLength2(entityX, entityY, randomR);
            if (laserLength <= 0)
                continue;
            switch (randInt(4)) {
                case 1:
                    p = new LaserTeleport(host, entityX, entityY, null, laserLength);
                    break;
                case 2:
                    p = new LaserAbsorption(host, entityX, entityY, null, laserLength);
                    break;
                case 3:
                    p = new LaserPulse(host, entityX, entityY, null, laserLength);
                    break;
                default:
                    p = new LaserBasic(host, entityX, entityY, null, laserLength, 1);
                    break;
            }
            if (p != null) {
                p.rot = randomR;
                host.entitySystem.registerProjectile(p);
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
    const randomTick_Gate: randomTickEventF = (host: IBatrGame, block: BlockCommon, position: iPoint): void => {
        let sourceX = position.x, sourceY = position.y; // TODO: 这里的东西需要等到后期「对实体的多维坐标化」后再实现「多维化」
        let newBlock: BlockGate = block.clone() as BlockGate // ! 原方块的状态不要随意修改！
        newBlock.open = true;
        host.setBlock(sourceX, sourceY, newBlock);
    }
}
