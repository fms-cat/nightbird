// reference : http://www.tohoho-web.com/wwwgif.htm

Nightbird.GifNode = function( _nightbird, _file ){

	var gifNode = this;

	Nightbird.Node.call( gifNode, _nightbird );
	gifNode.name = _file.name;
	gifNode.width = 100;
	gifNode.height = 100*gifNode.nightbird.height/gifNode.nightbird.width;

	gifNode.canvas = document.createElement( 'canvas' );
	gifNode.canvas.width = gifNode.nightbird.width;
	gifNode.canvas.height = gifNode.nightbird.height;

	gifNode.context = gifNode.canvas.getContext( '2d' );

	gifNode.frames = [];
	gifNode.frame = 0;
	gifNode.auto = true;

	gifNode.gif = {};

	gifNode.loadGif( _file );

	var outputCanvas = new Nightbird.Connector( nightbird, true, 'canvas' );
	outputCanvas.setName( 'output' );
	outputCanvas.onTransfer = function(){
		return gifNode.canvas;
	};
	gifNode.outputs.push( outputCanvas );
	gifNode.move();
	var inputFrame = new Nightbird.Connector( nightbird, false, 'number' );
	inputFrame.setName( 'frame' );
	inputFrame.onTransfer = function( _data ){
		gifNode.frame = _data;
	};
	gifNode.inputs.push( inputFrame );
	gifNode.move();

	gifNode.contextMenus.unshift( function(){
		var contextMenu = new Nightbird.ContextMenu( gifNode.nightbird );
		contextMenu.setName( ( function(){
			if( gifNode.auto ){ return 'Manual frame'; }
			else{ return 'Auto frame'; }
		}() ) );
		contextMenu.onClick = function(){
			gifNode.auto = !gifNode.auto;
		};
		return contextMenu;
	} );

};

Nightbird.GifNode.prototype = Object.create( Nightbird.Node.prototype );
Nightbird.GifNode.prototype.constructor = Nightbird.GifNode;

Nightbird.GifNode.prototype.loadGif = function( _file ){

	var gifNode = this;

	var reader = new FileReader();
	var name = _file.name;
	reader.onload = function(){

		var dv = new DataView( reader.result );
		var dataIndex = [];

		var offset = 0;
		/* magic number 'GIF' */ offset += 3;
		var gifVersion = getAscii( offset, 3 ); offset += 3;
		if( gifVersion == '89a' ){
			gifNode.gif.width = dv.getUint16( offset, true ); offset += 2;
			gifNode.gif.height = dv.getUint16( offset, true ); offset += 2;
			var gctFlag = ( dv.getUint8( offset )>>>7 );
			var colorRes = ( dv.getUint8( offset )>>>4&7 )+1;
			var gctSize = Math.pow( 2, ( dv.getUint8( offset )&7 )+1 ); offset ++;
			/* bgColorIndex */ offset ++;
			/* pixelAspectRatio */ offset ++;
			/* gct */ if( gctFlag ){ offset += gctSize*3; }

			/* Application Extension Test */
			while( dv.getUint8( offset ) == 0x21 && dv.getUint8( offset+1 ) == 0xff ){
				/* extIntro, extLabel, blockSize, appId, appAuth */ offset += 14;
				while( dv.getUint8( offset ) != 0x00 ){
					offset += 1+dv.getUint8( offset )
				}
				/* terminator */ offset ++;
			}
			dataIndex[0] = offset;

			var i = 1;
			/* Graphic Control Extension test */
			while( dv.getUint8( offset ) == 0x21 && dv.getUint8( offset+1 ) == 0xf9 ){
				/* Graphic Control Extension - to bifFlags */ offset += 4;
				if( !gifNode.gif.delay ){ gifNode.gif.delay = Math.max( dv.getUint16( offset, true ), 1 ); } offset += 2;
				/* transparentIndex, terminator */ offset += 2;
				/* Image Block Separator to Image Height */ offset += 9;
				var lctFlag = ( dv.getUint8( offset )>>>7 );
				var lctSize = Math.pow( 2, ( dv.getUint8( offset )&7 )+1 ); offset ++;
				/* lct */ if( lctFlag ){ offset += lctSize*3; }
				/* lzwMin */ offset ++;
				while( dv.getUint8( offset ) != 0x00 ){
					offset += 1+dv.getUint8( offset )
				}
				/* terminator */ offset ++;
				dataIndex[i] = offset;

				var frame = new DataView( new ArrayBuffer( dataIndex[0] + dataIndex[i] - dataIndex[i-1] ) );
				copyData( frame, 0, 0, dataIndex[0] );
				copyData( frame, dataIndex[i-1], dataIndex[0], dataIndex[i]-dataIndex[i-1] );
				var blob = new Blob( [ frame ], { "type" : "image/gif" } );
				gifNode.frames[i-1] = new Image();
				gifNode.frames[i-1].src = window.URL.createObjectURL( blob );
				i ++;
			}
			gifNode.gif.length = i-1;
		}else{
			gifNode.gif.width = dv.getUint16( offset, true ); offset += 2;
			gifNode.gif.height = dv.getUint16( offset, true ); offset += 2;
			var blob = new Blob( [ dv ], { "type" : "image/gif" } );
			gifNode.frames[0] = new Image();
			gifNode.frames[0].src = window.URL.createObjectURL( blob );
			gifNode.gif.length = 1;
			gifNode.gif.delay = 1;
		}

		function copyData( _to, _fromOffset, _toOffset, _length ){
			for( var i=0; i<_length; i++ ){
				_to.setUint8( _toOffset+i, dv.getUint8( _fromOffset+i ) );
			}
		}

		function getAscii( _offset, _length ){
			var ret = '';
			for( var i=0; i<_length; i++ ){
				var byte = dv.getInt8( _offset+i );
				ret += String.fromCharCode( byte );
			}
			return ret;
		};

	};

	reader.readAsArrayBuffer( _file );

}

Nightbird.GifNode.prototype.draw = function(){

	var gifNode = this;

	if( gifNode.active ){

		var frame = 0;
		if( gifNode.auto ){ frame = Math.floor( ( gifNode.nightbird.time*100/gifNode.gif.delay )%gifNode.gif.length ); }
		else{ frame = Math.floor( ( gifNode.frame%1 )*gifNode.gif.length ); }

		if( gifNode.frames[ frame ] ){
			var x = 0;
			var y = 0;
			var w = gifNode.gif.width;
			var h = gifNode.gif.height;
			if( w/gifNode.canvas.width < h/gifNode.canvas.height ){
				y = (h-(w*gifNode.canvas.height/gifNode.canvas.width))/2;
				h = w*gifNode.canvas.height/gifNode.canvas.width;
			}else{
				x = (w-(h*gifNode.canvas.width/gifNode.canvas.height))/2;
				w = h*gifNode.canvas.width/gifNode.canvas.height;
			}
			var s = Math.min( gifNode.gif.width, gifNode.gif.height );
			gifNode.context.drawImage( gifNode.frames[ frame ], x, y, w, h, 0, 0, gifNode.canvas.width, gifNode.canvas.height );
		}

	}

	gifNode.nightbird.modularContext.drawImage( gifNode.canvas, gifNode.posX, gifNode.posY, gifNode.width, gifNode.height );

	Nightbird.Node.prototype.draw.call( gifNode );

};
