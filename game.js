window.onload = function () {

		var MAX_WIDTH = 768;
		var MAX_HEIGHT = 384;
    //start crafty
		// Map is 10 (64px) tiles horizontally and 16 (32px) tiles vertically
    Crafty.init(MAX_WIDTH, MAX_HEIGHT);
    //Crafty.canvas();

    //turn the sprite map into usable components
    Crafty.sprite(32, "sprite.png", {
    	// Colors specified must be capitalized
    	brickDeath: [0, 0, 2, 1],
        diamondGray: [0, 1, 2, 1],
        brickBlue: [0, 2, 2, 1],
		brickGreen: [0, 3, 2, 1],
		brickPurple: [0, 4, 2, 1],
		brickRed: [0, 5, 2, 1],
		brickDiamond: [2, 0, 2, 1],
		brickLightblue: [2, 1, 2, 1],
		diamondBlue: [2, 2, 2, 1],
		diamondGreen: [2, 3, 2, 1],
		diamondPurple: [2, 4, 2, 1],
		diamondRed: [2, 5, 2, 1],
		playerGray: [4, 0],
		playerLightblue: [4, 1],
		playerBlue: [4, 2],
		playerGreen: [4, 3],
		playerPurple: [4, 4],
		playerRed: [4, 5]
    });

	// This returns tile type and color in an array for use in map generation
	function setTileParams(tile) {
		switch(tile) {
			case 'a':
				return ["diamond", "Gray"];
			case 'x':
				return ["brick", "Death"];
			case '*':
				return ["brick", "Diamond"];
			case 'l':
				return ["brick", "Lightblue"]
			case 'b':
				return ["brick", "Blue"];
			case 'B':
				return ["diamond", "Blue"];
			case 'g':
				return ["brick", "Green"];
			case 'G':
				return ["diamond", "Green"];
			case 'p':
				return ["brick", "Purple"];
			case 'P':
				return ["diamond", "Purple"];
			case 'r':
				return ["brick", "Red"];
			case 'R':
				return ["diamond", "Red"];
			default:
				return ["diamond", "Gray"];
		}
	}

	Crafty.c("Color", {
		_color: '',

		init: function() {
		},

		setcolor: function(entity,color) {
			if(color) this._color = color;
			this.addComponent(entity+color)

			return this;
		},

		getcolor: function() {
			return this._color;
		},

		removecolor: function(entity,color) {
			this.removeComponent(entity+color)

			return this;
		}
	});


    //method to generate the map
		// Map is 10 (64px) tiles horizontally and 16 (32px) tiles vertically
    function generateWorld() {
    	/*
		 * @todo Crafty.background
		 */

		Crafty.background("#222");

		if (window.XMLHttpRequest)
		{// code for IE7+, Firefox, Chrome, Opera, Safari
			xmlhttp=new XMLHttpRequest();
		}
		else
		{// code for IE6, IE5
			xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
		}
		xmlhttp.open("GET","levels.xml",false);
		xmlhttp.send();
		xmlDoc=xmlhttp.responseXML;

		//alert(xmlDoc.getElementById("level2").childNodes[3].childNodes[0].nodeValue);

		var level_lines = xmlDoc.getElementById("level2").childNodes[3].childNodes[0].nodeValue.split('\n');
		//alert(level_lines[0]);
		level_lines.shift(); // Remove the first list element to allow for easier XML level layout formatting.

		// Loop through the level layout rows
		for (var row=0;row<level_lines.length-1;row++) {
			for (var tile=0;tile<12;tile++) {
				if (level_lines[row][tile] != ' ') {
					var tileParams = setTileParams(level_lines[row][tile]); // setTileParams returns tile type,color in an array.
					var tileType = tileParams[0];
					var tileColor = tileParams[1];
					if (tileType == 'brick') {
						Crafty.e("2D, DOM, Collision, Color, " + tileType + ", " + tileColor)
							.attr({ w: 64, h: 32, x: tile * 64, y: row * 32, z:1 })
							.setcolor(tileType, tileColor) // Tile type, color
							.collision(new Crafty.polygon([0,0],[64,0],[64,32],[0,32]))
							.onHit("player"+tileColor, function() {
								this.destroy();
							});
					}
					else {
						Crafty.e("2D, DOM, Collision, Color, " + tileType + ", " + tileColor)
							.attr({ x: tile * 64, y: row * 32, z:1 })
							.setcolor(tileType, tileColor) // Tile type, color
							.collision(new Crafty.polygon([0,0],[64,0],[64,32],[0,32]))
					}
				}
			}
		}
    }

    //the loading screen that will display while our assets load
    Crafty.scene("loading", function () {
        //load takes an array of assets and a callback when complete
        Crafty.load(["sprite.png"], function () {
            Crafty.scene("main"); //when everything is loaded, run the main scene
        });

        //black background with some loading text
        Crafty.background("#000");
        Crafty.e("2D, DOM, Text").attr({ w: 100, h: 20, x: 150, y: 120 })
                .text("Loading")
                .css({ "text-align": "center" });
    });

    //automatically play the loading scene
    Crafty.scene("loading");

		
		Crafty.scene("main", function() {
			generateWorld();
			
			var naturalDir = 1;
			
			// NaturalWay sets the vertical movement of the player and sets boundaries
			Crafty.c("NaturalWay", {
				_vspeed: 3,
				_up: false,
				
				init: function() {
					this.requires("Keyboard");
				},
				
				naturalway: function(vspeed) {
					if(vspeed) this._vspeed = vspeed;
					
					this.bind("EnterFrame", function() {
						if (this.disableControls) return;
						// Down is -1
						if(this.y < (MAX_HEIGHT - 32) && naturalDir == -1) {
							this.y += this._vspeed;
						} else if (this.y >= (MAX_HEIGHT - 32)) {
							naturalDir = -naturalDir;
						}
						// Up is 1
						if(this.y > 2 && naturalDir == 1) {
							this.y -= this._vspeed;
						} else if (this.y <= 2) {
							naturalDir = -naturalDir;
						}
					});
					
					return this;
				}
					
			});
			
			// Custom Twoway component to allow only left and right movement and eliminate jumping
			Crafty.c("OnlyTwoway", {
				_hspeed: 3,
				
				init: function() {
					this.requires("Keyboard");
				},
				
				onlytwoway: function(hspeed) {
					if(hspeed) this._hspeed = hspeed;
					
					this.bind("EnterFrame", function() {
						if((this.isDown("RIGHT_ARROW") || this.isDown("D")) && this.x < (MAX_WIDTH - 32)) {
							this.x += this._hspeed;
						}
						if((this.isDown("LEFT_ARROW") || this.isDown("A")) && this.x >= 2) {
							this.x -= this._hspeed;
						}						
					});
					
					return this;
				}
			});

			function reverseDirection() {
				naturalDir = -naturalDir;
			}

			// Create our player entity with some premade components
			var player = Crafty.e("2D, DOM, player, Color, OnlyTwoway, NaturalWay, Collision, WiredHitBox")
				.attr({x: 18, y: 280, z: 1})
				.setcolor('player','Lightblue') // Color specified must be capitalized
				.onlytwoway(4)
				.naturalway(3)
				.collision(new Crafty.polygon([16,0],[4.686,4.686],[0,16],[4.686,27.314],[16,32],[27.314,27.314],[32,16],[27.314,4.686]))
				.onHit("brick", function(data) { // When a collision occurs with a brick...
					if (data[0]['normal']['y']==0) {
						reverseDirection();
					}
					else {
						this._hspeed = 0;
					}
				}, function() {
					this._hspeed = 3;
				})
				.onHit("diamond", function(data) { // When a collision occurs with a diamond...
					if (data[0]['normal']['y']==0) {
						reverseDirection();
					}
					else {
						this._hspeed = 0;
					}
				}, function() {
					this._hspeed = 3;
				})
				.onHit("diamondBlue", function() { // When a collision occurs with a blue diamond...
					this.removecolor('player',this.getcolor());
					this.setcolor('player','Blue'); // set the new player color and add the correct attribute
				})
				.onHit("diamondGreen", function() { // When a collision occurs with a blue diamond...
					this.removecolor('player',this.getcolor());
					this.setcolor('player','Green'); // set the new player color and add the correct attribute
				})
				.onHit("diamondPurple", function() { // When a collision occurs with a blue diamond...
					this.removecolor('player',this.getcolor());
					this.setcolor('player','Purple'); // set the new player color and add the correct attribute
				})
				.onHit("diamondRed", function() { // When a collision occurs with a blue diamond...
					this.removecolor('player',this.getcolor());
					this.setcolor('player','Red'); // set the new player color and add the correct attribute
				});
		});
};