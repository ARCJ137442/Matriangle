import { fPoint } from '../../../../../common/geometricTools'
import { uintToPercent } from '../../../../../common/utils'
import { IShape } from '../../../../../display/api/DisplayInterfaces'
import { DEFAULT_SIZE } from '../../../../../display/api/GlobalDisplayVariables'
import { logical2Real } from '../../../../../display/api/PosTransform'
import { uint, uint$MAX_VALUE } from '../../../../../legacy/AS3Legacy'
import Effect from '../../../../api/entity/Effect'
import { TPS } from '../../../../main/GlobalWorldVariables'

/**
 * 爆炸特效
 * * 呈现一个简单的线性淡出圆形
 * * 用于表现（子弹的）爆炸
 */
export default class EffectExplode extends Effect {
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
		public readonly color: uint = EffectExplode.DEFAULT_COLOR
	) {
		super(position, TPS * 0.25)
	}

	//============Display Implements============//
	/** 默认爆炸颜色 */
	public static readonly DEFAULT_COLOR: uint = 0xffdd00
	/** 默认线条不透明度 */
	public static readonly LINE_ALPHA: uint = 5 * (uint$MAX_VALUE >> 3) // 5/8
	/** 默认填充不透明度 */
	public static readonly FILL_ALPHA: uint = (uint$MAX_VALUE / 5) << 1 // 2/5
	/** 默认线条粗细 */
	public static readonly LINE_SIZE: number = DEFAULT_SIZE / 25

	public shapeInit(shape: IShape): void {
		shape.graphics.clear()
		shape.graphics.lineStyle(EffectExplode.LINE_SIZE, this.color, uintToPercent(EffectExplode.LINE_ALPHA))
		shape.graphics.beginFill(this.color, uintToPercent(EffectExplode.FILL_ALPHA))
		shape.graphics.drawCircle(0, 0, logical2Real(this.radius))
		shape.graphics.endFill()
	}

	/** 实现：透明度跟随生命周期百分比 */
	public shapeRefresh(shape: IShape): void {
		shape.alpha = this.lifePercent
	}
}
