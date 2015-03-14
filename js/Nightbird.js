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
	nightbird.links = [];

	nightbird.grabNode = null;
	nightbird.grabLink = null;
	nightbird.grabOffsetX = 0;
	nightbird.grabOffsetY = 0;

	nightbird.modular.addEventListener( 'mousedown', function( _e ){
		var mx = _e.layerX;
		var my = _e.layerY;

		for( var i=nightbird.nodes.length-1; 0<=i; i-- ){
			var node = nightbird.nodes[i];
			if( 0 < mx-node.posX && mx-node.posX < node.width && 0 < my-node.posY && my-node.posY < node.height ){
				nightbird.grabOffsetX = mx-node.posX;
				nightbird.grabOffsetY = my-node.posY;
				nightbird.grabNode = node;
				nightbird.nodes.push( nightbird.nodes.splice( i, 1 )[0] );
				return;
			}
			for( var ic=0; ic<node.inputs.length; ic++ ){
				var connector = node.inputs[ic];
				if( dist( connector.posX, connector.posY, mx, my ) < connector.radius ){
					var link = new Nightbird.Link( nightbird, connector );
					nightbird.links.push( link );
					nightbird.grabLink = link;
					return;
				}
			}
			for( var ic=0; ic<node.outputs.length; ic++ ){
				var connector = node.outputs[ic];
				if( dist( connector.posX, connector.posY, mx, my ) < connector.radius ){
					var link = new Nightbird.Link( nightbird, connector );
					nightbird.links.push( link );
					nightbird.grabLink = link;
					return;
				}
			}

			function dist( _x1, _y1, _x2, _y2 ){
				return Math.sqrt( (_x2-_x1)*(_x2-_x1)+(_y2-_y1)*(_y2-_y1) );
			}
		}
	}, false );

	nightbird.modular.addEventListener( 'mouseup', function( _e ){
		if( nightbird.grabNode ){
			nightbird.grabNode = null;
		}
		if( nightbird.grabLink ){
			nightbird.grabLink.release();
			nightbird.grabLink = null;
		}
	}, false );

	nightbird.modular.addEventListener( 'mousemove', function( _e ){
		var mx = _e.layerX;
		var my = _e.layerY;
		if( nightbird.grabNode ){
			nightbird.grabNode.move( mx-nightbird.grabOffsetX, my-nightbird.grabOffsetY );
		}
		if( nightbird.grabLink ){
			nightbird.grabLink.move( mx, my );
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

Nightbird.prototype.draw = function(){

	var nightbird = this;

	nightbird.time = ( +new Date() - nightbird.begint )*1e-3;

	nightbird.modularContext.fillStyle = '#222';
	nightbird.modularContext.fillRect( 0, 0, nightbird.modular.width, nightbird.modular.height );

	for( var node of nightbird.nodes ){
		node.draw();
	}

	for( var link of nightbird.links ){
		link.draw();
	}

};
