
// import flash.display.*;

import { X, Y } from "../../common/KeyCode";
import TitleImg from "./TitleImg";

export default class Title extends Bitmap {
	//============Static Variables============//
	public static readonly WIDTH: number = 2048.75;
	public static readonly HEIGHT: number = 609.75;
	public static readonly X: number = -23.1;
	public static readonly Y: number = -23.1;

	//============Constructor & Destructor============//
	public constructor() {
		super(new TitleImg()); // TitleImg.IMAGE_DATA
		// AddBitMap
		// var bitmap:Bitmap=new Bitmap();
		this.x = X;
		this.y = Y;
		this.width = WIDTH;
		this.height = HEIGHT;
	}
}