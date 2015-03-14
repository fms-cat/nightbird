// reference : http://www.tohoho-web.com/wwwgif.htm

Nightbird.GifNode = function( _nightbird, _file ){

	var gifNode = this;

	Nightbird.Node.call( gifNode, _nightbird, _file );

	gifNode.canvas = document.createElement( 'canvas' );
	gifNode.canvas.width = 128;
	gifNode.canvas.height = 128;
	gifNode.context = gifNode.canvas.getContext( '2d' );

	gifNode.frames = [];

	var reader = new FileReader();
	var name = _file.name;
	reader.onload = function(){

		var dv = new DataView( reader.result );
		var dataIndex = [];

		var offset = 0;
		/* magic number 'GIF' */ offset += 3;
		var gifVersion = getAscii( offset, 3 ); offset += 3;
		if( gifVersion == '89a' ){
			gifNode.width = dv.getUint16( offset, 2, true ); offset += 2;
			gifNode.height = dv.getUint16( offset, 2, true ); offset += 2;
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
				/* Graphic Control Extension */ offset += 8;
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
			gifNode.length = i;
		}else{
			gifNode.width = dv.getUint16( offset, 2, true ); offset += 2;
			gifNode.height = dv.getUint16( offset, 2, true ); offset += 2;
			var blob = new Blob( [ dv ], { "type" : "image/gif" } );
			gifNode.frames[0] = new Image();
			gifNode.frames[0].src = window.URL.createObjectURL( blob );
			gifNode.length = 1;
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

	gifNode.beat = 4;

};

Nightbird.GifNode.prototype = Object.create( Nightbird.Node.prototype );
Nightbird.GifNode.prototype.constructor = Nightbird.GifNode;

Nightbird.GifNode.prototype.setBeat = function( _b ){

	var gifNode = this;

	gifNode.beat = _b;

};

Nightbird.GifNode.prototype.draw = function(){

	var gifNode = this;

	var frame = ~~( ( gifNode.nightbird.time*gifNode.nightbird.bpm/gifNode.beat )%gifNode.length );

	if( gifNode.frames[ frame ] ){
		var x = Math.max( ( gifNode.width-gifNode.height )/2, 0 );
		var y = Math.max( ( gifNode.height-gifNode.width )/2, 0 );
		var s = Math.min( gifNode.width, gifNode.height );
		gifNode.context.drawImage( gifNode.frames[ frame ], x, y, s, s, 0, 0, gifNode.canvas.width, gifNode.canvas.height );
	}

	Nightbird.Node.prototype.draw.call( gifNode );

};
