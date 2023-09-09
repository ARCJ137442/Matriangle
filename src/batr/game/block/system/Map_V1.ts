
// import batr.common.*;
// import batr.general.*;
// import batr.game.block.blocks.XTrap;

import { EMPTY } from "../../../common/keyCodes";
import { iPoint } from "../../../common/intPoint";
import { DISPLAY_GRIDS } from "../../../display/GlobalDisplayVariables";
import { uint, int } from "../../../legacy/AS3Legacy";
import { NativeBlockAttributes } from "../../registry/BlockRegistry";
import BlockAttributes from "../BlockAttributes";
import BlockCommon, { BlockType } from "../BlockCommon";
import IMap from "./IMap";
import IMapDisplayer from "../../../display/map/IMapDisplayer";
import IMapGenerator from "./maps/IMapGenerator";
import MapGenerator from "./maps/MapGenerator";
import NativeMapCommon from "./maps/NativeMapCommon";

// import batr.game.map.*;
// import batr.game.block.*;
// import batr.game.map.*;
// import batr.game.map.main.*;

// import flash.utils.getQualifiedClassName;

/* This's a Game Map<Version 1>
 * This Map only save BlockType,not BlockCommon
 */
export default class Map_V1 extends NativeMapCommon {
	//============Static Variables============//
	protected static readonly _SIZE: uint = DISPLAY_GRIDS;

	public static EMPTY: Map_V1 = new Map_V1('EMPTY');
	public static FRAME: Map_V1 = new Map_V1('FRAME');
	public static MAP_1: Map_V1 = new Map_V1('1');
	public static MAP_2: Map_V1 = new Map_V1('2');
	public static MAP_3: Map_V1 = new Map_V1('3');
	public static MAP_4: Map_V1 = new Map_V1('4');
	public static MAP_5: Map_V1 = new Map_V1('5');
	public static MAP_6: Map_V1 = new Map_V1('6');
	public static MAP_7: Map_V1 = new Map_V1('7');
	public static MAP_8: Map_V1 = new Map_V1('8');
	public static MAP_9: Map_V1 = new Map_V1('9');
	public static MAP_A: Map_V1 = new Map_V1('A', null, true);
	public static MAP_B: Map_V1 = new Map_V1('B', null, true);
	public static MAP_C: Map_V1 = new Map_V1('C', null, true);
	public static MAP_D: Map_V1 = new Map_V1('D', null, true);
	public static MAP_E: Map_V1 = new Map_V1('E', null, true);
	public static MAP_F: Map_V1 = new Map_V1('F', null, true);
	public static MAP_G: Map_V1 = new Map_V1('G', null, true);
	public static MAP_H: Map_V1 = new Map_V1('H', null, true);

	protected static isInited: boolean = Map_V1.cInit();

	//============Static Functions============//
	public static pointToIndex(x: int, y: int): string {
		return String(x + '_' + y);
	}

	public static indexToPoint(str: string): iPoint {
		let s: string[] = str.split('_');

		return new iPoint(int(s[0]), int(s[1]));
	}

