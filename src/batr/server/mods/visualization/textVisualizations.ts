import {
	iPoint,
	iPointRef,
	iPointVal,
	traverseNDSquare,
} from '../../../common/geometricTools'
import { getClass } from '../../../common/utils'
import { int, uint, uint$MAX_VALUE } from '../../../legacy/AS3Legacy'
import Entity from '../../api/entity/Entity'
import {
	IEntityHasPosition,
	i_fixedLive,
	i_hasDirection,
	i_hasPosition,
} from '../../api/entity/EntityInterfaces'
import MapStorageSparse from '../native/maps/MapStorageSparse'
import { alignToGrid_P } from '../../general/PosTransform'
import PlayerBatr from '../batr/entity/player/PlayerBatr'
import IMapStorage from '../../api/map/IMapStorage'
import { MatrixEventDispatcher } from '../../api/control/MatrixControl'
import PlayerController from '../native/entities/player/controller/PlayerController'
import { MatrixProgram } from '../../api/control/MatrixProgram'
import BonusBox from '../batr/entity/item/BonusBox'
import Effect from '../../api/entity/Effect'
import Projectile from '../batr/entity/projectile/Projectile'
import BlockRandomTickDispatcher from '../batr/mechanics/programs/BlockRandomTickDispatcher'
import { nameOfAxis_M, nameOfRot_M } from '../../general/GlobalRot'
import { NativeBlockIDs } from '../native/registry/NativeBlockRegistry'
import EffectExplode from '../batr/entity/effect/EffectExplode'
import MapSwitcherRandom from '../batr/mechanics/programs/MapSwitcherRandom'
import IMatrix from '../../main/IMatrix'
import IPlayer, { isPlayer } from '../native/entities/player/IPlayer'

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

/**
 * 呈现实体
 * * 【2023-10-05 01:03:03】目前只呈现名称
 */
export function showEntity(entity: Entity, maxLength: uint = 7): string {
	return showName(
		// 自定义名称
		(entity as IPlayer)?.customName ??
			// 类名
			getClass(entity)?.name ??
			// 未定义
			'#UNDEF',
		maxLength
	)
}

export function mapV地图可视化(
	storage: MapStorageSparse,
	...otherPos_I: int[]
): void {
	let line: string[]
	const iP: iPoint = new iPoint(0, 0, ...otherPos_I)
	for (let y = storage.borderMin[1]; y <= storage.borderMax[1]; y++) {
		line = []
		for (let x = storage.borderMin[0]; x <= storage.borderMax[0]; x++) {
			iP.copyFromArgs(x, y) // ! 会忽略其它地方的值
			line.push(showBlock(storage.getBlock(iP).id))
		}
		console.log('|' + line.join(' ') + '|')
	}
}

/**
 * 像Julia遍历张量一样可视化一个地图
 */
export function mapVH地图可视化_高维(storage: MapStorageSparse): void {
	const zwMax: iPoint = new iPoint().copyFromArgs(
		...storage.borderMax.slice(2)
	)
	const zwMin: iPoint = new iPoint().copyFromArgs(
		...storage.borderMin.slice(2)
	)
	// console.log(zwMax, zwMin)
	traverseNDSquare(zwMin, zwMax, (zw: iPoint): void => {
		console.info(`切片 [:, :, ${zw.join(', ')}] = `)
		mapV地图可视化(storage, ...zw)
	})
}

const _temp_母体可视化_entityIPoint: iPointVal = new iPoint()
/**
 * 大一统的「母体可视化」
 * * 现在返回字符串
 */
export function matrixV母体可视化(
	storage: IMapStorage,
	entities: Entity[],
	string_l: uint = 7 // 限制字长
): string {
	// 分派「地图存储结构」的类型
	if (storage instanceof MapStorageSparse)
		return sparseMapMV稀疏地图母体可视化(storage, entities, string_l)
	throw new Error('不支持该地图存储结构的母体可视化')
}

