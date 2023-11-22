import { fPoint } from 'matriangle-common/geometricTools'
import { uint } from 'matriangle-legacy/AS3Legacy'
import Effect, { IDisplayDataStateEffect } from './Effect'
import { TPS } from 'matriangle-api/server/main/GlobalWorldVariables'
import { typeID } from 'matriangle-api'

/** 专用的显示状态数据 */
export interface IDisplayDataStateEffectExplode
	extends IDisplayDataStateEffect {
	/**
	 * 爆炸的半径
	 */
	radius: uint
	/**
	 * 爆炸的颜色（十六进制整数值）
	 */
	color: uint
}

/**
 * 爆炸特效
 * * 呈现一个简单的线性淡出圆形
 * * 用于表现（子弹的）爆炸
 */
export default class EffectExplode extends Effect<IDisplayDataStateEffectExplode> {
	/** ID */
	public static readonly ID: typeID = 'EffectExplode'
	// !【2023-10-01 16:14:36】现在不再因「需要获取实体类型」而引入`NativeEntityTypes`：这个应该在最后才提供「实体类-id」的链接（并且是给母体提供的）

	//============Constructor & Destructor============//
	public constructor(
		position: fPoint,
		/**
		 * 只读的爆炸半径
		 *
		 * !【2023-10-10 16:31:52】实际上「所有特效都不参与世界逻辑运作」，所以这里的「半径」不影响世界运行
		 * * @readonly 又因为「爆炸特效只会进行一次。且途中不受外界控制」，所以将其限制为一个只读属性
		 */
		public readonly radius: number = 1,
		/**
		 * 只读的爆炸特效颜色
		 * * @readonly 设置为只读属性的原因同上
		 */
		public readonly color: uint
	) {
		super(EffectExplode.ID, position, TPS * 0.25)
		// * 显示更新 | 这俩都是静态属性
		this._proxy.storeState('color', color)
		this._proxy.storeState('radius', radius)
	}
}
