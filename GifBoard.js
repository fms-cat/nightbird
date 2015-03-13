// reference : http://www.tohoho-web.com/wwwgif.htm

var GifBoard = function( _file ){

	this.canvas = document.createElement( 'canvas' );
	this.canvas.width = 512;
	this.canvas.height = 512;
	this.context = this.canvas.getContext( '2d' );

	this.frames = [];

	var reader = new FileReader();
	var name = _file.name;

	var gifBoard = this;
	reader.onload = function(){

		var dv = new DataView( reader.result );
		var dataIndex = [];

		var offset = 0;
		/* magic number 'GIF' */ offset += 3;
		var gifVersion = getAscii( offset, 3 ); offset += 3;
		if( gifVersion == '89a' ){
			gifBoard.width = dv.getUint16( offset, 2, true ); offset += 2;
			gifBoard.height = dv.getUint16( offset, 2, true ); offset += 2;
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
				gifBoard.frames[i-1] = new Image();
				gifBoard.frames[i-1].src = window.URL.createObjectURL( blob );
				i ++;
			}
			gifBoard.length = i;
		}else{
			gifBoard.width = dv.getUint16( offset, 2, true ); offset += 2;
			gifBoard.height = dv.getUint16( offset, 2, true ); offset += 2;
			var blob = new Blob( [ dv ], { "type" : "image/gif" } );
			gifBoard.frames[0] = new Image();
			gifBoard.frames[0].src = window.URL.createObjectURL( blob );
			gifBoard.length = 1;
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

};

GifBoard.prototype.setSize = function( _w, _h ){

	this.canvas.width = _w;
	this.canvas.height = _h;

}

GifBoard.prototype.draw = function( _time ){

	var frame = 0;
	if( _time == 0 ){ frame = 0; }
	else if( _time < 1 ){ frame = ~~( _time*this.length ); }
	else{ frame = ~~( _time%this.length ); }
	if( this.frames[ frame ] ){
		var x = Math.max( (this.width-this.height)/2, 0 );
		var y = Math.max( (this.height-this.width)/2, 0 );
		var s = Math.min( this.width, this.height );
		this.context.drawImage( this.frames[ frame ], x, y, s, s, 0, 0, this.canvas.width, this.canvas.height );
	}

};
