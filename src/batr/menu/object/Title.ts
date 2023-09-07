package batr.menu.objects {

	import flash.display.*;

	export default class Title extends Bitmap {
		//============Static Variables============//
		public static const WIDTH: number = 2048.75;
		public static const HEIGHT: number = 609.75;
		public static const X: number = -23.1;
		public static const Y: number = -23.1;

		//============Constructor Function============//
		public Title(): void {
			super(new TitleImg()); // TitleImg.IMAGE_DATA
			// AddBitMap
			// var bitmap:Bitmap=new Bitmap();
			this.x = X;
			this.y = Y;
			this.width = WIDTH;
			this.height = HEIGHT;
		}
	}
}