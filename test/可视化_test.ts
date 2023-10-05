import { iPoint, traverseNDSquare } from "../src/batr/common/geometricTools";
import { getClass } from "../src/batr/common/utils";
import { int, uint } from "../src/batr/legacy/AS3Legacy";
import Entity from "../src/batr/game/api/entity/Entity";
import { IEntityInGrid } from "../src/batr/game/api/entity/EntityInterfaces";
import BlockVoid from "../src/batr/game/mods/native/blocks/Void";
import MapStorageSparse from "../src/batr/game/mods/native/maps/MapStorageSparse";
import { getHitEntity_I_Grid } from "../src/batr/game/mods/native/registry/NativeMatrixMechanics";

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

/**
 * 大一统的「母体可视化」
 * * 现在返回字符串
 */
export function 母体可视化(
	storage: MapStorageSparse,
	entities: Entity[],
	string_l: uint = 7, // 限制字长
): string {
	//
	let result: string = '';
	// 格点实体
	const entitiesInGrid: IEntityInGrid[] = entities.filter(
		(entity: Entity): boolean => (entity as IEntityInGrid)?.i_inGrid
	) as IEntityInGrid[];
	let eig: IEntityInGrid | null;
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
				eig = getHitEntity_I_Grid(iP, entitiesInGrid)
				line.push(
					eig === null ?
						showBlock(
							storage.getBlock(iP).type.name, string_l
						) :
						showEntity(eig, string_l)
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

export function 列举实体(es: Entity[]): void {
	console.info('实体列表：');
	for (const e of es) {
		console.log(`${getClass(e)?.name} in ${(e as IEntityInGrid).position}`, e)
	}
}