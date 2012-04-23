/* Connect4 System for IGN Code-Foo
 * By James Burroughs
 */

(function(liquid) {
    
    var _rows = 6;
    var _cols = 7;
    var _slot_count = _rows*_cols;
    
    var _slots = []; //Contains all slots
    
    var _game_wrapper;
    var _game_redraw;
    var _game_height;
    var _game_width;
    
    var _turn;
    var _game_over = false;
    
    var _moves = 0;
    var _move_count;
    
    var _cookie;
    
    var _recent_results;
    
    var _directionMap = {
        horizontal: {
            a: "e",
            b: "w"
        },
        vertical: {
            a: "n",
            b: "s"
        },
        desc: {
            a: "nw",
            b: "se"
        },
        asc: {
            a: "sw",
            b: "ne"
        }
    };
    
    
     // The build function sets up all slots, and 
     // obtains all DOM elements for later use.   
    function build() {
               
        //Create temporary array to store Slots
        for(var i = 0; i < _slot_count; i++) {
            var x = i%_cols;
            var y = Math.floor((i/_cols));
            _slots.push(new Slot(x, y));
        }
        
        //Slots are made, now attach links
        for(var i = 0; i < _slot_count; i++) {
            var slot = _slots[i];
            
            //Bind links
            slot.n = (i - _cols) >= 0 ? _slots[i - _cols] : null;
            slot.ne = ((i - _cols + 1) >= 0) && ((i - _cols + 1) % _cols !== 0) ? _slots[i - _cols + 1] : null;
            slot.e = ((i + 1) < _slot_count) && ((i + 1) % _cols !== 0) ? _slots[i + 1] : null;
            slot.se = ((i + _cols + 1) % _cols !== 0) && ((i + _cols + 1) < _slot_count) ? _slots[i + _cols + 1] : null;
            slot.s = (i + _cols) < _slot_count ? _slots[i + _cols] : null;
            slot.sw = ((i + _cols - 1) < _slot_count) && ((i + _cols - 1) % _cols !== (_cols - 1)) ? _slots[i + _cols - 1] : null;
            slot.w = (i - 1) % _cols !== (_cols - 1) ? _slots[i - 1] : null;
            slot.nw = ((i - _cols - 1) >= 0) && ((i - _cols - 1) % _cols !== (_cols - 1)) ? _slots[i - _cols - 1] : null;
        }
  
        _game_wrapper = document.getElementById("connect_four");
        
        //Grab game dimensions
        _game_height = $(_game_wrapper).height();
        _game_width = $(_game_wrapper).width();
        
        //Grab redraw area
        _game_redraw = document.getElementById("connect_four_redraw");
        
        //Grab move count
        _move_count = document.getElementById("connect_four_score");
        
        //Grab recent results
        _recent_results = document.getElementById("connect_four_high");
        
        //Grab recent results COOKIE
        var temp_cookie = getCookie("connect4");
        if(temp_cookie) {
            try {
                temp_cookie = JSON.parse(temp_cookie);
            }
            catch(e) {
                temp_cookie = null;
            }
        }        
        _cookie = temp_cookie || [];
        
        for(var i = 0; i < _cookie.length; i++) {
            appendRecentResult(_cookie[i]);
        }
        
        //Create game buttons
        var colWidth = Math.floor(_game_width/_cols);
        for(var i = 1; i <= _cols; i++) {
            var colButton = document.createElement("div");
            colButton.className = "col_button";
            colButton.style.width = colWidth + "px";
            colButton.style.left = colWidth * (i-1) + "px";
            $(colButton).click((function(i) {
                return function() {
                    insertCoin(i);
                };
            })(i));
            _game_wrapper.appendChild(colButton);
        }        
        
        //RUN AI if move
        _turn = Math.round(Math.random());
        if(_turn) AI_nextmove();
               
    }
    
    //The endGame function inserts a small prompt into the DOM
    //Also attaches a function to an onclick event that will
    //reset the board.
    function endGame(m, playerWon) {
        _game_over = true;
        var wrapper = document.createElement("div");
        $(wrapper).attr("id","connect_four_prompt_wrapper");
        var prompt = document.createElement("div");
        $(prompt).attr("id","connect_four_prompt");
        $(prompt).text(m);
        var tryagain = document.createElement("span");
        tryagain.className = "hi";
        $(tryagain).text("Play again?");
        prompt.appendChild(tryagain);
        
        $(tryagain).click(function() {
            //Reset the game
            _game_over = false;
            $(wrapper).remove();
            $(_game_redraw).empty(); //Purge old
            _move_count.innerHTML = 0;
            _moves = 0;
            
            //Make all slots neutral
            for(var i = 0; i < _slots.length; i++) {
                _slots[i].allegiance = "";
            }
            
            //Start game again with a random first turn
            _turn = Math.round(Math.random());
            if(_turn) AI_nextmove();
        });
        
        wrapper.appendChild(prompt);
        _game_wrapper.appendChild(wrapper);
        
        
        //Set cookie
        var now = new Date().getTime();
        var result = {
            result: _moves,
            winner: playerWon ? true : false,
            ts: now
        };
        _cookie.push(result);
        setCookie("connect4", JSON.stringify(_cookie), 365);
        
        appendRecentResult(result);
    }
    
    function appendRecentResult(result) {
        var li = document.createElement("li");
        $(li).text("IGN Employee");
        
        var small = document.createElement("small");
        var now = new Date().getTime();
        var then = Number(result.ts);
        var since = now - then;
        
        if(since < (1000*60*60*24)) {       
            var date = new Date(then);
            $(small).text(date.toLocaleTimeString());
            
        }
        else {
            var d = Math.round(since/1000/60/60/24 % 30);            
            $(small).text(d + " day(s) ago.");
        }        
        
        var strong = document.createElement("strong");
        strong.className = result.winner ? "hi" : "loss";
        $(strong).text(result.result);
        
        li.appendChild(small);
        li.appendChild(strong);
        
        $(_recent_results).prepend(li);
        
        //Update liquid layout
        liquid.redraw();
    }
    
    // The slot function is treated as an object class,
    // each slot has a N, E, S, W, NE, SE, SW, NW link
    // that allows the connect4 board to be treated as a
    // linked lattice.    
    function Slot(x, y) {
        this.x = x;
        this.y = y;
        this.allegiance = null;
    }    
    Slot.prototype = {
        
        findConnections: function() {
            
            var player = {
                2: [],
                3: []
            };
            
            var ai = {
                1: [],
                2: [],
                3: []
            };
            
            for(var i in _directionMap) {
                
                var a = _directionMap[i].a;
                var b = _directionMap[i].b;
                
                var results = {
                    player: 0,
                    ai : 0
                };
                
                var aSlot = this[a];
                var bSlot = this[b];
                
                if(aSlot && aSlot.allegiance) {
                    var aSlot_allegiance = aSlot.allegiance;
                    while(aSlot && aSlot.allegiance === aSlot_allegiance) {
                        results[aSlot_allegiance]++;
                        aSlot = aSlot[a];
                    }
                }
                
                if(bSlot && bSlot.allegiance) {
                    var bSlot_allegiance = bSlot.allegiance;                    
                    while(bSlot && bSlot.allegiance === bSlot_allegiance){
                        results[bSlot_allegiance]++;
                        bSlot = bSlot[b];
                    }
                }
                
                //Connections of 3 or more all go into 3
                if(results.player > 1) player[results.player > 3 ? 3 : results.player].push(i);
                if(results.ai) ai[results.ai > 3 ? 3 : results.ai].push(i);
                
            }
            
            return {
                player: player,
                ai: ai
            };
            
        },
        
        changeAllegiance: function(player, cb) {
            var self = this;
            
            var callback = cb || function() {
                var con = self.findConnections();
                
                var m = player ? "Well done! You beat me, though I wasn't really trying... " : "Bad luck, that was a really good try! ";
                var key = player ? "player" : "ai";
                
                //Didn't win
                if(!con[key][3].length) {
                    _turn = player;
                    return;
                }
                
                //Won! Change the winning coins to their respective colour
                var dir = con[key][3][0];
                var dirA = _directionMap[dir].a;
                var dirB = _directionMap[dir].b;                   
                var nextA = self[dirA];
                var nextB = self[dirB];
                
                var count = 1;
                $(self.coin).addClass("win");
                
                while(nextA && nextA.allegiance === key && count < 5) {
                    $(nextA.coin).addClass("win");
                    nextA = nextA[dirA];
                    count++;
                }
                
                while(nextB && nextB.allegiance === key && count < 5) {
                    $(nextB.coin).addClass("win");
                    nextB = nextB[dirB];
                    count++;
                }                 
                              
                endGame(m, player);                         
            };
            
            var coin = document.createElement("div");
            $(coin).addClass("coin");
            
            if(player) {
                $(coin).addClass("coin_player");
                this.allegiance = "player";
            }
            else {
                $(coin).addClass("coin_ai");
                this.allegiance = "ai";
            }
            
            var desiredY = _game_height/_rows*this.y + 3;
            
            coin.style.left = _game_width/_cols*this.x + 3 + "px";
            coin.style.top = -68 + "px";
            
            _game_redraw.appendChild(coin);
            
            animate(coin, desiredY, callback);
            
            this.coin = coin;
        }
        
    };
    
    function animate(coin, y, cb) {
        var currY = -74;
        var fallspeed = 1;
        var fps = 60;
        var acceleration = 9.8/.15/fps; //Estimate scale around 15cm, 9.8ms/s (gravity), 60fps
        
        var t = setInterval(function() {
            currY += fallspeed;
            fallspeed += acceleration;
            
            if(currY < y) {
                coin.style.top = currY + "px";
            }
            else {
                clearInterval(t);
                coin.style.top = y + "px";
                cb();
            }
        },1/fps*1000);
    }
    
    /* This function accepts a slot object, and will cycle
     * through every slot below the given slot until it finds
     * the bottom-most empty slot, then return it.
     */
    function find_next_available_slot(slot) {
        //Cycle through column to find first available slot
        var prev_slot;
        while(slot && !slot.allegiance) {
            prev_slot = slot;
            slot = slot.s;
        }
        
        return prev_slot;
    }
    
    /* This function is what a player directly calls
     * after selecting a column to insert a coin into
     */
    function insertCoin(col) {
        
        //NOT YOUR TURN!
        if(_turn) return;
        
        var slot = _slots[0];
        
        for(var i = 1; i < col; i++) {
            slot = slot.e;
        }
        
        slot = find_next_available_slot(slot);
        
        if(!slot) return;
        
        //Slot is valid so set turn
        _turn = !_turn;
        
        slot.changeAllegiance(true);
        
        //Update total move count
        _moves++;
        _move_count.innerHTML = _moves;
        
        setTimeout(AI_nextmove, 1000);
    }
    
    /* This function runs AI logic */
    function AI_nextmove() {
        
        //Check if game is over
        if(_game_over) return;
        
        //PRIORITY ARRAYS
        //Contains all attacking possibilities
        var attack = {
            1: [],
            2: [],
            3: []
        };
        
        //Contains all defending possibilities
        var defend = {
            2: [],
            3: []
        };
        
        var availableSlots = []; //Array containing all available slots
        
        //For each bottom-most empty slot, check for connects
        var slot = _slots[0];
        
        while(slot) {
            var s = find_next_available_slot(slot);
            
            if(s) {
                var cons = s.findConnections();
                availableSlots.push(s);
                /* Here I sort the possibilities per slot
                 * into priority arrays attack and defend
                 * while adding a reference to the slot
                 */
                
                //Keys, player, ai
                for(var x in cons) {
                    //Keys, 1, 2, 3
                    for(var z in cons[x]) {
                        //Arrays
                        for(var i = 0; i < cons[x][z].length; i++) {
                            var o = {
                                s: s,
                                dir: cons[x][z][i]
                            };
                            
                            if(x === "ai") attack[z].push(o);
                            else defend[z].push(o);
                        }
                    }
                }
                             
            }   
                                      
            slot = slot.e;
        }       
        
        //Randomize all arrays to add an element of randomness to AI playstyle
        for(var i in attack) {
            attack[i].sort(randomizeArray);
        }
        for(var i in defend) {
            defend[i].sort(randomizeArray);
        }
        availableSlots.sort(randomizeArray);
        
        //Prioritise next move
        
        //If ai has any connections of 3, win the game!
        if(attack[3].length) {
            attack[3][0].s.changeAllegiance(false);            
            return;
        }
        
        //If player has connections of 3, block!
        if(defend[3].length) {
            defend[3][0].s.changeAllegiance(false);           
            return;
        }
        
        //If player has connections of 2, block! 
        for(var i = 0; i < defend[2].length; i++) {
            if(check_next_move(defend[2][i], true, 0)) {
                defend[2][i].s.changeAllegiance(false);
                return;
            }
        }              

        //Attack for the remaining connections where possible
        for(var z = 2; z > 0; z--) {
            for(var i = 0; i < attack[z].length; i++) {
                if(check_next_move(attack[z][i], false, 0)) {
                    attack[z][i].s.changeAllegiance(false);
                    return;
                }
            }                
        }                                        
            
        
        /* Uh oh, looks like no moves are possible, or there
         * are no slots with any connections.
         * Or not possible to win, try to insert into each row

         * First time try to place a coin without allowing
         * the player to block an AI connect 4. Second time just try to place a coin
         * without losing.
        */
       
        for(var z = 1; z < 3; z++) {
            for(var i = 0; i < availableSlots.length; i++) {
                if(check_next_move({s:availableSlots[i]}, false, z)) {
                    availableSlots[i].changeAllegiance(false);
                    return;
                }
            }
        }
        
        /* Looks like I'm going to lose! Lets choose a slot at random and
         * hope the human doesn't notice...
        */
        if(availableSlots.length) {
            availableSlots[0].changeAllegiance(false);
            return;
        }
        
        endGame("Holy moly its a draw! ");    
  
    }
    
    //Used to add an element of randomness to AI actions
    function randomizeArray(a,b) {
        return Math.ceil(Math.random()*3) - 2;
    }
    
    function check_next_move(o, player, level) {      
        /* 
         * LEVEL 0 - CHECK ALL
         * LEVEL 1 - DONT CHECK IF CONNECT 4 IS POSSIBLE
         * LEVEL 2 - ONLY CHECK IF PLAYER WILL WIN NEXT MOVE
         */
        
        var slot = o.s;
        
        //Here we check if the slot above has 3 connections to either the Player's coins or AI based on the player param.
        if(slot.n) {
            if(slot.n.findConnections().player[3].length) return false; //Check that player won't win after move
           
            if(level < 2) if(slot.n.findConnections().ai[3].length) return false; //Check that ai doesn't allow player to block a connect 4        
        }
        
        //Return true if not bothering to check if connecting 4 is possible
        if(level > 0) return true;

        return possible(o, player);
    }
    
    function possible(o, player) {
        
        var slot = o.s;
        //Check if possible to get a connect 4
        var poss = 1;
        
        var dirA = _directionMap[o.dir].a;
        var dirB = _directionMap[o.dir].b;
        
        var nextA = slot[dirA];
        var nextB = slot[dirB];
        
        var allegiance = player ? "player" : "ai";
        
        while(nextA || nextB && poss < 4) {
            if(nextA) {
                //alert("A: " + nextA.allegiance);
                if(!nextA.allegiance || nextA.allegiance === allegiance) {
                    poss++;
                    nextA = nextA[dirA];
                }
                else nextA = null;
            }
            
            if(nextB) {
                //alert("B: " + nextB.allegiance);
                if(!nextB.allegiance || nextB.allegiance === allegiance) {
                    poss++;
                    nextB = nextB[dirB];
                }
                else nextB = null;
            }         
        }
        
        if(poss < 4) return false;
        
        return true;
    }
    
    function setCookie(name,value,days) {
        if (days) {
            var date = new Date();
            date.setTime(date.getTime()+(days*24*60*60*1000));
            var expires = "; expires="+date.toGMTString();
        }
        else var expires = "";
        document.cookie = name+"="+value+expires+"; path=/";
    }
    
    function getCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
    }    
    
    
    //On document ready, exec build
    $(build);
    
    //Expose public methods
    window.connect4 = {        
        insertCoin: insertCoin     
    };
    
})(liquid);
