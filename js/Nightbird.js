var Nightbird = function(){

	var nightbird = this;

	nightbird.width = 512;
	nightbird.height = 512/16*9;

	nightbird.subWindow = window.open( 'about:blank', 'sub', 'width='+nightbird.width+',height='+nightbird.height+',menubar=no' );
	nightbird.subWindow.document.body.style.padding = 0;
	nightbird.subWindow.document.body.style.margin = 0;

	nightbird.modular = document.createElement( 'canvas' );
	nightbird.modular.width = 512;
	nightbird.modular.height = 512;
	nightbird.modularContext = nightbird.modular.getContext( '2d' );

	nightbird.begint = +new Date();
	nightbird.time = 0;
	nightbird.bpm = 120;

	nightbird.nodes = [];
	nightbird.links = [];
	nightbird.contextMenus = [];

	nightbird.grabNode = null;
	nightbird.grabLink = null;
	nightbird.selectContextMenu = null;
	nightbird.grabOffsetX = 0;
	nightbird.grabOffsetY = 0;
	nightbird.contextMenuRectX1 = 0;
	nightbird.contextMenuRectY1 = 0;
	nightbird.contextMenuRectX2 = 0;
	nightbird.contextMenuRectY2 = 0;
	nightbird.contextMenuRect = false;
	nightbird.contextTargets = [];

	nightbird.textbox = null;

	nightbird.modular.addEventListener( 'mousedown', function( _e ){

		_e.preventDefault();

		var mx = _e.layerX;
		var my = _e.layerY;

		if( nightbird.textbox ){
			nightbird.textbox.remove();
		}

		if( _e.which == 1 ){

			for( var i=0; i<nightbird.contextMenus.length; i++ ){
				var contextMenu = nightbird.contextMenus[i];
				if( 0 <= mx-contextMenu.posX && mx-contextMenu.posX < contextMenu.width && 0 <= my-contextMenu.posY && my-contextMenu.posY < contextMenu.height ){
					nightbird.selectContextMenu = contextMenu;
					contextMenu.selected = true;
					return;
				}
			}
			nightbird.contextMenus = [];
			nightbird.contextTargets = [];

			for( var i=nightbird.nodes.length-1; 0<=i; i-- ){
				var node = nightbird.nodes[i];
				if( 0 <= mx-node.posX && mx-node.posX < node.width && 0 <= my-node.posY && my-node.posY < node.height ){
					if(	typeof node.operate != 'function' || !node.operate( mx-node.posX, my-node.posY ) ){
						nightbird.grabOffsetX = mx-node.posX;
						nightbird.grabOffsetY = my-node.posY;
						nightbird.grabNode = node;
						nightbird.nodes.push( nightbird.nodes.splice( i, 1 )[0] );
					}
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
			}

		}else if( _e.which == 3 ){

			nightbird.contextMenus = [];
			nightbird.contextTargets = [];

			for( var i=nightbird.nodes.length-1; 0<=i; i-- ){
				var node = nightbird.nodes[i];
				for( var ic=0; ic<node.inputs.length; ic++ ){
					var connector = node.inputs[ic];
					if( dist( connector.posX, connector.posY, mx, my ) < connector.radius ){
						if( connector.link ){
							nightbird.links.splice( nightbird.links.indexOf( connector.link ), 1 );
							connector.link.remove();
							return;
						}
					}
				}
				for( var ic=0; ic<node.outputs.length; ic++ ){
					var connector = node.outputs[ic];
					if( dist( connector.posX, connector.posY, mx, my ) < connector.radius ){
						for( var i=connector.link.length-1; 0<=i; i-- ){
							nightbird.links.splice( nightbird.links.indexOf( connector.link[i] ), 1 );
							connector.link[i].remove();
						}
						return;
					}
				}
			}

			nightbird.contextMenuRect = true;
			nightbird.contextMenuRectX1 = mx;
			nightbird.contextMenuRectY1 = my;
			nightbird.contextMenuRectX2 = mx;
			nightbird.contextMenuRectY2 = my;

		}

		function dist( _x1, _y1, _x2, _y2 ){
			return Math.sqrt( (_x2-_x1)*(_x2-_x1)+(_y2-_y1)*(_y2-_y1) );
		}
	}, false );

	nightbird.modular.addEventListener( 'mouseup', function( _e ){

		_e.preventDefault();

		if( _e.which == 1 ){

			if( nightbird.selectContextMenu ){
				nightbird.selectContextMenu.onClick();
				nightbird.selectContextMenu.selected = false;
				nightbird.selectContextMenu = null;
				nightbird.contextMenus = [];
				nightbird.contextTargets = [];
			}

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
									if( link.end.link ){
										nightbird.links.splice( nightbird.links.indexOf( link.end.link ), 1 );
										link.end.link.remove();
									}
									link.start = connector;
									connector.setLink( link );
									link.end.setLink( link );
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
									link.start.setLink( link );
									link.grabEnd = false;
									return;
								}
							}
						}
					}
				}

				link.nightbird.links.splice( link.nightbird.links.indexOf( link ), 1 );

				function dist( _x1, _y1, _x2, _y2 ){
					return Math.sqrt( (_x2-_x1)*(_x2-_x1)+(_y2-_y1)*(_y2-_y1) );
				}
			}

		}else if( _e.which == 3 ){

			if( nightbird.contextMenuRect ){

				var single = ( Math.abs( nightbird.contextMenuRectX2-nightbird.contextMenuRectX1 ) < 5 && Math.abs( nightbird.contextMenuRectY2-nightbird.contextMenuRectY1 ) < 5 );
				var selects = [];

				for( var i=nightbird.nodes.length-1; 0<=i; i-- ){
					var node = nightbird.nodes[i];
					var x1 = nightbird.contextMenuRectX1;
					var y1 = nightbird.contextMenuRectY1;
					var x2 = nightbird.contextMenuRectX2;
					var y2 = nightbird.contextMenuRectY2;
					var x = Math.min( x1, x2 );
					var y = Math.min( y1, y2 );
					var w = Math.abs( x2-x1 );
					var h = Math.abs( y2-y1 );
					if( single ){
						if( 0 <= x2-node.posX && x2-node.posX < node.width && 0 <= y2-node.posY && y2-node.posY < node.height ){
							for( var i=0; i<node.contextMenus.length; i++ ){
								var contextMenu = node.contextMenus[i]();
								contextMenu.move( x2, y2+i*16 );
								nightbird.contextMenus.push( contextMenu );
							}
							nightbird.contextTargets.push( node );
							break;
						}
					}else{
						if(
							x <= node.posX && node.posX < x+w && y <= node.posY && node.posY <= y+h &&
							x <= node.posX+node.width && node.posX+node.width < x+w && y <= node.posY+node.height && node.posY+node.height <= y+h
						){
							selects.push( node );
						}
					}
				}

				if( 0 < selects.length ){
					var multipleContextMenus = [];

					multipleContextMenus.push( function(){
						var contextMenu = new Nightbird.ContextMenu( nightbird );
						contextMenu.setName( 'Activate all' );
						contextMenu.onClick = function(){
							for( var i=0; i<selects.length; i++ ){
								var node = selects[i];
								node.active = true;
							}
						};
						return contextMenu;
					} );
					multipleContextMenus.push( function(){
						var contextMenu = new Nightbird.ContextMenu( nightbird );
						contextMenu.setName( 'Dectivate all' );
						contextMenu.onClick = function(){
							for( var i=0; i<selects.length; i++ ){
								var node = selects[i];
								node.active = false;
							}
						};
						return contextMenu;
					} );
					multipleContextMenus.push( function(){
						var contextMenu = new Nightbird.ContextMenu( nightbird );
						contextMenu.setName( 'Disconnect all' );
						contextMenu.onClick = function(){
							for( var i=0; i<selects.length; i++ ){
								var node = selects[i];
								node.disconnect();
							}
						};
						return contextMenu;
					} );
					multipleContextMenus.push( function(){
						var contextMenu = new Nightbird.ContextMenu( nightbird );
						contextMenu.setName( 'Remove all' );
						contextMenu.onClick = function(){
							for( var i=0; i<selects.length; i++ ){
								var node = selects[i];
								node.remove();
							}
						};
						return contextMenu;
					} );

					for( var i=0; i<multipleContextMenus.length; i++ ){
						var contextMenu = multipleContextMenus[i]();
						contextMenu.move( x1, y1+i*16 );
						nightbird.contextMenus.push( contextMenu );
					}
				}

				for( var node of selects ){
					nightbird.contextTargets.push( node );
				}
				nightbird.contextMenuRect = false;

			}

		}

	}, false );

	nightbird.modular.addEventListener( 'mousemove', function( _e ){

		_e.preventDefault();

		var mx = _e.layerX;
		var my = _e.layerY;

		if( nightbird.selectContextMenu ){
			var contextMenu = nightbird.selectContextMenu;
			if( 0 <= mx-contextMenu.posX && mx-contextMenu.posX < contextMenu.width && 0 <= my-contextMenu.posY && my-contextMenu.posY < contextMenu.height ){
			}else{
				nightbird.selectContextMenu = null;
				contextMenu.selected = false;
			}
		}

		if( nightbird.grabNode ){
			nightbird.grabNode.move( mx-nightbird.grabOffsetX, my-nightbird.grabOffsetY );
		}

		if( nightbird.grabLink ){
			nightbird.grabLink.move( mx, my );
		}

		if( nightbird.contextMenuRect ){
			nightbird.contextMenuRectX2 = mx;
			nightbird.contextMenuRectY2 = my;
		}

	}, false );

	nightbird.modular.addEventListener( 'contextmenu', function( _e ){

		_e.preventDefault();

	}, false );

	this.master = new Nightbird.MasterNode( nightbird );
	nightbird.nodes.push( this.master );
	nightbird.subWindow.document.body.appendChild( this.master.canvas );

	var node = new Nightbird.ValueNode( nightbird );
	nightbird.nodes.push( node );

	document.body.appendChild( nightbird.modular );

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

	for( var link of nightbird.links ){
		link.draw();
	}

	for( var node of nightbird.nodes ){
		node.draw();
	}

	for( var node of nightbird.contextTargets ){
		nightbird.modularContext.globalAlpha = .2;
		nightbird.modularContext.fillStyle = '#846';
		nightbird.modularContext.fillRect( node.posX-5, node.posY-5, node.width+10, node.height+10 );
		nightbird.modularContext.strokeStyle = '#eac';
		nightbird.modularContext.lineWidth = 1;
		nightbird.modularContext.strokeRect( node.posX-5, node.posY-5, node.width+10, node.height+10 );
		nightbird.modularContext.globalAlpha = 1;
	}

	if( nightbird.contextMenuRect ){
		var x = Math.min( nightbird.contextMenuRectX1, nightbird.contextMenuRectX2 );
		var y = Math.min( nightbird.contextMenuRectY1, nightbird.contextMenuRectY2 );
		var w = Math.abs( nightbird.contextMenuRectX2-nightbird.contextMenuRectX1 );
		var h = Math.abs( nightbird.contextMenuRectY2-nightbird.contextMenuRectY1 );
		nightbird.modularContext.globalAlpha = Math.min( Math.max( w, h )*.01, .2 );
		nightbird.modularContext.fillStyle = '#888';
		nightbird.modularContext.fillRect( x, y, w, h );
		nightbird.modularContext.strokeStyle = '#fff';
		nightbird.modularContext.lineWidth = 1;
		nightbird.modularContext.strokeRect( x, y, w, h );
		nightbird.modularContext.globalAlpha = 1;
	}

	for( var contextMenu of nightbird.contextMenus ){
		contextMenu.draw();
	}

};
