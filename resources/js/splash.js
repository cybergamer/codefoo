//Need a function to optimally place my splash content vertically
(function($) {
    
    function placeVertical() {
        var wrapper = document.getElementById("splash_wrapper");
        if(!wrapper) return;
        
        var bHeight = $(window).height();
        
        //I want the middle of the gray strip to align with the golden ratio
        var yOffset = bHeight*.375 - 640/2;
        
        wrapper.style.marginTop = yOffset + "px";
    }
    
    //Bind to events
    $(placeVertical);
    $(window).resize(placeVertical);
    
    
})(jQuery);
