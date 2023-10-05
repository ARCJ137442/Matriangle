import { randInt } from "../../../../common/exMath";
import { iPoint } from "../../../../common/geometricTools";
import { randomIn, randomBoolean2 } from "../../../../common/utils";
import { uint, int } from "../../../../legacy/AS3Legacy";
import Block, { BlockType } from "../../../api/block/Block";
import IMap from "../../../api/map/IMap";
import IMapStorage from "../../../api/map/IMapStorage";
import BlockBedrock from "../blocks/Bedrock";
import BlockColorSpawner from "../blocks/ColorSpawner";
import BlockGate from "../blocks/Gate";
import BlockGlass from "../blocks/Glass";
import BlockLaserTrap from "../blocks/LaserTrap";
import BlockMetal from "../blocks/Metal";
import BlockMoveableWall from "../blocks/MoveableWall";
import BlockSupplyPoint from "../blocks/SupplyPoint";
import BlockVoid from "../blocks/Void";
import BlockWall from "../blocks/Wall";
import BlockWater from "../blocks/Water";
import BlockXTrapHurt from "../blocks/XTrapHurt";
import BlockXTrapKill from "../blocks/XTrapKill";
import BlockXTrapRotate from "../blocks/XTrapRotate";
import { fillBlock, setBlock, drawLaserTrapDownPillar, drawLaserTrapUpPillar, addSpawnPointWithMark, fillReflectBlock, setReflectBlock, fillReflectMirrorBlock, setReflectMirrorBlock } from "../maps/MapConstructTools";
import MapStorageSparse from "../maps/MapStorageSparse";
import Map_V1 from "../maps/Map_V1";
import { ALL_NATIVE_BLOCKS, NativeBlockTypes } from "./BlockTypeRegistry";

/**
 * 定义所有游戏原生（自带）的地图
 * ? 或许后续会独立出来作为「外置地图包」实现
 */
export module NativeMaps {

    // 地图的一般预设：大小、方块等
    export const MAP_SIZE: uint = 24;
    export const MAP_MAX_X: uint = MAP_SIZE - 1;
    export const MAP_MAX_Y: uint = MAP_SIZE - 1;

    const VOID: Block = BlockVoid.INSTANCE;
    const BEDROCK: Block = new BlockBedrock();
    const WALL: Block = new BlockWall();
    const WATER: Block = new BlockWater();
    const GLASS: Block = new BlockGlass();
    const METAL: Block = new BlockMetal();
    const MOVEABLE_WALL: Block = new BlockMoveableWall();
    const X_TRAP_HURT: Block = BlockXTrapHurt.INSTANCE;
    const X_TRAP_KILL: Block = BlockXTrapKill.INSTANCE;
    const X_TRAP_ROTATE: Block = BlockXTrapRotate.INSTANCE;
    const COLOR_SPAWNER: Block = BlockColorSpawner.INSTANCE;
    const LASER_TRAP: Block = BlockLaserTrap.INSTANCE;
    const SUPPLY_POINT: Block = BlockSupplyPoint.INSTANCE;

    // 所有地图存储的常量
    const STORAGE_EMPTY: MapStorageSparse = new MapStorageSparse(2);
    const STORAGE_FRAME: MapStorageSparse = new MapStorageSparse(2);
    const STORAGE_2: MapStorageSparse = new MapStorageSparse(2);
    const STORAGE_1: MapStorageSparse = new MapStorageSparse(2);
    const STORAGE_3: MapStorageSparse = new MapStorageSparse(2);
    const STORAGE_4: MapStorageSparse = new MapStorageSparse(2);
    const STORAGE_5: MapStorageSparse = new MapStorageSparse(2);
    const STORAGE_6: MapStorageSparse = new MapStorageSparse(2);
    const STORAGE_7: MapStorageSparse = new MapStorageSparse(2);
    const STORAGE_8: MapStorageSparse = new MapStorageSparse(2);
    const STORAGE_9: MapStorageSparse = new MapStorageSparse(2);
    const STORAGE_A: MapStorageSparse = new MapStorageSparse(2);
    const STORAGE_B: MapStorageSparse = new MapStorageSparse(2);
    const STORAGE_C: MapStorageSparse = new MapStorageSparse(2);
    const STORAGE_D: MapStorageSparse = new MapStorageSparse(2);
    const STORAGE_E: MapStorageSparse = new MapStorageSparse(2);
    const STORAGE_F: MapStorageSparse = new MapStorageSparse(2);
    const STORAGE_G: MapStorageSparse = new MapStorageSparse(2);
    const STORAGE_H: MapStorageSparse = new MapStorageSparse(2);

