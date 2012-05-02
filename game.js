window.onload = function () {

	// Game window dimensions
	// Map is 12 (64px) tiles horizontally and 12 (32px) tiles vertically
	var MAX_WIDTH = 768;
	var MAX_HEIGHT = 384;
    // Start crafty
    Crafty.init(MAX_WIDTH, MAX_HEIGHT);

    // Turn the sprite map into usable components
    Crafty.sprite(32, "sprite.png", {
    	// Colors specified must be capitalized
    	breakableDeath: [0, 0, 2, 1],
        solidGray: [0, 1, 2, 1],
        breakableBlue: [0, 2, 2, 1],
		breakableGreen: [0, 3, 2, 1],
		breakablePurple: [0, 4, 2, 1],
		breakableRed: [0, 5, 2, 1],
		breakableDiamond: [2, 0, 2, 1],
		breakableLightblue: [2, 1, 2, 1],
		solidBlue: [2, 2, 2, 1],
		solidGreen: [2, 3, 2, 1],
		solidPurple: [2, 4, 2, 1],
		solidRed: [2, 5, 2, 1],
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
				return ["solid", "Gray"];
			case 'x':
				return ["breakable", "Death"];
			case '*':
				return ["breakable", "Diamond"];
			case 'l':
				return ["breakable", "Lightblue"]
			case 'b':
				return ["breakable", "Blue"];
			case 'B':
				return ["solid", "Blue"];
			case 'g':
				return ["breakable", "Green"];
			case 'G':
				return ["solid", "Green"];
			case 'p':
				return ["breakable", "Purple"];
			case 'P':
				return ["solid", "Purple"];
			case 'r':
				return ["breakable", "Red"];
			case 'R':
				return ["solid", "Red"];
			default:
				return ["solid", "Gray"];
		}
	}

	// Custom component to set colors of bricks and player to allow for player color-change and brick removal features
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

	// Generate the level layout
    function generateWorld() {

    	/*
    	 * @ TODO set background image
    	 */
    	// Background color
		Crafty.background("#222");

		// Retrieve level info via xml request
		if (window.XMLHttpRequest) {
			xmlhttp=new XMLHttpRequest(); // Modern browsers
		}
		else {
			xmlhttp=new ActiveXObject("Microsoft.XMLHTTP"); // IE6, IE5
		}
		xmlhttp.open("GET","levels.xml",false);
		xmlhttp.send();
		xmlDoc=xmlhttp.responseXML;

		// Retrieve level layout and split into parseable array
		var level_lines = xmlDoc.getElementById("level2").childNodes[3].childNodes[0].nodeValue.split('\n');
		level_lines.shift(); // Remove the first list element to allow for easier XML level layout formatting

		// Loop through the level layout rows
		for (var row=0;row<level_lines.length-1;row++) {
			for (var tile=0;tile<12;tile++) {
				if (level_lines[row][tile] != ' ') {
					var tileParams = setTileParams(level_lines[row][tile]); // setTileParams returns tile type,color in an array
					var tileType = tileParams[0];
					var tileColor = tileParams[1];
					if (tileType == 'breakable') {
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

    // The loading screen that will display while our assets load
    Crafty.scene("loading", function () {
    	/*
    	 * @ TODO plug in background images to load function
    	 */
        // Load takes an array of assets and a callback when complete
        Crafty.load(["sprite.png"], function () {
            Crafty.scene("main"); // When everything is loaded, run the main scene
        });

        // Black background with some loading text
        Crafty.background("#000");
        Crafty.e("2D, DOM, Text").attr({ w: 100, h: 20, x: 150, y: 120 })
                .text("Loading")
                .css({ "text-align": "center" });
    });

    // Automatically play the loading scene
    Crafty.scene("loading");

    // Main game scene
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
				
				// On every frame, reverses player vertical direction if the player entity is at the edge of the playing field
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
				
				// Checks for movement input on every frame and allows within playing field boundaries
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

		// Function to reverse player direction on contact with a solid or breakable brick
		function reverseDirection() {
			naturalDir = -naturalDir;
		}

		// Create our player entity with some premade components
		var player = Crafty.e("2D, DOM, player, Color, OnlyTwoway, NaturalWay, Collision")
			.attr({x: 18, y: 280, z: 1})
			.setcolor('player','Lightblue') // Color specified must be capitalized
			.onlytwoway(4)
			.naturalway(3)
			.collision(new Crafty.polygon([16,0],[4.686,4.686],[0,16],[4.686,27.314],[16,32],[27.314,27.314],[32,16],[27.314,4.686])) // This is a weak octogon meant to represent a circle
			.onHit("breakable", function(data) { // When a collision occurs with a breakable...
				// Check if the hitdata returns a y value that isn't 0. If it is 0, it's a top or bottom, so reverse player direction
				if (data[0]['normal']['y']==0) {
					reverseDirection();
				}
				// If y does not equal 0, it's a side, so restrict player left-right movement and maintain direction
				else {
					this._hspeed = 0;
				}
			}, function() {
				this._hspeed = 3;
			})
			.onHit("solid", function(data) { // When a collision occurs with a solid...
				// Check if the hitdata returns a y value that isn't 0. If it is 0, it's a top or bottom, so reverse player direction
				if (data[0]['normal']['y']==0) {
					reverseDirection();
				}
				// If y does not equal 0, it's a side, so restrict player left-right movement and maintain direction
				else {
					this._hspeed = 0;
				}
			}, function() {
				/*
				 * @ TODO make hspeed reset a variable, so it can change depending on the level
				 */
				// Reset horizontal speed, allowing the player to move again
				this._hspeed = 3;
			})
			/*
			 * @ TODO can this be refactored to not be checking 4+ events every frame?
			 */
			.onHit("solidBlue", function() { // When a collision occurs with a blue solid...
				this.removecolor('player',this.getcolor());
				this.setcolor('player','Blue'); // set the new player color and add the correct attribute
			})
			.onHit("solidGreen", function() { // When a collision occurs with a green solid...
				this.removecolor('player',this.getcolor());
				this.setcolor('player','Green');
			})
			.onHit("solidPurple", function() { // When a collision occurs with a purple solid...
				this.removecolor('player',this.getcolor());
				this.setcolor('player','Purple');
			})
			.onHit("solidRed", function() { // When a collision occurs with a red solid...
				this.removecolor('player',this.getcolor());
				this.setcolor('player','Red');
			});
	});
};