	protected static cInit(): boolean {
		// if(isInited) return
		//========Init Maps========//
		let i: uint, ix: uint, iy: uint;

		//====Basic Frame====//
		Map_V1.FRAME.fillBlock(0, 0, Map_V1._SIZE - 1, Map_V1._SIZE - 1, BlockType.BEDROCK, true);

		//====Map 1====//
		Map_V1.MAP_1.copyContentFrom(Map_V1.FRAME); {
			for (ix = 3; ix < Map_V1._SIZE - 4; ix += 4) {
				for (iy = 3; iy < Map_V1._SIZE - 4; iy += 4) {
					Map_V1.MAP_1.fillBlock(ix, iy, ix + 1, iy + 1, BlockType.WALL);
				}
			}
		}
		//====Map 2====//
		Map_V1.MAP_2.copyContentFrom(Map_V1.FRAME); {
			Map_V1.MAP_2.fillBlock(4, 4, 10, 10, BlockType.WALL);

			Map_V1.MAP_2.fillBlock(4, 13, 10, 19, BlockType.WALL);

			Map_V1.MAP_2.fillBlock(13, 4, 19, 10, BlockType.WALL);

			Map_V1.MAP_2.fillBlock(13, 13, 19, 19, BlockType.WALL);
		}
		//====Map 3====//
		Map_V1.MAP_3.copyContentFrom(Map_V1.FRAME); {
			for (iy = 3; iy < Map_V1._SIZE - 4; iy += 4) {
				Map_V1.MAP_3.fillBlock(3, iy, 20, iy + 1, BlockType.WATER);
			}
		}
		//====Map 4====//
		Map_V1.MAP_4.copyContentFrom(Map_V1.FRAME); {
			Map_V1.MAP_4.fillBlock(3, 3, 20, 4, BlockType.WALL);

			Map_V1.MAP_4.fillBlock(3, 19, 20, 20, BlockType.WALL);

			Map_V1.MAP_4.fillBlock(11, 5, 12, 18, BlockType.GLASS);
		}
		//====Map 5====//
		Map_V1.MAP_5._generator = new MapGenerator(function (map: IMap): IMap {
			map.copyContentFrom(Map_V1.FRAME);
			let randNum: int = 24 + exMath.random(47), randType: BlockType;
			let ix: int, iy: int;
			while (--randNum > 0) {
				ix = map.randomX, iy = map.randomY;
				if (map.getBlockType(ix, iy) == BlockType.BEDROCK) {
					map.setVoid(ix, iy);
				} /*
					else if(Utils.randomBoolean()) {
						if(Utils.randomBoolean(1,3)) {
							map.setBlock(ix,iy,BlockCommon.fromType(BlockType.X_TRAP_KILL));
						}
						else {
							map.setBlock(ix,iy,BlockCommon.fromType(BlockType.X_TRAP_HURT));
						}
					}*/
				else {
					randType = BlockType.RANDOM_NORMAL;
					map.setBlock(ix, iy, BlockCommon.fromType(randType));
				}
			}
			return map;
		});
		//====Map 6====//
		Map_V1.MAP_6.copyContentFrom(Map_V1.FRAME); {
			Map_V1.MAP_6.setBlock(3, 3, BlockCommon.fromType(BlockType.COLOR_SPAWNER));

			Map_V1.MAP_6.setBlock(3, 20, BlockCommon.fromType(BlockType.COLOR_SPAWNER));

			Map_V1.MAP_6.setBlock(20, 3, BlockCommon.fromType(BlockType.COLOR_SPAWNER));

			Map_V1.MAP_6.setBlock(20, 20, BlockCommon.fromType(BlockType.COLOR_SPAWNER));

			// 1
			Map_V1.MAP_6.setBlock(20, 9, BlockCommon.fromType(BlockType.COLOR_SPAWNER));

			Map_V1.MAP_6.setBlock(20, 14, BlockCommon.fromType(BlockType.COLOR_SPAWNER));

			// x+
			Map_V1.MAP_6.setBlock(3, 9, BlockCommon.fromType(BlockType.COLOR_SPAWNER));

			Map_V1.MAP_6.setBlock(3, 14, BlockCommon.fromType(BlockType.COLOR_SPAWNER));

			// x-
			Map_V1.MAP_6.setBlock(9, 20, BlockCommon.fromType(BlockType.COLOR_SPAWNER));

			Map_V1.MAP_6.setBlock(14, 20, BlockCommon.fromType(BlockType.COLOR_SPAWNER));

			// y+
			Map_V1.MAP_6.setBlock(9, 3, BlockCommon.fromType(BlockType.COLOR_SPAWNER));

			Map_V1.MAP_6.setBlock(14, 3, BlockCommon.fromType(BlockType.COLOR_SPAWNER));

			// y-
			Map_V1.MAP_6.fillBlock(4, 20, 8, 20, BlockType.GLASS);

			Map_V1.MAP_6.fillBlock(15, 20, 19, 20, BlockType.GLASS);

			// #y+
			Map_V1.MAP_6.fillBlock(4, 3, 8, 3, BlockType.GLASS);

			Map_V1.MAP_6.fillBlock(15, 3, 19, 3, BlockType.GLASS);

			// #y-
			Map_V1.MAP_6.fillBlock(20, 4, 20, 8, BlockType.GLASS);

			Map_V1.MAP_6.fillBlock(20, 15, 20, 19, BlockType.GLASS);

			// #x+
			Map_V1.MAP_6.fillBlock(3, 4, 3, 8, BlockType.GLASS);

			Map_V1.MAP_6.fillBlock(3, 15, 3, 19, BlockType.GLASS);

			// #x-
			Map_V1.MAP_6.fillBlock(9, 9, 14, 14, BlockType.X_TRAP_HURT, true);

			Map_V1.MAP_6.fillBlock(11, 11, 12, 12, BlockType.X_TRAP_KILL, true);
		}
		//====Map 7====//
		Map_V1.MAP_7.copyContentFrom(Map_V1.FRAME); {
			Map_V1.MAP_7.fillBlock(1, 5, 22, 6, BlockType.WATER);

			// up side
			Map_V1.MAP_7.fillBlock(1, 17, 22, 18, BlockType.WATER);

			// down side
			Map_V1.MAP_7.setBlock(10, 10, BlockCommon.fromType(BlockType.COLOR_SPAWNER));

			Map_V1.MAP_7.setBlock(10, 13, BlockCommon.fromType(BlockType.COLOR_SPAWNER));

			Map_V1.MAP_7.setBlock(13, 10, BlockCommon.fromType(BlockType.COLOR_SPAWNER));

			Map_V1.MAP_7.setBlock(13, 13, BlockCommon.fromType(BlockType.COLOR_SPAWNER));

			Map_V1.MAP_7.fillBlock(9, 11, 9, 12, BlockType.X_TRAP_KILL);

			// x-
			Map_V1.MAP_7.fillBlock(11, 9, 12, 9, BlockType.X_TRAP_KILL);

			// y-
			Map_V1.MAP_7.fillBlock(14, 11, 14, 12, BlockType.X_TRAP_KILL);

			// x+
			Map_V1.MAP_7.fillBlock(11, 14, 12, 14, BlockType.X_TRAP_KILL);

			// y+
		}
		//====Map 8====//
		Map_V1.MAP_8.copyContentFrom(Map_V1.FRAME); {
			// hole
			Map_V1.MAP_8.fillBlock(0, 12, 0, 13, BlockType.VOID);

			Map_V1.MAP_8.fillBlock(23, 12, 23, 13, BlockType.VOID);

			// down
			Map_V1.drawLaserTrapDownPillar(Map_V1.MAP_8, 4);
			Map_V1.drawLaserTrapDownPillar(Map_V1.MAP_8, 14);
			// up
			Map_V1.drawLaserTrapUpPillar(Map_V1.MAP_8, 9);
			Map_V1.drawLaserTrapUpPillar(Map_V1.MAP_8, 19);
		}
		//====Map 9====//
		Map_V1.MAP_9.copyContentFrom(EMPTY); {
			// left
			Map_V1.MAP_9.fillBlock(0, 0, 0, 23, BlockType.LASER_TRAP);
			// right
			Map_V1.MAP_9.fillBlock(23, 0, 23, 23, BlockType.LASER_TRAP);
			// center
			Map_V1.MAP_9.fillBlock(11, 11, 12, 12, BlockType.COLOR_SPAWNER);

			// up side
		}
		//======Arena Maps======//
		//====Map A====//
		Map_V1.MAP_A.copyContentFrom(Map_V1.FRAME); {
			for (i = 0; i < 5; i++) {
				// base
				Map_V1.MAP_A.fillBlock(5, 5 + 3 * i, 18, 6 + 3 * i, BlockType.WALL);
				if (i < 4) {
					// lines
					Map_V1.MAP_A.fillBlock(6, 7 + 3 * i, 17, 7 + 3 * i, BlockType.METAL);
					// corner
					Map_V1.MAP_A.fillBlock(1 + (i >> 1) * 20, 1 + (i & 1) * 20, 2 + (i >> 1) * 20, 2 + (i & 1) * 20, BlockType.X_TRAP_ROTATE);
					Map_V1.MAP_A.addSpawnPointWithMark(2 + (i >> 1) * 19, 2 + (i & 1) * 19);
				}
			}
		}
		//====Map B====//
		Map_V1.MAP_B.copyContentFrom(Map_V1.FRAME); {
			/**
			 * Spin 180*:x=23-x,y=23-y
			 * for fill:cross imput
			 */
			// corner spawnpoint
			for (i = 0; i < 4; i++)
				Map_V1.MAP_B.addSpawnPointWithMark(2 + (i >> 1) * 19, 2 + (i & 1) * 19);
			// Metal Middle Line&Laser Trap
			// l
			Map_V1.MAP_B.fillBlock(0, 9, 13, 9, BlockType.METAL);
			Map_V1.MAP_B.setBlock(14, 9, BlockCommon.fromType(BlockType.LASER_TRAP));
			// r
			Map_V1.MAP_B.fillBlock(10, 14, 23, 14, BlockType.METAL);
			Map_V1.MAP_B.setBlock(9, 14, BlockCommon.fromType(BlockType.LASER_TRAP));
			// center X_TRAP_KILL
			Map_V1.MAP_B.fillBlock(11, 11, 12, 12, BlockType.X_TRAP_KILL);
			// side water&spawner
			// l
			Map_V1.MAP_B.fillBlock(6, 10, 6, 17, BlockType.WATER);

			Map_V1.MAP_B.setBlock(3, 16, BlockCommon.fromType(BlockType.COLOR_SPAWNER));
			Map_V1.MAP_B.setBlock(3, 12, BlockCommon.fromType(BlockType.COLOR_SPAWNER));
			// r
			Map_V1.MAP_B.fillBlock(17, 6, 17, 13, BlockType.WATER);

			Map_V1.MAP_B.setBlock(20, 7, BlockCommon.fromType(BlockType.COLOR_SPAWNER));
			Map_V1.MAP_B.setBlock(20, 11, BlockCommon.fromType(BlockType.COLOR_SPAWNER));
			// up&down side X_TRAP_HURT/WATER/BEDROCK
			// u
			Map_V1.MAP_B.fillBlock(19, 4, 22, 4, BlockType.BEDROCK);

			Map_V1.MAP_B.fillBlock(6, 4, 18, 4, BlockType.WATER);

			Map_V1.MAP_B.fillBlock(6, 2, 20, 2, BlockType.X_TRAP_HURT);

			// d
			Map_V1.MAP_B.fillBlock(1, 19, 4, 19, BlockType.BEDROCK);

			Map_V1.MAP_B.fillBlock(5, 19, 17, 19, BlockType.WATER);

			Map_V1.MAP_B.fillBlock(3, 21, 17, 21, BlockType.X_TRAP_HURT);

			// corner X_TRAP_HURT/WATER
			// ul
			Map_V1.MAP_B.fillBlock(2, 3, 2, 7, BlockType.X_TRAP_HURT);

			Map_V1.MAP_B.fillBlock(4, 1, 4, 7, BlockType.WATER);

			// dr
			Map_V1.MAP_B.fillBlock(21, 16, 21, 20, BlockType.X_TRAP_HURT);

			Map_V1.MAP_B.fillBlock(19, 16, 19, 22, BlockType.WATER);
		}
		//====Map C====//
		Map_V1.MAP_C.copyContentFrom(Map_V1.FRAME); {
			// center C
			// h
			Map_V1.MAP_C.fillBlock(6, 6, 17, 6, BlockType.BEDROCK);

			Map_V1.MAP_C.fillBlock(6, 17, 17, 17, BlockType.BEDROCK);

			// l
			Map_V1.MAP_C.fillBlock(6, 6, 6, 17, BlockType.BEDROCK);

			for (i = 0; i < 4; i++) {
				if (i < 2) {
					// 10*Spawner
					Map_V1.MAP_C.setBlock(6, 6 + i * 11, BlockCommon.fromType(BlockType.COLOR_SPAWNER));
					Map_V1.MAP_C.setBlock(10, 6 + i * 11, BlockCommon.fromType(BlockType.COLOR_SPAWNER));
					Map_V1.MAP_C.setBlock(13, 6 + i * 11, BlockCommon.fromType(BlockType.COLOR_SPAWNER));
					Map_V1.MAP_C.setBlock(17, 6 + i * 11, BlockCommon.fromType(BlockType.COLOR_SPAWNER));
					Map_V1.MAP_C.setBlock(6, 10 + i * 3, BlockCommon.fromType(BlockType.COLOR_SPAWNER));
					// Spawnpoint/Wall,l
					Map_V1.MAP_C.addSpawnPointWithMark(3, 11 + i);
					Map_V1.MAP_C.setBlock(3, 10 + i * 3, BlockCommon.fromType(BlockType.WALL));
					// water/wall,r
					Map_V1.MAP_C.setBlock(20, 11 + i, BlockCommon.fromType(BlockType.WATER));
					Map_V1.MAP_C.setBlock(20, 10 + i * 3, BlockCommon.fromType(BlockType.WALL));
				}
				// Spawnpoint/Wall,u&d
				Map_V1.MAP_C.addSpawnPointWithMark(11 + (i & 1), 3 + 17 * (i >> 1));
				Map_V1.MAP_C.setBlock(10 + (i & 1) * 3, 3 + 17 * (i >> 1), BlockCommon.fromType(BlockType.WALL));
				// corner LaserTrap/XTrapHurt
				Map_V1.MAP_C.setBlock(3 + (i >> 1) * 17, 3 + (i & 1) * 17, BlockCommon.fromType(BlockType.LASER_TRAP));
				Map_V1.MAP_C.setBlock(2 + (i >> 1) * 17, 3 + (i & 1) * 17, BlockCommon.fromType(BlockType.X_TRAP_HURT));
				Map_V1.MAP_C.setBlock(3 + (i >> 1) * 17, 2 + (i & 1) * 17, BlockCommon.fromType(BlockType.X_TRAP_HURT));
				Map_V1.MAP_C.setBlock(4 + (i >> 1) * 17, 3 + (i & 1) * 17, BlockCommon.fromType(BlockType.X_TRAP_HURT));
				Map_V1.MAP_C.setBlock(3 + (i >> 1) * 17, 4 + (i & 1) * 17, BlockCommon.fromType(BlockType.X_TRAP_HURT));
			}
		}
		//====Map D====//
		Map_V1.MAP_D.copyContentFrom(Map_V1.FRAME); {
			for (i = 0; i < 4; i++) {
				// Water Circle
				// long_line
				Map_V1.MAP_D.fillBlock(9 + (i >> 1) * 2, 4 + (i & 1) * 15, 12 + (i >> 1) * 2, 4 + (i & 1) * 15, BlockType.WATER);

				Map_V1.MAP_D.fillBlock(4 + (i & 1) * 15, 9 + (i >> 1) * 2, 4 + (i & 1) * 15, 12 + (i >> 1) * 2, BlockType.WATER);

				// 2x line
				// h
				Map_V1.MAP_D.setBlock(7 + (i >> 1) * 8, 5 + (i & 1) * 13, BlockCommon.fromType(BlockType.WATER));
				Map_V1.MAP_D.setBlock(8 + (i >> 1) * 8, 5 + (i & 1) * 13, BlockCommon.fromType(BlockType.WATER));
				// v
				Map_V1.MAP_D.setBlock(5 + (i & 1) * 13, 7 + (i >> 1) * 8, BlockCommon.fromType(BlockType.WATER));
				Map_V1.MAP_D.setBlock(5 + (i & 1) * 13, 8 + (i >> 1) * 8, BlockCommon.fromType(BlockType.WATER));
				// point
				Map_V1.MAP_D.setBlock(6 + (i >> 1) * 11, 6 + (i & 1) * 11, BlockCommon.fromType(BlockType.WATER));
				if (i < 2) {
					// Spawnpoint/Wall,d
					Map_V1.MAP_D.addSpawnPointWithMark(11 + i, 21);
					Map_V1.MAP_D.setBlock(10 + i * 3, 21, BlockCommon.fromType(BlockType.WALL));
				}
				// corner spawner
				Map_V1.MAP_D.setBlock(4 + (i >> 1) * 15, 4 + (i & 1) * 15, BlockCommon.fromType(BlockType.COLOR_SPAWNER));
				// Spawnpoint/Wall,l&r
				Map_V1.MAP_D.addSpawnPointWithMark(2 + 19 * (i >> 1), 11 + (i & 1));
				Map_V1.MAP_D.setBlock(2 + 19 * (i >> 1), 10 + (i & 1) * 3, BlockCommon.fromType(BlockType.WALL));
				// center band
				Map_V1.MAP_D.setBlock(11 + (i >> 1), 10 + (i & 1) * 3, BlockCommon.fromType(BlockType.LASER_TRAP));
			}
			// XTrapRotate,u
			Map_V1.MAP_D.fillBlock(11, 3, 12, 4, BlockType.X_TRAP_ROTATE);

			// XTrapKill,l
			Map_V1.MAP_D.fillBlock(7, 10, 10, 13, BlockType.X_TRAP_KILL);

			// XTrapHurt,r
			Map_V1.MAP_D.fillBlock(13, 10, 16, 13, BlockType.X_TRAP_HURT);
		}
		//====Map E====//
		Map_V1.MAP_E.copyContentFrom(Map_V1.FRAME); {
			for (i = 0; i < 4; i++)
				Map_V1.MAP_E.addSpawnPointWithMark(2 + (i >> 1) * 19, 2 + (i & 1) * 19);
			// Center E
			Map_V1.fillReflectBlock(Map_V1.MAP_E, false, true, 6, 6, 17, 7, BlockType.BEDROCK);

			Map_V1.MAP_E.fillBlock(6, 8, 7, 15, BlockType.BEDROCK);

			Map_V1.MAP_E.fillBlock(6, 11, 17, 12, BlockType.BEDROCK);

			// corner water/laserTrap
			Map_V1.fillReflectBlock(Map_V1.MAP_E, true, true, 4, 1, 4, 5, BlockType.WATER);
			Map_V1.setReflectBlock(Map_V1.MAP_E, true, true, 6, 6, BlockCommon.fromType(BlockType.LASER_TRAP));

			// 1x1 Water,l
			Map_V1.setReflectBlock(Map_V1.MAP_E, false, true, 2, 4, BlockCommon.fromType(BlockType.WATER));

			// killTrap/spawner,l
			Map_V1.setReflectBlock(Map_V1.MAP_E, false, true, 3, 11, BlockCommon.fromType(BlockType.COLOR_SPAWNER));

			Map_V1.setReflectBlock(Map_V1.MAP_E, false, true, 1, 11, BlockCommon.fromType(BlockType.X_TRAP_KILL));

			Map_V1.setReflectBlock(Map_V1.MAP_E, false, true, 5, 11, BlockCommon.fromType(BlockType.X_TRAP_KILL));

			Map_V1.fillReflectBlock(Map_V1.MAP_E, false, true, 1, 7, 2, 7, BlockType.X_TRAP_KILL);

			Map_V1.fillReflectBlock(Map_V1.MAP_E, false, true, 4, 7, 5, 7, BlockType.X_TRAP_KILL);

			Map_V1.fillReflectBlock(Map_V1.MAP_E, false, true, 2, 9, 4, 9, BlockType.X_TRAP_KILL);

			// water/rotate/supply,u&d
			Map_V1.fillReflectBlock(Map_V1.MAP_E, false, true, 6, 4, 18, 4, BlockType.WATER);

			Map_V1.fillReflectBlock(Map_V1.MAP_E, false, true, 9, 9, 18, 9, BlockType.WATER);

			Map_V1.MAP_E.fillBlock(19, 6, 19, 17, BlockType.WATER);

			Map_V1.fillReflectBlock(Map_V1.MAP_E, false, true, 15, 1, 15, 3, BlockType.X_TRAP_ROTATE);

			Map_V1.MAP_E.setBlock(19, 11, BlockCommon.fromType(BlockType.X_TRAP_ROTATE));

			Map_V1.MAP_E.setBlock(19, 12, BlockCommon.fromType(BlockType.X_TRAP_ROTATE));

			Map_V1.setReflectBlock(Map_V1.MAP_E, false, true, 17, 2, BlockCommon.fromType(BlockType.SUPPLY_POINT));

			// hurt,r
			Map_V1.MAP_E.fillBlock(21, 4, 21, 19, BlockType.X_TRAP_HURT);
		}
		//====Map F====//
		Map_V1.MAP_F.copyContentFrom(EMPTY); {
			// Center spawnPoint
			for (i = 0; i < 4; i++)
				Map_V1.MAP_F.addSpawnPointWithMark(11 + (i >> 1), 11 + (i & 1));
			// Bedrock&Gate
			Map_V1.setReflectBlock(Map_V1.MAP_F, true, true, 1, 1, BlockCommon.fromType(BlockType.BEDROCK));

			Map_V1.fillReflectMirrorBlock(Map_V1.MAP_F, true, true, 2, 1, 8, 1, BlockType.BEDROCK);

			Map_V1.setReflectMirrorBlock(Map_V1.MAP_F, true, true, 1, 0, BlockCommon.fromType(BlockType.GATE_OPEN));

			Map_V1.setReflectMirrorBlock(Map_V1.MAP_F, true, true, 9, 1, BlockCommon.fromType(BlockType.GATE_OPEN));

			// Traps/gate/supply
			Map_V1.setReflectBlock(Map_V1.MAP_F, true, true, 3, 3, BlockCommon.fromType(BlockType.X_TRAP_KILL));

			Map_V1.setReflectBlock(Map_V1.MAP_F, true, true, 5, 5, BlockCommon.fromType(BlockType.X_TRAP_HURT));

			Map_V1.setReflectBlock(Map_V1.MAP_F, true, true, 7, 7, BlockCommon.fromType(BlockType.X_TRAP_HURT));

			Map_V1.setReflectBlock(Map_V1.MAP_F, true, true, 6, 6, BlockCommon.fromType(BlockType.SUPPLY_POINT));

			Map_V1.setReflectMirrorBlock(Map_V1.MAP_F, true, true, 7, 5, BlockCommon.fromType(BlockType.X_TRAP_HURT));

			Map_V1.setReflectMirrorBlock(Map_V1.MAP_F, true, true, 6, 5, BlockCommon.fromType(BlockType.X_TRAP_ROTATE));

			Map_V1.setReflectMirrorBlock(Map_V1.MAP_F, true, true, 7, 6, BlockCommon.fromType(BlockType.X_TRAP_ROTATE));

			// Water/Trap/spawner/gate,c
			Map_V1.fillReflectMirrorBlock(Map_V1.MAP_F, true, true, 10, 1, 10, 6, BlockType.WATER);

			Map_V1.setReflectBlock(Map_V1.MAP_F, true, true, 8, 8, BlockCommon.fromType(BlockType.COLOR_SPAWNER));

			Map_V1.setReflectMirrorBlock(Map_V1.MAP_F, true, true, 9, 8, BlockCommon.fromType(BlockType.LASER_TRAP));

			Map_V1.setReflectMirrorBlock(Map_V1.MAP_F, true, true, 10, 7, BlockCommon.fromType(BlockType.GATE_OPEN));

			Map_V1.setReflectMirrorBlock(Map_V1.MAP_F, true, true, 10, 8, BlockCommon.fromType(BlockType.BEDROCK));

			Map_V1.setReflectMirrorBlock(Map_V1.MAP_F, true, true, 11, 8, BlockCommon.fromType(BlockType.GATE_OPEN));
		}
		//====Map G====//
		Map_V1.MAP_G.copyContentFrom(Map_V1.FRAME); {
			Map_V1.fillReflectMirrorBlock(Map_V1.MAP_G, true, true, 3, 3, 8, 3, BlockType.BEDROCK);
			Map_V1.setReflectMirrorBlock(Map_V1.MAP_G, true, true, 1, 1, BlockCommon.fromType(BlockType.MOVEABLE_WALL));
			Map_V1.MAP_G.fillBlock(4, 4, 19, 19, BlockType.GATE_OPEN, false);
			for (i = 0; i < 4; i++)
				Map_V1.MAP_G.addSpawnPointWithMark(2 + (i >> 1) * 19, 2 + (i & 1) * 19);
		}
		//====Map H====//
		Map_V1.MAP_H.copyContentFrom(Map_V1.FRAME); {
			Map_V1.fillReflectMirrorBlock(Map_V1.MAP_H, true, true, 4, 4, 9, 4, BlockType.BEDROCK);
			ix = Utils.randomBoolean() ? 0 : 9;
			iy = Utils.randomBoolean() ? 0 : 9;
			Map_V1.MAP_H.fillBlock(5 + ix, 5 + iy, 9 + ix, 9 + iy, BlockType.MOVEABLE_WALL, false);
			for (i = 10; i <= 13; i++) {
				// x
				Map_V1.MAP_H.addSpawnPointWithMark(i, 4);
				Map_V1.MAP_H.addSpawnPointWithMark(i, 19);
				// y
				Map_V1.MAP_H.addSpawnPointWithMark(4, i);
				Map_V1.MAP_H.addSpawnPointWithMark(19, i);
			}
		}
		// Set Variables//
		return true;
	}