    // 所有地图的常量
    /** 原先AS3的地图尺寸：24×24 */
    export const _AS3_CONSERVED_MAP_SIZE: iPoint = new iPoint(24, 24)
    export const EMPTY: Map_V1 = new Map_V1('EMPTY', STORAGE_EMPTY, _AS3_CONSERVED_MAP_SIZE);
    export const FRAME: Map_V1 = new Map_V1('FRAME', STORAGE_FRAME, _AS3_CONSERVED_MAP_SIZE);
    export const MAP_1: Map_V1 = new Map_V1('1', STORAGE_1, _AS3_CONSERVED_MAP_SIZE);
    export const MAP_2: Map_V1 = new Map_V1('2', STORAGE_2, _AS3_CONSERVED_MAP_SIZE);
    export const MAP_3: Map_V1 = new Map_V1('3', STORAGE_3, _AS3_CONSERVED_MAP_SIZE);
    export const MAP_4: Map_V1 = new Map_V1('4', STORAGE_4, _AS3_CONSERVED_MAP_SIZE);
    export const MAP_5: Map_V1 = new Map_V1('5', STORAGE_5, _AS3_CONSERVED_MAP_SIZE);
    export const MAP_6: Map_V1 = new Map_V1('6', STORAGE_6, _AS3_CONSERVED_MAP_SIZE);
    export const MAP_7: Map_V1 = new Map_V1('7', STORAGE_7, _AS3_CONSERVED_MAP_SIZE);
    export const MAP_8: Map_V1 = new Map_V1('8', STORAGE_8, _AS3_CONSERVED_MAP_SIZE);
    export const MAP_9: Map_V1 = new Map_V1('9', STORAGE_9, _AS3_CONSERVED_MAP_SIZE);
    export const MAP_A: Map_V1 = new Map_V1('A', STORAGE_A, _AS3_CONSERVED_MAP_SIZE, true);
    export const MAP_B: Map_V1 = new Map_V1('B', STORAGE_B, _AS3_CONSERVED_MAP_SIZE, true);
    export const MAP_C: Map_V1 = new Map_V1('C', STORAGE_C, _AS3_CONSERVED_MAP_SIZE, true);
    export const MAP_D: Map_V1 = new Map_V1('D', STORAGE_D, _AS3_CONSERVED_MAP_SIZE, true);
    export const MAP_E: Map_V1 = new Map_V1('E', STORAGE_E, _AS3_CONSERVED_MAP_SIZE, true);
    export const MAP_F: Map_V1 = new Map_V1('F', STORAGE_F, _AS3_CONSERVED_MAP_SIZE, true);
    export const MAP_G: Map_V1 = new Map_V1('G', STORAGE_G, _AS3_CONSERVED_MAP_SIZE, true);
    export const MAP_H: Map_V1 = new Map_V1('H', STORAGE_H, _AS3_CONSERVED_MAP_SIZE, true);

    export const ALL_NATIVE_MAPS: IMap[] = [
        EMPTY,
        FRAME,
        MAP_1,
        MAP_2,
        MAP_3,
        MAP_4,
        MAP_5,
        MAP_6,
        MAP_7,
        MAP_8,
        MAP_9,
        MAP_A,
        MAP_B,
        MAP_C,
        MAP_D,
        MAP_E,
        MAP_F,
        MAP_G,
        MAP_H,
    ];
    // ! 后面都是直接对引用的对象进行修改，故预先声明有效

    //========Init Maps========//
    let i: uint, ix: uint, iy: uint;

    //====Empty====//
    STORAGE_EMPTY.setBorder(
        new iPoint(0, 0),
        new iPoint(MAP_MAX_X, MAP_MAX_Y)
    ); // ! 有必要给空地图整理好边界

    //====Basic Frame====//
    fillBlock(STORAGE_FRAME.copyBorderFrom(STORAGE_EMPTY), 0, 0, MAP_MAX_X, MAP_MAX_Y, BEDROCK, true);

