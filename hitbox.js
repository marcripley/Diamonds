
/**@
* #Collision
* @category Collision
* Components to display Crafty.polygon Array for debugging collision detection
* * @example
* ~~~
* Crafty.e("2D,DOM,Player,Collision,WiredHitBox").collision(new Crafty.polygon([0,0],[0,300],[300,300],[300,0])) 
* ~~~
* this will display a wired square over your original Canvas screen 
*/
Crafty.c("WiredHitBox", {

    init:function(){

        if (Crafty.support.canvas){ 
            var c = document.getElementById('HitBox');
            if(!c){
                c = document.createElement("canvas");
                c.id = 'HitBox';
                c.width = Crafty.viewport.width;
                c.height = Crafty.viewport.height;
                c.style.position = 'absolute';
                c.style.left = "0px";
                c.style.top = "0px";
                c.style.zIndex = Crafty.stage.elem.style.zIndex+1;
                Crafty.stage.elem.appendChild(c); 
            }
            var ctx = c.getContext('2d');
            if(!this.map) this.collision();
            var drawed = 0,total=Crafty("WiredHitBox").length;
            this.requires("Collision").bind("EnterFrame",function(){
                if(drawed == total){
                    ctx.clearRect(0,0,Crafty.viewport.width,Crafty.viewport.height);
                    drawed = 0;
                }
                ctx.beginPath(); 
                for(var p in this.map.points){
                    ctx.lineTo(Crafty.viewport.x+this.map.points[p][0],Crafty.viewport.y+this.map.points[p][1]);  
                }
                ctx.closePath(); 
                ctx.stroke(); 
                drawed++;
               
            }); 
        }
       
        return this;
    }
});
/*
 * @example
* ~~~
* Crafty.e("2D,DOM,Player,Collision,SolidHitBox").collision(new Crafty.polygon([0,0],[0,300],[300,300])) 
* ~~~
* this will display a solid triangle over your original Canvas screen 
 */
Crafty.c("SolidHitBox", {
    init:function(){
        if (Crafty.support.canvas){ 
            var c = document.getElementById('HitBox');
            if(!c){
                c = document.createElement("canvas");
                c.id = 'HitBox';
                c.width = Crafty.viewport.width;
                c.height = Crafty.viewport.height;
                c.style.position = 'absolute';
                c.style.left = "0px";
                c.style.top = "0px";
                c.style.zIndex = Crafty.stage.elem.style.zIndex+1;
                Crafty.stage.elem.appendChild(c); 
            }
            var ctx = c.getContext('2d');
            if(!this.map) this.collision();
            var drawed = 0,total =Crafty("SolidHitBox").length;
            this.requires("Collision").bind("EnterFrame",function(){
                  if(drawed == total){
                    ctx.clearRect(0,0,Crafty.viewport.width,Crafty.viewport.height);
                    drawed = 0;
                }
                ctx.beginPath(); 
                for(var p in this.map.points){
                    ctx.lineTo(Crafty.viewport.x+this.map.points[p][0],Crafty.viewport.y+this.map.points[p][1]);  
                }
                ctx.closePath(); 
                ctx.fill(); 
                drawed++;
            }); 
        }
        
        return this;
    }
});
