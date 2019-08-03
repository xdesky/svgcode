var sketch = require('sketch');
var Rectangle = require('sketch/dom').Rectangle;
var document = sketch.Document.getSelectedDocument();
var layer = document.selectedLayers.layers[0];

export default function(context) {
    var pasteBoard = NSPasteboard.generalPasteboard();
    var svgCode = pasteBoard.stringForType(NSPasteboardTypeString);
    log(svgCode);
    var svgString = NSString.stringWithString(svgCode);
    var checkURL = svgString.substring(0, 4);
    if (checkURL == "<svg") {
        log("svg");
        var svgData = svgString.dataUsingEncoding(NSUTF8StringEncoding);
        insertSVG(svgData);
        log(svgData);
    }else if (checkURL == "http") {
        log("link");
        var checkExtenSvg= svgString.slice(-3);
        if(checkExtenSvg == 'svg'){
            try {
                var url = NSURL.URLWithString(svgString);
                var svgData = NSData.dataWithContentsOfURL(url);
                log(url);
                insertSVG(svgData);
            } catch (e) {
                log("Exception: " + e);
            }
        }else {
            context.document.showMessage("Not find SVG!");
        }

    }else{
        context.document.showMessage("Not find SVG!");
    }

    function parentOffsetInArtboard(layer) {
        var offset = {x: 0, y: 0};
        var parent = layer.parent;
        while (parent.name && parent.type !== 'Artboard') {
            offset.x += parent.frame.x;
            offset.y += parent.frame.y;
            parent = parent.parent;
        }
        return offset;
    }

    function positionInArtboard(layer, x, y) {
        var parentOffset = parentOffsetInArtboard(layer);
        var newFrame = new Rectangle(layer.frame);
        newFrame.x = x - parentOffset.x;
        newFrame.y = y - parentOffset.y;
        layer.frame = newFrame;
    }

    function insertSVG(svgData) {
        var svgImporter = MSSVGImporter.svgImporter();
        svgImporter.prepareToImportFromData(svgData);
        var svgLayer = svgImporter.importAsLayer();
        svgLayer.setName('SVG Layer');
        context.document.currentPage().currentArtboard().addLayers([svgLayer]);
        var layer = doc.getLayersNamed('SVG Layer').pop();
        var canvasView = context.document.contentDrawView();
        var center = canvasView.viewCenterInAbsoluteCoordinatesForViewPort(canvasView.viewPort());
        var shiftX = layer.frame.width / 2;
        var shiftY = layer.frame.height / 2;
        var centerX = center.x - shiftX;
        var centerY = center.y - shiftY;
        positionInArtboard(layer, centerX, centerY);
        context.document.showMessage("SVG imported!");
    }

}
