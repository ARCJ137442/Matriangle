import { randInt } from "../../common/exMath";
import { randomIn, randomInParas } from "../../common/utils";
import { uint, int } from "../../legacy/AS3Legacy";
import BlockCommon, { BlockType } from "../block/BlockCommon";
import BlockColorSpawner from "../block/blocks/ColorSpawner";
import IMap from "../block/system/IMap";
import IMapStorage from "../block/system/IMapStorage";
import Map_V1 from "../block/system/Map_V1";
import { fillBlock, setBlock, drawLaserTrapDownPillar, drawLaserTrapUpPillar, fillReflectBlock, setReflectBlock, fillReflectMirrorBlock, setReflectMirrorBlock } from "../block/system/maps/MapConstructTools";
import MapStorageSparse from "../block/system/storage/MapStorageSparse";
import { NativeBlockTypes } from "./BlockRegistry";

/**
 * 定义所有游戏原生（自带）的地图
 * ? 或许后续会独立出来作为「外置地图包」实现
 */
export module NativeMaps {

    // 地图的一般预设：大小、方块等
    export const MAP_SIZE: uint = 24;
    export const MAP_MAX_X: uint = MAP_SIZE - 1;
    export const MAP_MAX_Y: uint = MAP_SIZE - 1;

    //  TODO: 【20230909 21:50:27】将「从方块类型直接到方块对象」的函数抽象成「共用方块对象」

    // 所有地图的常量
    export const EMPTY: IMap = new Map_V1('EMPTY', new MapStorageSparse());
    export const FRAME: IMap = new Map_V1('FRAME', new MapStorageSparse());
    export const MAP_1: IMap = new Map_V1('1', new MapStorageSparse());
    export const MAP_2: IMap = new Map_V1('2', new MapStorageSparse());
    export const MAP_3: IMap = new Map_V1('3', new MapStorageSparse());
    export const MAP_4: IMap = new Map_V1('4', new MapStorageSparse());
    export const MAP_5: IMap = new Map_V1('5', new MapStorageSparse());
    export const MAP_6: IMap = new Map_V1('6', new MapStorageSparse());
    export const MAP_7: IMap = new Map_V1('7', new MapStorageSparse());
    export const MAP_8: IMap = new Map_V1('8', new MapStorageSparse());
    export const MAP_9: IMap = new Map_V1('9', new MapStorageSparse());
    export const MAP_A: IMap = new Map_V1('A', new MapStorageSparse(), true);
    export const MAP_B: IMap = new Map_V1('B', new MapStorageSparse(), true);
    export const MAP_C: IMap = new Map_V1('C', new MapStorageSparse(), true);
    export const MAP_D: IMap = new Map_V1('D', new MapStorageSparse(), true);
    export const MAP_E: IMap = new Map_V1('E', new MapStorageSparse(), true);
    export const MAP_F: IMap = new Map_V1('F', new MapStorageSparse(), true);
    export const MAP_G: IMap = new Map_V1('G', new MapStorageSparse(), true);
    export const MAP_H: IMap = new Map_V1('H', new MapStorageSparse(), true);

    // if(isInited) return
    //========Init Maps========//
    let i: uint, ix: uint, iy: uint;

    //====Basic Frame====//
    fillBlock(FRAME.storage, 0, 0, MAP_MAX_X - 1, MAP_MAX_Y - 1, NativeBlockTypes.BEDROCK, true);

