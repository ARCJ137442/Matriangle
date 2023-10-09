import { iPoint, iPointVal, traverseNDSquare } from "../../../common/geometricTools";
import { getClass } from "../../../common/utils";
import { int, uint, uint$MAX_VALUE } from "../../../legacy/AS3Legacy";
import Entity from "../../api/entity/Entity";
import { IEntityHasPosition, IEntityInGrid, IEntityOutGrid, IEntityWithDirection } from "../../api/entity/EntityInterfaces";
import MapStorageSparse from "../native/maps/MapStorageSparse";
import { alignToGrid_P } from "../../general/PosTransform";
import Player from "../native/entities/player/Player";
import IMapStorage from "../../api/map/IMapStorage";
import { MatrixController } from "../../api/control/MatrixControl";
import PlayerController from "../native/entities/player/controller/PlayerController";
import { MatrixProgram } from "../../api/control/MatrixProgram";
import BonusBox from "../native/entities/item/BonusBox";
import Effect from "../../api/entity/Effect";
import Projectile from "../native/entities/projectile/Projectile";
import { NativeBlockIDs } from "../native/registry/BlockRegistry";
import BlockRandomTickDispatcher from "../native/mechanics/programs/BlockRandomTickDispatcher";
import { nameOfRot_M } from "../../general/GlobalRot";
import MapSwitcher from "../native/mechanics/programs/MapSwitcher";

/**
 * 一个用于可视化母体的可视化函数库
 * * 所有呈现都基于纯文本，即「ASCII艺术」
 * * 【2023-10-06 17:48:33】原先用于测试，现在提升为一个附属模组
 */

/**
 * 若方块为「空」，则填充空格；否则保留自身
 * *【2023-10-07 22:20:15】由于新方块系统的产生，不再截取方块类名
 * @param id 方块类型（类名）
 * @returns 格式化后的定长名字
 */
export function showBlock(id: string, maxLength: uint = 7): string {
	return showName(id == NativeBlockIDs.VOID ? '' : id, maxLength)
}

export function showName(name: string, maxLength: uint = 7): string {
	return name.slice(0, maxLength).padEnd(maxLength, ' ')
}

export function 地图可视化(storage: MapStorageSparse, ...otherPos_I: int[]): void {
	let line: string[];
	let iP: iPoint = new iPoint(0, 0, ...otherPos_I);
	for (let y = storage.borderMin[1]; y <= storage.borderMax[1]; y++) {
		line = [];
		for (let x = storage.borderMin[0]; x <= storage.borderMax[0]; x++) {
			iP.copyFromArgs(x, y); // ! 会忽略其它地方的值
			line.push(
				showBlock(
					storage.getBlock(iP).id
				)
			);
		}
		console.log('|' + line.join(' ') + '|')
	}
}

/**
 * 呈现实体
 * * 【2023-10-05 01:03:03】目前只呈现名称
 */
export function showEntity(entity: Entity, maxLength: uint = 7): string {
	return showName(getClass(entity)?.name ?? 'UNDEF', maxLength)
}

/**
 * 像Julia遍历张量一样可视化一个地图
 */
export function 地图可视化_高维(storage: MapStorageSparse): void {
	let zwMax: iPoint = new iPoint().copyFromArgs(...storage.borderMax.slice(2));
	let zwMin: iPoint = new iPoint().copyFromArgs(...storage.borderMin.slice(2));
	// console.log(zwMax, zwMin)
	traverseNDSquare(
		zwMin, zwMax, (zw: iPoint): void => {
			console.info(`切片 [:, :, ${zw.join(', ')}] = `)
			地图可视化(storage, ...zw);
		}
	);
}

const _temp_母体可视化_entityIPoint: iPointVal = new iPoint();
/**
 * 大一统的「母体可视化」
 * * 现在返回字符串
 */
export function 母体可视化(
	storage: IMapStorage,
	entities: Entity[],
	string_l: uint = 7, // 限制字长
): string {
	// 分派「地图存储结构」的类型
	if (storage instanceof MapStorageSparse)
		return 稀疏地图母体可视化(storage, entities, string_l);
	throw new Error('不支持该地图存储结构的母体可视化');
}

function 可视化单点(
	storage: IMapStorage,
	p: iPoint,
	entitiesPositioned: IEntityHasPosition[],
	string_l: uint = 7, // 限制字长
): string {
	let e: Entity | null = null;
	for (const ent of entitiesPositioned) {
		if (alignToGrid_P(ent.position, _temp_母体可视化_entityIPoint).isEqual(p)) {
			e = ent;
			break;
		}
	}
	// 打印
	return (
		e === null ?
			showBlock(
				String(storage.getBlockID(p)),
				string_l
			) :
			showEntity(e, string_l)
	);
}

