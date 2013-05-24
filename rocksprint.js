
/*function drawCircle(context, pos, radius, color, outline) {
    context.beginPath();
    context.arc(pos[0], pos[1], radius, 0, 2 * Math.PI, true);
    if (outline) {
        context.strokeStyle = color;
        context.stroke();
    } else {
        context.fillStyle = color;
        context.fill();
    }
    
}*/
function drawRect(context, x, y, width, height, color) {
    context.fillStyle = color;
    context.fillRect(x, y, width, height);
}/*
function drawText(context, text, font, style, x, y) {
    context.font = font;
    context.fillStyle = style;
    context.fillText(text, x, y);
}

function chooseFromArray(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(minimum, maximum) {
    rand = minimum + Math.floor(Math.random() * (maximum - minimum + 1));
    return rand;
}

function calc_hypotenuse_length(a, b) {
    return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
}
function calc_distance(pos1, pos2) {
    xdiff = pos1[0] - pos2[0];
    ydiff = pos1[1] - pos2[1];
    return calc_hypotenuse_length(xdiff, ydiff);
}
function normalize_vector(xlength, ylength) {
    //Scale the vector down to 0-1
    hypotenuse = calc_hypotenuse_length(xlength, ylength);
    return [xlength/hypotenuse, ylength/hypotenuse];
}
function calc_vel(pos, destination, totalvel) {
    xdiff = destination[0] - pos[0];
    ydiff = destination[1] - pos[1];
    
    vel = normalize_vector(xdiff, ydiff);
    vel[0] *= totalvel;
    vel[1] *= totalvel;
    
    return vel;
}

function calc_time() {
    return Math.floor((gCurrentTime - gStartTime) / 1000);
}

function pos_to_draw_pos(pos, radius) {
    return [pos[0] - radius, pos[1] - radius];
}

function getMinRange() {
    return gSettings.blastradius + gSettings.planetradius;
}

function getCentre() {
    return [gSettings.width/2, gSettings.height/2];
}*/

//http://ejohn.org/blog/simple-javascript-inheritance/#postcomment
/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
 
  // The base Class implementation (does nothing)
  this.Class = function(){};
 
  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;
   
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
   
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
           
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
           
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);        
            this._super = tmp;
           
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
   
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
   
    // Populate our constructed prototype object
    Class.prototype = prototype;
   
    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;
 
    // And make this class extendable
    Class.extend = arguments.callee;
   
    return Class;
  };
})();

MySprite = Class.extend({
    init: function(pos, vel) {
        this.pos = pos;
        this.vel = vel;
    },
    update: function(dt) {
        this.pos[0] += (this.vel[0] * dt);
        this.pos[1] += (this.vel[1] * dt);
    },
});

Player = MySprite.extend({
    init: function() {        
        this._super([0,0], [0, 0]);
    },
    draw: function() {
        drawX = this.pos[0] * gSettings.tile_size;
        drawY = this.pos[1] * gSettings.tile_size;
        
        image = gImage.getImage('player');
        if (image) {
            gContext.drawImage(image, drawX, drawY);
        } else {
            drawRect(gContext, drawX, drawY, gSettings.tile_size, gSettings.tile_size, 'white');
        }
    },
    update: function(dt) {
        //this._super(dt);
        gTiles[this.pos[0]][this.pos[1]] = gSettings.const_empty;
    },
    left: function() {
        this.pos[0]--;
        if (this.pos[0] < 0) {
            this.pos[0] = 0;
        }
    },
    right: function() {
        this.pos[0]++;
        if (this.pos[0] > gSettings.tiles_width - 1) {
            this.pos[0] = gSettings.tiles_width - 1;
        }
    },
    up: function() {
        this.pos[1]--;
        if (this.pos[1] < 0) {
            this.pos[1] = 0;
        }
    },
    down: function() {
        this.pos[1]++;
        if (this.pos[1] > gSettings.tiles_height - 1) {
            this.pos[1] = gSettings.tiles_height - 1;
        }
    }
});

