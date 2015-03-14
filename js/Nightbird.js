var Nightbird = function(){

	var nightbird = this;

	nightbird.subWindow = window.open( 'about:blank', 'sub', 'width=512,height=512,menubar=no' );
	nightbird.subWindow.document.body.style.padding = 0;
	nightbird.subWindow.document.body.style.margin = 0;

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
					if( connector.link ){
						nightbird.links.splice( nightbird.links.indexOf( connector.link ), 1 );
						connector.link.remove();
					}
					var link = new Nightbird.Link( nightbird, connector );
					connector.setLink( link );
					nightbird.links.push( link );
					nightbird.grabLink = link;
					return;
				}
			}
			for( var ic=0; ic<node.outputs.length; ic++ ){
				var connector = node.outputs[ic];
				if( dist( connector.posX, connector.posY, mx, my ) < connector.radius ){
					if( connector.link ){
						nightbird.links.splice( nightbird.links.indexOf( connector.link ), 1 );
						connector.link.remove();
					}
					var link = new Nightbird.Link( nightbird, connector );
					connector.setLink( link );
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
			var link = nightbird.grabLink;
			nightbird.grabLink = null;

			for( var i=link.nightbird.nodes.length-1; 0<=i; i-- ){
				var node = link.nightbird.nodes[i];
				if( link.grabStart ){
					for( var ic=0; ic<node.outputs.length; ic++ ){
						var connector = node.outputs[ic];
						if( dist( connector.posX, connector.posY, link.grabX, link.grabY ) < connector.radius ){
							if( connector.type == link.type ){
								if( connector.link ){
									nightbird.links.splice( nightbird.links.indexOf( connector.link ), 1 );
									connector.link.remove();
								}
								link.start = connector;
								connector.setLink( link );
								link.grabStart = false;
								return;
							}
						}
					}
				}
				if( link.grabEnd ){
					for( var ic=0; ic<node.inputs.length; ic++ ){
						var connector = node.inputs[ic];
						if( dist( connector.posX, connector.posY, link.grabX, link.grabY ) < connector.radius ){
							if( connector.type == link.type ){
								if( connector.link ){
									nightbird.links.splice( nightbird.links.indexOf( connector.link ), 1 );
									connector.link.remove();
								}
								link.end = connector;
								connector.setLink( link );
								link.grabEnd = false;
								return;
							}
						}
					}
				}
			}

			link.remove();
			link.nightbird.links.splice( link.nightbird.links.indexOf( link ), 1 );

			function dist( _x1, _y1, _x2, _y2 ){
				return Math.sqrt( (_x2-_x1)*(_x2-_x1)+(_y2-_y1)*(_y2-_y1) );
			}
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

	this.master = new Nightbird.MasterNode( nightbird );
	nightbird.nodes.push( this.master );
	nightbird.subWindow.document.body.appendChild( this.master.canvas );

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