    //====Map 1====//
    STORAGE_1.copyFrom(STORAGE_FRAME); {
        for (ix = 3; ix < MAP_MAX_X; ix += 4) {
            for (iy = 3; iy < MAP_MAX_Y; iy += 4) {
                fillBlock(STORAGE_1, ix, iy, ix + 1, iy + 1, WALL);
            }
        }
    }
    //====Map 2====//
    STORAGE_2.copyFrom(STORAGE_FRAME); {
        fillBlock(STORAGE_2, 4, 4, 10, 10, WALL);
        fillBlock(STORAGE_2, 4, 13, 10, 19, WALL);
        fillBlock(STORAGE_2, 13, 4, 19, 10, WALL);
        fillBlock(STORAGE_2, 13, 13, 19, 19, WALL);
    }
    //====Map 3====//
    STORAGE_3.copyFrom(STORAGE_FRAME); {
        for (iy = 3; iy <= MAP_MAX_Y; iy += 4) {
            fillBlock(STORAGE_3, 3, iy, 20, iy + 1, WATER);
        }
    }
    //====Map 4====//
    STORAGE_4.copyFrom(STORAGE_FRAME); {
        fillBlock(STORAGE_4, 3, 3, 20, 4, WALL);
        fillBlock(STORAGE_4, 3, 19, 20, 20, WALL);
        fillBlock(STORAGE_4, 11, 5, 12, 18, GLASS);
    }
    //====Map 5====//
    STORAGE_5.generatorF = (storage: IMapStorage): IMapStorage => {
        storage.copyFrom(STORAGE_FRAME, true, false);
        let randNum: int = 24 + randInt(47), randType: BlockType;
        let iP: iPoint;
        while (--randNum > 0) {
            iP = storage.randomPoint;
            if (storage.getBlockType(iP) == NativeBlockTypes.BEDROCK) {
                storage.setVoid(iP);
            } /*
					else if(Utils.randomBoolean()) {
						if(Utils.randomBoolean(1,3)) {
							map.setBlock(iP, X_TRAP_KILL);
						}
						else {
							map.setBlock(iP, X_TRAP_HURT);
						}
					}*/
            else {
                randType = randomIn(ALL_NATIVE_BLOCKS);
                storage.setBlock(iP, (randType as any).randomInstance(randType)); // ! 一定是Block的子类型
            }
        }
        return storage;
    };
    STORAGE_5.generateNext()
    //====Map 6====//
    STORAGE_6.copyFrom(STORAGE_FRAME); {
        setBlock(STORAGE_6, 3, 3, BlockColorSpawner.INSTANCE);
        setBlock(STORAGE_6, 3, 20, BlockColorSpawner.INSTANCE);
        setBlock(STORAGE_6, 20, 3, BlockColorSpawner.INSTANCE);
        setBlock(STORAGE_6, 20, 20, BlockColorSpawner.INSTANCE);

        // 1
        setBlock(STORAGE_6, 20, 9, BlockColorSpawner.INSTANCE);
        setBlock(STORAGE_6, 20, 14, BlockColorSpawner.INSTANCE);

        // x+
        setBlock(STORAGE_6, 3, 9, BlockColorSpawner.INSTANCE);
        setBlock(STORAGE_6, 3, 14, BlockColorSpawner.INSTANCE);

        // x-
        setBlock(STORAGE_6, 9, 20, BlockColorSpawner.INSTANCE);
        setBlock(STORAGE_6, 14, 20, BlockColorSpawner.INSTANCE);

        // y+
        setBlock(STORAGE_6, 9, 3, BlockColorSpawner.INSTANCE);
        setBlock(STORAGE_6, 14, 3, BlockColorSpawner.INSTANCE);

        // y-
        fillBlock(STORAGE_6, 4, 20, 8, 20, GLASS);
        fillBlock(STORAGE_6, 15, 20, 19, 20, GLASS);

        // #y+
        fillBlock(STORAGE_6, 4, 3, 8, 3, GLASS);
        fillBlock(STORAGE_6, 15, 3, 19, 3, GLASS);

        // #y-
        fillBlock(STORAGE_6, 20, 4, 20, 8, GLASS);
        fillBlock(STORAGE_6, 20, 15, 20, 19, GLASS);

        // #x+
        fillBlock(STORAGE_6, 3, 4, 3, 8, GLASS);
        fillBlock(STORAGE_6, 3, 15, 3, 19, GLASS);

        // #x-
        fillBlock(STORAGE_6, 9, 9, 14, 14, X_TRAP_HURT, true);
        fillBlock(STORAGE_6, 11, 11, 12, 12, X_TRAP_KILL, true);
    }
    //====Map 7====//
    STORAGE_7.copyFrom(STORAGE_FRAME); {
        fillBlock(STORAGE_7, 1, 5, 22, 6, WATER);

        // up side
        fillBlock(STORAGE_7, 1, 17, 22, 18, WATER);

        // down side
        setBlock(STORAGE_7, 10, 10, COLOR_SPAWNER);
        setBlock(STORAGE_7, 10, 13, COLOR_SPAWNER);
        setBlock(STORAGE_7, 13, 10, COLOR_SPAWNER);
        setBlock(STORAGE_7, 13, 13, COLOR_SPAWNER);
        fillBlock(STORAGE_7, 9, 11, 9, 12, X_TRAP_KILL);

        // x-
        fillBlock(STORAGE_7, 11, 9, 12, 9, X_TRAP_KILL);

        // y-
        fillBlock(STORAGE_7, 14, 11, 14, 12, X_TRAP_KILL);

        // x+
        fillBlock(STORAGE_7, 11, 14, 12, 14, X_TRAP_KILL);

        // y+
    }
    //====Map 8====//
    STORAGE_8.copyFrom(STORAGE_FRAME); {
        // hole
        fillBlock(STORAGE_8, 0, 12, 0, 13, VOID);
        fillBlock(STORAGE_8, 23, 12, 23, 13, VOID);

        // down
        drawLaserTrapDownPillar(
            STORAGE_8, 4,
            WALL, GLASS, BEDROCK, LASER_TRAP
        );
        drawLaserTrapDownPillar(
            STORAGE_8, 14,
            WALL, GLASS, BEDROCK, LASER_TRAP
        );
        // up
        drawLaserTrapUpPillar(
            STORAGE_8, 9,
            WALL, GLASS, BEDROCK, LASER_TRAP
        );
        drawLaserTrapUpPillar(
            STORAGE_8, 19,
            WALL, GLASS, BEDROCK, LASER_TRAP
        );
    }
    //====Map 9====//
    STORAGE_9.copyFrom(STORAGE_EMPTY); {
        // left
        fillBlock(STORAGE_9, 0, 0, 0, 23, LASER_TRAP);
        // right
        fillBlock(STORAGE_9, 23, 0, 23, 23, LASER_TRAP);
        // center
        fillBlock(STORAGE_9, 11, 11, 12, 12, COLOR_SPAWNER);

        // up side
    }
    //======Arena Maps======//
    //====Map A====//
    STORAGE_A.copyFrom(STORAGE_FRAME); {
        for (i = 0; i < 5; i++) {
            // base
            fillBlock(STORAGE_A, 5, 5 + 3 * i, 18, 6 + 3 * i, WALL);
            if (i < 4) {
                // lines
                fillBlock(STORAGE_A, 6, 7 + 3 * i, 17, 7 + 3 * i, METAL);
                // corner
                fillBlock(STORAGE_A, 1 + (i >> 1) * 20, 1 + (i & 1) * 20, 2 + (i >> 1) * 20, 2 + (i & 1) * 20, X_TRAP_ROTATE);
                addSpawnPointWithMark(STORAGE_A, 2 + (i >> 1) * 19, 2 + (i & 1) * 19);
            }
        }
    }
    //====Map B====//
    STORAGE_B.copyFrom(STORAGE_FRAME); {
        /**
         * Spin 180*:x=23-x,y=23-y
         * for fill:cross input
         */
        // corner spawn point
        for (i = 0; i < 4; i++)
            addSpawnPointWithMark(STORAGE_B, 2 + (i >> 1) * 19, 2 + (i & 1) * 19);
        // Metal Middle Line&Laser Trap
        // l
        fillBlock(STORAGE_B, 0, 9, 13, 9, METAL);
        setBlock(STORAGE_B, 14, 9, LASER_TRAP);
        // r
        fillBlock(STORAGE_B, 10, 14, 23, 14, METAL);
        setBlock(STORAGE_B, 9, 14, LASER_TRAP);
        // center X_TRAP_KILL
        fillBlock(STORAGE_B, 11, 11, 12, 12, X_TRAP_KILL);
        // side water&spawner
        // l
        fillBlock(STORAGE_B, 6, 10, 6, 17, WATER);
        setBlock(STORAGE_B, 3, 16, COLOR_SPAWNER);
        setBlock(STORAGE_B, 3, 12, COLOR_SPAWNER);
        // r
        fillBlock(STORAGE_B, 17, 6, 17, 13, WATER);
        setBlock(STORAGE_B, 20, 7, COLOR_SPAWNER);
        setBlock(STORAGE_B, 20, 11, COLOR_SPAWNER);
        // up&down side X_TRAP_HURT/WATER/BEDROCK
        // u
        fillBlock(STORAGE_B, 19, 4, 22, 4, BEDROCK);
        fillBlock(STORAGE_B, 6, 4, 18, 4, WATER);
        fillBlock(STORAGE_B, 6, 2, 20, 2, X_TRAP_HURT);

        // d
        fillBlock(STORAGE_B, 1, 19, 4, 19, BEDROCK);
        fillBlock(STORAGE_B, 5, 19, 17, 19, WATER);
        fillBlock(STORAGE_B, 3, 21, 17, 21, X_TRAP_HURT);

        // corner X_TRAP_HURT/WATER
        // ul
        fillBlock(STORAGE_B, 2, 3, 2, 7, X_TRAP_HURT);
        fillBlock(STORAGE_B, 4, 1, 4, 7, WATER);

        // dr
        fillBlock(STORAGE_B, 21, 16, 21, 20, X_TRAP_HURT);
        fillBlock(STORAGE_B, 19, 16, 19, 22, WATER);
    }
    //====Map C====//
    STORAGE_C.copyFrom(STORAGE_FRAME); {
        // center C
        // h
        fillBlock(STORAGE_C, 6, 6, 17, 6, BEDROCK);
        fillBlock(STORAGE_C, 6, 17, 17, 17, BEDROCK);

        // l
        fillBlock(STORAGE_C, 6, 6, 6, 17, BEDROCK);

        for (i = 0; i < 4; i++) {
            if (i < 2) {
                // 10*Spawner
                setBlock(STORAGE_C, 6, 6 + i * 11, COLOR_SPAWNER);
                setBlock(STORAGE_C, 10, 6 + i * 11, COLOR_SPAWNER);
                setBlock(STORAGE_C, 13, 6 + i * 11, COLOR_SPAWNER);
                setBlock(STORAGE_C, 17, 6 + i * 11, COLOR_SPAWNER);
                setBlock(STORAGE_C, 6, 10 + i * 3, COLOR_SPAWNER);
                // Spawn Point/Wall,l
                addSpawnPointWithMark(STORAGE_C, 3, 11 + i);
                setBlock(STORAGE_C, 3, 10 + i * 3, WALL);
                // water/wall,r
                setBlock(STORAGE_C, 20, 11 + i, WATER);
                setBlock(STORAGE_C, 20, 10 + i * 3, WALL);
            }
            // Spawn Point/Wall,u&d
            addSpawnPointWithMark(STORAGE_C, 11 + (i & 1), 3 + 17 * (i >> 1));
            setBlock(STORAGE_C, 10 + (i & 1) * 3, 3 + 17 * (i >> 1), WALL);
            // corner LaserTrap/XTrapHurt
            setBlock(STORAGE_C, 3 + (i >> 1) * 17, 3 + (i & 1) * 17, LASER_TRAP);
            setBlock(STORAGE_C, 2 + (i >> 1) * 17, 3 + (i & 1) * 17, X_TRAP_HURT);
            setBlock(STORAGE_C, 3 + (i >> 1) * 17, 2 + (i & 1) * 17, X_TRAP_HURT);
            setBlock(STORAGE_C, 4 + (i >> 1) * 17, 3 + (i & 1) * 17, X_TRAP_HURT);
            setBlock(STORAGE_C, 3 + (i >> 1) * 17, 4 + (i & 1) * 17, X_TRAP_HURT);
        }
    }
    //====Map D====//
    STORAGE_D.copyFrom(STORAGE_FRAME); {
        for (i = 0; i < 4; i++) {
            // Water Circle
            // long_line
            fillBlock(STORAGE_D, 9 + (i >> 1) * 2, 4 + (i & 1) * 15, 12 + (i >> 1) * 2, 4 + (i & 1) * 15, WATER);
            fillBlock(STORAGE_D, 4 + (i & 1) * 15, 9 + (i >> 1) * 2, 4 + (i & 1) * 15, 12 + (i >> 1) * 2, WATER);

            // 2x line
            // h
            setBlock(STORAGE_D, 7 + (i >> 1) * 8, 5 + (i & 1) * 13, WATER);
            setBlock(STORAGE_D, 8 + (i >> 1) * 8, 5 + (i & 1) * 13, WATER);
            // v
            setBlock(STORAGE_D, 5 + (i & 1) * 13, 7 + (i >> 1) * 8, WATER);
            setBlock(STORAGE_D, 5 + (i & 1) * 13, 8 + (i >> 1) * 8, WATER);
            // point
            setBlock(STORAGE_D, 6 + (i >> 1) * 11, 6 + (i & 1) * 11, WATER);
            if (i < 2) {
                // Spawn Point/Wall,d
                addSpawnPointWithMark(STORAGE_D, 11 + i, 21);
                setBlock(STORAGE_D, 10 + i * 3, 21, WALL);
            }
            // corner spawner
            setBlock(STORAGE_D, 4 + (i >> 1) * 15, 4 + (i & 1) * 15, COLOR_SPAWNER);
            // Spawn Point/Wall,l&r
            addSpawnPointWithMark(STORAGE_D, 2 + 19 * (i >> 1), 11 + (i & 1));
            setBlock(STORAGE_D, 2 + 19 * (i >> 1), 10 + (i & 1) * 3, WALL);
            // center band
            setBlock(STORAGE_D, 11 + (i >> 1), 10 + (i & 1) * 3, LASER_TRAP);
        }
        // XTrapRotate,u
        fillBlock(STORAGE_D, 11, 3, 12, 4, X_TRAP_ROTATE);

        // XTrapKill,l
        fillBlock(STORAGE_D, 7, 10, 10, 13, X_TRAP_KILL);

        // XTrapHurt,r
        fillBlock(STORAGE_D, 13, 10, 16, 13, X_TRAP_HURT);
    }
    //====Map E====//
    STORAGE_E.copyFrom(STORAGE_FRAME); {
        for (i = 0; i < 4; i++)
            addSpawnPointWithMark(STORAGE_E, 2 + (i >> 1) * 19, 2 + (i & 1) * 19);
        // Center E
        fillReflectBlock(STORAGE_E, false, true, 6, 6, 17, 7, BEDROCK);
        fillBlock(STORAGE_E, 6, 8, 7, 15, BEDROCK);
        fillBlock(STORAGE_E, 6, 11, 17, 12, BEDROCK);

        // corner water/laserTrap
        fillReflectBlock(STORAGE_E, true, true, 4, 1, 4, 5, WATER);
        setReflectBlock(STORAGE_E, true, true, 6, 6, LASER_TRAP);

        // 1x1 Water,l
        setReflectBlock(STORAGE_E, false, true, 2, 4, WATER);

        // killTrap/spawner,l
        setReflectBlock(STORAGE_E, false, true, 3, 11, COLOR_SPAWNER);
        setReflectBlock(STORAGE_E, false, true, 1, 11, X_TRAP_KILL);
        setReflectBlock(STORAGE_E, false, true, 5, 11, X_TRAP_KILL);
        fillReflectBlock(STORAGE_E, false, true, 1, 7, 2, 7, X_TRAP_KILL);
        fillReflectBlock(STORAGE_E, false, true, 4, 7, 5, 7, X_TRAP_KILL);
        fillReflectBlock(STORAGE_E, false, true, 2, 9, 4, 9, X_TRAP_KILL);

        // water/rotate/supply,u&d
        fillReflectBlock(STORAGE_E, false, true, 6, 4, 18, 4, WATER);
        fillReflectBlock(STORAGE_E, false, true, 9, 9, 18, 9, WATER);
        fillBlock(STORAGE_E, 19, 6, 19, 17, WATER);
        fillReflectBlock(STORAGE_E, false, true, 15, 1, 15, 3, X_TRAP_ROTATE);
        setBlock(STORAGE_E, 19, 11, X_TRAP_ROTATE);
        setBlock(STORAGE_E, 19, 12, X_TRAP_ROTATE);
        setReflectBlock(STORAGE_E, false, true, 17, 2, SUPPLY_POINT);

        // hurt,r
        fillBlock(STORAGE_E, 21, 4, 21, 19, X_TRAP_HURT);
    }
    //====Map F====//
    STORAGE_F.copyFrom(STORAGE_EMPTY); { // ! 【20230913 17:47:00】注意：因为「方块类」是用于存储「方块状态」的，故这里的Gate状态不能共用
        // Center spawnPoint
        for (i = 0; i < 4; i++)
            addSpawnPointWithMark(STORAGE_F, 11 + (i >> 1), 11 + (i & 1));
        // Bedrock&Gate
        setReflectBlock(STORAGE_F, true, true, 1, 1, BEDROCK);
        fillReflectMirrorBlock(STORAGE_F, true, true, 2, 1, 8, 1, BEDROCK);
        setReflectMirrorBlock(STORAGE_F, true, true, 1, 0, new BlockGate(true));
        setReflectMirrorBlock(STORAGE_F, true, true, 9, 1, new BlockGate(true));

        // Traps/gate/supply
        setReflectBlock(STORAGE_F, true, true, 3, 3, X_TRAP_KILL);
        setReflectBlock(STORAGE_F, true, true, 5, 5, X_TRAP_HURT);
        setReflectBlock(STORAGE_F, true, true, 7, 7, X_TRAP_HURT);
        setReflectBlock(STORAGE_F, true, true, 6, 6, SUPPLY_POINT);
        setReflectMirrorBlock(STORAGE_F, true, true, 7, 5, X_TRAP_HURT);
        setReflectMirrorBlock(STORAGE_F, true, true, 6, 5, X_TRAP_ROTATE);
        setReflectMirrorBlock(STORAGE_F, true, true, 7, 6, X_TRAP_ROTATE);

        // Water/Trap/spawner/gate,c
        fillReflectMirrorBlock(STORAGE_F, true, true, 10, 1, 10, 6, WATER);
        setReflectBlock(STORAGE_F, true, true, 8, 8, COLOR_SPAWNER);
        setReflectMirrorBlock(STORAGE_F, true, true, 9, 8, LASER_TRAP);
        setReflectMirrorBlock(STORAGE_F, true, true, 10, 7, new BlockGate(true), true);
        setReflectMirrorBlock(STORAGE_F, true, true, 10, 8, BEDROCK);
        setReflectMirrorBlock(STORAGE_F, true, true, 11, 8, new BlockGate(true), true);
    }
    //====Map G====//
    STORAGE_G.copyFrom(STORAGE_FRAME); {
        fillReflectMirrorBlock(STORAGE_G, true, true, 3, 3, 8, 3, BEDROCK);
        setReflectMirrorBlock(STORAGE_G, true, true, 1, 1, MOVEABLE_WALL);
        fillBlock(STORAGE_G, 4, 4, 19, 19, new BlockGate(true), false, true);
        for (i = 0; i < 4; i++)
            addSpawnPointWithMark(STORAGE_G, 2 + (i >> 1) * 19, 2 + (i & 1) * 19);
    }
    //====Map H====//
    STORAGE_H.generatorF = (storage: IMapStorage): IMapStorage => {
        storage.copyFrom(STORAGE_FRAME, true, false);
        fillReflectMirrorBlock(STORAGE_H, true, true, 4, 4, 9, 4, BEDROCK);
        ix = randomBoolean2() ? 0 : 9;
        iy = randomBoolean2() ? 0 : 9;
        fillBlock(STORAGE_H, 5 + ix, 5 + iy, 9 + ix, 9 + iy, MOVEABLE_WALL, false);
        for (i = 10; i <= 13; i++) {
            // x
            addSpawnPointWithMark(STORAGE_H, i, 4);
            addSpawnPointWithMark(STORAGE_H, i, 19);
            // y
            addSpawnPointWithMark(STORAGE_H, 4, i);
            addSpawnPointWithMark(STORAGE_H, 19, i);
        }
        return storage
    };
    STORAGE_H.generateNext()
}
