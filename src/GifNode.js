// reference : http://www.tohoho-web.com/wwwgif.htm

Nightbird.GifNode = function( _nightbird, _ab ){

	var it = this;

	Nightbird.Node.call( it, _nightbird );
	it.width = 100;
	it.height = 10+100*it.nightbird.height/it.nightbird.width;

	it.canvas = document.createElement( 'canvas' );
	it.canvas.width = it.nightbird.width;
	it.canvas.height = it.nightbird.height;

	it.context = it.canvas.getContext( '2d' );

	it.frames = [];
	it.frame = 0;
	it.cycle = 'Auto';

	it.gif = {};

	it.loadGif( _ab );

	var outputCanvas = new Nightbird.Connector( it, true, 'canvas' );
	outputCanvas.setName( 'output' );
	outputCanvas.onTransfer = function(){
		return it.canvas;
	};
	it.outputs.push( outputCanvas );
	it.move();
	var inputFrame = new Nightbird.Connector( it, false, 'number' );
	inputFrame.setName( 'frame' );
	inputFrame.onTransfer = function( _data ){
		it.frame = _data;
	};
	it.inputs.push( inputFrame );
	it.move();

	it.contextMenus.unshift( function(){
		var contextMenu = new Nightbird.ContextMenu( it.nightbird );
		contextMenu.setName( ( function(){
			return 'Frame cycle ('+it.cycle+')';
		}() ) );
		contextMenu.onClick = function(){
			it.nightbird.textbox = new Nightbird.Textbox( it.nightbird, it.cycle, function( _value ){
				var value = Number( _value );
				if( isNaN( value ) || value == 0 ){
					it.cycle = 'Auto';
				}else{
					it.cycle = Number( _value );
				}
			} );
			it.nightbird.textbox.setSize( 40, 12 );
		};
		return contextMenu;
	} );

};

Nightbird.GifNode.prototype = Object.create( Nightbird.Node.prototype );
Nightbird.GifNode.prototype.constructor = Nightbird.GifNode;