/*MissileState = {
    FLYING : 1,
    EXPLODING : 2,
    COLLAPSING : 3
}

Missile = MyRoundSprite.extend({
	init: function(pos, vel, color, blastspeed) {
	    this.state = MissileState.FLYING;
        this.color = color;
        this.blastspeed = blastspeed;

        this._super(pos, vel, gSettings.blastradius, gSettings.missileradius);
	},
	//size : {x:0,y:0},
	update : function(dt) {
        this._super(dt);
        
        if (this.is_offscreen()) {
            this.kill();
        }
        
        if (this.state == MissileState.EXPLODING) {
            this.radius_float += (this.blastspeed * dt);
            this.currentradius = Math.floor(this.radius_float);
            if (this.currentradius > this.maxradius) {
                this.state = MissileState.COLLAPSING;
            }
        } else if (this.state == MissileState.COLLAPSING) {
            this.radius_float -= (this.blastspeed * dt);
            this.currentradius = Math.round(this.radius_float);
            if (this.currentradius < 0) {
                this.kill();
                return;
            }
        }
    },
    draw: function(context) {
        drawCircle(context, this.pos, this.currentradius, this.color);
    },
    explode: function() {
        if (this.state == MissileState.FLYING) {
            this.state = MissileState.EXPLODING;
            this.radius_float = this.currentradius;
            this.vel = [0,0];
            gSound.play('explosion');
        }
    },
    kill: function() {
        var index = gMissiles.indexOf(this);
        gMissiles.splice(index, 1);
    }
});

EnemyMissile = Missile.extend({
    init: function() {
        pos = Array(2);
        if (chooseFromArray([0, 1]) == 0) {
            // left or right side
            pos[0] = chooseFromArray([0, gSettings.width]);
            pos[1] = getRandomInt(0, gSettings.height);
        } else {
            // top or bottom edge
            pos[0] = getRandomInt(0, gSettings.width);
            pos[1] = chooseFromArray([0, gSettings.height]);
        }
        vel = calc_vel(pos, getCentre(), gSettings.missilevelocity);
    
        this._super(pos, vel, 'red', gSettings.blastspeed);
    },
    kill: function() {
        this._super();
        gEnemyCount--;
    }
});

FriendlyMissile = Missile.extend({
    init: function(destination) {
        this.center = getCentre();
        this.targetrange = calc_distance(this.center, destination);
        
        // use center as start pos so we can figure out vel vector
        vel = calc_vel(this.center, destination, gSettings.missilevelocity * 2);
        
        vector = normalize_vector(vel[0], vel[1]);
        h = gSettings.planetradius + gSettings.missileradius + 1;
        x = gSettings.width/2 + (vector[0] * h);
        y = gSettings.height/2 + (vector[1] * h);
        pos = [Math.round(x), Math.round(y)];
        
        this._super(pos, vel, 'white', gSettings.blastspeed);
        
        gSound.play('launch');
    },
    update: function(dt) {
        this._super(dt);
        
        if (this.targetrange < calc_distance(this.pos, this.center)) {
            this.explode();
        }
    }
});

function onSoundLoad() {
    gSound.numSoundsLoaded++;
}
SoundManager = Class.extend({
    numSoundsLoaded: 0,
    sounds: Array(2),
    enabled: true,
    init: function() {
        try {
            //this._context = new webkitAudioContext();
            
            this.sounds['launch'] = new Audio("sfx_fly.ogg");
            this.sounds['explosion'] = new Audio("DeathFlash.ogg");
            //this.sounds['music'] = new Audio("DST-AngryRobotIII.mp3");
            
            for (var key in this.sounds) {
                //this.sounds[key].preload = "auto";
                this.sounds[key].addEventListener('loadeddata', onSoundLoad);
            }
        } catch(e) {
            alert("Web Audio not supported");
        }
    },
    play: function(name) {
        if (this.enabled && name in this.sounds) {
            this.sounds[name].currentTime = 0;
            this.sounds[name].play();
        }
    },
    stop: function(name) {
        if (this.enabled && name in this.sounds) {
            this.sounds[name].pause();
        }
    },
    volume: function(name, volume) {
        if (this.enabled && name in this.sounds) {
            this.sounds[name].volume = volume;
        }
    }
});
var gSound = new SoundManager();
*/
function onImageLoad() {
    gImage.numImagesLoaded++;
}
ImageManager = Class.extend({
    numImagesLoaded: 0,
    images: Array(3),
    init: function() {            
        this.images['diamond'] = new Image();
        this.images['diamond'].onload = onImageLoad;
        this.images['diamond'].src = 'diamond5.png';
        
        this.images['dirt'] = new Image();
        this.images['dirt'].onload = onImageLoad;
        this.images['dirt'].src = 'Dirt.png';
        
        this.images['player'] = new Image();
        this.images['player'].onload = onImageLoad;
        this.images['player'].src = 'player.png';
    },
    getImage: function(name) {
        if (this.images.length == this.numImagesLoaded) {
            return this.images[name];
        } else {
            return null;
        }
    }
});
var gImage = new ImageManager();
/*
function onMouseClick(event) {
    if (gState == State.INGAME) {
        var mouseX;
        var mouseY;
        if ( event.offsetX == null ) { // Firefox
            if (event.pageX || event.pageY) { 
              mouseX = event.pageX;
              mouseY = event.pageY;
            }
            else { 
              mouseX = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
              mouseY = event.clientY + document.body.scrollTop + document.documentElement.scrollTop; 
            } 
            mouseX -= gCanvas.offsetLeft;
            mouseY -= gCanvas.offsetTop;
        } else {                       // Other browsers
           mouseX = event.offsetX;
           mouseY = event.offsetY;
        }
        target = [mouseX, mouseY];
        
        if (calc_distance(target, getCentre()) > getMinRange()) {
            gMissiles.push(new FriendlyMissile(target));
        } else {
            
        }
    }
}*/
function onKeyDown(event) {
    if (gState == State.PREGAME || gState == State.ENDGAME) {
        if (event.keyCode == 88) { // 'x' to start game
            newGame();
        }
    } else if (gState == State.INGAME) {
        if (event.keyCode == 37) { //left arrow
            gPlayer.left();
        } else if (event.keyCode == 39) { //right arrow
            gPlayer.right();
        } else if (event.keyCode == 38) { //up array
            gPlayer.up();
        } else if (event.keyCode == 40) { //down array
            gPlayer.down();
        }
    }
}

