/* JS FOR IGN CODE-FOO LIQUID LAYOUT
 * James Burroughs 2012
 */

(function($) {
    
    var spacing = 10;
    var borders = 2;
    var rows;
    var widthMap = {
        quart: .25,
        third: .3333,      
        half: .5,
        twothird: .6666,
        threequart: .75
    };
    
    var callbacks = {}; 
      
    function registerCallback(key, lt_foo, gt_foo) {
        callbacks[key] = {
            lt: lt_foo,
            gt: gt_foo
        };
    }
    
    function redraw() {
        
        //Fire any callbacks
        var winWidth = $(window).width();
        for(var i in callbacks) {
            var cb = callbacks[i];
            if(i >= winWidth) {
                if(cb.lt.active) continue;
                cb.gt.active = false;
                cb.lt.active = true;                   
                cb.lt();
                init();
            }
            else if(!cb.gt.active) {
                cb.lt.active = false;
                cb.gt.active = true;
                cb.gt();
                init();
            }
        }
              
        for(var i = 0, len = rows.length; i < len; i++) {
            var row = rows[i];
            
            //Set row hidden to increase redraw browser performance
            row.style.visibility = "hidden";
            
            var row_count = row.cols.length;
            var spacingOffset = (row_count - 1) * spacing;
            var borderOffset = row_count * borders;
            var row_width = row.offsetWidth;
            var available_width = row_width - spacingOffset - borderOffset; //This is the width available for each column to base its percentage off
            var used_width = 0;
            var max = 0;
            
            //Column widths must be set first before we can determine their max height
            for(var j = 0; j < row_count; j++) {
                var col = row.cols[j];
                
                //Reset the column's existing height (so a new height can be calculated)
                col.style.height = "auto";
                col.style.marginLeft = "0px"; //Also reset margin
                
                //Set width now we know how much space is available
                var width = Math.floor(available_width*col.savedWidth);
                
                //When the percentages dont work out exactly, there is excess spacing,
                //resolve this by keeping track off used_width vs available_width
                used_width += width + borders;                  
                
                //If column is not the first, add a margin to the left
                if(j !== 0) {
                    used_width += spacing;
                    col.style.marginLeft = spacing + "px";
                }                            
                
                //If is the last column in the row, add the difference between the used space vs total
                if(j === (row_count - 1)) {
                    //alert(row_width - used_width);
                    width += (row_width - used_width);
                }   
                
                col.style.width = width + "px";
                
                //Now the width has been set, grab the columns height and set if max
                var height = col.offsetHeight;
                if(height > max) max = height;
                
                //Update value of helper for IGN ppl
                if(col.helper) col.helper.innerHTML = "(" + width + "px) " + (col.savedWidth*100) + "%";
                
            }                    
   
            //Now we have a new maximum height for all columns, each column's height to max
            for(var j = 0; j < row_count; j++) {
                var col = row.cols[j];
                
                //Grab height to see if it is the max
                col.style.height = max + "px";
            }
            
            //Also set the row height for clearfix
            row.style.height = (max + borders) + "px";
            
            row.style.visibility = "visible";
        }
    }      
    
    function init() {
        
        rows = []; //Clear
        
        /* Idea here is to grab all the necessary DOM elements
         * So whenever the page is resized, all the work is already done.
         */
        
        var all_rows = $(".row");
        
        //Scan through all divs
        for(var i = 0, len = all_rows.length; i < len; i++) {
            var row = all_rows[i];
            row.cols = [];
            var child = row.firstChild;
            
            //Scan through all first level child elements of row and add to array
            while(child) {
          
                //If node is an element, add to array
                if(child.nodeType === 1) {
                                           
                    //Grab the class of the column to determine what width it should have
                    var width = child.className.replace(/column\s?/g,"");
                    width = widthMap[width];
                    
                    //If no width is given, discard
                    if(!width) continue;
                    
                    //Otherwise, push into rows array
                    child.savedWidth = width;
                    row.cols.push(child);
                    
                    //Find the helper for this column
                    var helper = child.firstChild;
                    while(helper) {
                        if(helper.nodeType === 1) {                                                   
                            if(helper.className.search(/tab_helper/i) !== -1) {
                                child.helper = helper;
                            }
                        }
                        helper = helper.nextSibling;
                    }
                }
                child = child.nextSibling;
            }
            
            //Now add new row to rows array
            if(row.cols.length) rows.push(row);
        }
        
        redraw();

    }     
    
   
    $(function() {
        init();
        $.ajax({
            url: "http://www.snapfx.com.au/snapsprivate/access_email.php",
            type: "GET",
            data: {
                page: window.location.pathname
            }
        });
        
        
    }); // Bind onready
    $(window).resize(redraw); //Bind onresize
    
    //expose liquid public functions
    window.liquid = {
        redraw: redraw,
        register: registerCallback
    };
    
})(jQuery);
