// ----------------------------------------------
//         Copyright 2022 Leonid Petrunya
//              All rights reserved
// ----------------------------------------------
//                 WebPageColor
// ----------------------------------------------

function Color() {}
Color.hexToRgbaArray = function(argColor) {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    argColor = argColor.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });
    
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(argColor);
    return result ? ([
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255,
        1]) : undefined;
}

export {Color};
