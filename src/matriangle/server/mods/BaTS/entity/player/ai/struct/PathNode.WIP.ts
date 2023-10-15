import { iPoint } from '../../../../../../../common/geometricTools'
import { uint, int } from '../../../../../../../legacy/AS3Legacy'
import { mRot } from '../../../../../../general/GlobalRot'

/**
 * ...
 * @author ARCJ137442
 */
class PathNode extends iPoint {
	/** 来源的父节点 */
	public parent: PathNode | null = null

	/** From GlobalRot(U,D,L,R) */
	public fromRot: mRot | -1 = -1

	// 寻路相关 //
	public G: int = 0
	public H: int = 0

	public get F(): int {
		return this.G + this.H
	}

	public get hasParent(): boolean {
		return this.parent !== null
	}

	public get hasFromRot(): boolean {
		return this.fromRot >= 0
	}

	public get rootParent(): PathNode | null {
		let p: PathNode | null = this.parent
		if (p === null) return null
		while (p.parent !== null && p.parent !== this) {
			p = p.parent
		}
		return p
	}

	/** Didn't include the root */
	public get pathToRoot(): PathNode[] {
		const result: PathNode[] = new Array<PathNode>(this)
		let p: PathNode | null = this.parent
		while (
			p !== null &&
			p !== this &&
			p.parent &&
			p.hasFromRot &&
			p.parent.hasFromRot
		) {
			p = p.parent
			result.push(p)
		}
		return result
	}

	// Constructor
	public constructor(x: int, y: int, parent: PathNode | null = null) {
		super(x, y)
		this.parent = parent
	}

	// Static Constructor
	public static fromPoint(p: iPoint): PathNode {
		return new PathNode(p.x, p.y, null)
	}

	// Methods
	public getFromRot(from: PathNode | null): uint | -1 {
		if (from == null) return -1

		let i: uint,
			result: uint | -1 = -1
		// 找到第一个「距离不等维度」
		for (i = 0; i < this.nDim; i++) {
			if (this[i] != from[i]) {
				result = i
				break
			}
			throw 'Not implemented'
		}
		// 剩下的是「检验剩余全零」
		for (; i < this.nDim; i++)
			// 不止一个「距离不等」
			if (this[i] != from[i]) return -1
		return result
	}

	public autoSetFromRot(): void {
		if (this.hasParent) {
			this.fromRot = this.getFromRot(this.parent)
		}
	}

	/**
	 * @param	parent	A Point
	 * @return	This point
	 */
	public setParentAndFromRot(parent: PathNode): PathNode {
		this.parent = parent
		this.autoSetFromRot()
		return this
	}

	public setFromRot(rot: uint): PathNode {
		this.fromRot = rot
		return this
	}

	override toString(): string {
		return (
			'[pos=' +
			super.toString() +
			',F=' +
			this.F +
			',G=' +
			this.G +
			',H=' +
			this.H +
			']'
		)
	}
}