function vPoint可视化单点(
	storage: IMapStorage,
	p: iPoint,
	entitiesPositioned: IEntityHasPosition[],
	string_l: uint = 7 // 限制字长
): string {
	let e: Entity | null = null
	for (const ent of entitiesPositioned) {
		if (
			alignToGrid_P(ent.position, _temp_母体可视化_entityIPoint).isEqual(
				p
			)
		) {
			e = ent
			break
		}
	}
	// 打印
	return e === null
		? showBlock(String(storage.getBlockID(p)), string_l)
		: showEntity(e, string_l)
}

export function sparseMapMV稀疏地图母体可视化(
	storage: MapStorageSparse,
	entities: Entity[],
	string_l: uint = 7 // 限制字长
): string {
	// 返回值
	let result: string = ''
	// 格点实体
	const entitiesPositioned: IEntityHasPosition[] =
		entities.filter(i_hasPosition)
	// 正式开始
	const zwMax: iPoint = new iPoint().copyFromArgs(
		...storage.borderMax.slice(2)
	)
	const zwMin: iPoint = new iPoint().copyFromArgs(
		...storage.borderMin.slice(2)
	)

	const vLine可视化单线 = (
		iP: iPoint,
		line: string[],
		...otherPos_I: int[]
	): string => {
		for (let x = storage.borderMin[0]; x <= storage.borderMax[0]; x++) {
			// 每一个点
			iP.copyFromArgs(x, ...otherPos_I) // ! 会忽略其它地方的值
			line.push(
				vPoint可视化单点(storage, iP, entitiesPositioned, string_l)
			)
		}
		return '|' + line.join(' ') + '|' + '\n'
	}
	const vPlane可视化单面 = (zw: iPoint): void => {
		// 每一个切片
		result += `切片 [:, :, ${zw.join(', ')}] = ` + '\n'
		const line: string[] = []
		const iP: iPoint = new iPoint(0, 0, ...zw)
		for (let y = storage.borderMin[1]; y <= storage.borderMax[1]; y++) {
			line.length = 0
			result += vLine可视化单线(iP, line, y)
		}
	}
	// 处理各个维度的情况
	switch (storage.numDimension) {
		case 0:
			result = vPoint可视化单点(
				storage,
				new iPoint(),
				entitiesPositioned,
				string_l
			)
			break
		case 1:
			result = vLine可视化单线(new iPoint(), [])
			break
		case 2:
			vPlane可视化单面(new iPoint())
			break
		// 其它高维情况
		default:
			traverseNDSquare(zwMin, zwMax, vPlane可视化单面)
			break
	}
	return result
}

export function listE列举实体(
	es: Entity[],
	maxCount: uint = uint$MAX_VALUE
): void {
	console.info(`实体列表(${es.length})：`)
	for (const e of es) {
		console.log(entityTS实体标签显示(e), e)
		if (--maxCount < 0) break
	}
}

export function entityLV实体列表可视化(
	es: Entity[],
	maxCount: uint = uint$MAX_VALUE
): string {
	let result: string = ''
	result += `实体列表(${es.length})：\n`
	for (const e of es) {
		result += entityTS实体标签显示(e) + '\n'
		if (--maxCount < 0) break
	}
	return result
}

