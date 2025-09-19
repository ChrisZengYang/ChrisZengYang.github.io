//Started on June 2025

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
let time = 0;

//Level Editor Palette Selector
const palette = document.getElementById("palette");
const paletteCtx = palette.getContext("2d");

//Add event listeners and keys
let mouse = {
    x: 0,
    y: 0,
    wasDown: false,
    down: false
};

let keys = {};

document.addEventListener("keydown", (e) => {
    keys[e.key] = true;
});
document.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

//The mouse for the game
canvas.addEventListener("mousemove", e => {
    const rect = canvas.getBoundingClientRect();

    // Map mouse position to canvas coordinate system
    mouse.x = (e.clientX - rect.left) * (canvas.width / rect.width);
    mouse.y = (e.clientY - rect.top) * (canvas.height / rect.height);

    // now mouseX, mouseY match your game coords
});

canvas.addEventListener("mousedown", (e) => {
    mouse.down = true;
});
canvas.addEventListener("mouseup", (e) => {
    mouse.down = false;
});


//Physics and global functions definitions
let editor = false;

const tileSize = 32;
let width = 100;
let height = 20;

let cam = {
    x: 0,
    y: 0,
}

let physics = {
    gravity: 0.3,
    friction: 0.8
}

function random(min, max) {
    return min + Math.floor(Math.random() * (max-min));
};

function rectCollide(obj1, obj2) {
    return obj1.x+obj1.w>obj2.x&&obj1.x<obj2.x+obj2.w&&obj1.y+obj1.h>obj2.y&&obj1.y<obj2.y+obj2.h;
};

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

//Loading tile spritesheet; the spritesheet is 5x scale for better resolution
const img = new Image();
img.src = "resources/metatilesheet.png";

const santa = new Image();
santa.src = "resources/santaspritesheet.png";

const parallax = [];
const layers = [
  {src: 'resources/parallax-1/layer-1.png', speed: 0.05},
  {src: 'resources/parallax-1/layer-2.png', speed: 0.1},
  {src: 'resources/parallax-1/layer-3.png', speed: 0.15},
  {src: 'resources/parallax-1/layer-4.png', speed: 0.2}
];

let loadedCount = 0;

parallax.push(new Array());

for (let i = 0; i < layers.length; i++) {
  const img = new Image();
  img.src = layers[i].src;
  parallax[0].push({img: img, speed: layers[i].speed});
}

function drawSprite(image, tileX, tileY, sizeX, sizeY, x, y, w, h, context, scale) {
    const sX = sizeX*scale;
    const sY = sizeY*scale;
    if(img.complete){
        context.drawImage(image, Math.floor(scale+tileX*(sX+scale)), Math.floor(scale+tileY*(sY+scale)), sX, sY, x, y, w, h);
    }
};

//Tile system
let tileGrid = [];
let metaData = {};
let tileIndex = 0;
let spawnIndex = null;

function wall() {
    for(let i = 0; i < height; i++) {
        tileGrid.push(5);
    }
};
function floor() {
    for(let i = 0; i < height-1; i++) {
        tileGrid.push(0);
    }
    tileGrid.push(2);
}
function genLevel() {
    tileGrid = [];
    for(let i = 0; i < width; i++) {
        floor();
    }
    updateLevel();
};

const nonSolids = [0, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49];

//Make sure two slopes are connected; left = slope to the left, right = slope to the right
function slopeConnected(left, right) {
    let leftBegin = left.y + left.h - left.b;
    let leftEnd = leftBegin - left.m*tileSize;
    let rightBegin = right.y + right.h - right.b;
    let rightEnd = rightBegin - right.m * tileSize;
    return leftEnd === rightBegin;
};

//Classes
class Block {
    constructor(x, y, w, h, type) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

        this.type = type || "air";

        this.solid = true;
        if(nonSolids.includes(this.type)) {
            this.solid = false;
        }

        this.m = 0;
        this.b = 0;
        this.slopeSurface = true; //True for sloped surfaces, false for sloped ceilings

        this.index = (this.x/tileSize)*height+(this.y/tileSize); //Get the index of the block
        