	protected static setReflectBlock(map: Map_V1, rX: boolean, rY: boolean, x: int, y: int, block: BlockCommon): void {
		map.setBlock(x, y, block);
		if (rX)
			map.setBlock(23 - x, y, block);
		if (rY) {
			map.setBlock(x, 23 - y, block);
			if (rX)
				map.setBlock(23 - x, 23 - y, block);
		}
	}

	protected static fillReflectBlock(map: Map_V1, rX: boolean, rY: boolean, x1: int, y1: int, x2: int, y2: int, type: BlockType, outline: boolean = false): void {
		map.fillBlock(x1, y1, x2, y2, type, outline);
		if (rX)
			map.fillBlock(23 - x2, y1, 23 - x1, y2, type, outline);
		if (rY) {
			map.fillBlock(x1, 23 - y2, x2, 23 - y1, type, outline);
			if (rX)
				map.fillBlock(23 - x2, 23 - y2, 23 - x1, 23 - y1, type, outline);
		}
	}

	protected static setMirrorBlock(map: Map_V1, x: int, y: int, block: BlockCommon): void {
		map.setBlock(y, x, block);
	}

	protected static fillMirrorBlock(map: Map_V1, x1: int, y1: int, x2: int, y2: int, type: BlockType, outline: boolean = false): void {
		map.fillBlock(y1, x1, y2, x2, type, outline);
	}

