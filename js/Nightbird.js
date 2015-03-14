var Nightbird = function(){

	var nightbird = this;

	nightbird.subWindow = window.open( 'about:blank', 'sub', 'menubar=no' );

	nightbird.canvas = document.createElement( 'canvas' );
	nightbird.canvas.width = 128;
	nightbird.canvas.height = 128;
	nightbird.context = nightbird.canvas.getContext( '2d' );

	nightbird.modular = document.createElement( 'canvas' );
	nightbird.modular.width = 128;
	nightbird.modular.height = 128;
	nightbird.modularContext = nightbird.modular.getContext( '2d' );

	nightbird.begint = +new Date();
	nightbird.time = 0;
	nightbird.bpm = 120;

	nightbird.nodes = [];

	nightbird.grabNode = null;
	nightbird.grabOffsetX = 0;
	nightbird.grabOffsetY = 0;
	nightbird.modular.addEventListener( 'mousedown', function( _e ){
		var mx = _e.layerX;
		var my = _e.layerY;
		for( var i = nightbird.nodes.length-1; 0<=i; i-- ){
			var node = nightbird.nodes[i];
			if( Math.abs( mx-node.posX ) < node.width/2 && Math.abs( my-node.posY ) < node.height/2 ){
				nightbird.grabOffsetX = mx-node.posX;
				nightbird.grabOffsetY = my-node.posY;
				nightbird.grabNode = node;
				nightbird.nodes.push( nightbird.nodes.splice( i, 1 )[0] );
				break;
			}
		}
	}, false );
	nightbird.modular.addEventListener( 'mouseup', function( _e ){
		nightbird.grabNode = null;
	}, false );
	nightbird.modular.addEventListener( 'mousemove', function( _e ){
		var mx = _e.layerX;
		var my = _e.layerY;
		if( nightbird.grabNode ){
			nightbird.grabNode.posX = mx-nightbird.grabOffsetX;
			nightbird.grabNode.posY = my-nightbird.grabOffsetY;
		}
	}, false );

	nightbird.input = document.createElement( 'input' );
	nightbird.input.type = 'file';
	nightbird.input.multiple = true;
	nightbird.input.onchange = function( _e ){

		for( var i=0, file; file=_e.target.files[i]; i++ ){

			var ext = '';
			if( /\.([^.]+)$/.test( file.name ) ){
				ext = /\.([^.]+)$/.exec( file.name )[1];
			}else{
				console.error( file.name+' has no extension' );
			}

			if( ext == 'glsl' ){
				var node = new Nightbird.ShaderNode( nightbird, file );
				nightbird.nodes.push( node );
			}else if( ext == 'gif' ){
				var node = new Nightbird.GifNode( nightbird, file );
				nightbird.nodes.push( node );
			}else{
				console.error( file.name+' is unsupported extension' );
			}

		}

	};

};

Nightbird.prototype.setSize = function( _w, _h ){

	var nightbird = this;

	nightbird.canvas.width = _w;
	nightbird.canvas.height = _h;

};

Nightbird.prototype.setModularSize = function( _w, _h ){

	var nightbird = this;

	nightbird.modular.width = _w;
	nightbird.modular.height = _h;

};

Nightbird.prototype.grabNode = function(){

	var nightbird = this;

};

Nightbird.prototype.draw = function(){

	var nightbird = this;

	nightbird.time = ( +new Date() - nightbird.begint )*1e-3;

	nightbird.modularContext.fillStyle = '#888';
	nightbird.modularContext.fillRect( 0, 0, nightbird.modular.width, nightbird.modular.height );

	for( var node of nightbird.nodes ){
		node.draw();
	}

};