var gCanvas = document.getElementById('gamecanvas');
//gCanvas.addEventListener('click', onMouseClick);
//gCanvas.style.cursor = "none";

window.addEventListener('keydown', onKeyDown, false);
var gContext = gCanvas.getContext('2d');

/*var gMousePos = null;
function getMousePos(evt) {
    var rect = gCanvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}
gCanvas.addEventListener('mousemove', function(evt) {
    gMousePos = getMousePos(evt);
}, false);*/

//gStartTime = 0;
//gCurrentTime = 0;

State = {
    LOADING: 0,
    PREGAME: 1,
    INGAME: 2,
    ENDGAME: 3
}
gState = State.PREGAME;

gSettings = {
    width: gCanvas.width,
    height: gCanvas.height,
    
    tile_size: 20,
    tiles_width: 26,
    tiles_height: 21,
    
    const_empty: 0,
    const_dirt: 1,
    
    /*missilevelocity: 25,
    missileradius: 2,
    
    blastspeed: 15,
    blastradius: 50,
    
    planetradius: 16,
    minRangeColor: 'MidnightBlue',
    
    splashBackgroundColor: "#0A0A0A",

    splashTextColor: "#88CEFA",
    bigFont: '24pt Arial',
    smallFont: '18pt Arial'*/
}/*
gTheWorld = new TheWorld();
gMissiles = [];*/
gPlayer = null;
gTiles = null;
/*gEnemyCount = 0;*/
var ONE_FRAME_TIME = 1000 / 60;

function loadTiles() {
    gTiles = Array(gSettings.tiles_width);
    for (var i = 0; i < gTiles.length; i++) {
        gTiles[i] = Array(gSettings.tiles_height);
    }
    
    for (var i = 0; i < gTiles.length; i++) {
        for (var j = 0; j < gTiles[i].length; j++) {
            gTiles[i][j] = gSettings.const_dirt;
        }
    }
}
function newGame() {
    //gMissiles = [];
    //gEnemyCount = 0;
    //gStartTime = Date.now();
    gState = State.INGAME;
    loadTiles();
    gPlayer = new Player();
    
    //gSound.play('music');
    //gSound.volume('music', 0.5);
}
function endGame() {
    gState = State.ENDGAME;
    //gSound.stop('music');
}

