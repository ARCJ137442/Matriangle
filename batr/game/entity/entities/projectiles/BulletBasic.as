package batr.game.entity.entities.projectiles 
{
	import batr.general.*;
	
	import batr.game.entity.*;
	import batr.game.entity.entities.players.*;
	import batr.game.model.*;
	import batr.game.main.*;
	
	import flash.display.*;
	import flash.geom.*;
	
	public class BulletBasic extends ProjectileCommon
	{
		//============Static Variables============//
		public static const LINE_SIZE:Number=GlobalGameVariables.DEFAULT_SIZE/96
		public static const SIZE:Number=PosTransform.localPosToRealPos(3/8)
		public static const DEFAULT_SPEED:Number=16/GlobalGameVariables.TPS*2
		public static const DEFAULT_EXPLODE_RADIUS:Number=1
		
		//============Instance Variables============//
		public var speed:Number
		public var finalExplodeRadius:Number//Entity Pos
		
		//============Constructor Function============//
		public function BulletBasic(host:Game,x:Number,y:Number,
									owner:Player,
									speed:Number=DEFAULT_SPEED,
									defaultExplodeRadius:Number=DEFAULT_EXPLODE_RADIUS):void
		{
			super(host,x,y,owner);
			this.speed=speed
			this.finalExplodeRadius=owner==null?defaultExplodeRadius:owner.operateFinalRadius(defaultExplodeRadius);
			this._currentWeapon=WeaponType.BULLET
			this.damage=this._currentWeapon.defaultDamage
			this.drawShape();
		}
		
		//============Destructor Function============//
		public override function deleteSelf():void
		{
			this.graphics.clear();
			super.deleteSelf();
		}
		
		//============Instance Getter And Setter============//
		public override function get type():EntityType
		{
			return EntityType.BULLET_BASIC;
		}
		
		//============Instance Functions============//
		
		//====Tick Function====//
		public override function onProjectileTick():void
		{
			onBulletTick()
			onBulletCommonTick()
		}
		
		public function onBulletCommonTick():void
		{
			if(!_host.isOutOfMap(this.entityX,this.entityY)&&
			   this._host.testFrontCanPass(this,this.speed,false,true,false))
			{
				this.moveForward(this.speed)
			}
			else
			{
				if(Game.debugMode) trace("Bullet explode:",this.getX(),this.getY())
				explode()
			}
		}
		
		public function onBulletTick():void
		{
			
		}
		
		protected function explode():void
		{
			this._host.weaponCreateExplode(this.entityX,this.entityY,this.finalExplodeRadius,this.damage,this)
			this._host.entitySystem.removeProjectile(this)
		}
		
		//====Graphics Functions====//
		public override function drawShape():void
		{
			var realRadiusX:Number=SIZE/2
			var realRadiusY:Number=SIZE/2
			graphics.clear();
			graphics.lineStyle(LINE_SIZE,this.ownerLineColor);
			//graphics.beginFill(this._fillColor);
			var m:Matrix=new Matrix()
			m.createGradientBox(SIZE,
								SIZE,0,-realRadiusX,-realRadiusX)
			graphics.beginGradientFill(GradientType.LINEAR,
            [this.ownerColor,ownerLineColor],
            [1,1],
            [63,255],
            m,
            SpreadMethod.PAD,
            InterpolationMethod.RGB,
            1)
			graphics.moveTo(-realRadiusX,-realRadiusY);
			graphics.lineTo(realRadiusX,0);
			graphics.lineTo(-realRadiusX,realRadiusY);
			graphics.lineTo(-realRadiusX,-realRadiusY);
			//graphics.drawCircle(0,0,10)
			graphics.endFill();
		}
	}
}