	protected static setReflectMirrorBlock(map: Map_V1, rX: boolean, rY: boolean, x: int, y: int, block: BlockCommon): void {
		Map_V1.setReflectBlock(map, rX, rY, x, y, block);
		Map_V1.setReflectBlock(map, rY, rX, y, x, block);
	}

	protected static fillReflectMirrorBlock(map: Map_V1, rX: boolean, rY: boolean, x1: int, y1: int, x2: int, y2: int, type: BlockType, outline: boolean = false): void {
		Map_V1.fillReflectBlock(map, rX, rY, x1, y1, x2, y2, type, outline);
		Map_V1.fillReflectBlock(map, rY, rX, y1, x1, y2, x2, type, outline);
	}

	// Sub Graphics functions
	protected static drawLaserTrapDownPillar(map: Map_V1, rootX: uint): void {
		map.fillBlock(rootX - 1, 1, rootX - 1, 18, BlockType.WALL);

		map.fillBlock(rootX + 1, 1, rootX + 1, 18, BlockType.WALL);

		map.fillBlock(rootX, 1, rootX, 18, BlockType.BEDROCK);

		map.setBlock(rootX, 19, BlockCommon.fromType(BlockType.LASER_TRAP));

		map.setBlock(rootX + 1, 19, BlockCommon.fromType(BlockType.GLASS));

		map.setBlock(rootX - 1, 19, BlockCommon.fromType(BlockType.GLASS));

		map.setBlock(rootX, 20, BlockCommon.fromType(BlockType.GLASS));

		map.setBlock(rootX + 1, 20, BlockCommon.fromType(BlockType.WALL));

		map.setBlock(rootX - 1, 20, BlockCommon.fromType(BlockType.WALL));
	}

