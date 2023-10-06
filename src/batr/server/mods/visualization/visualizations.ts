import { iPoint, iPointVal, traverseNDSquare } from "../../../common/geometricTools";
import { getClass } from "../../../common/utils";
import { int, uint, uint$MAX_VALUE } from "../../../legacy/AS3Legacy";
import Entity from "../../api/entity/Entity";
import { IEntityInGrid, IEntityOutGrid } from "../../api/entity/EntityInterfaces";
import BlockVoid from "../native/blocks/Void";
import MapStorageSparse from "../native/maps/MapStorageSparse";
import { alignToGrid_P } from "../../general/PosTransform";
import Player from "../native/entities/player/Player";
import IMapStorage from "../../api/map/IMapStorage";

/**
 * 一个用于可视化母体的可视化函数库
 * * 【2023-10-06 17:48:33】原先用于测试，现在转入一个附属模组
 */

/**
 * 若方块为「空」，则填充空格；否则截断并补全空格
 * @param name 方块类型（类名）
 * @returns 格式化后的定长名字
 */
export function showBlock(name: string, maxLength: uint = 7): string {
	return showName(name == BlockVoid.name ? '' : name.slice(5, 5 + maxLength), maxLength)
}

export function showName(name: string, maxLength: uint = 7): string {
	return name.slice(0, maxLength).padEnd(maxLength)
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
					storage.getBlock(iP).type.name
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
	console.log(zwMax, zwMin)
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

export function 稀疏地图母体可视化(
	storage: MapStorageSparse,
	entities: Entity[],
	string_l: uint = 7, // 限制字长
): string {
	// 返回值
	let result: string = '';
	// 格点实体
	const entitiesPositioned: (IEntityInGrid | IEntityOutGrid)[] = entities.filter(
		(entity: Entity): boolean => (
			(entity as IEntityInGrid)?.i_inGrid ||
			(entity as IEntityOutGrid)?.i_outGrid
		)
	) as (IEntityInGrid | IEntityOutGrid)[];
	let e: (IEntityInGrid | IEntityOutGrid) | null;
	// 正式开始
	let zwMax: iPoint = new iPoint().copyFromArgs(...storage.borderMax.slice(2));
	let zwMin: iPoint = new iPoint().copyFromArgs(...storage.borderMin.slice(2));
	// 
	let tvf = (zw: iPoint): void => {
		// 每一个切片
		result += (`切片 [:, :, ${zw.join(', ')}] = `) + '\n';
		let line: string[];
		let iP: iPoint = new iPoint(0, 0, ...zw);
		for (let y = storage.borderMin[1]; y <= storage.borderMax[1]; y++) {
			line = [];
			for (let x = storage.borderMin[0]; x <= storage.borderMax[0]; x++) {
				// 每一个点
				iP.copyFromArgs(x, y); // ! 会忽略其它地方的值
				// e = getHitEntity_I_Grid(iP, entitiesInGrid)
				// 获取实体
				e = null
				for (const ent of entitiesPositioned) {
					if (alignToGrid_P(ent.position, _temp_母体可视化_entityIPoint).isEqual(iP)) {
						e = ent;
						break;
					}
				}
				// 打印
				line.push(
					e === null ?
						showBlock(
							storage.getBlock(iP).type.name, string_l
						) :
						showEntity(e, string_l)
				);
			}
			result += '|' + line.join(' ') + '|' + '\n';
		}
	}
	// 高维情况
	if (storage.numDimension > 2) traverseNDSquare(
		zwMin, zwMax, tvf
	);
	else tvf(new iPoint())
	return result;
}

export function 列举实体(es: Entity[], maxCount: uint = uint$MAX_VALUE): void {
	console.info(`实体列表(${es.length})：`);
	for (const e of es) {
		console.log(实体标签显示(e), e)
		if (--maxCount < 0) break;
	}
}

function 实体标签显示(e: Entity) {
	if (e instanceof Player)
		return `${getClass(e)?.name}"${e.customName}"@${(e as IEntityInGrid).position}|${e.HPText}`
	else if ((e as (IEntityInGrid | IEntityOutGrid))?.position !== undefined)
		return `${getClass(e)?.name}@${(e as IEntityInGrid).position}`
	return `${getClass(e)?.name}`
}