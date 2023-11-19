import {
	IDisplayData,
	IStateDisplayer,
} from 'matriangle-api/display/RemoteDisplayAPI'
import { OptionalRecursive2 } from 'matriangle-common'
import { Shape } from 'zimjs'

// 抽象接口 //

/**
 * 所有需要接收「更新信息」的图形都继承该类
 */
export abstract class ZimShapeDisplayer<StateDataT extends IDisplayData>
	extends Shape
	implements IStateDisplayer<StateDataT>
{
	// ! 这下面仨函数对应着「可显示对象」的「初始化」「刷新」「销毁」的方法 ! //
	shapeInit(_data: StateDataT): void {
		// console.log('ZimDisplayShape.shapeInit', data)
	}

	/**
	 * @implements （部分化）刷新图形
	 * * 即便基于「完整数据」可以很方便地「销毁再初始化」，但这应该是子类需要做的事情
	 *
	 * @abstract 作为一个抽象方法，因为并非总是「完整数据」
	 * @param data 更新用的「数据补丁」
	 */
	abstract shapeRefresh(data: OptionalRecursive2<StateDataT>): void

	/**
	 * 图形销毁
	 */
	shapeDestruct(): void {
		this.graphics.clear()
	}
}