	protected static drawLaserTrapUpPillar(map: Map_V1, rootX: uint): void {
		map.fillBlock(rootX - 1, 22, rootX - 1, 5, BlockType.WALL);

		map.fillBlock(rootX + 1, 22, rootX + 1, 5, BlockType.WALL);

		map.fillBlock(rootX, 22, rootX, 5, BlockType.BEDROCK);

		map.setBlock(rootX, 4, BlockCommon.fromType(BlockType.LASER_TRAP));

		map.setBlock(rootX + 1, 4, BlockCommon.fromType(BlockType.GLASS));

		map.setBlock(rootX - 1, 4, BlockCommon.fromType(BlockType.GLASS));

		map.setBlock(rootX, 3, BlockCommon.fromType(BlockType.GLASS));

		map.setBlock(rootX + 1, 3, BlockCommon.fromType(BlockType.WALL));

		map.setBlock(rootX - 1, 3, BlockCommon.fromType(BlockType.WALL));
	}

	protected static drawLaserTrapBox(map: Map_V1, x: int, y: int): void {
		map.setBlock(x, y, BlockCommon.fromType(BlockType.LASER_TRAP));

		map.setBlock(x + 1, y, BlockCommon.fromType(BlockType.GLASS));

		map.setBlock(x - 1, y, BlockCommon.fromType(BlockType.GLASS));

		map.setBlock(x, y - 1, BlockCommon.fromType(BlockType.GLASS));

		map.setBlock(x, y + 1, BlockCommon.fromType(BlockType.GLASS));

		map.setBlock(x + 1, y - 1, BlockCommon.fromType(BlockType.WALL));

		map.setBlock(x - 1, y - 1, BlockCommon.fromType(BlockType.WALL));

		map.setBlock(x + 1, y + 1, BlockCommon.fromType(BlockType.WALL));

		map.setBlock(x - 1, y + 1, BlockCommon.fromType(BlockType.WALL));
	}

