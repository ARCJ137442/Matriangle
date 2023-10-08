import { randomInWeightMap } from "../../../../../common/utils";
import { uint } from "../../../../../legacy/AS3Legacy";
import { MatrixProgram, MatrixProgramLabel } from "../../../../api/control/MatrixProgram";
import Effect from "../../../../api/entity/Effect";
import Entity from "../../../../api/entity/Entity";
import { IEntityActive } from "../../../../api/entity/EntityInterfaces";
import IMap from "../../../../api/map/IMap";
import IMatrix from "../../../../main/IMatrix";
import BonusBox from "../../entities/item/BonusBox";
import IPlayer from "../../entities/player/IPlayer";
import Projectile from "../../entities/projectile/Projectile";
import MatrixRule_V1 from "../../rule/MatrixRule_V1";
import { changeMap, getRandomMap, isPlayer, spreadPlayer } from "../NativeMatrixMechanics";

/**
 * 「地图切换者」是
 * * 活跃的
 * * 基于「内部时钟」定期更改母体地图的
 * * 作为AS3版本「地图变换机制」继任者的
 * 母体程序
 */
export default class MapSwitcher extends MatrixProgram implements IEntityActive {

	/** 标签 */
	public static readonly LABEL: MatrixProgramLabel = 'MapSwitch';

	// 构造&析构 //
	public constructor(switchInterval: uint) {
		super(MapSwitcher.LABEL);
		this._mapSwitchTick = this.mapSwitchInterval = switchInterval;
	}

	// 内部时钟 //
	protected _mapSwitchTick: uint;
	/**
	 * 地图「定期切换」的周期间隔时长
	 */
	public mapSwitchInterval: uint;

	// 活跃实体 //
	public readonly i_active: true = true;

	// *实现：定期切换地图
	onTick(host: IMatrix): void {
		if (--this._mapSwitchTick <= 0) {
			this._mapSwitchTick = this.mapSwitchInterval;
			this.changeMap(host);
		}
	}

	/**
	 * The Main PURPOSE: 切换地图
	 * * 原`transformMap`
	 * 
	 * ? 「中途切换地图」但后续还遍历到抛射体/玩家，怎么处理
	 * 
	 * @param host 需要「切换地图」的母体
	 */
	protected changeMap(host: IMatrix): void {
		// 获取新的地图 //
		let newMap: IMap;
		// 先判断母体是否有相应的规则
		if (host.rule.hasRule(MatrixRule_V1.key_mapRandomPotentials)) {
			// 随机地图
			newMap = getRandomMap(host.rule).copy(true); // !【2023-10-08 22:31:40】现在对地图进行深拷贝
		}
		else {
			console.error('并未在母体中找到相应的「地图随机规则」！')
			return;
		}
		// 实体预备 //
		let entities: Entity[] = host.entities;
		let players: IPlayer[] = [];
		// 新建一个映射，缓存所有实体的激活状态 // * 避免「变换前未激活的实体，变换后异常被激活」
		let entityActives: Map<Entity, boolean> = new Map();
		// 处理旧实体
		for (const entity of entities) {
			// 清除所有抛射体、奖励箱和特效
			if (
				entity instanceof Projectile ||
				entity instanceof BonusBox ||
				entity instanceof Effect
			)
				host.removeEntity(entity);
			// 记录玩家
			else if (isPlayer(entity))
				players.push(entity as IPlayer)
			// 冻结实体：取消实体激活
			entityActives.set(entity, entity.isActive);
			entity.isActive = false;
		}
		// 改变地图 //
		changeMap(host, newMap, true);
		// 插入「最终代码」：恢复激活、分散并告知玩家等 //
		host.insertFinalExecution((): void => {
			// 重新激活 // !这里使用「已回收后的实体列表」，先前被删除的实体不再处理
			for (const entity of host.entities) {
				// 必须「映射里有」才能恢复
				if (entityActives.has(entity))
					entity.isActive = entityActives.get(entity) as boolean;
				// 分散并告知玩家 // ! 必须是「执行该函数时母体中的玩家」，因为有可能在执行到这里之前玩家发生变动（杜绝「被删除但还是被遍历到」的情况）
				if (isPlayer(entity) && !(entity as IPlayer).isRespawning/* 必须不在重生过程中 */) {
					spreadPlayer(host, entity as IPlayer, true, true);
					(entity as IPlayer).onMapTransform(host);
				}
				// 否则：不做任何事情，保留状态 // * 可能是后续又新增了实体
			}
			// 清空字典状态
			entityActives.clear();
		})
		// TODO: 母体统计系统（参见`MatrixStats.ts`）
	}
}

// !【2023-10-08 18:18:09】「世界随机刻」的「事件处理函数」类型 已并入 统一的「方块事件机制」