import $ from "properjs-hobo";
import Controller from "properjs-controller";
import Stagger from "properjs-stagger";
import socket from "../socket";



const maze = {
    init () {
        this.canvas = $( ".js-hud-maze" );
        this.context = this.canvas[ 0 ].getContext( "2d" );
        this.cellauto = window.CellAuto;
        this.controller = new Controller();
        this.queue = [];
        this.players = {};
        this.hero = {
            x: 0,
            y: 0,
            color: "#2affea",
            spawn: false
        };
        this.chest = {
            x: 0,
            y: 0,
            color: "#6441a4",
            spawn: false
        };
        this.isMoving = false;

        return this;
    },

    push ( data ) {
        this.queue.push( data );

        if ( !this.isMoving ) {
            this.move();
        }
    },

    check () {
        if ( this.queue.length ) {
            this.move();

        } else {
            this.isMoving = false;
        }
    },

    move () {
        this.isMoving = true;

        const queueData = this.queue.shift();
        const increment = (queueData.direction === "left" || queueData.direction === "up" ? -1 : 1);
        const points = [];
        let i = 0;

        // Player has not made a move yet
        if ( !this.players[ queueData.username ] ) {
            this.players[ queueData.username ] = {
                username: queueData.username,
                moves: 0
            };

        // Increment players move count for this maze
        } else {
            this.players[ queueData.username ].moves++;
        }

        while ( i < queueData.distance ) {
            i++;

            const x = (queueData.direction === "left" || queueData.direction === "right" ? (this.hero.x + (increment * i)) : this.hero.x);
            const y = (queueData.direction === "up" || queueData.direction === "down" ? (this.hero.y + (increment * i)) : this.hero.y);
            const cell = this.world.grid[ y ][ x ];

            // Point is in bounds and not alive
            if ( cell && !cell.alive ) {
                points.push({
                    x,
                    y,
                    chest: (x === this.chest.x && y === this.chest.y)
                });

            // Break the loop at first instance of collision
            } else {
                break;
            }
        }

        if ( points.length ) {
            this.tick( this.players[ queueData.username ], points );

        } else {
            this.check();
        }
    },

    tick ( player, points ) {
        this.stagger = new Stagger({
            steps: points.length,
            delay: 250

        }).step(( i ) => {
            const point = points[ i ];
            const cell = this.world.grid[ point.y ][ point.x ];
            const color = cell.getColor();

            // redraw old block
            this.fillCell( this.hero.x, this.hero.y, this.world.palette[ color ] );
            // redraw new block
            this.fillCell( point.x, point.y, this.hero.color );
            // update hero
            this.hero.x = point.x;
            this.hero.y = point.y;

            // chest collision
            if ( point.chest ) {
                this.stagger.pause();
                this.stagger = null;
                this.render();

                socket.emit( "mazerunner", player );
            }

        }).done(() => {
            this.check();

        }).start();
    },

    spawn ( thing ) {
        while ( !this[ thing ].spawn ) {
            const x = Math.floor( Math.random() * (this.world.width - 1) );
            const y = Math.floor( Math.random() * (this.world.height - 1) );
            const cell = this.world.grid[ y ][ x ];

            if ( !cell.alive && !this[ thing ].spawn ) {
                this[ thing ].spawn = true;
                this[ thing ].x = x;
                this[ thing ].y = y;

                this.fillCell( this[ thing ].x, this[ thing ].y, this[ thing ].color );
            }
        }
    },

    fillCell ( x, y, color ) {
        this.context.clearRect(
            x * this.world.cellSize,
            y * this.world.cellSize,
            this.world.cellSize,
            this.world.cellSize
        );
        this.context.fillStyle = color;
        this.context.fillRect(
            x * this.world.cellSize,
            y * this.world.cellSize,
            this.world.cellSize,
            this.world.cellSize
        );
    },

    render () {
        this.queue = [];
        this.players = {};
        this.hero.spawn = false;
        this.chest.spawn = false;
        this.isMoving = false;

        this.world = new this.cellauto.World({
            width: 10,
            height: 50,
            cellSize: 20
        });

        this.world.palette = [
            "#333",
            "#000"
        ];

        this.world.registerCellType( "living", {
            getColor: function () {
                return this.alive ? 0 : 1;
            },
            process: function ( neighbors ) {
                const surrounding = this.countSurroundingCellsWithValue( neighbors, "wasAlive" );

                if ( this.simulated < 20 ) {
                    this.alive = surrounding === 1 || surrounding === 2 && this.alive;
                }

                if ( this.simulated > 20 && surrounding === 2 ) {
                    this.alive = true;
                }

                this.simulated += 1;
            },
            reset: function () {
                this.wasAlive = this.alive;
            }

        }, function () {
            this.alive = Math.random() > 0.5;
            this.simulated = 0;
        });

        this.world.initialize([
            {
                name: "living",
                distribution: 100
            }
        ]);

        this.bytes = null;
        this.controller.go(() => {
            const bytes = [];

            this.world.step();

            for ( let y = 0; y < this.world.height; y++ ) {
                for ( let x = 0; x < this.world.width; x++ ) {
                    const cell = this.world.grid[ y ][ x ];
                    const color = cell.getColor();

                    this.fillCell( x, y, this.world.palette[ color ] );

                    bytes.push( color );
                }
            }

            if ( this.bytes ) {
                // When the old bytes matches the new bytes the maze is done
                if ( this.bytes.join( "" ) === bytes.join( "" ) ) {
                    this.bytes = null;
                    this.controller.stop();
                    this.spawn( "hero" );
                    this.spawn( "chest" );
                }
            }

            this.bytes = bytes;
        });
    }
};



export default maze;