	//============Instance Variables============//
	protected _Content: object = new Object();
	protected _generator: IMapGenerator;

	//============Constructor============//
	public constructor(name: string = null, content: object | null = null, isArena: boolean = false) {
		super(name, isArena);
		if (content != null)
			this._Content = content;
	}

	//============Destructor============//
	override destructor(): void {
		this.removeAllBlock();
		this._Content = null;
		this._generator = null;
		super.destructor();
	}

	//============Instance Getter And Setter============//

	//============Interface Functions============//
	override get mapWidth(): uint {
		return GlobalGameVariables.DISPLAY_GRIDS;
	}

	override get mapHeight(): uint {
		return GlobalGameVariables.DISPLAY_GRIDS;
	}

	override get randomX(): int {
		return exMath.random(this.mapWidth);
	}

	override get randomY(): int {
		return exMath.random(this.mapHeight);
	}

	override get allDefinedPositions(): iPoint[] {
		let returnPoints: iPoint[] = new Array<iPoint>();

		if (this._Content == null)
			return returnPoints;

		for (let key: string in this._Content) {
			returnPoints.push(Map_V1.indexToPoint(key));
		}
		return returnPoints;
	}

	override get allMapPositions(): iPoint[] {
		let returnPoints: iPoint[] = new Array<iPoint>();

		for (let x: uint = 0; x < this.mapWidth; x++) {
			for (let y: uint = 0; y < this.mapHeight; y++) {
				returnPoints.push(new iPoint(x, y));
			}
		}
		return returnPoints;
	}

