
function drawRect(context, x, y, width, height, color) {
    context.fillStyle = color;
    context.fillRect(x, y, width, height);
}
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

Monster = Class.extend({
    init: function(pos) {
        this.pos = pos;
        this.direction = null;
    },
    update: function() {
        var newpos = null;
        if (this.direction == 'right'
            && this.pos[0]+1 < gSettings.tiles_width
            && gTiles[this.pos[0]+1][this.pos[1]] == gSettings.const_empty) {

            newpos = [this.pos[0]+1,this.pos[1]];
        } else if (this.direction == 'up'
            && this.pos[1]-1 >= 0
            && gTiles[this.pos[0]][this.pos[1]-1] == gSettings.const_empty) {

            newpos = [this.pos[0],this.pos[1]-1];
        } else if (this.direction == 'left'
            && (this.pos[0]-1) >= 0
            && gTiles[this.pos[0]-1][this.pos[1]] == gSettings.const_empty) {

            newpos = [this.pos[0]-1,this.pos[1]];
        } else if (this.direction == 'down'
            && this.pos[1]+1 < gSettings.tiles_height
            && gTiles[this.pos[0]][this.pos[1]+1] == gSettings.const_empty) {

            newpos = [this.pos[0],this.pos[1]+1];
        }
        if (!newpos) {
            var directions = ['left', 'right', 'up', 'down'];
            this.direction = chooseFromArray(directions);
            newpos = [this.pos[0], this.pos[1]];
        }
        return newpos;
    }
});

MySprite = Class.extend({
    init: function(pos) {
        this.pos = pos;
    }
});

Player = MySprite.extend({
    init: function() {        
        this._super([0,0]);
        this.diamonds = 0;
        this.dead = false;
    },
    draw: function() {
        if (this.dead) {
            return;
        }
        drawX = this.pos[0] * gSettings.tile_size;
        drawY = this.pos[1] * gSettings.tile_size;
        
        image = gImage.getImage('player');
        gContext.drawImage(image, drawX, drawY);
    },
    update: function() {
        if (this.dead) {
            return;
        }
        
        if (gKeyState[65]) { //a - left
            this.left();
        } else if (gKeyState[68]) { //d - right
            this.right();
        } else if (gKeyState[87]) { //w - up
            this.up();
        } else if (gKeyState[83]) { //s - down
            this.down();
        }
        
        if (this.gotAllDiamonds()) {
            return false;
        }
        gTiles[this.pos[0]][this.pos[1]] = gSettings.const_empty;
        return true;
    },
    left: function() {
        targetX = this.pos[0] - 1;
        targetY = this.pos[1];
        
        player_move(targetX, targetY, this.pos[0], this.pos[1]);
    },
    right: function() {
        targetX = this.pos[0] + 1;
        targetY = this.pos[1];
        
        player_move(targetX, targetY, this.pos[0], this.pos[1]);
    },
    up: function() {
        targetX = this.pos[0];
        targetY = this.pos[1] - 1;
        
        player_move(targetX, targetY, this.pos[0], this.pos[1]);
    },
    down: function() {
        targetX = this.pos[0];
        targetY = this.pos[1] + 1;
        
        player_move(targetX, targetY, this.pos[0], this.pos[1]);
    },
    gotAllDiamonds: function() {
        // returns true if no diamonds left
    
        if (gTiles[this.pos[0]][this.pos[1]] == gSettings.const_diamond) {
            this.diamonds++;
            
            //remove the diamond
            gTiles[this.pos[0]][this.pos[1]] = gSettings.const_empty;
            
            if (this.diamonds == gDiamondCount) {
                loadNextLevel();
                return true;
            }
        }
        return false;
    },
    die: function() {
        //this.dead = true;
        //todo play squish sound
    }
});

