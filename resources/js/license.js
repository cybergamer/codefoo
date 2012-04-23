/* LICENSE PLATE JS - CODE FOO 2012 - JAMES BURROUGHS */


(function($, liquid) {
    
    var graph;
    
    var initialCalcs = [1234567890, 3423423, 325085, 16230, 1024, 786, 512, 384, 261, 260, 100, 27, 26, 10]; //These initial calcs will be run on pageready 
    
    function driver(input, skipAnim) {
        
        var population = Number(input);
        
        //If the value given by the user isn't a valid number, return
        if(isNaN(population)) return;
        
        if(!population) return; //Pop = 0
        
        //Go ahead and do calculation
        var bestPattern = crunch(population);
        
        //Create DOM elements
        if(!graph) return;
        
        var wrapper = document.createElement("div");
        wrapper.className = "license_graph_column";  
             
        //Apply colour tone      
        if(bestPattern.percent > 50) {
            wrapper.className += " license_graph_column_red";
        }
        else if(bestPattern.percent > 20) {
            wrapper.className += " license_graph_column_yellow";
        }
        
        var poptext = document.createElement("div");
        poptext.className = "license_graph_pop_text";
        poptext.innerHTML = "Population <strong>" + population + "</strong>";
        
        var patterntext = document.createElement("div");
        patterntext.className = "license_graph_pattern";
        patterntext.innerHTML = bestPattern.pattern;
        
        var excesstext = document.createElement("div");
        excesstext.className = "license_graph_excess_text";
        excesstext.innerHTML = "Excess: <strong>" + bestPattern.excess + "</strong>";
        
        var excessbar = document.createElement("div");
        excessbar.className = "license_graph_excess_bar";
        excessbar.style.width = bestPattern.percent + "%";
        
        wrapper.appendChild(poptext);
        wrapper.appendChild(patterntext);
        wrapper.appendChild(excesstext);
        wrapper.appendChild(excessbar);
        
        if(!skipAnim) $(wrapper).hide();
        
        $(graph).prepend(wrapper);
        
        if(!skipAnim) $(wrapper).slideDown("fast", liquid.redraw);
        else liquid.redraw();
    }
    
    //Computes the best License Plate Pattern
    function crunch(pop) {       
        var runningTotal = 0;
        var l = 26;
        var n = 10;
        var l_power = 0;
        var n_power = 0;
        
        //Determine a limit for the power of N and determine a value to beat
        while(runningTotal <= pop) {
            runningTotal = Math.pow(n,n_power);
            n_power++;
        }
        
        //Save a best result
        var bestResult = new Result(pop, runningTotal, l_power, n_power-1);
        
        if(pop === 1) return bestResult; //Special case for population of 1
        
        /* Now, for each power of n that is less than the limit, keep adding l's until the running total
         * exceeds that of the population size, then check if the value
         * beats the bestResult.
         */
        for(var i = 0, limit = n_power; i < limit; i++) {
            runningTotal = Math.pow(n,i); 
            n_power = i;
            l_power = 1;
            
            while(runningTotal < pop) {
                runningTotal *= l; //Continually multiply by L (26);
                l_power++; //Increment the power count for L
            }
            
            //Check if the runningTotal is better than our bestResult
            var excess = runningTotal - pop;
            if(excess < bestResult.excess) {
                bestResult = new Result(pop, runningTotal, l_power-1, n_power);
                if(excess === 0) break;
            }
        }
        
        return bestResult;
        
    }
    
    //Result class for storing results!
    function Result(pop, total, l_power, n_power) {
        this.excess = total - pop;
        this.percent = Math.round(100 - (pop/total)*100);
        this.pattern = "";
        
        for(var i = 0; i < n_power; i++) {
            this.pattern += "N";
        }
                
        for(var i = 0; i < l_power; i++) {
            this.pattern += "L";
        }

    }
    
    
    //Onready
    $(function() {
        
        //Grab graph wrapper
        graph = document.getElementById("license_graph");
        
        //bind keypress event handler
        var input = document.getElementById("pop_text_input");
        $(input).keypress(function(e) {
            //Here we check for when the user hits <enter>
            var code = (e.keyCode ? e.keyCode : e.which);
            if(code == 13) {
                e.preventDefault();
                driver(this.value);
                this.value = "";
            }
        });
        
        $(input).focus(function() {
           if(this.value === "Enter a population size...") this.value = ""; 
        });
        
        $(input).blur(function() {
            if(this.value == "") this.value = "Enter a population size...";
        });
        
        //Bring input into focus!
        input.focus();
        
        //Run these initial calculations
        for(var i = 0; i < initialCalcs.length; i++) {
            driver(initialCalcs[i], true);
        }
    });
    
    
})(jQuery, liquid);