        switch(this.type) {
            //Slopes going up left to right
            case 15:
            case 35:
                this.slopeSurface = false;
            case 7:
            case 24:
                this.m = 1;
                break;
            
            //Slopes going down left to right
            case 16:
            case 34:
                this.slopeSurface = false;
            case 10:
            case 26:
                this.m = -1;
                this.b = 32;
                break;
            
            //Slopes going gently up left to right
            case 17:
            case 36:
                this.slopeSurface = false;
            case 11:
            case 27:
                this.m = 0.5;
                break;
                
            case 18:
            case 37:
                this.slopeSurface = false;
            case 12:
            case 28:
                this.m = 0.5;
                this.b = 16;
                break;

            //Slopes going gently down left to right
            case 19:
            case 31:
                this.slopeSurface = false;
            case 13:
            case 29:
                this.m = -0.5;
                this.b = 32;
                break;
            case 20:
            case 32:
                this.slopeSurface = false;
            case 14:
            case 30:
                this.m = -0.5;
                this.b = 16;
                break;
            default:
                this.b = 32;
                this.m = 0;
        }
    }

    collideX(obj) {
        if(this.solid && rectCollide(this, obj)) {
            this.index = (this.x/tileSize)*height+(this.y/tileSize); //Get the tile above the block
            //let above = blocks[this.index-1];
            //let below = blocks[this.index+1];
            let left = blocks[this.index-height];
            let right = blocks[this.index+height];

            if(this.m === 0) {
                if(obj.x > this.x) {
                    if( !( (right?.slopeSurface && right?.m < 0) || ((!(right?.slopeSurface ?? true) && right?.m > 0) ))) { //Only allow the right side of the block to check collisions if the slope above or right of it is a left slope or air block
                        obj.x = this.x + this.w;
                        obj.xVel = 0;
                    }
                } else{
                    if(!( (left?.slopeSurface && left?.m > 0) || ((!(left?.slopeSurface ?? true) && left?.m < 0) ))) { //Only allow the left side of the block to check collisions if the slope above and left is not a left slope or IS an air block
                        obj.x = this.x - obj.w;
                        obj.xVel = 0;
                    }
                }
            } else if(this.m > 0) { //Slopes that go upward left to right
                if(this.slopeSurface) {
                    if(obj.y+obj.h > this.y+this.h+(-this.m*tileSize-this.b) && obj.x+obj.w > this.x+this.w && obj.xVel < 0) {
                        if(!right || right?.m >= 0) { //Only allow the right side of the slope to check collisions if there is no right slope to the right of it
                            obj.x = this.x + this.w;
                            obj.xVel = 0;
                        }
                    }
                } else{
                    if(obj.y < this.y+this.h-this.b && obj.x < this.x && obj.xVel > 0) {
                        obj.x = this.x - obj.w;
                        obj.xVel = 0;
                    }
                }
            } else{ //Slopes that go downward left to right
                if(this.slopeSurface) {
                    if(obj.y+obj.h > this.y+(tileSize-this.b) && obj.x < this.x && obj.xVel > 0) {
                        if(!left || left?.m <= 0) { //Only allow the left side of the slope to check collisions if there is no left slope to the left of it
                            obj.x = this.x - obj.w;
                            obj.xVel = 0;
                        }
                    }   
                } else{
                    if(obj.y < this.y+this.h+(-this.m*tileSize-this.b) && obj.x + obj.w > this.x + this.w && obj.xVel < 0) {
                        obj.x = this.x + this.w;
                        obj.xVel = 0;
                    }
                }
            }
            //obj.xVel = 0;
        }
    }

    collideY(obj) {
        if(this.solid) {
            this.index = (this.x/tileSize)*height+(this.y/tileSize); //Get the tile above the block
            if(this.m === 0) { //Flat surfaces
                if(rectCollide(this, obj)) {
                    if(obj.y+obj.h > this.y+this.h && obj.yVel < 0) { //The "obj.yVel" only allows the player to bump their head when moving upwards, preventing the engine thinking that the player hit the ceiling when in fact the player is falling
                        obj.y = this.y + this.h;
                        obj.yVel *= -1;
                    } else{
                        obj.y = this.y - obj.h;
                        obj.yVel = 0;
                        if (this.type === 25) {
                            obj.maxSpeed = 7;
                            obj.friction = 0.99;
                        } else {
                            obj.friction = 0.9;
                        }
                        obj.isGrounded = true;
                        obj.lastSurface = this;
                    }
                }
            } else{ //Slope 
                if(this.slopeSurface) {
                    if(obj.x+obj.w>this.x&&obj.x<this.x+this.w && obj.y<this.y+this.h && obj.y+obj.h > this.y-this.h) {
                        if(obj.y+obj.h > this.y+this.h && obj.yVel < 0) { // Object is under this; The "obj.yVel" only allows the player to bump their head when moving upwards, preventing the engine thinking that the player hit the ceiling when in fact the player is falling
                            obj.y = this.y + this.h;
                            obj.yVel *= -1;
                        } else{ //Object is on top of this
                            if(this.m > 0) { //Slopes that go up from left to right
                                if (obj.x + obj.w > this.x && obj.x + obj.w <= this.x + this.w) {
                                    let relX = (obj.x+obj.w)-this.x; //Bottom-right of player colliding with slope
                                    let y = ((this.y + this.h) + (-this.m * relX) - this.b); //y = mx+b for slopes

                                    if (obj.y + obj.h > y) { //Put player on slope if intersecting
                                        obj.isGrounded = true;
                                        obj.stickOnSlope = true;
                                    } else {
                                        //Prevent player from always snapping onto slopes, even if the terrain isn't connected
                                        if (obj.lastSurface !== this && ((obj.xVel <= 0 && !slopeConnected(this, obj.lastSurface)) || (obj.xVel >= 0 && !slopeConnected(obj.lastSurface, this))) ) {
                                            return;
                                        }
                                    }

                                    if(obj.stickOnSlope) { //The object is to be placed on the top of the slope
                                        if(obj.highestY === null || y < obj.highestY) {
                                            if (obj.isPlayer) {
                                                if (keys["ArrowDown"]) {
                                                    obj.slideDirection = -1;
                                                }
                                            }

                                            obj.highestY = y;
                                            obj.isGrounded = true;
                                            obj.y = y - obj.h;

                                            //Change the yVel in proportion to the steepness
                                            if (obj.slideDirection === 0) {
                                                obj.yVel = Math.abs(obj.xVel * this.m);
                                            } else {
                                                obj.yVel = -(obj.xVel * this.m);
                                            }

                                            obj.lastSurface = this;

                                            if ([24, 27, 28].includes(this.type)) { 
                                                obj.friction = 0.99;
                                            }

                                            if (obj.xVel > 0) {
                                                obj.maxSpeed = 5 / (1 + Math.abs(this.m));

                                                if ([24, 27, 28].includes(this.type)) {
                                                    obj.maxSpeed = 5;
                                                }
                                            } else {
                                                obj.maxSpeed = 5 * (1+Math.abs(this.m));
                                            }
                                        }
                                    }
                                } else{
                                    let top = this.y+this.h-(this.m*tileSize+this.b);
                                    if(obj.y + obj.h > top) {
                                        obj.highestY = top;
                                        obj.y = top - obj.h;
                                        //wasSliding variable stops the slope tile from snapping the player on the slope even when we're supposed to be flying of the ramp (sliding)
                                        if (obj.yVel >= 0 && obj.slideDirection === 0) {
                                            obj.isGrounded = true;
                                            obj.stickOnSlope = true;
                                            obj.yVel = 0;
                                        } else {
                                            obj.wasSliding = false;
                                            obj.isGrounded = false;
                                            obj.stickOnSlope = false;
                                        }
                                        obj.lastSurface = this;
                                    }
                                }
                            }
                            else if (this.m < 0) { //Slopes that go down from left to right      
                                if(obj.x >= this.x && obj.x < this.x + this.w) {
                                    let relX = (obj.x)-this.x; //Bottom-left of player colliding with slope
                                    let y = ((this.y)+(-this.m*relX+(tileSize-this.b))); //y = mx+b for slopes
                                    
                                    if(obj.y + obj.h > y) {
                                        obj.isGrounded = true;
                                        obj.stickOnSlope = true;
                                    } else {
                                        if (obj.lastSurface !== this && ((obj.xVel >= 0 && !slopeConnected(obj.lastSurface, this)) || (obj.xVel <= 0 && !slopeConnected(this, obj.lastSurface))) ) {
                                            return;
                                        }
                                    }

                                    if(obj.stickOnSlope) {
                                        if (obj.highestY === null || y < obj.highestY) {
                                            if (obj.isPlayer) {
                                                if (keys["ArrowDown"]) {
                                                    obj.slideDirection = 1;
                                                }
                                            }

                                            obj.highestY = y;
                                            obj.isGrounded = true;
                                            obj.y = y - obj.h;

                                            //Change the yVel in proportion to the steepness
                                            if (obj.slideDirection === 0) {
                                                obj.yVel = Math.abs(obj.xVel * this.m);
                                            } else {
                                                obj.yVel = -(obj.xVel * this.m);
                                            }
                                            obj.lastSurface = this;

                                            if ([26, 29, 30].includes(this.type)) {
                                                obj.friction = 0.99;
                                            }

                                            if (obj.xVel < 0) {
                                                obj.maxSpeed = 5 / (1 + Math.abs(this.m));

                                                if ([26, 29, 30].includes(this.type)) {
                                                    obj.maxSpeed = 5;
                                                }
                                            } else {
                                                obj.maxSpeed = 5 * (1+Math.abs(this.m));
                                            }
                                        }
                                    }
                                } else{
                                    let top = this.y+this.h-(this.b);
                                    if(obj.y + obj.h > top) {
                                        obj.highestY = top;
                                        obj.y = top - obj.h;
                                        if (obj.yVel >= 0 && obj.slideDirection === 0) {
                                            obj.isGrounded = true;
                                            obj.stickOnSlope = true;
                                            obj.yVel = 0;
                                        } else {
                                            obj.isGrounded = false;
                                            obj.stickOnSlope = false;
                                        }
                                        obj.lastSurface = this;
                                    }
                                }
                            }
                        }
                    }
                } else{
                    if(rectCollide(this, obj)) {
                        if(obj.y < this.y && obj.yVel > 0) { // Object is on top of this
                            obj.y = this.y - obj.h;
                            obj.yVel = 0;
                            obj.isGrounded = true;
                        } else{ //Object is under this
                            if(this.m > 0) { //Slopes that go up from left to right
                                if(obj.x > this.x && obj.x < this.x + this.w) {
                                    let relX = (obj.x)-this.x; //Top-left of player colliding with slope
                                    let y = ((this.y+this.h)+(-this.m*relX)-this.b); //y = mx+b for slopes

                                    if(obj.y < y) { //The object is to be placed on the top of the slope
                                        obj.highestY = y;
                                        obj.y = y;
                                        obj.yVel = Math.abs(this.m*obj.xVel);
                                    }
                                } else{
                                    let top = this.y+this.h-this.b;
                                    if(obj.y < top) {
                                        obj.y = top;
                                        obj.yVel = Math.abs(this.m*obj.xVel);
                                    }
                                }
                            } else if(this.m < 0){ //Slopes that go down from left to right
                                if(obj.x+obj.w > this.x && obj.x+obj.w < this.x + this.w) {
                                    let relX = (obj.x+obj.w)-this.x; //Top-right of player colliding with slope
                                    let y = ((this.y+this.h)+(-this.m*relX)-this.b); //y = mx+b for slopes

                                    if(obj.y < y) { //The object is to be placed on the top of the slope
                                        obj.highestY = y;
                                        obj.y = y;
                                        obj.yVel = Math.abs(this.m*obj.xVel);
                                    }
                                } else{
                                    let top = this.y+(-this.m*tileSize-(tileSize-this.b));
                                    if(obj.y < top) {
                                        obj.y = top;
                                        obj.yVel = Math.abs(this.m*obj.xVel);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    draw() {
        if(this.type != 0) {
            drawSprite(img, this.type%16, Math.floor(this.type/16), 16, 16, this.x, this.y, tileSize, tileSize, ctx, 5);
        }
    }
}

class Player {
    constructor(x, y) {
        //Allow other objects to identify the player
        this.isPlayer = true;

        //Position and coordinates
        this.x = x;
        this.y = y;
        this.tileX = 0;
        this.tileY = 0;

        //Hitbox width and height
        this.w = 20;
        this.h = 44;

        //Speed and acceleration
        this.xVel = 0;
        this.yVel = 0;
        this.xAccel = 0.3;
        this.maxSpeed = 5;
        this.friction = 0.9;

        //Animation
        this.frame = 0;
        this.costume = 0;
        this.dir = 1; //-1 = left, 1 = right

        //Touching ground variables
        this.slideDirection = 0; // -1 = slide left, 0 = no slide, 1 = slide right
        this.isGrounded = false;
        this.stickOnSlope = false; //For nice, sticky slopes and to prevent the player "floating" down slopes (because yVel is set every frame on the slope logic);
        this.lastSurface = null;
    };

    moveX() {
        if (editor) {
            if(keys['ArrowLeft']) {
                this.xVel = -15;
            }
            else if(keys['ArrowRight']) {
                this.xVel = 15;
            } else{
                this.xVel = 0;
            }
        } else{
            this.frame += Math.abs(this.xVel) / 16;

            this.costume = Math.floor(this.frame) % 4 + 1;

            if (Math.abs(this.xVel) < 1) {
                this.costume = 0;
            }

            if (this.slideDirection === 0) { //Not sliding
                if (keys['ArrowLeft'] && keys['ArrowRight']) {
                    if (this.isGrounded) {
                        this.xVel *= this.friction;
                    }
                } else if (keys['ArrowLeft'] && this.xVel > -this.maxSpeed) {
                    //if (this.xVel > -this.maxSpeed) {
                        this.dir = -1;
                        this.xVel -= this.xAccel;
                    //}
                } else if (keys['ArrowRight'] && this.xVel < this.maxSpeed) {
                    //if (this.xVel < this.maxSpeed) {
                        this.dir = 1;
                        this.xVel += this.xAccel;
                    //}
                } else {
                    if (this.isGrounded) {
                        this.xVel *= this.friction;
                    }
                }
                this.friction = 0.9;
                this.maxSpeed = 5;
            } else{ //Sliding
                this.wasSliding = true;
                this.friction = 0.98;
                this.maxSpeed = 20;
                this.costume = 6;

                if (this.xVel > 0) {
                    this.dir = 1;
                    if (this.lastSurface.m > 0) {
                        this.yVel = -(Math.abs(this.lastSurface.m) * this.xVel) + 1; //Sliding off ramps
                    }
                } else {
                    this.dir = -1;
                    if (this.lastSurface.m < 0) {
                        this.yVel = -(this.lastSurface.m * this.xVel)+1; //Sliding off ramps
                    }
                }

                if (this.slideDirection === 1) {
                    if (this.xVel < this.maxSpeed) {
                        this.xVel += 0.3;
                    }
                } else if (this.slideDirection === -1) {
                    if (this.xVel > -this.maxSpeed) {
                        this.xVel -= 0.3;
                    }
                }
            }
        }
        this.x += this.xVel;
        this.tileX = Math.floor(this.x / tileSize);
    };

    moveY() {
        if (editor) {
            this.slideDirection = 0;
            this.maxSpeed = 10;
            this.friction = 0.7;
            if(keys['ArrowUp']) {
                this.yVel = -15;
            } else if(keys['ArrowDown']) {
                this.yVel = 15;
            } else{
                this.yVel = 0;
            }
        } else{
            this.highestY = null; //To resolve conlicting slope collisions in a "\/" shape; see Block.collideY();

            if(keys['ArrowUp'] && this.isGrounded) {
                this.yVel = -8;
                this.isGrounded = false;
                this.stickOnSlope = false;
            }

            if(!this.isGrounded && this.slideDirection === 0) {
                this.costume = 5;
            }

            if (this.yVel < 0) {
                this.stickOnSlope = false;
            }

            if (this.y > height * tileSize + this.h) {
                this.xVel = 0;
                this.yVel = 0;
                this.x = Math.floor(spawnIndex/height)*tileSize;
                this.y = spawnIndex%height*tileSize-(this.h - tileSize)-2;
            }

            this.yVel += physics.gravity;
            
            this.isGrounded = false;
        }
        this.y += this.yVel;
        this.tileY = Math.floor(this.y / tileSize);

        this.slideDirection = 0;
    }

    draw() {
        //ctx.fillStyle = "blue";
        //ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.translate(this.x, this.y);
        ctx.translate((this.dir === -1) ? 16 : 0, 0);
        ctx.scale(this.dir, 1);
        drawSprite(santa, this.costume%6, Math.floor(this.costume/6), 16, 16, -16, 2, tileSize*1.5, tileSize*1.5, ctx, 15);
        ctx.resetTransform();
    };
};

class Particle {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.offset = random(0, 100);
        this.wave = 0;
        this.speed = 2  ;
    };

    update() {
        switch(this.type) {
            case "snow":
                this.y += 4;
                this.x += this.speed;
                this.wave = Math.sin(time/10+this.offset)*10;
                if(this.y > cam.y+canvas.height) {
                    this.y = cam.y-200;
                    this.x = random(cam.x-500, cam.x+canvas.width+500);
                }
        }
    };

    draw() {
        ctx.translate(-cam.x, -cam.y);
        switch(this.type) {
            case "snow":
                ctx.fillStyle = "white";
                ctx.fillRect(this.x+this.wave, this.y, 8, 8);
                break;
        }
        ctx.resetTransform();
    };
}

class Button {
    constructor(x, y, w, h, type) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.type = type;
    }

    draw = function () {
        switch (this.type) {
            case "fullscreen":
                ctx.fillStyle = "grey";
                ctx.fillRect(this.x, this.y, this.w, this.h);
                break;
        }
    };
};

//Arrays
let blocks = [];
let particles = [];

function updateLevel() {
    tileIndex = 0;
    blocks = [];
    for(let i = 0; i < width; i++) {
        for(let j = 0; j < height; j++) {
            let x = tileSize*i;
            let y = tileSize*j;
            let type = tileGrid[tileIndex];

            if(type != 0) {
                blocks.push(new Block(x, y, tileSize, tileSize, type));
            } else{
                blocks.push(null);
            }
            tileIndex++;
        }
    }
};

updateLevel();

let chosenBrush = 1;
let brush = chosenBrush;


function updatePalette() {
    paletteCtx.fillStyle = "black";
    paletteCtx.fillRect(0, 0, palette.width, palette.height);


    for(let i = 0; i < 16; i++) {
        for(let j = 0; j < 16; j++) {
            drawSprite(img, j, i, 16, 16, 2+j*(tileSize+2), 2+i*(tileSize+2), tileSize, tileSize, paletteCtx, 5);
        }
    }
};

img.onload = () => {
    updatePalette();
}

//The mouse for the palette
palette.addEventListener("mousedown", (e) => {
    const rect = palette.getBoundingClientRect();
    const mouseX = e.clientX-rect.left;
    const mouseY = e.clientY-rect.top;
    
    updatePalette();

    const tileX = Math.floor(mouseX/(tileSize+2));
    const tileY = Math.floor(mouseY/(tileSize+2));

    chosenBrush = tileY*16+tileX;

    paletteCtx.strokeStyle = "white";
    paletteCtx.lineWidth = 2;
    paletteCtx.strokeRect(1+tileX*(tileSize+2), 2+tileY*(tileSize+2), tileSize+2, tileSize+2);
});

//Level encoding and compression; CREDIT TO GRIFFPATCH
let encoded = "";
let atoz = "abcdefghijklmnopqrstuvwxyzABCDEFGHIKLMNOPQRSTUVWXYZ";
let readIndex = 0;
let letter = "";
let value = "";

function writeValue(value, letter) {
    encoded = encoded + value + letter;

}

function saveLevel() {
    encoded = "";

    writeValue(1, "_");
    writeValue(width, "_");
    writeValue(height, "_");

    tileIndex = 0;
    let tile = tileGrid[tileIndex];
    let length = 0;

    for(let i = 0; i < height; i++) {
        for(let j = 0; j < width; j++) {
            if(length < atoz.length && tile === tileGrid[tileIndex]) {
                length++;
            } else{
                if(tile === 0) {
                    tile = "";
                }
                writeValue(tile, atoz.charAt(length-1));
                tile = tileGrid[tileIndex];
                length = 1;
            }
            tileIndex += height; //Longest repitition of blocks are found horizontally (usually), so we transform the reading to optimize
        }
        tileIndex += (1-(width*height));
    }
    writeValue(tile, atoz.charAt(length - 1));
    writeValue("_", "");
    //END OF TILEGRID DATA, BEGIN METADATA

    length = 0;

    /*writeValue(i + "_");
    let keys = Object.keys(metaData)
        .sort((a, b) => {
            return parseInt(a.split("_")[0]) - parseInt(b.split("_")[0]);
        })
        .map(key => [key, metadata[key]]);

    for (let i = 0; i < keys.length; i++) {
        if (keys[i] && Number(keys[i]) === Number(keys[i - 1])) { }
    }*/

    document.getElementById("levelCode").value = encoded;
};


function loadLevel(code) {
    if(!code || code === "") {
        return;
    }

    encoded = code;

    readIndex = 0;
    readValue();
    if(value != 1) {
        return; //Only version 1 save codes allowed
    }

    tileGrid = [];
    readValue();
    width = Number(value);
    readValue();
    height = Number(value);

    for(let i = 0; i < width*height; i++) {
        tileGrid.push(0);
    }

    tileIndex = 0;
    while(readIndex < encoded.length) {
        readValue();
        if(value === "") {
            value = 0;
        }
        
        for(let i = 0; i < Number(atoz.indexOf(letter))+1; i++) {
            tileGrid[tileIndex] = Number(value);

            tileIndex += height;
            if(tileIndex >= width * height) {
                tileIndex += (1-width*height);
            }
        }
    }

    //METADATA

    //while(readIndex)

    updateLevel();
    spawnIndex = tileGrid.indexOf(49);
}

function readLetter() {
    letter = encoded.charAt(readIndex);
    readIndex++;
}

function readValue() {
    value = "";
    readLetter();
    while(!isNaN(letter)) {
        value = value + letter;
        readLetter();
    }
}
if(tileGrid.length === 0) {
    genLevel();
}
//loadLevel("1_247_40_ZZZZZZZZZZZZm38aa38aa38aa38aa38aa38aa38aa38aZZZZz24a25p26aZZZZx24a25r26aZZZZv24a25t26aZZZZu25vZZZZO25dZZZZN25cZZZZO25cZZZZO25cb25aZZZD24a33eZa25cZZZF24a33fZa25cZZZC25o26aU25cd25aZZZx25p26aT25cZZZC25q26aa38aQ25cZZZC25wN25cb25aZZZZL25bZZZZP25b39aZZZZO34a25a35al45aZZZZr1a3ap42ae46ah42aZZZZa11a12a2f8a9a2b10ak7a2q3aZZZX11a12a8a5k9a10ai7a8a5q6aZZZW7a8a5n9a10ag7a8a5r6aZZZV7a8a5p9a2g8a5s6aZZZU7a8a5T6aZZZT7a8a5U6aZZZT4a5V6aX11a12a2xZZu16a5V6aV11a12a8a5yZZl21a22d23ad16a5U6aT11a12a8a5AZZl25fw16a5A6aS7a8a5CU38ac38aZl25fx16a5e15ac16a5p6aj1a2j10au7a8a5DS24a25g26aZe24a25jy16a5c15ae16a5o6aj4a5j9a10as7a8a5ER24a25i26aZc24a25kK5o6aj4a5k9a10aq7a8a5FK47ae24a25k26aH43aq24a25lq11a12a2c10al7a5o6aj4a5l9a10ao7a8a5GK48ad24a25m26aG44ap24a25mq4a5d9a10aj7a8a5o6aj4a5m9a10am7a8a5HF21a22h25o29a30aA1a2d3an24a25nq4a5e9a10ae7a2c8a5p6aj4a5n9a10ak7a8a5Il45ac1a2g3ag25z29a30ao45ab45af4a5d6al27a28a25ph1a3af4a5f9a2e8a5t6aj4a5o9a13a14ah7a8a5Kb49ac42ae46ac4a5g6ag25B29a30ai42ac46ab46af4a5d6aj27a28a25rh4a6af4a5G6aj4a5q9a2h8a5L2p8a5g6ag25Df1a2p8a5d6af25xh4a6af4a5G6aj4a5Z5m_");
loadLevel("1_247_120_ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZK1aZZZZZc11qZZZZz11qZZZZz11qZZZZz11qZZZZz11qZZZZz11qZZg38aZZr11rZZe25dd39aZZm11pZZe25dd40aZZb49ad42ag11nZZe25dd40ad38aZT2r11lZF25T29a30aZK5t11jZF25V29a30aZH5v11hZF25X29a30aZF5x11f13a14aZD25Z29a30aZD5z11d5a9a13a14aZB25Z25b26aZC5B11b5c9a13a14aZz25Z25c26aZB5I9a13a14aZx31a32a25Z25b26aZA5L9a10aZy31a32a25Z25a26aZz5M9a10aZz31a32a25Z26aZy5N9a10aZA31a32a25Y29aZx5O9a10aZB34a25Yh47aZo5P9a10aZB34a25H35av48aZo5Q9a10aZB34a25F35au21a22b23aZn5R9a10aZB34a25D35as21a22b25dZn5S9a10aZB34a25B35at25gZn5T9a10aZB34a25h36a37aM25gZn5U9a10aZB34a25e36a37aC21a22e23ad25gZn5V9aZC34a25a36a37aF25gd25gZn5WU47aS27a28a25qf25gd25gZn5WU48aQ27a28a25sf25gd25gZn5WU1a13a14aM27a28a25uf25gd25gZn5WU4a5a9a13a14aH27a28a25wf25gd25gZn5WU4a5c9a13a14aD27a28a25yf25gd25gZn5WH7a3aj4a5e9a13a14az27a28a25Af25gd25gZn5WG7a8a6aj4a5g9a13a14ax34a25Bf25gd25gZn5WF7a8a5a6aj4a5i9a13a14aw34a25Af25gd25gZn5Wc1a2d13a14at11a12a8a5b6aj4a5k9a13a14ah11a12al34a25zf25gd25gZn5Wc4a5e9a13a14ap11a12a8a5d6aj4a5m9a13a14ad11a12a8a5am34a25yf25gd25gZn5Wc4a5g9a13a14al11a12a8a5f6aj4a5o9a13a14a11a12a8a5cn31a32a25wf25gd25gZn5Wc4a5i9a13a14ah11a12a8a5h6aj4a5q9a8a5ep31a32a25uf25gd25gZn5Wc4a5k9a13a14ad11a12a8a5j6aj4a5xh26ai31a32a25sf25gd25gZn5Wc4a5m9a13a14a11a12a8a5l6aj4a5xh25a26aj31a32a25qf25gd25gZn5Wc4a5E6aj4a5xh25b26ak31a32a25of25gd25gZn5Wc4a5E6aj4a5xh25c26al34a25nf25gd25gZn5Wc4a5E6aj4a5xh25d26al34a25mf25gd25gZn5Wc4a5E6aj4a5xh25e29a30ak31a32a25kf25gd25gZn5Wc4a5E6aj4a5xh25g29a30ak31a32a25e36a37ah25gd25gZn5Wc4a5E6aj4a5xh25i29a30ak31a32a25a36a37aj25gd25gZn5Wc4a5E6aj4a5xh25k29a30ax25gd25gZn5Wc4a5E6aj4a5xh25mx25gd25gZn5Wc4a5E6aj4a5xh25mx25gd25gZn5Wc4a5E6aj4a5xh25mr27a28a25kd25gZn5Wc4a5E6aj4a5xh25l36ap27a28a25md25gZn5Wc4a5E6aj4a5xh25j36a37ao27a28a25od25gZn5Wc4a5E6aj4a5xh25h36a37ao27a28a25qd25gZn5Wc4a5E6aj4a5xh25g35ao27a28a25sd25gZn5Wc4a5E6aj4a5xh25f35ao24a25ud25gZn5Wc4a5E6aj4a5xh25e35ac27a28a25a26ah24a25vd25gZn5Wc4a5E6aj4a5xh25d35ac24a25d26af24a25wd25gZn5Wc4a5E6aj4a5xh25c35ac24a25f22f25xd25gZn5Wc4a5E6aj4a5xh25b35ac24a25Ld25gZn5Wc4a5E6aj4a5xh25a35ad25Md25gZn5Wc4a5E6aj4a5xh25ae25Md25gZn5Wc4a5E6aj4a5xh25ae25Md25gZn5Wc4a5E6aj4a5xh25ae25Md25gZn5Wc4a5E6aj4a5xh25ae25Md25gZn5Wc4a5E6aj4a5xh25ae34a25Ld25gZn5Wc4a5E6aj4a5xh25af34a25Kd25gZn5Wc4a5E6aj4a5xh25ag34a25Id25gZn5Wc4a5E6aj4a5xh25ah34a25F36a37aZy5Wc4a5E6aj4a5xh25a26ah34a25h33p25e36a37aZA5Wc4a5E6aj4a5xh25b26ah34a25g33p25c36a37aZC5Wc4a5E6aj4a5xh25c26ah34a25f33p25b35aZE5Wc4a5E6aj4a5xh25d26ah34a25e33p25a35aZF5Wc4a5E6aj4a5xh25e26ah31a32a25c33p35an27a28a29a30aZo5Wc4a5E6aj4a5xh25f26ai31a32a25a33n36a37am27a28a25d29a30aZm5Wc4a5E6aj4a5xh25g26aj31a32a33k36a37am27a28a25hZm5Wc4a5E6aj4a5xh25h26aI27a28a25jZm5Wc4a5E6aj4a5xh25i26aF27a28a25lZm5Wc4a5E6aj4a5xh25j26aC27a28a25n2h10aZd5Wc4a5E6aj4a5xh25k26az27a28a25p5h9a10aZc5Wc4a5E6aj4a5xh25l26aw27a28a25r5i9a10aZb5Wc4a5E6aj4a5xh25m26at27a28a25t5j9a10aZa5Wc4a5E6aj4a5xh25n26ar24a25v5k9a10aZ5Wc4a5E6aj4a5xh25o26ap24a25w5l9a10aY5Wc4a5E6aj4a5xh25p26an24a25x5m9a10aX5Wc4a5E6aj4a5xh25q26al24a25y5n9a2iO5Wc4a5E6aj4a5xh25r26aj24a25z5xO5Wc4a5E6aj4a5xh25s26ah24a25A5xO5Wc4a5E6aj4a5xh25t26af24a25B5xO5Wc4a5E6aj4a5xh25u26ad24a25C5xO5Wc4a5E6aj4a5xh25Z25e5xO5Wc4a5E6aj4a5xh25Z25e5xO5Wc4a5E6aj4a5xh25Z25e5xO5Wc4a5E6aj4a5xh25Z25e5xO5Wc4a5E6aj4a5xh25Z25e5xO5Wc4a5E6aj4a5xh25Z25e5xO5Wc4a5E6aj4a5xh25Z25e5xO5Wc4a5E6aj4a5xh25Z25e5x0O_");
//loadLevel("1_297_40_w7db10aZZZZZL7cb10aZZZZZM7ac10aZZV38aa38aa38aa38aa38aa38aa38aa38aZZu7cb7cb10aZZS24a25p26aZW7au7bb7ec10aZZZZZf7aA7bf10aZZZZZd7aB7ah10aZZZZZb7aB7aj10aZZZZZ7aB7al10aZZZZX7aB7bm10aZZZZV7aB7ap10aZZZZT7aA7br10aZU24a33eZZQ7aA7bt10aZS24a33fZZP7aA7bv10aZO25aa25ae25aa25e26aZZH7az7cx10aZV25ab25e26aZZF7az7bA10aZZ25d26aa38aZZB7az7bC10aZm41ac41ac41aA25kZZx7ay7bF10aZl41bb41ah41bd41bd41bc41aZZN7ay7bH10aZk41aa41aa41ac41ac41ab41ab41ab41ab41ab41ab41dZu13a14aZl7ax7bL10aZj41ab41bc41ad41cc41cb41cc41aZm7ae45af13a14aZi7ax7bN10aZi41ac41ac41af41ae41ab41ae41aU1a3ao7a42ae46ah13a14aZf7aw7bQ10aZt41cc41cd41cb41aM11a12a2f8a9a2b10ak7a2q3aZe7aw7bS10aZZw11a12a8a5k9a10ai7a8a5q6aD7ax7as7fU10aZZt11a12a8a5n9a10af10a7a8a5r6aC7ax7aZv10aZZq11a12a7a8a5p9a2g8a5s6aB7ax7aZx10aZZn11a12aa7a8a5T6ar7a10ag7ax7aZz10aZZk11a12ab7a8a5U6aq7ab10aD7aZB10aZZh11a12ad4a5V6ap7ad10aA11a12a2xZf10aZZe11a12af16a5V6av10ax11a12a8a5yZg10aZZd22d23ad16a5U6aw10au11a12a8a5AZh10aZZb25fw16a5A6ax10as7a8a5CZi10aI38ac38aZi7ab25fx16a5e15ac16a5p6aj1a2j10ac10aq7a8a5DZj10aF24a25g26aZf7a25iy16a5c15ae16a5o6aj4a5j9a10ac10ao7a8a5EZk10aj10as24a25i26aZd7a25jK5o6aj4a5k9a10ac10a7al7a8a5FZl10aj10ak47ae24a25k26aH43ar7a25kq11a12a2c10al7a5o6aj4a5l9a10ao7a8a5GZm10ac11a12ae10aj48ad24a25m26aG44ap10a7a25lq4a5d9a10aj7a8a5o6aj4a5m9a10am7a8a5HZn10a11a12ah10ae21a22h25o29a30af10at1a2d3ap25mq4a5e9a10ae7a2c8a5p6aj4a5n9a10ak7a8a5IZk45ac1a2g3ab10ad25z29a30ae10ai45ab45af4a5d6al27ab25oh1a3af4a5f9a2e8a5t6aj4a5o9a13a14ag10a7a8a5KZe42ae46ac4a5g6ac10ac25B29a30ad10ad42ac46ab46af4a5d6aj27a28a25rh4a6af4a5G6aj4a5q9a2h8a5LY2p8a5g6ag25De10a1a2p8a5d6af25xh4a6af4a5G6aj4a5Z5m_");
//Level editor
function updateMode() {
    document.getElementById('label').textContent = (editor) ? 'Editor' : 'Play';
    document.getElementById('palette').style.display = (editor) ? "block" : "none";
};
updateMode();

let lastKeys = {};

let drawRects = false;
let drawSlopes = false;

let gridX;
let gridY;
let lastGridX;
let lastGridY;
let drawnRect = {x: gridX, y: gridY, x2: gridX, y2: gridY};
let drawnSlope = {x: gridX, y: gridY, x2: gridX, y2: gridY};

let slopeGroups = [{
    "0.5": [11, 12],
    "1": [7],
    "leftjoiner": 8,
    "-0.5": [13, 14],
    "-1": [10],
    "rightjoiner": 9
}];

function edit() {
    ctx.resetTransform();
    gridX = Math.floor((cam.x+mouse.x)/tileSize);
    gridY = Math.floor((cam.y+mouse.y)/tileSize);
    let mouseIndex = gridX*height+gridY;

    //Tile picker
    if(keys['e']) {
        chosenBrush = tileGrid[mouseIndex];
    }
    
    //Adding/removing rows/columns in level
    if (keys['a'] && !lastKeys['a']) {
        let type = prompt("Add/remove rows or columns? (Enter 'r' or 'c'):");
        if (type === 'r' || type === 'c') {
            let amount = parseInt(prompt(`Add how many ${(type === 'c') ? "columns" : "rows"}? (Negative to delete):`), 10);
            if (!isNaN(amount)) {
                if (type === 'c') {
                    let where = prompt("Insert/Remove columns at left or right of world? (left/right)");

                    if (where === "left" || where === "right") {
                        if (amount > 0) {
                            if (where === "left") {
                                for (let i = 0; i < amount; i++) {
                                    for (let j = 0; j < height; j++) {
                                        tileGrid.splice(i * height + j, 0, 0);
                                    }
                                }
                            } else {
                                for (let i = amount - 1; i >= 0; i--) {
                                    for (let j = height - 1; j >= 0; j--) {
                                        tileGrid.splice((i + width) * height, 0, 0);
                                    }
                                }
                            }
                        } else {
                            if (where === "left") {
                                for (let i = 0; i < Math.abs(amount); i++) {
                                    for (let j = 0; j < height; j++) {
                                        tileGrid.splice(0, 1);
                                    }
                                }
                            } else {
                                for (let i = amount - 1; i >= 0; i--) {
                                    let removeAt = (i + width) * height + (height + amount);

                                    for (let j = 0; j < height; j++) {
                                        tileGrid.splice(removeAt, 1);
                                    }
                                }
                            }
                        }
                        width += amount;
                    }
                } else {
                    let where = prompt("Insert/Remove rows at top or bottom of world? (top/bottom)");

                    if (where === "top" || where === "bottom") {
                        if (amount > 0) {
                            for (let i = width - 1; i >= 0; i--) {
                                let insertAt = (where === "top")
                                    ? i * height
                                    : i * height + height;

                                for (let j = 0; j < amount; j++) {
                                    tileGrid.splice(insertAt, 0, 0);
                                }
                            }
                        } else {
                            for (let i = width - 1; i >= 0; i--) {
                                let removeAt = (where === "top")
                                    ? i * height
                                    : i * height + (height + amount);
                                for (let j = 0; j < Math.abs(amount); j++) {
                                    tileGrid.splice(removeAt, 1);
                                }
                            }
                        }
                        height += amount;
                    }
                }
                updateLevel();
            }
        }
    }

    //Speed drawing large rectangles by dragging
    if (keys['Shift'] && !lastKeys['Shift']) { //Toggle draw rectangle mode
        drawRects = !drawRects;
    }
    
    if(drawRects && chosenBrush != 49) {
        if(mouse.down && !mouse.wasDown) {
            drawnRect.x = gridX;
            drawnRect.y = gridY;
        }

        if(mouse.down){//!mouse.down && mouse.wasDown) {
            drawnRect.x2 = gridX;
            drawnRect.y2 = gridY;
            
            //Ensure x and y are the smaller values while x2 and y2 are the larger values to make a valid rectangle
            const rectX = Math.min(drawnRect.x, drawnRect.x2);
            const rectX2 = Math.max(drawnRect.x, drawnRect.x2);
            const rectY = Math.min(drawnRect.y, drawnRect.y2);
            const rectY2 = Math.max(drawnRect.y, drawnRect.y2);
            
            let rectWidth = Math.abs(rectX2 - rectX) + 1;
            let rectHeight = Math.abs(rectY2 - rectY) + 1;

            for(let i = 0; i < rectWidth; i++) {
                for(let j = 0; j < rectHeight; j++) {
                    const x = rectX + i;
                    const y = rectY + j;

                    let index = x * height + y;
                    tileGrid[index] = chosenBrush;
                }
            }
            updateLevel();
        }
    }

    //Draw slopes easily
    if(keys['s'] && !lastKeys['s']) {
        drawSlopes = !drawSlopes;
    }

    if(drawSlopes) {
        const slope = 0.5;

        const groupIndex = slopeGroups.findIndex(group => group.includes(chosenBrush));



        if(mouse.down && !mouse.wasDown) {
            drawnSlope.x = gridX;
            drawnSlope.y = gridY;
        }

        if(mouse.down) {
            drawnSlope.x2 = gridX;
            drawnSlope.y2 = gridY;

            //Ensure x and y are the smaller values while x2 and y2 are the larger values to make a valid rectangle
            const rectX = Math.min(drawnSlope.x, drawnSlope.x2);
            const rectX2 = Math.max(drawnSlope.x, drawnSlope.x2);
            const rectY = Math.min(drawnSlope.y, drawnSlope.y2);
            const rectY2 = Math.max(drawnSlope.y, drawnSlope.y2);
            
            let rectWidth = Math.abs(rectX2 - rectX) + 1;
            let rectHeight = Math.abs(rectY2 - rectY) + 1;

            for(let i = 0; i < rectWidth; i++) {
                for(let j = Math.floor(slope*i); j >= 0; j--) {
                    const x = rectX + i;
                    const y = rectY - j;

                    let index = x * height + y;

                    switch(j) {
                        case Math.floor(slope*i):
                            tileGrid[index] = (i%2===0) ? 11 : 12;
                            break;
                        case Math.floor(slope*i)-1:
                            if((i%Math.floor(1/slope))===0) {
                                tileGrid[index] = 8;
                            } else{
                                tileGrid[index] = 5;
                            }
                            break;
                        default:
                            tileGrid[index] = 5;
                    }
                }
            }
            updateLevel();
        }
    }

    //Code for the editing brush
    if(!drawRects && !drawSlopes) {
        if(!mouse.down) {
            brush = -1;
        } else{
            //Normal Brush... not drawing rectangles
            if(brush === -1) {
                if(tileGrid[mouseIndex] == chosenBrush) {
                    brush = 0;
                } else{
                    brush = chosenBrush;
                }
            }
            //Change spawn point
            if(brush === 49) {
                spawnIndex = tileGrid.indexOf(49);
                if(spawnIndex !== -1) {
                    tileGrid[spawnIndex] = 0;
                }
            }
            tileGrid[mouseIndex] = brush;
            console.log(brush);
            updateLevel();
        }
    }

    ctx.globalAlpha = 0.5;
    ctx.translate(-cam.x, -cam.y);
    drawSprite(img, chosenBrush%16, Math.floor(chosenBrush/16), 16, 16, gridX*tileSize, gridY*tileSize, tileSize, tileSize, ctx, 5);
    ctx.globalAlpha = 1;

    if(drawRects) {
        ctx.strokeStyle = "red";
        ctx.strokeRect(gridX*tileSize, gridY*tileSize, tileSize, tileSize);
    }

    ctx.fillText(mouseIndex, cam.x+mouse.x, cam.y+mouse.y-10);
    lastGridX = gridX;
    lastGridY = gridY;
};

spawnIndex = tileGrid.indexOf(49);
let player = new Player(Math.floor(spawnIndex/height)*tileSize, spawnIndex%height*tileSize);

function getTilesFromArea(x, x2, y, y2, func) {
    for(let dx = x; dx <= x2; dx++) {
        for(let dy = y; dy <= y2; dy++) {
            func(dx, dy);
        }
    }
};

//Pool of 50 particles; setTimeOut gives the camera a few milliseconds to allow it to move to the player

setTimeout(() => {
    for (let i = 0; i < 100; i++) {
        particles.push(new Particle(random(cam.x - 200, cam.x + canvas.width + 200), random(cam.y - 200, cam.y + canvas.height), "snow"));
    }
}, 10);

//Parallax scrolling
function drawParallax() {
  for (let i = 0; i < parallax[0].length; i++) {
    const layer = parallax[0][i];
    const x = -cam.x * layer.speed;

    // repeat image if needed
    const count = Math.ceil(canvas.width / canvas.height) + 1;
    for (let j = 0; j < count; j++) {
        ctx.drawImage(layer.img, x + j * canvas.height, 0, canvas.height, canvas.height);
    }
  }
}

//Prevent sub-pixel gaps
ctx.imageSmoothingEnabled = false;

let deltaTime;
let lastTime = performance.now();
let fps = 0;

function loop() {
    /*if (keys["s"]) {
        clearInterval(l);
        l = setInterval(() => {
            loop();
        }, 1000/20)
    } else {
        clearInterval(l);
        l = setInterval(() => {
            loop();
        }, 1000/60)

    }*/


    if (keys["0"] && !lastKeys["0"]) {
        editor = (editor) ? false : true;
        updateMode();
    }

    deltaTime = (performance.now() - lastTime) / 1000;
    const fps = 1 / deltaTime;
    lastTime = performance.now();

    time++;
    ctx.fillStyle = "lightblue";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawParallax();
    ctx.fillStyle = "black";
    ctx.fillText("FPS: " + fps.toFixed(3), 100, 100);

    ctx.resetTransform();

    if(editor) {
        edit();
    }

    for(let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.update();
        p.draw();
    }

    ctx.resetTransform();
    
    ctx.translate(-cam.x, -cam.y);
    cam.x = clamp(Math.round(player.x-canvas.width/2), 0, tileSize*width-canvas.width);
    cam.y = clamp(Math.round(player.y-canvas.height/2), 0, tileSize*height-canvas.height);

    if(player.x < 0) {
        player.x = 0;
        player.xVel = 0;
    } else if(player.x > tileSize*width-tileSize/2) {
        player.x = tileSize*width-tileSize/2;
        player.xVel = 0;
    }

    player.moveX();

    let camTileX = Math.floor(cam.x / tileSize);
    let camTileY = Math.floor(cam.y / tileSize);
    //block collisionX

    getTilesFromArea(player.tileX - 2, player.tileX + 2, player.tileY - 2, player.tileY + 2, (tx, ty) => {
    //for(let i = 0; i < blocks.length; i++) {
        let index = tx*height+ty;
        let b = blocks[index];
        if(b != null && !editor) {
            b.collideX(player);
        }
    //}
    });

    player.moveY();

    //block collisionY
    getTilesFromArea(player.tileX - 2, player.tileX + 2, player.tileY - 2, player.tileY + 2, (tx, ty) => {
        let index = tx*height+ty;
        let b = blocks[index];
        if(b != null) {
            if(b.m != 0 && !editor) {
                b.collideY(player);
            }
        }
    });
    getTilesFromArea(player.tileX - 2, player.tileX + 2, player.tileY - 2, player.tileY + 2, (tx, ty) => {
        let index = tx*height+ty;
        let b = blocks[index];
        if(b != null) {
            if(b.m === 0 && !editor) {
                b.collideY(player);
            }
        }
    });
    //Block draw

    //This function optimizes performance by only drawing tiles within the viewing area
    getTilesFromArea(camTileX, camTileX+(Math.floor(canvas.width/tileSize)), camTileY, camTileY+(Math.ceil(canvas.height/tileSize)), (tx, ty) => {
        let index = tx*height+ty;

        let b = blocks[index];
        if(b != null) {
            //Prevent spawnpoint from being shown in editor
            if(b.type !== 49 || editor) {
                b.draw();
            }
        }
    });

    player.draw();

    requestAnimationFrame(loop);

    //Last frame's keys
    lastKeys = { ...keys };
    mouse.wasDown = mouse.down;
};

loop();
/*let l = setInterval(() => {
    loop();
}, 1000/60)*/