function player_move(x, y, playerX, playerY) {
    if (x < 0 || y < 0) {
        return false;
    }
    if (y > gSettings.tiles_height - 1 || x > gSettings.tiles_width - 1) {
        return false;
    }

    var tile = gTiles[x][y];
    var move = false;
    
    if (tile == gSettings.const_solid) {
        //no go
    } else if (tile == gSettings.const_boulder) {
        //boulder push logic
        //can only push sideways
        if (y == playerY) {
            var nextX = null;
            if (playerX < x) {
                nextX = x+1; //pushing right
            } else {
                nextX = x-1; //pushing left
            }
            if (nextX >= 0
                && nextX < gSettings.tiles_width
                && gTiles[nextX][y] == gSettings.const_empty) {
            
                gTiles[nextX][y] = gSettings.const_boulder;
                move = true;
            }
        }
    } else if (tile == gSettings.const_empty
            || tile == gSettings.const_diamond
            || tile == gSettings.const_dirt) {
            
        move = true;
    }
    
    if (move) {
        gPlayer.pos[0] = x;
        gPlayer.pos[1] = y;
    }
}

function onSoundLoad() {
    gSound.numSoundsLoaded++;
}
SoundManager = Class.extend({
    numSoundsLoaded: 0,
    sounds: Array(3),
    enabled: true,
    init: function() {
        try {
            //this._context = new webkitAudioContext();
            
            //this.sounds['ingamemusic'] = new Audio("Fairing Well.mp3");
            //this.sounds['cutscenemusic'] = new Audio("Fairing Well.mp3");
            this.sounds['music'] = new Audio("Fairing Well.ogg");
            this.sounds['thump'] = new Audio("thump.ogg");
            this.sounds['rock'] = new Audio("rock.ogg");
            
            for (var key in this.sounds) {
                //this.sounds[key].preload = "auto";
                this.sounds[key].addEventListener('loadeddata', onSoundLoad);
            }
        } catch(e) {
            alert("Web Audio not supported");
        }
    },
    play: function(name, loop) {
        if (this.enabled && name in this.sounds) {
            if (loop) {
                this.sounds[name].addEventListener('ended', function() {
                    this.currentTime = 0;
                    this.play();
                }, false);
            }
            if (this.sounds[name].duration > 0 && !this.sounds[name].paused) {
                //already playing
            } else {
                this.sounds[name].currentTime = 0;
                this.sounds[name].play();
            }
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
    },
    isplaying: function(name) {
        if (this.enabled && name in this.sounds) {
            return !this.sounds[name].paused;
        }
    }
});
var gSound = new SoundManager();

function onImageLoad() {
    gImage.numImagesLoaded++;
}
ImageManager = Class.extend({
    numImagesLoaded: 0,
    images: null,
    imagedict: {
        'diamond': 'diamond5.png',
        'dirt': 'Dirt.png',
        'player': 'player.png',
        'playerbig': 'playerbig.png',
        'princessbig': 'princessbig.png',
        'chadbig': 'chadbig.png',
        'boulder': 'rock.png',
        'rock': 'birck.png',
        'monster': 'monster.png',
        'map1': 'maps/1.png',
        'map2': 'maps/2.png',
        'map3': 'maps/3.png',
        'map4': 'maps/4.png',
        'map5': 'maps/5.png',
        'map7': 'maps/7.png',
        'map8': 'maps/8.png',
        'map9': 'maps/9.png',
        'map10': 'maps/10.png',
        'map11': 'maps/11.png',
    },
    init: function() {
        this.images = Array(19);
        for (var name in this.imagedict) {
            this.images[name] = new Image();
            this.images[name].onload = onImageLoad;
            this.images[name].src = this.imagedict[name];
        }
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

function onKeyDown(event) {
    if (gState == State.PREGAME || gState == State.ENDGAME) {
        if (event.keyCode == 88) { // 'x' to start game
            newGame();
        }
    } else if (gState == State.INGAME) {
        gKeyState[event.keyCode] = true;
    }
}
function onKeyUp(event) {
    gKeyState[event.keyCode] = false;
}

var gCanvas = document.getElementById('gamecanvas');
//gCanvas.addEventListener('click', onMouseClick);
//gCanvas.style.cursor = "none";

window.addEventListener('keydown', onKeyDown, false);
window.addEventListener('keyup', onKeyUp, false);

var gContext = gCanvas.getContext('2d');

State = {
    LOADING: 0,
    PREGAME: 1,
    INGAME: 2,
    ENDGAME: 3
}
gState = State.LOADING;

gSettings = {
    width: gCanvas.width,
    height: gCanvas.height,
    
    tile_size: 20,
    tiles_width: 26,
    tiles_height: 21,
    
    const_empty: 0,
    const_dirt: 1,
    const_diamond: 2,
    const_boulder: 3,
    const_solid: 4,
    const_monster: 5,
    
    splashTextColor: "#88CEFA",
    splashline1x:200,
    splashline1y:150,
    splashline2x:190,
    splashline2y:200,
    bigFont: '24pt Arial',
    smallFont: '18pt Arial',
    
    hisColor: 'blue',
    herColor: 'purple',
    chadColor: 'gray',
    hisX: 100,
    herX: 160,
    
    cutSceneDelay: 4,
    cutSceneDrawPrincess: true,
    cutSceneDrawChad: false
}

var gPlayer = null;
var gMonsters = null;
var gTiles = null;
var gDiamondCount = null;

var gKeyState = Array();
var gLevelNumber = -1;
var ONE_FRAME_TIME = 1000 / 60;

var gLoading = false;

function reloadLevel() {
    gLoading = true;
    gPlayer = new Player();
    loadTiles();
    gLoading = false;
}
function loadNextLevel() {
    gLoading = true;
    gPlayer = new Player();
    gLevelNumber++;
    gSecondCount = 0;
    if (gLevelNumber!=0 && gLevelNumber!=6 && gLevelNumber!=12 && !loadTiles()) {
        //no more levels
        gLoading = false;
        endGame();
    }
    //if (gLevelNumber==0 || gLevelNumber==6 || gLevelNumber==12) {
        //if (gSound.isplaying('ingamemusic')) {
        //    gSound.stop('ingamemusic');
        //}
        //gSound.play('cutscenemusic');
    //} else if (gSound.isplaying('cutscenemusic')) {
        //gSound.stop('cutscenemusic');
        //gSound.play('ingamemusic');
    //}
    gLoading = false;
}
function loadTiles() {

    gTiles = Array(gSettings.tiles_width);
    for (i = 0; i < gTiles.length; i++) {
        gTiles[i] = Array(gSettings.tiles_height);
        for (var j = 0; j < gTiles[i].length; j++) {
            gTiles[i][j] = gSettings.const_solid;
        }
    }
    
    gDiamondCount = 0;
    gMonsters = Array();

    map = gImage.getImage('map'+gLevelNumber);
    if (map) {
        var mapcanvas = document.createElement('canvas');
        mapcanvas.width = gSettings.tiles_width;
        mapcanvas.height = gSettings.tiles_height;
        
        var mapcontext = mapcanvas.getContext('2d');
        mapcontext.drawImage(map, 0, 0);

        for (var x = 0;x < gSettings.tiles_width; x++) {
            for (var y = 0; y < gSettings.tiles_height; y++) {
                var pixelData = mapcontext.getImageData(x, y, 1, 1).data;
                
                if (pixelData[0] == 255 && pixelData[1] == 255 && pixelData[2] == 255) {
                    //white - empty
                    gTiles[x][y] = gSettings.const_empty;
                } else if (pixelData[0] == 0 && pixelData[1] == 0 && pixelData[2] == 0) {
                    //black - dirt
                    gTiles[x][y] = gSettings.const_dirt;
                } else if (pixelData[0] == 127 && pixelData[1] == 127 && pixelData[2] == 127) {
                    //grey - boulder
                    gTiles[x][y] = gSettings.const_boulder;
                } else if (pixelData[0] == 255 && pixelData[1] == 0 && pixelData[2] == 0) {
                    //red - solid
                    gTiles[x][y] = gSettings.const_solid;
                } else if (pixelData[0] == 0 && pixelData[1] == 255 && pixelData[2] == 0) {
                    //green - monster
                    gTiles[x][y] = gSettings.const_monster;
                    m = new Monster([x, y]);
                    gMonsters.push(m);
                } else if (pixelData[0] == 0 && pixelData[1] == 0 && pixelData[2] == 255) {
                    //blue - diamond
                    gTiles[x][y] = gSettings.const_diamond;
                    gDiamondCount++;
                }
            }
        }
        return true;
    }
    return false;
}
function newGame() {
    gLevelNumber = -1;
    loadNextLevel();
    
    gSound.play('music', true);
    gSound.volume('music', 0.5);
    
    gState = State.INGAME;
}
function endGame() {
    gState = State.ENDGAME;
    //gSound.stop('music');
}

function one_second_update() {
    if (gState == State.INGAME) {
        gSecondCount++;
    }
}

function findRockFallSpot(x, y) {
    if (y+1 == gSettings.tiles_height) {
        //sitting on the bottom
        return [x, y];
    }
    if (gTiles[x][y+1] == gSettings.const_empty) {
        //cell below is empty
        return [x, y+1];
    }
    
    //fall to the right
    if (x+1 < gSettings.tiles_width
        && gTiles[x+1][y] == gSettings.const_empty
        && gTiles[x+1][y+1] == gSettings.const_empty
        && !(x+1 == gPlayer.pos[0] && y == gPlayer.pos[1])//dont fall sideways into the player
        && gTiles[x][y+1] != gSettings.const_dirt) { //dont fall if sitting on dirt
        
        return [x+1, y];
    }
    
    //fall to the left
    if (x-1 > 0
        && gTiles[x-1][y] == gSettings.const_empty
        && gTiles[x-1][y+1] == gSettings.const_empty
        && !(x-1 == gPlayer.pos[0] && y == gPlayer.pos[1])//dont fall sideways into the player
        && gTiles[x][y+1] != gSettings.const_dirt) { //dont fall if sitting on dirt
        
        return [x-1, y];
    }
    return [x, y];
}

function updateGame() {
    if (gState != State.INGAME || gLoading) {
        return;
    }
    if (gLevelNumber == 0 || gLevelNumber == 6 || gLevelNumber == 12) {
        return;
    }

    if (gLoopCount % 3 == 0) {
        if (!gPlayer.update()) {
            return;
        }
    }
    
    if (gLoopCount % 6 == 0) {
        var newspot = null;
        var x = null;
        var y = null;
        
        //Do the monsters first
        var toempty = [];
        var tomonster = [];
        for (y = gSettings.tiles_height - 1; y >= 0; y--) {
            for (x = gSettings.tiles_width - 1; x >= 0; x--) {
                if (gTiles[x][y] == gSettings.const_monster) {

                    for (i in gMonsters) {
                        if (gMonsters[i].pos[0] == x && gMonsters[i].pos[1] == y) {
                            newspot = gMonsters[i].update();
                            toempty.push([x,y]);
                            tomonster.push(newspot);
                            gMonsters[i].pos = newspot;
                        }
                    }
                }
            }
        }
        for (var i in toempty) {
            x = toempty[i][0];
            y = toempty[i][1];
            gTiles[x][y] = gSettings.const_empty;
        }
        for (var i in tomonster) {
            x = tomonster[i][0];
            y = tomonster[i][1];
            gTiles[x][y] = gSettings.const_monster;
            if (x == gPlayer.pos[0] && y == gPlayer.pos[1]) {
                //todo play sound
                gSound.play('thump');
                reloadLevel();
                return;
            }
        }
        
        for (y = gSettings.tiles_height - 1; y >= 0; y--) {
            for (x = gSettings.tiles_width - 1; x >= 0; x--) {
                switch(gTiles[x][y]) {
                    case gSettings.const_diamond:
                        newspot = findRockFallSpot(x, y);
                        gTiles[x][y] = gSettings.const_empty;
                        gTiles[newspot[0]][newspot[1]] = gSettings.const_diamond;
                        if (x!=newspot[0] || y!=newspot[1]) {
                            if (gTiles[newspot[0]][newspot[1]+1] != gSettings.const_empty) {
                                gSound.play('rock');
                            }
                        }
                        break;
                    case gSettings.const_boulder:
                        newspot = findRockFallSpot(x, y);
                        if (x != newspot[0] || y != newspot[1]) {
                            //the boulder has moved
                            if (gTiles[newspot[0]][newspot[1]+1] != gSettings.const_empty) {
                                gSound.play('rock');
                            }
                            if (newspot[0] == gPlayer.pos[0]
                            //&& newspot[1]+1 == gPlayer.pos[1]) {
                            && newspot[1] == gPlayer.pos[1]) {
                                reloadLevel();
                                return;
                                //gPlayer.die();
                            }
                        }
                        gTiles[x][y] = gSettings.const_empty;
                        gTiles[newspot[0]][newspot[1]] = gSettings.const_boulder;
                        break;
                    case gSettings.const_solid:
                    case gSettings.const_dirt:
                    case gSettings.const_empty:
                    case gSettings.const_monster:
                        break;
                    default:
                        console.log('unknown tile type found->'+gTiles[x][y]+" x=="+x+" y=="+y);
                }
            }
        }
    }
}

function drawSplashLoading(context) {
    total = gSound.sounds.length + gImage.images.length;
    loaded = gSound.numSoundsLoaded + gImage.numImagesLoaded;
    if (loaded == total) {
        gState = State.PREGAME;
        return;
    }
    
    text = "Mine Runner";
    x = gSettings.splashline1x;
    y = gSettings.splashline1y;
    drawText(context, text, gSettings.bigFont, gSettings.splashTextColor, x, y);
        
    text = "Loading...    "+loaded+"/"+total;
    x = gSettings.splashline2x;
    y = gSettings.splashline2y;
    drawText(context, text, gSettings.smallFont, gSettings.splashTextColor, x, y);
}
function drawSplashPregame(context) {

    text = "Mine Runner";
    x = gSettings.splashline1x;
    y = gSettings.splashline1y;
    drawText(context, text, gSettings.bigFont, gSettings.splashTextColor, x, y);
    
    text = "Use w a s d to move";
    x = gSettings.splashline2x;
    y = gSettings.splashline2y;
    drawText(context, text, gSettings.smallFont, gSettings.splashTextColor, x, y);
    
    text = "Press 'x' to begin";
    x = gSettings.splashline2x;
    y = gSettings.splashline2y + 50;
    drawText(context, text, gSettings.smallFont, gSettings.splashTextColor, x, y);
    
    image = gImage.getImage('playerbig');
    gContext.drawImage(image, (gSettings.width/2)-20, 300);
}
function drawSplashEndgame(context) {
    
    text = "That\'s all folks";
    x = 350;
    y = 75;
    drawText(context, text, gSettings.bigFont, gSettings.splashTextColor, x, y);
    
    text = "Fear not valiant player. Time heals all wounds.";
    x = 40;
    y = 200;
    drawText(context, text, gSettings.smallFont, gSettings.splashTextColor, x, y);
    
    text = "Press x to play again";
    x = 275;
    y = 300;
    drawText(context, text, gSettings.bigFont, gSettings.splashTextColor, x, y);
}
function drawCutsceneCharacters() {
    imageHim = gImage.getImage('playerbig');
    imageHer = gImage.getImage('princessbig');
    imageChad = gImage.getImage('chadbig');
    gContext.drawImage(imageHim, 40, 200);
    
    if (gSettings.cutSceneDrawPrincess) {
        gContext.drawImage(imageHer, gCanvas.width - 80, 200);
    }
    if (gSettings.cutSceneDrawChad) {
        gContext.drawImage(imageChad, (gCanvas.width/2)-20, 300);
    }
}
function drawCutsceneText(text, textcolor, x) {
    var y = 200;
    for (var i in text) {
        drawText(gContext, text[i], gSettings.smallFont, textcolor, x, y);
        y += 25;
    }
}
function drawFirstCutScene() {
    drawCutsceneCharacters();
    
    var text = [], x = null, textcolor = null;

    if (gSecondCount < 1*gSettings.cutSceneDelay) {
        text.push('Most beautiful princess, marry me.');
        x = gSettings.hisX;
        textcolor = gSettings.hisColor;
    } else if (gSecondCount < 2*gSettings.cutSceneDelay) {
        text.push('You\'re my oldest friend.');
        text.push('You know that I cannot.');
        x = gSettings.herX;
        textcolor = gSettings.herColor;
    } else if (gSecondCount < 3*gSettings.cutSceneDelay) {
        text.push('Suitors must pay the king\'s bounty');
        text.push('for the hand of the princess.');
        x = gSettings.herX;
        textcolor = gSettings.herColor;
    } else if (gSecondCount < 4*gSettings.cutSceneDelay) {
        text.push('We\'ll always be friends');
        text.push('but we cannot be together.');
        x = gSettings.herX;
        textcolor = gSettings.herColor;
    } else if (gSecondCount < 6*gSettings.cutSceneDelay) {
        text.push('There must be a way.');
        text.push('I shall enter the mines.');
        text.push('I will pay the bounty in diamonds.');
        x = gSettings.hisX;
        textcolor = gSettings.hisColor;
    } else {
        loadNextLevel();
        return;
    }

    drawCutsceneText(text, textcolor, x);
}
function drawSecondCutScene() {
    drawCutsceneCharacters();
    
    var text = [], x = null, textcolor = null;

    if (gSecondCount < 1*gSettings.cutSceneDelay) {
        text.push('My lady, I have half the bounty!');
        x = gSettings.hisX;
        textcolor = gSettings.hisColor;
    } else if (gSecondCount < 2*gSettings.cutSceneDelay) {
        text.push('Please give up.');
        text.push('I want my best friend alive.');
        x = gSettings.herX;
        textcolor = gSettings.herColor;
    } else if (gSecondCount < 3*gSettings.cutSceneDelay) {
        text.push('Fear not princess.');
        text.push('Your love is worth any risk.');
        x = gSettings.hisX;
        textcolor = gSettings.hisColor;
    } else if (gSecondCount < 4*gSettings.cutSceneDelay) {
        text.push('Oh dear...');
        x = gSettings.herX;
        textcolor = gSettings.herColor;
    } else {
        loadNextLevel();
        return;
    }

    drawCutsceneText(text, textcolor, x);
}
function drawFinalCutScene() {
    drawCutsceneCharacters();
    
    var text = [], x = null, textcolor = null;

    if (gSecondCount < 1*gSettings.cutSceneDelay) {
        //gSound.volume('cutscenemusic', 0.8);
        text.push('At last, it is done.');
        text.push('We can be together!');
        x = gSettings.hisX;
        textcolor = gSettings.hisColor;
    } else if (gSecondCount < 2*gSettings.cutSceneDelay) {
        //gSound.volume('cutscenemusic', 0.6);
        text.push('You fool.');
        text.push('Why didn\'t you listen?');
        x = gSettings.herX;
        textcolor = gSettings.herColor;
    } else if (gSecondCount < 3*gSettings.cutSceneDelay) {
        //gSound.volume('cutscenemusic', 0.4);
        text.push('My princess?');
        text.push('What\'s wrong?');
        x = gSettings.hisX;
        textcolor = gSettings.hisColor;
    } else if (gSecondCount < 5*gSettings.cutSceneDelay) {
        //gSound.volume('music', 0.2);
        text.push('I see you as a friend.');
        text.push('You\'re like a brother to me.');
        text.push('Besides, I\'m seeing someone.');
        x = gSettings.herX;
        textcolor = gSettings.herColor;
        //if (gSound.isplaying('cutscenemusic')) {
        //    gSound.stop('cutscenemusic');
        //}
    } else if (gSecondCount < 6*gSettings.cutSceneDelay) {
        //gSound.stop('music');
        text.push('This is Chad.');
        text.push('He\'s in a band.');
        x = gSettings.herX;
        textcolor = gSettings.herColor;
        gSettings.cutSceneDrawChad = true;
    } else if (gSecondCount < 7*gSettings.cutSceneDelay) {
        text.push('Sup bro.');
        x = gSettings.herX;
        textcolor = gSettings.chadColor;
        //gSettings.cutSceneDrawPrincess = false;
    } else if (gSecondCount < 8*gSettings.cutSceneDelay) {
        gSound.stop('music');
        text.push('Fuck...');
        x = gSettings.hisX;
        textcolor = gSettings.hisColor;
    } else {
        loadNextLevel();
        return;
    }

    drawCutsceneText(text, textcolor, x);
}
function drawRightMargin() {
    //draw right hand margin of game area
    gContext.beginPath();
    gContext.moveTo(gSettings.width - (gSettings.tile_size*4), 0);
    gContext.lineTo(gSettings.width - (gSettings.tile_size*4), gSettings.height);
    gContext.lineWidth = 1;

    gContext.strokeStyle = '#5f3e22';//brown
    gContext.stroke();
}
function drawGame() {
    gContext.fillStyle = "black";
    gContext.fillRect(0 , 0, gCanvas.width, gCanvas.height);
    //context.clearRect(0, 0, canvas.width, canvas.height);
    
    if (gState == State.INGAME) {
        if (gLevelNumber == 0 ) {
            drawFirstCutScene();
            return;
        } else if (gLevelNumber == 6 ) {
            drawSecondCutScene();
            return;
        } else if (gLevelNumber == 12 ) {
            drawFinalCutScene();
            return;
        }
        //draw tiles
        diamondImage = gImage.getImage('diamond');
        dirtImage = gImage.getImage('dirt');
        boulderImage = gImage.getImage('boulder');
        solidImage = gImage.getImage('rock');
        monsterImage = gImage.getImage('monster');
        for (var i = 0; i < gTiles.length; i++) {
            for (var j = 0; j < gTiles[i].length; j++) {
                x = i * gSettings.tile_size;
                y = j * gSettings.tile_size;
                
                if (gTiles[i][j] == gSettings.const_empty) {
                    // nothing to do
                } else if (gTiles[i][j] == gSettings.const_dirt) {
                    gContext.drawImage(dirtImage, x, y);
                } else if (gTiles[i][j] == gSettings.const_diamond) {
                    gContext.drawImage(diamondImage, x, y);
                } else if (gTiles[i][j] == gSettings.const_boulder) {
                    gContext.drawImage(boulderImage, x, y);
                } else if (gTiles[i][j] == gSettings.const_solid) {
                    gContext.drawImage(solidImage, x, y);
                } else if (gTiles[i][j] == gSettings.const_monster) {
                    gContext.drawImage(monsterImage, x, y);
                }
            }
        }
        drawRightMargin();

        gPlayer.draw();
        
        //draw scores etc
        x = gSettings.width - 70;
        y = 20;
        
        image = gImage.getImage('diamond');
        if (image) {
            gContext.drawImage(image, x+20, y);
        }
        
        y += 40;
        text = gPlayer.diamonds + '/' + gDiamondCount;
        drawText(gContext, text, gSettings.smallFont, gSettings.splashTextColor, x, y);
    } else if (gState == State.LOADING) {
        drawSplashLoading(gContext);
    } else if (gState == State.PREGAME) {
        drawSplashPregame(gContext);
    } else if (gState == State.ENDGAME) {
        drawSplashEndgame(gContext);
    }
}

//var gOldTime = Date.now();
var gLoopCount = 0;
var gSecondCount = 0;

//executed 60/second
var mainloop = function() {
    //newtime = Date.now();
    //dt = (newtime - gOldTime)/1000;
    //gOldTime = newtime;
    
    gLoopCount++;
    gLoopCount = gLoopCount % 1000;
    
    updateGame();
    drawGame();
};

setInterval( mainloop, ONE_FRAME_TIME );
setInterval( one_second_update, 1000 );

// To stop the game, use the following:
//clearInterval(Game._intervalId);