export function 稀疏地图母体可视化(
	storage: MapStorageSparse,
	entities: Entity[],
	string_l: uint = 7, // 限制字长
): string {
	// 返回值
	let result: string = '';
	// 格点实体
	const entitiesPositioned: IEntityHasPosition[] = entities.filter(
		(entity: Entity): boolean => (
			(entity as IEntityInGrid)?.i_inGrid ||
			(entity as IEntityOutGrid)?.i_outGrid
		)
	) as IEntityHasPosition[];
	let e: IEntityHasPosition | null;
	// 正式开始
	let zwMax: iPoint = new iPoint().copyFromArgs(...storage.borderMax.slice(2));
	let zwMin: iPoint = new iPoint().copyFromArgs(...storage.borderMin.slice(2));

	let 可视化单线 = (iP: iPoint, line: string[], ...otherPos_I: int[]): string => {
		for (let x = storage.borderMin[0]; x <= storage.borderMax[0]; x++) {
			// 每一个点
			iP.copyFromArgs(x, ...otherPos_I); // ! 会忽略其它地方的值
			line.push(
				可视化单点(storage, iP, entitiesPositioned, string_l)
			)
		}
		return '|' + line.join(' ') + '|' + '\n';
	}
	let 可视化单面 = (zw: iPoint): void => {
		// 每一个切片
		result += (`切片 [:, :, ${zw.join(', ')}] = `) + '\n';
		let line: string[] = [];
		let iP: iPoint = new iPoint(0, 0, ...zw);
		for (let y = storage.borderMin[1]; y <= storage.borderMax[1]; y++) {
			line.length = 0;
			result += 可视化单线(iP, line, y);
		}
	}
	// 处理各个维度的情况
	switch (storage.numDimension) {
		case 0:
			result = 可视化单点(storage, new iPoint(), entitiesPositioned, string_l)
			break;
		case 1:
			result = 可视化单线(new iPoint(), []);
			break;
		case 2:
			可视化单面(new iPoint());
			break;
		// 其它高维情况
		default:
			traverseNDSquare(zwMin, zwMax, 可视化单面);
			break;
	}
	return result;
}

export function 列举实体(es: Entity[], maxCount: uint = uint$MAX_VALUE): void {
	console.info(`实体列表(${es.length})：`);
	for (const e of es) {
		console.log(实体标签显示(e), e)
		if (--maxCount < 0) break;
	}
}

export function 实体列表可视化(es: Entity[], maxCount: uint = uint$MAX_VALUE): string {
	let result: string = '';
	result += `实体列表(${es.length})：\n`;
	for (const e of es) {
		result += 实体标签显示(e) + '\n'
		if (--maxCount < 0) break;
	}
	return result;
}

function 实体标签显示(e: Entity): string {
	// 玩家
	if (e instanceof Player)
		return `${getClass(e)?.name}"${e.customName}"${获取坐标标签(e)
			}|${e.HPText
			}|[${e.tool.id}:${e.tool.usingCD}/${e.tool.baseCD}!${e.tool.chargeTime}/${e.tool.chargeMaxTime
			}]`
	// 奖励箱
	if (e instanceof BonusBox)
		return `${getClass(e)?.name}"${e.bonusType}"@${位置可视化(e)}`
	// 特效
	if (e instanceof Effect)
		return `${getClass(e)?.name}@${位置可视化(e)}|${e.life}/${e.LIFE}`
	// 抛射体（不管有无坐标）
	if (e instanceof Projectile)
		return `${getClass(e)?.name}${获取坐标标签(e)}`
	// 母体程序
	if (e instanceof MatrixProgram)
		// 方块随机刻分派者
		if (e instanceof BlockRandomTickDispatcher)
			return `${getClass(e)?.name}[${e.label}] -> ${(e as any)?._temp_lastRandomP.toString()}`
		// 地图切换者
		else if (e instanceof MapSwitcher)
			return `${getClass(e)?.name}[${e.label}]=#${(e as any)?._mapSwitchTick}/${e.mapSwitchInterval}#`
		// 控制器
		else if (e instanceof MatrixController)
			// 玩家控制器
			if (e instanceof PlayerController)
				return `${getClass(e)?.name}[${e.label}] -> ${e.subscribers.map(实体标签显示).join(', ')}`
			// 其它
			else
				return `${getClass(e)?.name}[${e.label}] -> ${//
					e.subscribers.map(x => (x instanceof Entity) ? 实体标签显示(e) : e?.toString()).join(', ')
					}`
		else
			// 普通情况：仅有一个标签
			return `${getClass(e)?.name}[${e.label}]`
	// 其它实体（包括「是否有坐标」）
	return `${getClass(e)?.name}${获取坐标标签(e)}`
}

/**  辅助函数 */
function 获取坐标标签(e: Entity): string {
	return (
		((e as IEntityHasPosition)?.position !== undefined) ?
			`@${位置可视化(e as IEntityHasPosition)}` : ``
	) + (
			((e as IEntityWithDirection)?.direction !== undefined) ?
				`^${nameOfRot_M((e as IEntityWithDirection).direction)}` : ``
		)
}

const number可视化 = (n: number): string => Number.isInteger(n) ? n.toString() : n.toFixed(2)
const 位置可视化 = (e: IEntityHasPosition): string => e.position.map(number可视化).join(',')