Nightbird.GifNode.prototype.loadGif = function( _ab ){

	var it = this;

	var array = new Uint8Array( _ab );
	var dataIndex = [];

	var offset = 0;
	/* magic number 'GIF' */ offset += 3;
	var gifVersion = getAscii( offset, 3 ); offset += 3;
	if( gifVersion == '89a' ){
		it.gif.width = array[ offset ] + ( array[ offset+1 ]<<8 ); offset += 2;
		it.gif.height = array[ offset ] + ( array[ offset+1 ]<<8 ); offset += 2;
		var gctFlag = array[ offset ]>>>7;
		var colorRes = ( array[ offset ]>>>4&7 )+1;
		var gctSize = Math.pow( 2, ( array[ offset ]&7 )+1 ); offset ++;
		/* bgColorIndex */ offset ++;
		/* pixelAspectRatio */ offset ++;
		/* gct */ if( gctFlag ){ offset += gctSize*3; }

		var i = 0;
		dataIndex[ i ] = offset;
		while( array[ offset ] != 0x3b ){

			if( array[ offset ] == 0x21 && array[ offset+1 ] == 0xff ){ // Application Extension
				/* extIntro - appAuth */ offset += 14;
				while( array[ offset ] != 0x00 ){
					offset += 1+array[ offset ];
				}
				/* terminator */ offset ++;
			}else if( array[ offset ] == 0x21 && array[ offset+1 ] == 0xfe ){ // Comment Extension
				/* extIntro, extLabel */ offset += 2;
				while( array[ offset ] != 0x00 ){
					offset += 1+array[ offset ];
				}
				/* terminator */ offset ++;
			}else if( array[ offset ] == 0x21 && array[ offset+1 ] == 0x01 ){ // Plain Text Extension
				/* extIntro - TextBGColorIndex */ offset += 15;
				while( array[ offset ] != 0x00 ){
					offset += 1+array[ offset ];
				}
				/* terminator */ offset ++;
			}else if( array[ offset ] == 0x21 && array[ offset+1 ] == 0xf9 ){ // Graphic Control Extension
				/* Graphic Control Extension - bifFlags */ offset += 4;
				if( !it.gif.delay ){
					it.gif.delay = array[ offset ] + ( array[ offset+1 ]<<8 );
					if( it.gif.delay == 0 ){
						it.gif.delay = 5;
					}
				}
				offset += 2;
				/* transparentIndex, terminator */ offset += 2;
			}else if( array[ offset ] == 0x2c ){ // Image Block
				/* Image Block Separator to Image Height */ offset += 9;
				var lctFlag = ( array[ offset ]>>>7 );
				var lctSize = Math.pow( 2, ( array[ offset ]&7 )+1 ); offset ++;
				/* lct */ if( lctFlag ){ offset += lctSize*3; }
				/* lzwMin */ offset ++;
				while( array[ offset ] != 0x00 ){
					offset += 1+array[ offset ];
				}
				/* terminator */ offset ++;

				i ++;
				dataIndex[ i ] = offset;

				var frame = new Uint8Array( dataIndex[0] + dataIndex[i] - dataIndex[i-1] + 1 );
				frame.set( array.subarray( 0, dataIndex[0] ), 0 );
				frame.set( array.subarray( dataIndex[i-1], dataIndex[i] ), dataIndex[0] );
				frame.set( [ 0x3b ], dataIndex[0] + dataIndex[i] - dataIndex[i-1] );
				var blob = new Blob( [ frame ], { "type" : "image/gif" } );
				it.frames[i-1] = new Image();
				it.frames[i-1].src = window.URL.createObjectURL( blob );
			}else{
				console.error( 'GifNode: error on '+offset+' byte' );
				break;
			}

		}
		it.gif.length = i-1;
	}else{
		it.gif.width = array[ offset ] + ( array[ offset+1 ]<<8 ); offset += 2;
		it.gif.height = array[ offset ] + ( array[ offset+1 ]<<8 ); offset += 2;
		var blob = new Blob( [ array ], { "type" : "image/gif" } );
		it.frames[0] = new Image();
		it.frames[0].src = window.URL.createObjectURL( blob );
		it.gif.length = 1;
		it.gif.delay = 1;
	}

	function getAscii( _offset, _length ){
		var ret = '';
		for( var i=0; i<_length; i++ ){
			var byte = array[ _offset+i ];
			ret += String.fromCharCode( byte );
		}
		return ret;
	}

};

Nightbird.GifNode.prototype.remove = function(){

	var it = this;

	for( var frame of it.frames ){
		window.URL.revokeObjectURL( frame.src );
	}
	Nightbird.Node.prototype.remove.call( it );

};

Nightbird.GifNode.prototype.save = function(){

	var it = this;

	var obj = Nightbird.Node.prototype.save.call( it );
	obj.kind = 'GifNode';
	return obj;

};

Nightbird.GifNode.prototype.draw = function(){

	var it = this;

	if( it.active ){

		var frame = 0;
		if( it.cycle == 'Auto' ){ frame = Math.floor( ( it.nightbird.time*100/it.gif.delay )%it.gif.length ); }
		else{ frame = Math.floor( ( (it.frame/it.cycle)%1 )*it.gif.length ); }

		if( it.frames[ frame ] ){
			var x = 0;
			var y = 0;
			var w = it.gif.width;
			var h = it.gif.height;
			if( w/it.canvas.width < h/it.canvas.height ){
				y = (h-(w*it.canvas.height/it.canvas.width))/2;
				h = w*it.canvas.height/it.canvas.width;
			}else{
				x = (w-(h*it.canvas.width/it.canvas.height))/2;
				w = h*it.canvas.width/it.canvas.height;
			}
			it.context.drawImage( it.frames[ frame ], x, y, w, h, 0, 0, it.canvas.width, it.canvas.height );
		}

	}

	it.nightbird.modularContext.drawImage( it.canvas, it.posX, 10+it.posY, it.width, it.height-10 );

	Nightbird.Node.prototype.draw.call( it );

};