    //====Map 1====//
    MAP_1.storage.copyContentFrom(FRAME.storage); {
        for (ix = 3; ix < MAP_MAX_X - 4; ix += 4) {
            for (iy = 3; iy < MAP_MAX_Y - 4; iy += 4) {
                fillBlock(MAP_1.storage, ix, iy, ix + 1, iy + 1, NativeBlockTypes.WALL);
            }
        }
    }
    //====Map 2====//
    MAP_2.storage.copyContentFrom(FRAME.storage); {
        fillBlock(MAP_2.storage, 4, 4, 10, 10, NativeBlockTypes.WALL);

        fillBlock(MAP_2.storage, 4, 13, 10, 19, NativeBlockTypes.WALL);

        fillBlock(MAP_2.storage, 13, 4, 19, 10, NativeBlockTypes.WALL);

        fillBlock(MAP_2.storage, 13, 13, 19, 19, NativeBlockTypes.WALL);
    }
    //====Map 3====//
    MAP_3.storage.copyContentFrom(FRAME.storage); {
        for (iy = 3; iy < MAP_MAX_Y - 4; iy += 4) {
            fillBlock(MAP_3.storage, 3, iy, 20, iy + 1, NativeBlockTypes.WATER);
        }
    }
    //====Map 4====//
    MAP_4.storage.copyContentFrom(FRAME.storage); {
        fillBlock(MAP_4.storage, 3, 3, 20, 4, NativeBlockTypes.WALL);

        fillBlock(MAP_4.storage, 3, 19, 20, 20, NativeBlockTypes.WALL);

        fillBlock(MAP_4.storage, 11, 5, 12, 18, NativeBlockTypes.GLASS);
    }
    //====Map 5====//
    MAP_5.storage.generatorF = function (storage: IMapStorage): IMapStorage {
        storage.copyContentFrom(FRAME.storage);
        let randNum: int = 24 + randInt(47), randType: BlockType;
        let ix: int, iy: int;
        while (--randNum > 0) {
            ix = storage.randomX, iy = storage.randomY;
            if (storage.getBlockType(ix, iy) == NativeBlockTypes.BEDROCK) {
                storage.setVoid(ix, iy);
            } /*
					else if(Utils.randomBoolean()) {
						if(Utils.randomBoolean(1,3)) {
							map.setBlock(ix,iy,BlockCommon.fromType(NativeBlockTypes.X_TRAP_KILL));
						}
						else {
							map.setBlock(ix,iy,BlockCommon.fromType(NativeBlockTypes.X_TRAP_HURT));
						}
					}*/
            else {
                randType = randomIn(NativeBlockTypes.ALL_NATIVE_BLOCKS);
                storage.setBlock(ix, iy, (randType as any).randomInstance(randType)); // ! 一定是BlockCommon的子类型
            }
        }
        return storage;
    };
    //====Map 6====//
    MAP_6.storage.copyContentFrom(FRAME.storage); {
        setBlock(MAP_6.storage, 3, 3, BlockColorSpawner.INSTANCE);
        setBlock(MAP_6.storage, 3, 20, BlockColorSpawner.INSTANCE);
        setBlock(MAP_6.storage, 20, 3, BlockColorSpawner.INSTANCE);
        setBlock(MAP_6.storage, 20, 20, BlockColorSpawner.INSTANCE);

        // 1
        setBlock(MAP_6.storage, 20, 9, BlockColorSpawner.INSTANCE);
        setBlock(MAP_6.storage, 20, 14, BlockColorSpawner.INSTANCE);

        // x+
        setBlock(MAP_6.storage, 3, 9, BlockColorSpawner.INSTANCE);
        setBlock(MAP_6.storage, 3, 14, BlockColorSpawner.INSTANCE);

        // x-
        setBlock(MAP_6.storage, 9, 20, BlockColorSpawner.INSTANCE);
        setBlock(MAP_6.storage, 14, 20, BlockColorSpawner.INSTANCE);

        // y+
        setBlock(MAP_6.storage, 9, 3, BlockColorSpawner.INSTANCE);
        setBlock(MAP_6.storage, 14, 3, BlockColorSpawner.INSTANCE);

        // y-
        fillBlock(MAP_6.storage, 4, 20, 8, 20, NativeBlockTypes.GLASS);
        fillBlock(MAP_6.storage, 15, 20, 19, 20, NativeBlockTypes.GLASS);

        // #y+
        fillBlock(MAP_6.storage, 4, 3, 8, 3, NativeBlockTypes.GLASS);
        fillBlock(MAP_6.storage, 15, 3, 19, 3, NativeBlockTypes.GLASS);

        // #y-
        fillBlock(MAP_6.storage, 20, 4, 20, 8, NativeBlockTypes.GLASS);
        fillBlock(MAP_6.storage, 20, 15, 20, 19, NativeBlockTypes.GLASS);

        // #x+
        fillBlock(MAP_6.storage, 3, 4, 3, 8, NativeBlockTypes.GLASS);
        fillBlock(MAP_6.storage, 3, 15, 3, 19, NativeBlockTypes.GLASS);

        // #x-
        fillBlock(MAP_6.storage, 9, 9, 14, 14, NativeBlockTypes.X_TRAP_HURT, true);
        fillBlock(MAP_6.storage, 11, 11, 12, 12, NativeBlockTypes.X_TRAP_KILL, true);
    }
    //====Map 7====//
    MAP_7.storage.copyContentFrom(FRAME.storage); {
        fillBlock(MAP_7.storage, 1, 5, 22, 6, NativeBlockTypes.WATER);

        // up side
        fillBlock(MAP_7.storage, 1, 17, 22, 18, NativeBlockTypes.WATER);

        // down side
        setBlock(MAP_7.storage, 10, 10, BlockCommon.fromType(NativeBlockTypes.COLOR_SPAWNER));

        setBlock(MAP_7.storage, 10, 13, BlockCommon.fromType(NativeBlockTypes.COLOR_SPAWNER));

        setBlock(MAP_7.storage, 13, 10, BlockCommon.fromType(NativeBlockTypes.COLOR_SPAWNER));

        setBlock(MAP_7.storage, 13, 13, BlockCommon.fromType(NativeBlockTypes.COLOR_SPAWNER));

        fillBlock(MAP_7.storage, 9, 11, 9, 12, NativeBlockTypes.X_TRAP_KILL);

        // x-
        fillBlock(MAP_7.storage, 11, 9, 12, 9, NativeBlockTypes.X_TRAP_KILL);

        // y-
        fillBlock(MAP_7.storage, 14, 11, 14, 12, NativeBlockTypes.X_TRAP_KILL);

        // x+
        fillBlock(MAP_7.storage, 11, 14, 12, 14, NativeBlockTypes.X_TRAP_KILL);

        // y+
    }
    //====Map 8====//
    MAP_8.storage.copyContentFrom(FRAME.storage); {
        // hole
        fillBlock(MAP_8.storage, 0, 12, 0, 13, NativeBlockTypes.VOID);

        fillBlock(MAP_8.storage, 23, 12, 23, 13, NativeBlockTypes.VOID);

        // down
        drawLaserTrapDownPillar(MAP_8, 4);
        drawLaserTrapDownPillar(MAP_8, 14);
        // up
        drawLaserTrapUpPillar(MAP_8, 9);
        drawLaserTrapUpPillar(MAP_8, 19);
    }
    //====Map 9====//
    MAP_9.storage.copyContentFrom(EMPTY); {
        // left
        fillBlock(MAP_9.storage, 0, 0, 0, 23, NativeBlockTypes.LASER_TRAP);
        // right
        fillBlock(MAP_9.storage, 23, 0, 23, 23, NativeBlockTypes.LASER_TRAP);
        // center
        fillBlock(MAP_9.storage, 11, 11, 12, 12, NativeBlockTypes.COLOR_SPAWNER);

        // up side
    }
    //======Arena Maps======//
    //====Map A====//
    MAP_A.storage.copyContentFrom(FRAME.storage); {
        for (i = 0; i < 5; i++) {
            // base
            fillBlock(MAP_A.storage, 5, 5 + 3 * i, 18, 6 + 3 * i, NativeBlockTypes.WALL);
            if (i < 4) {
                // lines
                fillBlock(MAP_A.storage, 6, 7 + 3 * i, 17, 7 + 3 * i, NativeBlockTypes.METAL);
                // corner
                fillBlock(MAP_A.storage, 1 + (i >> 1) * 20, 1 + (i & 1) * 20, 2 + (i >> 1) * 20, 2 + (i & 1) * 20, NativeBlockTypes.X_TRAP_ROTATE);
                addSpawnPointWithMark(MAP_A.storage, 2 + (i >> 1) * 19, 2 + (i & 1) * 19);
            }
        }
    }
    //====Map B====//
    MAP_B.storage.copyContentFrom(FRAME.storage); {
        /**
         * Spin 180*:x=23-x,y=23-y
         * for fill:cross imput
         */
        // corner spawnpoint
        for (i = 0; i < 4; i++)
            addSpawnPointWithMark(MAP_B.storage, 2 + (i >> 1) * 19, 2 + (i & 1) * 19);
        // Metal Middle Line&Laser Trap
        // l
        fillBlock(MAP_B.storage, 0, 9, 13, 9, NativeBlockTypes.METAL);
        setBlock(MAP_B.storage, 14, 9, BlockCommon.fromType(NativeBlockTypes.LASER_TRAP));
        // r
        fillBlock(MAP_B.storage, 10, 14, 23, 14, NativeBlockTypes.METAL);
        setBlock(MAP_B.storage, 9, 14, BlockCommon.fromType(NativeBlockTypes.LASER_TRAP));
        // center X_TRAP_KILL
        fillBlock(MAP_B.storage, 11, 11, 12, 12, NativeBlockTypes.X_TRAP_KILL);
        // side water&spawner
        // l
        fillBlock(MAP_B.storage, 6, 10, 6, 17, NativeBlockTypes.WATER);

        setBlock(MAP_B.storage, 3, 16, BlockCommon.fromType(NativeBlockTypes.COLOR_SPAWNER));
        setBlock(MAP_B.storage, 3, 12, BlockCommon.fromType(NativeBlockTypes.COLOR_SPAWNER));
        // r
        fillBlock(MAP_B.storage, 17, 6, 17, 13, NativeBlockTypes.WATER);

        setBlock(MAP_B.storage, 20, 7, BlockCommon.fromType(NativeBlockTypes.COLOR_SPAWNER));
        setBlock(MAP_B.storage, 20, 11, BlockCommon.fromType(NativeBlockTypes.COLOR_SPAWNER));
        // up&down side X_TRAP_HURT/WATER/BEDROCK
        // u
        fillBlock(MAP_B.storage, 19, 4, 22, 4, NativeBlockTypes.BEDROCK);

        fillBlock(MAP_B.storage, 6, 4, 18, 4, NativeBlockTypes.WATER);

        fillBlock(MAP_B.storage, 6, 2, 20, 2, NativeBlockTypes.X_TRAP_HURT);

        // d
        fillBlock(MAP_B.storage, 1, 19, 4, 19, NativeBlockTypes.BEDROCK);

        fillBlock(MAP_B.storage, 5, 19, 17, 19, NativeBlockTypes.WATER);

        fillBlock(MAP_B.storage, 3, 21, 17, 21, NativeBlockTypes.X_TRAP_HURT);

        // corner X_TRAP_HURT/WATER
        // ul
        fillBlock(MAP_B.storage, 2, 3, 2, 7, NativeBlockTypes.X_TRAP_HURT);

        fillBlock(MAP_B.storage, 4, 1, 4, 7, NativeBlockTypes.WATER);

        // dr
        fillBlock(MAP_B.storage, 21, 16, 21, 20, NativeBlockTypes.X_TRAP_HURT);

        fillBlock(MAP_B.storage, 19, 16, 19, 22, NativeBlockTypes.WATER);
    }
    //====Map C====//
    MAP_C.storage.copyContentFrom(FRAME.storage); {
        // center C
        // h
        fillBlock(MAP_C.storage, 6, 6, 17, 6, NativeBlockTypes.BEDROCK);

        fillBlock(MAP_C.storage, 6, 17, 17, 17, NativeBlockTypes.BEDROCK);

        // l
        fillBlock(MAP_C.storage, 6, 6, 6, 17, NativeBlockTypes.BEDROCK);

        for (i = 0; i < 4; i++) {
            if (i < 2) {
                // 10*Spawner
                setBlock(MAP_C.storage, 6, 6 + i * 11, BlockCommon.fromType(NativeBlockTypes.COLOR_SPAWNER));
                setBlock(MAP_C.storage, 10, 6 + i * 11, BlockCommon.fromType(NativeBlockTypes.COLOR_SPAWNER));
                setBlock(MAP_C.storage, 13, 6 + i * 11, BlockCommon.fromType(NativeBlockTypes.COLOR_SPAWNER));
                setBlock(MAP_C.storage, 17, 6 + i * 11, BlockCommon.fromType(NativeBlockTypes.COLOR_SPAWNER));
                setBlock(MAP_C.storage, 6, 10 + i * 3, BlockCommon.fromType(NativeBlockTypes.COLOR_SPAWNER));
                // Spawnpoint/Wall,l
                addSpawnPointWithMark(MAP_C.storage, 3, 11 + i);
                setBlock(MAP_C.storage, 3, 10 + i * 3, BlockCommon.fromType(NativeBlockTypes.WALL));
                // water/wall,r
                setBlock(MAP_C.storage, 20, 11 + i, BlockCommon.fromType(NativeBlockTypes.WATER));
                setBlock(MAP_C.storage, 20, 10 + i * 3, BlockCommon.fromType(NativeBlockTypes.WALL));
            }
            // Spawnpoint/Wall,u&d
            addSpawnPointWithMark(MAP_C.storage, 11 + (i & 1), 3 + 17 * (i >> 1));
            setBlock(MAP_C.storage, 10 + (i & 1) * 3, 3 + 17 * (i >> 1), BlockCommon.fromType(NativeBlockTypes.WALL));
            // corner LaserTrap/XTrapHurt
            setBlock(MAP_C.storage, 3 + (i >> 1) * 17, 3 + (i & 1) * 17, BlockCommon.fromType(NativeBlockTypes.LASER_TRAP));
            setBlock(MAP_C.storage, 2 + (i >> 1) * 17, 3 + (i & 1) * 17, BlockCommon.fromType(NativeBlockTypes.X_TRAP_HURT));
            setBlock(MAP_C.storage, 3 + (i >> 1) * 17, 2 + (i & 1) * 17, BlockCommon.fromType(NativeBlockTypes.X_TRAP_HURT));
            setBlock(MAP_C.storage, 4 + (i >> 1) * 17, 3 + (i & 1) * 17, BlockCommon.fromType(NativeBlockTypes.X_TRAP_HURT));
            setBlock(MAP_C.storage, 3 + (i >> 1) * 17, 4 + (i & 1) * 17, BlockCommon.fromType(NativeBlockTypes.X_TRAP_HURT));
        }
    }
    //====Map D====//
    MAP_D.storage.copyContentFrom(FRAME.storage); {
        for (i = 0; i < 4; i++) {
            // Water Circle
            // long_line
            fillBlock(MAP_D.storage, 9 + (i >> 1) * 2, 4 + (i & 1) * 15, 12 + (i >> 1) * 2, 4 + (i & 1) * 15, NativeBlockTypes.WATER);

            fillBlock(MAP_D.storage, 4 + (i & 1) * 15, 9 + (i >> 1) * 2, 4 + (i & 1) * 15, 12 + (i >> 1) * 2, NativeBlockTypes.WATER);

            // 2x line
            // h
            setBlock(MAP_D.storage, 7 + (i >> 1) * 8, 5 + (i & 1) * 13, BlockCommon.fromType(NativeBlockTypes.WATER));
            setBlock(MAP_D.storage, 8 + (i >> 1) * 8, 5 + (i & 1) * 13, BlockCommon.fromType(NativeBlockTypes.WATER));
            // v
            setBlock(MAP_D.storage, 5 + (i & 1) * 13, 7 + (i >> 1) * 8, BlockCommon.fromType(NativeBlockTypes.WATER));
            setBlock(MAP_D.storage, 5 + (i & 1) * 13, 8 + (i >> 1) * 8, BlockCommon.fromType(NativeBlockTypes.WATER));
            // point
            setBlock(MAP_D.storage, 6 + (i >> 1) * 11, 6 + (i & 1) * 11, BlockCommon.fromType(NativeBlockTypes.WATER));
            if (i < 2) {
                // Spawnpoint/Wall,d
                addSpawnPointWithMark(MAP_D.storage, 11 + i, 21);
                setBlock(MAP_D.storage, 10 + i * 3, 21, BlockCommon.fromType(NativeBlockTypes.WALL));
            }
            // corner spawner
            setBlock(MAP_D.storage, 4 + (i >> 1) * 15, 4 + (i & 1) * 15, BlockCommon.fromType(NativeBlockTypes.COLOR_SPAWNER));
            // Spawnpoint/Wall,l&r
            addSpawnPointWithMark(MAP_D.storage, 2 + 19 * (i >> 1), 11 + (i & 1));
            setBlock(MAP_D.storage, 2 + 19 * (i >> 1), 10 + (i & 1) * 3, BlockCommon.fromType(NativeBlockTypes.WALL));
            // center band
            setBlock(MAP_D.storage, 11 + (i >> 1), 10 + (i & 1) * 3, BlockCommon.fromType(NativeBlockTypes.LASER_TRAP));
        }
        // XTrapRotate,u
        fillBlock(MAP_D.storage, 11, 3, 12, 4, NativeBlockTypes.X_TRAP_ROTATE);

        // XTrapKill,l
        fillBlock(MAP_D.storage, 7, 10, 10, 13, NativeBlockTypes.X_TRAP_KILL);

        // XTrapHurt,r
        fillBlock(MAP_D.storage, 13, 10, 16, 13, NativeBlockTypes.X_TRAP_HURT);
    }
    //====Map E====//
    MAP_E.storage.copyContentFrom(FRAME.storage); {
        for (i = 0; i < 4; i++)
            addSpawnPointWithMark(MAP_E.storage, 2 + (i >> 1) * 19, 2 + (i & 1) * 19);
        // Center E
        fillReflectBlock(MAP_E, false, true, 6, 6, 17, 7, NativeBlockTypes.BEDROCK);

        fillBlock(MAP_E.storage, 6, 8, 7, 15, NativeBlockTypes.BEDROCK);

        fillBlock(MAP_E.storage, 6, 11, 17, 12, NativeBlockTypes.BEDROCK);

        // corner water/laserTrap
        fillReflectBlock(MAP_E, true, true, 4, 1, 4, 5, NativeBlockTypes.WATER);
        setReflectBlock(MAP_E, true, true, 6, 6, BlockCommon.fromType(NativeBlockTypes.LASER_TRAP));

        // 1x1 Water,l
        setReflectBlock(MAP_E, false, true, 2, 4, BlockCommon.fromType(NativeBlockTypes.WATER));

        // killTrap/spawner,l
        setReflectBlock(MAP_E, false, true, 3, 11, BlockCommon.fromType(NativeBlockTypes.COLOR_SPAWNER));

        setReflectBlock(MAP_E, false, true, 1, 11, BlockCommon.fromType(NativeBlockTypes.X_TRAP_KILL));

        setReflectBlock(MAP_E, false, true, 5, 11, BlockCommon.fromType(NativeBlockTypes.X_TRAP_KILL));

        fillReflectBlock(MAP_E, false, true, 1, 7, 2, 7, NativeBlockTypes.X_TRAP_KILL);

        fillReflectBlock(MAP_E, false, true, 4, 7, 5, 7, NativeBlockTypes.X_TRAP_KILL);

        fillReflectBlock(MAP_E, false, true, 2, 9, 4, 9, NativeBlockTypes.X_TRAP_KILL);

        // water/rotate/supply,u&d
        fillReflectBlock(MAP_E, false, true, 6, 4, 18, 4, NativeBlockTypes.WATER);

        fillReflectBlock(MAP_E, false, true, 9, 9, 18, 9, NativeBlockTypes.WATER);

        fillBlock(MAP_E.storage, 19, 6, 19, 17, NativeBlockTypes.WATER);

        fillReflectBlock(MAP_E, false, true, 15, 1, 15, 3, NativeBlockTypes.X_TRAP_ROTATE);

        setBlock(MAP_E.storage, 19, 11, BlockCommon.fromType(NativeBlockTypes.X_TRAP_ROTATE));

        setBlock(MAP_E.storage, 19, 12, BlockCommon.fromType(NativeBlockTypes.X_TRAP_ROTATE));

        setReflectBlock(MAP_E, false, true, 17, 2, BlockCommon.fromType(NativeBlockTypes.SUPPLY_POINT));

        // hurt,r
        fillBlock(MAP_E.storage, 21, 4, 21, 19, NativeBlockTypes.X_TRAP_HURT);
    }
    //====Map F====//
    MAP_F.storage.copyContentFrom(EMPTY); {
        // Center spawnPoint
        for (i = 0; i < 4; i++)
            addSpawnPointWithMark(MAP_F.storage, 11 + (i >> 1), 11 + (i & 1));
        // Bedrock&Gate
        setReflectBlock(MAP_F, true, true, 1, 1, BlockCommon.fromType(NativeBlockTypes.BEDROCK));

        fillReflectMirrorBlock(MAP_F, true, true, 2, 1, 8, 1, NativeBlockTypes.BEDROCK);

        setReflectMirrorBlock(MAP_F, true, true, 1, 0, BlockCommon.fromType(NativeBlockTypes.GATE_OPEN));

        setReflectMirrorBlock(MAP_F, true, true, 9, 1, BlockCommon.fromType(NativeBlockTypes.GATE_OPEN));

        // Traps/gate/supply
        setReflectBlock(MAP_F, true, true, 3, 3, BlockCommon.fromType(NativeBlockTypes.X_TRAP_KILL));

        setReflectBlock(MAP_F, true, true, 5, 5, BlockCommon.fromType(NativeBlockTypes.X_TRAP_HURT));

        setReflectBlock(MAP_F, true, true, 7, 7, BlockCommon.fromType(NativeBlockTypes.X_TRAP_HURT));

        setReflectBlock(MAP_F, true, true, 6, 6, BlockCommon.fromType(NativeBlockTypes.SUPPLY_POINT));

        setReflectMirrorBlock(MAP_F, true, true, 7, 5, BlockCommon.fromType(NativeBlockTypes.X_TRAP_HURT));

        setReflectMirrorBlock(MAP_F, true, true, 6, 5, BlockCommon.fromType(NativeBlockTypes.X_TRAP_ROTATE));

        setReflectMirrorBlock(MAP_F, true, true, 7, 6, BlockCommon.fromType(NativeBlockTypes.X_TRAP_ROTATE));

        // Water/Trap/spawner/gate,c
        fillReflectMirrorBlock(MAP_F, true, true, 10, 1, 10, 6, NativeBlockTypes.WATER);

        setReflectBlock(MAP_F, true, true, 8, 8, BlockCommon.fromType(NativeBlockTypes.COLOR_SPAWNER));

        setReflectMirrorBlock(MAP_F, true, true, 9, 8, BlockCommon.fromType(NativeBlockTypes.LASER_TRAP));

        setReflectMirrorBlock(MAP_F, true, true, 10, 7, BlockCommon.fromType(NativeBlockTypes.GATE_OPEN));

        setReflectMirrorBlock(MAP_F, true, true, 10, 8, BlockCommon.fromType(NativeBlockTypes.BEDROCK));

        setReflectMirrorBlock(MAP_F, true, true, 11, 8, BlockCommon.fromType(NativeBlockTypes.GATE_OPEN));
    }
    //====Map G====//
    MAP_G.storage.copyContentFrom(FRAME.storage); {
        fillReflectMirrorBlock(MAP_G, true, true, 3, 3, 8, 3, NativeBlockTypes.BEDROCK);
        setReflectMirrorBlock(MAP_G, true, true, 1, 1, BlockCommon.fromType(NativeBlockTypes.MOVEABLE_WALL));
        fillBlock(MAP_G.storage, 4, 4, 19, 19, NativeBlockTypes.GATE_OPEN, false);
        for (i = 0; i < 4; i++)
            addSpawnPointWithMark(MAP_G.storage, 2 + (i >> 1) * 19, 2 + (i & 1) * 19);
    }
    //====Map H====//
    MAP_H.storage.copyContentFrom(FRAME.storage); {
        fillReflectMirrorBlock(MAP_H, true, true, 4, 4, 9, 4, NativeBlockTypes.BEDROCK);
        ix = Utils.randomBoolean() ? 0 : 9;
        iy = Utils.randomBoolean() ? 0 : 9;
        fillBlock(MAP_H.storage, 5 + ix, 5 + iy, 9 + ix, 9 + iy, NativeBlockTypes.MOVEABLE_WALL, false);
        for (i = 10; i <= 13; i++) {
            // x
            addSpawnPointWithMark(MAP_H.storage, i, 4);
            addSpawnPointWithMark(MAP_H.storage, i, 19);
            // y
            addSpawnPointWithMark(MAP_H.storage, 4, i);
            addSpawnPointWithMark(MAP_H.storage, 19, i);
        }
    }

}