	/**
	 * truly overrite virual function
	 */
	override clone(createBlock: boolean = true): IMap {
		// content
		let tempContent: object = new Object();

		let block: BlockCommon;

		for (let index: string in this._Content) {
			block = (this._Content[index] as BlockCommon);

			if (block == null)
				continue;

			block = createBlock ? block.clone() : block;

			tempContent[index] = block;
		}
		// construct(included isArena)
		let copy: Map_V1 = new Map_V1(this._name, tempContent, this._arena);

		// spawnPoints
		copy._spawnPoints = this._spawnPoints.concat();

		// generator
		copy._generator = this._generator;

		// return
		return copy;
	}

	override copyFrom(target: IMap, clearSelf: boolean = false, createBlock: boolean = true): void {
		// content
		this.copyContentFrom(target, clearSelf, createBlock);
		// super
		super.copyFrom(target, clearSelf, createBlock);
	}

	override copyContentFrom(target: IMap, clearSelf: boolean = false, createBlock: boolean = true): void {
		// clear
		if (clearSelf)
			this.removeAllBlock();

		// content
		let points: iPoint[] = target.allDefinedPositions;

		let block: BlockCommon;

		for (let point of points) {
			block = target.getBlock(point.x, point.y);
			this._setBlock(point.x, point.y, createBlock ? block.clone() : block);
		}
		// super
		super.copyContentFrom(target, clearSelf, createBlock);
	}