function entityTS实体标签显示(e: Entity): string {
	// 玩家
	if (isPlayer(e))
		if (e instanceof PlayerBatr)
			// BaTr
			return `${getClass(e)?.name}"${e.customName}"${getPT获取坐标标签(
				e
			)}|${
				e.HPText // 生命
			}|${e.isUsing ? '^' : '#'}[${e.tool.id}:${e.tool.usingCD}/${
				e.tool.baseCD
			}${
				e.tool.needsCharge
					? `!${e.tool.chargeTime}/${e.tool.chargeMaxTime}`
					: '' // 工具
			}]|#${e.team.name}:${e.team.id}#`
		// 普通原生玩家
		else
			return `${getClass(e)?.name}"${e.customName}"${getPT获取坐标标签(
				e
			)}|${e.HPText}`
	// 奖励箱
	if (e instanceof BonusBox)
		return `${getClass(e)?.name}"${e.bonusType}"@${PV位置可视化(e)}`
	// 特效
	if (e instanceof Effect)
		if (e instanceof EffectExplode)
			// 爆炸特效
			return `${getClass(e)?.name}@${PV位置可视化(
				e
			)}${getLT获取生命周期标签(e)}(r=${e.radius})`
		else
			return `${getClass(e)?.name}@${PV位置可视化(
				e
			)}${getLT获取生命周期标签(e)}`
	// 抛射体（不管有无坐标）
	if (e instanceof Projectile)
		return `${getClass(e)?.name}${getPT获取坐标标签(
			e
		)}${getLT获取生命周期标签(e)}`
	// 母体程序
	if (e instanceof MatrixProgram)
		if (e instanceof BlockRandomTickDispatcher)
			// 方块随机刻分派者
			return `${getClass(e)?.name}[${e.label}]`
		// 地图切换者
		else if (e instanceof MapSwitcherRandom)
			// *↓使用any强制访问私有变量
			// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
			return `${getClass(e)?.name}[${e.label}]=#${(e as any)
				?._mapSwitchTick}/${e.mapSwitchInterval}#`
		// 控制器
		else if (e instanceof MatrixEventDispatcher)
			if (e instanceof PlayerController)
				// 玩家控制器
				return `${getClass(e)?.name}[${e.label}] -> ${e.subscribers
					.map(entityTS实体标签显示)
					.join(', ')}`
			// 其它
			else
				return `${getClass(e)?.name}[${e.label}] -> ${
					//
					// eslint-disable-next-line @typescript-eslint/no-base-to-string
					e.subscribers
						.map(x =>
							x instanceof Entity
								? entityTS实体标签显示(e)
								: e?.toString()
						)
						.join(', ')
				}`
		// 普通情况：仅有一个标签
		else return `${getClass(e)?.name}[${e.label}]`
	// 其它实体（包括「是否有坐标」）
	return `${getClass(e)?.name}${getPT获取坐标标签(e)}`
}

/**  辅助函数 */
function getPT获取坐标标签(e: Entity): string {
	return (
		(i_hasPosition(e) ? `@${PV位置可视化(e)}` : ``) +
		(i_hasDirection(e) ? `^${nameOfRot_M(e.direction)}` : ``)
	)
}

/** 辅助函数 */
function getLT获取生命周期标签(e: Entity): string {
	return i_fixedLive(e) ? `|${e.life}/${e.LIFE}` : ``
}

const number可视化 = (n: number): string =>
	Number.isInteger(n) ? n.toString() : n.toFixed(2)
const PV位置可视化 = (e: IEntityHasPosition): string =>
	e.position.map(number可视化).join(',')

// 截面可视化 //

/**
 * 截面可视化
 *
 * @param storage 地图存储结构
 * @param entitiesPositioned 所有有坐标实体
 * @param axis_x 作为呈现上x轴的轴向
 * @param axis_y 作为呈现上y轴的轴向
 * @param axis_x_max 呈现x轴最大值
 * @param axis_y_max 呈现y轴最大值
 * @param axis_x_min 呈现x轴最小值
 * @param axis_y_min 呈现y轴最小值
 * @param keeps 其它维的坐标（呈现轴上随意设置）
 * @param string_l 每一格统一的字符串长度
 *
 * @returns 地图（连带实体）在特定轴向显示的画面
 */
export function getCutVisualization(
	storage: IMapStorage,
	entitiesPositioned: IEntityHasPosition[],
	axis_x: uint,
	axis_y: uint,
	axis_x_max: uint,
	axis_y_max: uint,
	axis_x_min: uint,
	axis_y_min: uint,
	keeps: iPointRef,
	string_l: uint = 6
): string {
	let result: string = ''

	_temp_getCutVisualization.copyFrom(keeps)

	const line: string[] = []
	for (let y = axis_y_min; y <= axis_y_max; y++) {
		for (let x = axis_x_min; x <= axis_x_max; x++) {
			_temp_getCutVisualization[axis_x] = x
			_temp_getCutVisualization[axis_y] = y
			line.push(
				vPoint可视化单点(
					storage,
					_temp_getCutVisualization,
					entitiesPositioned,
					string_l
				)
			)
		}
		result += '|' + line.join(' ') + '|\n'
		line.length = 0
	}
	return result
}
const _temp_getCutVisualization: iPointVal = new iPoint()