function one_second_update() {
    if (gState == State.INGAME) {
        //spawn_enemy_missile();
    }
}/*
function spawn_enemy_missile() {
    gCurrentTime = Date.now();
    
    // Raise max number of missiles by 1 every 10 seconds
    gameTime = gCurrentTime - gStartTime;
    enemies = Math.floor(gameTime / 10000) + 1;
    
    if (gEnemyCount < enemies) {
        m = new EnemyMissile();
        gMissiles.push(m);
        gEnemyCount++;
    }
}
*/
function updateGame(dt) {
    //for (var i = 0; i < gMissiles.length; i++) {
    //    gMissiles[i].update(dt);
    //}
    gPlayer.update(dt);
}
function checkCollisions() {
    /*for (var i = 0; i < gMissiles.length; i++) {
        
        distance = calc_distance(gMissiles[i].pos, gTheWorld.pos);
        if (distance < (gMissiles[i].currentradius + gTheWorld.currentradius)) {
            gMissiles[i].explode();
            endGame();
        }
        
        for (var j = 0; j < gMissiles.length; j++) {
            if (i == j) {
                continue;
            }
            distance = calc_distance(gMissiles[i].pos, gMissiles[j].pos);
            if (distance < (gMissiles[i].currentradius + gMissiles[j].currentradius)) {
                
                gMissiles[i].explode();
                gMissiles[j].explode();
            }
        }
    }*/
}
/*
function drawSplashLoading(context) {
    total = gSound.sounds.length + gImage.images.length;
    loaded = gSound.numSoundsLoaded + gImage.numImagesLoaded;
    if (loaded == total) {
        gState = State.PREGAME;
        return;
    }
    
    splashWidth = gSettings.width * (2/3);
    splashHeight = gSettings.height * (2/3);
    splashX = (gSettings.width - splashWidth) / 2;
    splashY = (gSettings.height - splashHeight) / 2;

    drawRect(context, splashX, splashY, splashWidth, splashHeight, gSettings.splashBackgroundColor);

    text = "Blue Ball Defender";
    x = splashX + 10;
    y = splashY + 50;
    drawText(context, text, gSettings.bigFont, gSettings.splashTextColor, x, y);
    
    text = "Loading...    "+loaded+"/"+total;
    x = splashX + 10;
    y = splashY + 150;
    drawText(context, text, gSettings.smallFont, gSettings.splashTextColor, x, y);
}
function drawSplashPregame(context) {
    splashWidth = gSettings.width * (2/3);
    splashHeight = gSettings.height * (2/3);
    splashX = (gSettings.width - splashWidth) / 2;
    splashY = (gSettings.height - splashHeight) / 2;

    drawRect(context, splashX, splashY, splashWidth, splashHeight, gSettings.splashBackgroundColor);

    text = "Blue Ball Defender";
    x = splashX + 10;
    y = splashY + 50;
    drawText(context, text, gSettings.bigFont, gSettings.splashTextColor, x, y);
    
    text = "Our fragile blue planet is under attack";
    x = splashX + 10;
    y = splashY + 150;
    drawText(context, text, gSettings.smallFont, gSettings.splashTextColor, x, y);
    
    text = "Use the mouse to target missiles";
    x = splashX + 10;
    y = splashY + 200;
    drawText(context, text, gSettings.smallFont, gSettings.splashTextColor, x, y);
    
    text = "Press the space bar to begin";
    x = splashX + 10;
    y = splashY + 250;
    drawText(context, text, gSettings.smallFont, gSettings.splashTextColor, x, y);
}
function drawSplashEndgame(context) {
    splashWidth = gSettings.width * (2/3);
    splashHeight = gSettings.height * (2/3);
    splashX = (gSettings.width - splashWidth) / 2;
    splashY = (gSettings.height - splashHeight) / 2;
    
    drawRect(context, splashX, splashY, splashWidth, splashHeight, gSettings.splashBackgroundColor);
    
    text = "You lasted " + calc_time() + " seconds";
    x = splashX + 10;
    y = splashY + 50;
    drawText(context, text, gSettings.bigFont, gSettings.splashTextColor, x, y);
    
    text = "Press the space bar to try again";
    x = splashX + 10;
    y = splashY + 100;
    drawText(context, text, gSettings.smallFont, gSettings.splashTextColor, x, y);
}*/
function drawGame() {
    gContext.fillStyle = "black";
    gContext.fillRect(0 , 0, gCanvas.width, gCanvas.height);
    //context.clearRect(0, 0, canvas.width, canvas.height);
    
    //draw tiles
    for (var i = 0; i < gTiles.length; i++) {
        for (var j = 0; j < gTiles[i].length; j++) {
            x = i * gSettings.tile_size;
            y = j * gSettings.tile_size;
            
            if (gTiles[i][j] == gSettings.const_empty) {
                // nothing to do
            } else if (gTiles[i][j] == gSettings.const_dirt) {
                drawRect(gContext, x, y, gSettings.tile_size, gSettings.tile_size, 'brown');
            }
        }
    }
    
    if (gState == State.INGAME) {
        //draw player
        gPlayer.draw();
        /*
        // Draw the minimum target range
        minrange = getMinRange();
        drawCircle(gContext, getCentre(), minrange, gSettings.minRangeColor, true);

        gTheWorld.draw(gContext);
        for (var i = 0; i < gMissiles.length; i++) {
            gMissiles[i].draw(gContext);
        }
        
        // draw the crosshairs
        if (gMousePos) {
            crosshairimage = gImage.getImage('crosshair');
            halfwidth = crosshairimage.width/2;
            if (crosshairimage) {
                gContext.drawImage(crosshairimage, gMousePos.x - halfwidth, gMousePos.y - halfwidth);
            }
        }*/
    } else if (gState == State.LOADING) {
        drawSplashLoading(gContext);
    } else if (gState == State.PREGAME) {
        drawSplashPregame(gContext);
    } else if (gState == State.ENDGAME) {
        drawSplashEndgame(gContext);
    }
}

gOldTime = Date.now();
var mainloop = function() {
    newtime = Date.now();
    dt = (newtime - gOldTime)/1000;
    gOldTime = newtime;
    
    updateGame(dt);
    checkCollisions();
    drawGame();
};

newGame();

setInterval( mainloop, ONE_FRAME_TIME );
setInterval( one_second_update, 1000 );

// To stop the game, use the following:
//clearInterval(Game._intervalId);