	/**
	 * construct new map.
	 * If has generator,generate to new map
	 * Else clone self
	 * @return
	 */
	override generateNew(): IMap {
		// trace('generateNew:',this===MAP_5,this._generator)
		if (this._generator != null)
			return this._generator.generateTo(this.clone(), true);
		return super.generateNew();
	}

	override hasBlock(x: int, y: int): boolean {
		if (this.getBlock(x, y) == null) {
			this._setVoid(x, y);

			return false;
		}
		return this._Content.hasOwnProperty(Map_V1.pointToIndex(x, y));
	}

	override getBlock(x: int, y: int): BlockCommon {
		return this._getBlock(x, y);
	}

	override getBlockAttributes(x: int, y: int): BlockAttributes {
		if (this.hasBlock(x, y))
			return this._getBlock(x, y).attributes;
		else
			return NativeBlockAttributes.VOID;
	}

	override getBlockType(x: int, y: int): BlockType {
		if (this.hasBlock(x, y))
			return this._getBlock(x, y).type;
		else
			return BlockType.VOID;
	}

	override setBlock(x: int, y: int, block: BlockCommon): void {
		this._setBlock(x, y, block);
	}

	override isVoid(x: int, y: int): boolean {
		return (!this.hasBlock(x, y) || this.getBlockType(x, y) == BlockType.VOID);
	}

	override setVoid(x: int, y: int): void {
		this._setVoid(x, y);
	}

	override removeAllBlock(deleteBlock: boolean = true): void {
		// trace(this+':removeAllBlock!')
		let block: BlockCommon;
		for (let key: string in this._Content) {
			block = this._Content[key] as BlockCommon;

			if (deleteBlock && block != null)
				block.destructor();
			delete this._Content[key];
		}
	}

	override setDisplayTo(target: IMapDisplayer): void {
		target.removeAllBlock();
		let ix: int, iy: int, iBlock: BlockCommon;
		for (let index: string in this._Content) {
			ix = Map_V1.indexToPoint(index).x;
			iy = Map_V1.indexToPoint(index).y;
			iBlock = this._getBlock(ix, iy);
			target.setBlock(ix, iy, iBlock);
		}
	}

	override forceDisplayToLayers(targetBottom: IMapDisplayer, targetMiddle: IMapDisplayer, targetTop: IMapDisplayer): void {
		targetBottom.removeAllBlock();
		targetMiddle.removeAllBlock();
		targetTop.removeAllBlock();
		let ix: int, iy: int, iBlock: BlockCommon, iLayer: int;

		for (let index: string in this._Content) {
			ix = Map_V1.indexToPoint(index).x;

			iy = Map_V1.indexToPoint(index).y;

			iBlock = this._getBlock(ix, iy);

			if (iBlock == null)
				continue;

			iLayer = iBlock.attributes.drawLayer;

			NativeMapCommon.getTargetByLayer(iLayer, targetTop, targetBottom, targetMiddle).setBlock(ix, iy, iBlock);
		}
	}

	//============Instance Funcitons============//
	//========Core========//
	protected _getBlock(x: int, y: int): BlockCommon {
		let block: BlockCommon = this._Content[Map_V1.pointToIndex(x, y)] as BlockCommon;
		return block == null ? BlockCommon.fromType(BlockType.NULL) : block;
	}

	protected _setBlock(x: int, y: int, block: BlockCommon): void {
		if (block == null)
			this._setVoid(x, y);
		this._Content[Map_V1.pointToIndex(x, y)] = block;
	}

	protected _setVoid(x: int, y: int): void {
		delete this._Content[Map_V1.pointToIndex(x, y)];
	}

	public fillBlock(x1: int, y1: int, x2: int, y2: int,
		type: BlockType,
		outline: boolean = false): Map_V1 {
		let xl: int = Math.min(x1, x2), xm: int = Math.max(x1, x2);

		let yl: int = Math.min(y1, y2), ym: int = Math.max(y1, y2);

		let xi: int, yi: int;

		for (xi = xl; xi <= xm; xi++) {
			for (yi = yl; yi <= ym; yi++) {
				if (!outline || outline && ((xi == xm || xi == xl) || (yi == ym || yi == yl))) {
					this._setBlock(xi, yi, BlockCommon.fromType(type));
				}
			}
		}
		return this;
	}

	public fillBlock2(x1: int, y1: int, x2: int, y2: int,
		block: BlockCommon,
		outline: boolean = false): Map_V1 {
		let xl: int = Math.min(x1, x2), xm: int = Math.max(x1, x2);

		let yl: int = Math.min(y1, y2), ym: int = Math.max(y1, y2);

		let xi: int, yi: int;

		for (xi = xl; xi <= xm; xi++) {
			for (yi = yl; yi <= ym; yi++) {
				if (!outline || outline && ((xi == xm || xi == xl) || (yi == ym || yi == yl))) {
					this._setBlock(xi, yi, block.clone());
				}
			}
		}
		return this;
	}
}