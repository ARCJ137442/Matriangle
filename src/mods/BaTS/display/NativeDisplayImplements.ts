import { IGraphicContext } from '../../../api/display/DisplayInterfaces'
import { DEFAULT_SIZE } from '../../../api/display/GlobalDisplayVariables'
import { NativeDecorationLabel } from '../../native/entities/player/DecorationLabels'

/**
 * （移植自AIPlayer）用于在主图形上显示「附加装饰」
 *
 * ?【2023-10-01 15:39:00】这个似乎应该迁移到「显示端」做
 * @param graphics 绘制的图形上下文
 * @param decorationLabel 绘制的「装饰类型」
 * @param radius 装饰半径
 */
export function drawShapeDecoration(
	graphics: IGraphicContext,
	decorationLabel: NativeDecorationLabel,
	radius: number = DEFAULT_SIZE / 10
): void {
	// TODO: 有待整理
	switch (decorationLabel) {
		case NativeDecorationLabel.EMPTY:
			break
		case NativeDecorationLabel.CIRCLE:
			graphics.drawCircle(0, 0, radius)
			break
		case NativeDecorationLabel.SQUARE:
			graphics.drawRect(-radius, -radius, radius * 2, radius * 2)
			break
		case NativeDecorationLabel.TRIANGLE:
			graphics.moveTo(-radius, -radius)
			graphics.lineTo(radius, 0)
			graphics.lineTo(-radius, radius)
			graphics.lineTo(-radius, -radius)
			break
		case NativeDecorationLabel.DIAMOND:
			graphics.moveTo(-radius, 0)
			graphics.lineTo(0, radius)
			graphics.lineTo(radius, 0)
			graphics.lineTo(0, -radius)
			graphics.lineTo(-radius, -0)
			break
	}
}
