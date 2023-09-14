import { IBatrDisplayable, IBatrShape } from '../../../display/api/BatrDisplayInterfaces';
import { uint } from '../../../legacy/AS3Legacy';

/**
 * ABSTRACT
 * @author ARCJ137442
 * 
 * @class 一切「游戏内实体」的抽象基类
 * @abstract 【20230913 23:21:10】使用抽象类，但因其特殊性不使用Abstract前缀
 */
export default abstract class Entity implements IBatrDisplayable {

	/**
	 * 存储「实体是否激活」的信息
	 * * 用于在事件分派时「是否忽略」（激活⇔需要分派）
	 */
	private _isActive: boolean = false;
	public get isActive(): boolean { return this._isActive }
	public set isActive(value: boolean) { this._isActive = value }

	//============Constructor & Destructor============//
	public constructor() { }

	public destructor(): void { }

	//============Display Implements============//
	protected _zIndex: uint = 0;
	get zIndex(): uint { return this._zIndex }
	set zIndex(value: uint) {
		this._zIndex = value
		// TODO: 增加回调事件，更新显示对象（💭需要一种「响应式更新，不能全靠显示端自己主动」）
	}

	public abstract shapeInit(shape: IBatrShape): void;
	public abstract shapeRefresh(shape: IBatrShape): void;
	public abstract shapeDestruct(shape: IBatrShape): void;
}