/**
 * 特别针对稀疏地图，直接使用其边界决定四个边界参数
 * @param storage 地图存储结构
 * @param entitiesPositioned 所有有坐标实体
 * @param axis_x 作为呈现上x轴的轴向
 * @param axis_y 作为呈现上y轴的轴向
 * @param keeps 其它维的坐标（呈现轴上随意设置）
 * @param string_l 每一格统一的字符串长度
 *
 * @returns 地图（连带实体）在特定轴向显示的画面
 */
export function cutSV稀疏地图截面可视化(
	storage: MapStorageSparse,
	entitiesPositioned: IEntityHasPosition[],
	axis_x: uint,
	axis_y: uint,
	keeps: iPointRef,
	string_l: uint = 7
): string {
	return getCutVisualization(
		storage,
		entitiesPositioned,
		axis_x,
		axis_y,
		storage.borderMax[axis_x],
		storage.borderMax[axis_y],
		storage.borderMin[axis_x],
		storage.borderMin[axis_y],
		keeps,
		string_l
	)
}

/**
 * 对于单个中心点，在所有可能轴向组合上的「截面可视化」
 *
 * @param storage 稀疏地图存储结构
 * @param entitiesPositioned 所有有坐标实体
 * @param center 呈现的中心（所谓「其它维坐标」）
 * @param string_l 每一格统一的字符串长度
 *
 * @returns 地图（连带实体）在所有轴向显示的画面
 */
export function SPSACV单点稀疏地图所有视角截面可视化(
	storage: MapStorageSparse,
	entitiesPositioned: IEntityHasPosition[],
	center: iPointRef,
	string_l: uint = 7
): string {
	let result: string = `[Slices@(${center.toString()})]\n`

	const nDim = storage.numDimension
	for (let axis_x: uint = 0; axis_x < nDim; ++axis_x)
		// xy不重样
		for (let axis_y: uint = axis_x + 1; axis_y < nDim; ++axis_y) {
			// 直接生成一个截面
			result +=
				`Slice ${nameOfAxis_M(axis_x)}${nameOfAxis_M(
					axis_y
				)}(${storage.getSizeAt(axis_x)}x${storage.getSizeAt(
					axis_y
				)}):\n` +
				cutSV稀疏地图截面可视化(
					storage,
					entitiesPositioned,
					axis_x,
					axis_y,
					center,
					string_l
				) // ! ↑这里已经带了一个换行符
		}

	return result
}

/**
 * 大一统的「母体可视化」
 * * 现在返回字符串
 */
export function SPMAVCV单点母体所有视角截面可视化(
	matrix: IMatrix,
	center: iPointRef,
	string_l: uint = 7 // 限制字长
): string {
	// 分派「地图存储结构」的类型
	if (matrix.map.storage instanceof MapStorageSparse)
		return SPSACV单点稀疏地图所有视角截面可视化(
			matrix.map.storage,
			matrix.entities.filter(i_hasPosition),
			center,
			string_l
		)
	throw new Error('不支持该地图存储结构的母体可视化')
}

/**
 * 字符串处理：行拼接
 *
 * @example
 * |x y|
 * |z w|
 * +
 * |a b|
 * |c d|
 * =
 * |x y| |a b|
 * |z w| |c d|
 */
export function rowJoin(
	rowsA: string[],
	rowsB: string[],
	separator: string = ''
): string {
	let result: string = ''
	for (let i: uint = 0; i < rowsA.length; i++) {
		result += rowsA[i] + separator + rowsB[i] + '\n'
	}
	return result
}
