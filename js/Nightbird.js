var Nightbird = function( _w, _h ){

	var it = this;

	it.width = _w;
	it.height = _h;

	it.begint = +new Date();
	it.time = 0;

	it.nodes = [];
	it.links = [];
	it.contextMenus = [];

	it.operateNode = null;
	it.grabNode = null;
	it.grabLinks = [];
	it.movingLinks = [];
	it.grabTime = 0;
	it.selectContextMenu = null;
	it.grabOffsetX = 0;
	it.grabOffsetY = 0;
	it.multipleRectX1 = 0;
	it.multipleRectY1 = 0;
	it.multipleRectX2 = 0;
	it.multipleRectY2 = 0;
	it.multipleRect = false;
	it.targets = [];

	it.textbox = null;

	it.modular = document.createElement( 'canvas' );
	it.modular.width = 512;
	it.modular.height = 512;
	it.modularContext = it.modular.getContext( '2d' );

	var subWindow = window.open( 'about:blank', 'sub', 'width='+it.width+',height='+it.height+',menubar=no' );
	subWindow.document.body.style.padding = 0;
	subWindow.document.body.style.margin = 0;
	subWindow.document.body.style.overflow = 'hidden';

	it.master = new Nightbird.MasterNode( it );
	it.nodes.push( it.master );
	it.master.move( 256, 256 );
	subWindow.document.body.appendChild( it.master.canvas );
	subWindow.onresize = function(){
		it.master.canvas.style.width = subWindow.innerWidth;
		it.master.canvas.style.height = subWindow.innerHeight;
	};

	document.body.appendChild( it.modular );

	it.modular.addEventListener( 'mousedown', function( _e ){

		_e.preventDefault();

		if( it.textbox ){
			it.textbox.remove();
		}

		if( _e.which == 1 ){
			it.mousedown1( _e );
		}else if( _e.which == 3 ){
			it.mousedown3( _e );
		}

	}, false );

	it.modular.addEventListener( 'mouseup', function( _e ){

		_e.preventDefault();

		if( _e.which == 1 ){
			it.mouseup1( _e );
		}else if( _e.which == 3 ){
			it.mouseup3( _e );
		}

	}, false );

	it.modular.addEventListener( 'mousemove', function( _e ){

		_e.preventDefault();

		it.mousemove( _e );

	}, false );

	it.modular.addEventListener( 'dragover', function( _e ){

		_e.stopPropagation();
	  _e.preventDefault();

		it.dragover( _e );

	}, false );

	it.modular.addEventListener( 'drop', function( _e ){

		_e.stopPropagation();
	  _e.preventDefault();

		it.drop( _e );

	}, false );

	it.modular.addEventListener( 'contextmenu', function( _e ){

		_e.preventDefault();

	}, false );

	it.input = document.createElement( 'input' );
	it.input.type = 'file';
	it.input.multiple = true;
	it.input.onchange = function( _e ){

		it.loadFiles( _e.target.files );

	};

};

Nightbird.prototype.mousedown1 = function( _e ){

	var it = this;

	var mx = _e.layerX;
	var my = _e.layerY;

	// contextMenuのクリック判定
	for( var i=0; i<it.contextMenus.length; i++ ){
		var contextMenu = it.contextMenus[i];
		if( 0 <= mx-contextMenu.posX && mx-contextMenu.posX < contextMenu.width && 0 <= my-contextMenu.posY && my-contextMenu.posY < contextMenu.height ){
			it.selectContextMenu = contextMenu;
			contextMenu.selected = true;
			return;
		}
	}
	it.contextMenus = [];

	for( var i=it.nodes.length-1; 0<=i; i-- ){
		var node = it.nodes[i];

		// nodeのクリック（移動開始）
		if( 0 <= mx-node.posX && mx-node.posX < node.width && 0 <= my-node.posY && my-node.posY < node.height ){
			// もし操作可能箇所だったら操作
			if(	typeof node.operateDown == 'function' && it.targets.indexOf( node ) == -1 && node.operateDown( mx-node.posX, my-node.posY ) ){
				it.operateNode = node;
			}else{
				if( it.targets.indexOf( node ) == -1 ){
					it.targets = [];
				}
				it.grabOffsetX = mx-node.posX;
				it.grabOffsetY = my-node.posY;
				it.grabNode = node;
				it.grabTime = it.time;
				it.nodes.push( it.nodes.splice( i, 1 )[0] );
			}
			return;
		}

		// nodeのinputのクリック（link開始）
		for( var ic=0; ic<node.inputs.length; ic++ ){
			var connector = node.inputs[ic];
			if( dist( connector.posX, connector.posY, mx, my ) < connector.radius ){
				var link = new Nightbird.Link( it, connector );
				it.links.push( link );
				it.grabLinks.push( link );
				it.grabTime = it.time;
				return;
			}
		}

		// nodeのoutputのクリック（link開始）
		for( var ic=0; ic<node.outputs.length; ic++ ){
			var connector = node.outputs[ic];
			if( dist( connector.posX, connector.posY, mx, my ) < connector.radius ){
				var link = new Nightbird.Link( it, connector );
				it.links.push( link );
				it.grabLinks.push( link );
				it.grabTime = it.time;
				return;
			}
		}
	}

	// 空の場所でのクリック（範囲選択開始）
	it.targets = [];
	it.multipleRect = true;
	it.multipleRectX1 = mx;
	it.multipleRectY1 = my;
	it.multipleRectX2 = mx;
	it.multipleRectY2 = my;

	function dist( _x1, _y1, _x2, _y2 ){
		return Math.sqrt( (_x2-_x1)*(_x2-_x1)+(_y2-_y1)*(_y2-_y1) );
	}

};

Nightbird.prototype.mousedown3 = function( _e ){

	var it = this;

	var mx = _e.layerX;
	var my = _e.layerY;

	it.contextMenus = [];

	for( var i=it.nodes.length-1; 0<=i; i-- ){
		var node = it.nodes[i];

		// nodeのinputの右クリック
		for( var ic=0; ic<node.inputs.length; ic++ ){
			var connector = node.inputs[ic];
			if( dist( connector.posX, connector.posY, mx, my ) < connector.radius && connector.links.length ){
				for( var i=connector.links.length-1; 0<=i; i-- ){
					it.movingLinks.push( connector.links[i] );
					var link = new Nightbird.Link( it, connector.links[i].start );
					it.links.push( link );
					it.grabLinks.push( link );
				}
				it.grabTime = it.time;
				return;
			}
		}

		// nodeのoutputの右クリック
		for( var ic=0; ic<node.outputs.length; ic++ ){
			var connector = node.outputs[ic];
			if( dist( connector.posX, connector.posY, mx, my ) < connector.radius && 0 < connector.links.length ){
				for( var i=connector.links.length-1; 0<=i; i-- ){
					it.movingLinks.push( connector.links[i] );
					var link = new Nightbird.Link( it, connector.links[i].end );
					it.links.push( link );
					it.grabLinks.push( link );
				}
				it.grabTime = it.time;
				return;
			}
		}

	}

	function dist( _x1, _y1, _x2, _y2 ){
		return Math.sqrt( (_x2-_x1)*(_x2-_x1)+(_y2-_y1)*(_y2-_y1) );
	}

};

Nightbird.prototype.mouseup1 = function( _e ){

	var it = this;

	var mx = _e.layerX;
	var my = _e.layerY;

	// contextMenuのクリック完了
	if( it.selectContextMenu ){
		var contextMenu = it.selectContextMenu;
		it.selectContextMenu.onClick();
		it.selectContextMenu.selected = false;
		it.selectContextMenu = null;
		it.contextMenus = [];
	}

	// nodeの操作完了
	if( it.operateNode && typeof it.operateNode.operateUp == 'function' ){
		it.operateNode.operateUp( mx-it.operateNode.posX, my-it.operateNode.posY );
		it.operateNode = null;
	}

	// nodeの移動完了
	if( it.grabNode ){
		it.grabNode = null;
	}

	// linkの移動完了
	if( 0 < it.grabLinks.length ){
		var link = it.grabLinks[0];
		it.grabLinks = [];

		for( var i=it.nodes.length-1; 0<=i; i-- ){
			var node = it.nodes[i];

			if( link.grabStart ){
				for( var ic=0; ic<node.outputs.length; ic++ ){
					var connector = node.outputs[ic];
					if( connector.type == link.type && dist( connector.posX, connector.posY, mx, my ) < connector.radius ){
						if( link.end.links.length == 1 ){ // inputには1つしかlinkできない
							it.links.splice( it.links.indexOf( link.end.links[0] ), 1 );
							link.end.links[0].remove();
						}
						link.start = connector;
						connector.setLink( link );
						link.end.setLink( link );
						link.grabStart = false;
						return;
					}
				}
			}

			if( link.grabEnd ){
				for( var ic=0; ic<node.inputs.length; ic++ ){
					var connector = node.inputs[ic];
					if( connector.type == link.type && dist( connector.posX, connector.posY, mx, my ) < connector.radius ){
						if( connector.links.length == 1 ){ // inputには1つしかlinkできない
							it.links.splice( it.links.indexOf( connector.links[0] ), 1 );
							connector.links[0].remove();
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

		// コネクトできなかった場合、リンクを消す
		it.links.splice( it.links.indexOf( link ), 1 );
	}

	// 範囲選択完了
	if( it.multipleRect ){

		it.multipleRect = false;

		it.targets = [];

		var x1 = it.multipleRectX1;
		var y1 = it.multipleRectY1;
		var x2 = it.multipleRectX2;
		var y2 = it.multipleRectY2;
		var x = Math.min( x1, x2 );
		var y = Math.min( y1, y2 );
		var w = Math.abs( x2-x1 );
		var h = Math.abs( y2-y1 );

		// nodeが範囲内かを判定
		for( var i=it.nodes.length-1; 0<=i; i-- ){
			var node = it.nodes[i];

			if(
				x <= node.posX && node.posX < x+w && y <= node.posY && node.posY <= y+h &&
				x <= node.posX+node.width && node.posX+node.width < x+w && y <= node.posY+node.height && node.posY+node.height <= y+h
			){
				it.targets.push( node );
			}

		}

	}

	function dist( _x1, _y1, _x2, _y2 ){
		return Math.sqrt( (_x2-_x1)*(_x2-_x1)+(_y2-_y1)*(_y2-_y1) );
	}

};

Nightbird.prototype.mouseup3 = function( _e ){

	var it = this;

	var mx = _e.layerX;
	var my = _e.layerY;



	if( 0 < it.grabLinks.length ){

		if( it.time-it.grabTime < .3 ){ // すぐ離した場合リンクを消去

			for( var i=it.grabLinks.length-1; 0<=i; i-- ){
				var link = it.grabLinks[i];
				it.links.splice( it.links.indexOf( link ), 1 );
			}
			it.grabLinks = [];
			for( var i=it.movingLinks.length-1; 0<=i; i-- ){
				var link = it.movingLinks[i];
				it.links.splice( it.links.indexOf( link ), 1 );
				link.remove();
			}
			it.movingLinks = [];

		}else{

			// linkの移動完了
			var links = it.grabLinks;
			it.grabLinks = [];

			for( var i=it.nodes.length-1; 0<=i; i-- ){
				var node = it.nodes[i];
				if( links[0].grabStart ){
					for( var ic=0; ic<node.outputs.length; ic++ ){
						var connector = node.outputs[ic];
						if( connector.type == links[0].type && dist( connector.posX, connector.posY, mx, my ) < connector.radius ){
							for( var link of links ){
								link.start = connector;
								connector.setLink( link );
								link.end.setLink( link );
								link.grabStart = false;
							}
							for( var i=it.movingLinks.length-1; 0<=i; i-- ){
								var link = it.movingLinks[i];
								it.links.splice( it.links.indexOf( link ), 1 );
								link.remove();
							}
							it.movingLinks = [];
							return;
						}
					}
				}
				if( links[0].grabEnd ){
					for( var ic=0; ic<node.inputs.length; ic++ ){
						var connector = node.inputs[ic];
						if( connector.type == links[0].type && dist( connector.posX, connector.posY, mx, my ) < connector.radius ){
							if( connector.link ){
								it.links.splice( it.links.indexOf( connector.link ), 1 );
								connector.link.remove();
							}
							links[0].end = connector;
							connector.setLink( links[0] );
							links[0].start.setLink( links[0] );
							links[0].grabEnd = false;
							for( var i=it.movingLinks.length-1; 0<=i; i-- ){
								var link = it.movingLinks[i];
								it.links.splice( it.links.indexOf( link ), 1 );
								link.remove();
							}
							it.movingLinks = [];
							return;
						}
					}
				}
			}

			// コネクトできなかった場合、リンクを消す
			for( var i=links.length-1; 0<=i; i-- ){
				var link = links[i];
				it.links.splice( it.links.indexOf( link ), 1 );
			}
			it.grabLinks = [];
			it.movingLinks = [];

		}

	}else{ // リンク移動中でない場合、コンテクストメニュー系

		for( var i=it.nodes.length-1; 0<=i; i-- ){
			var node = it.nodes[i];

			if( 0 <= mx-node.posX && mx-node.posX < node.width && 0 <= my-node.posY && my-node.posY < node.height ){
				// 範囲選択されたnodeか、それ以外か
				if( it.targets.indexOf( node ) == -1 ){
					it.targets = [];
					for( var i=0; i<node.contextMenus.length; i++ ){
						var contextMenu = node.contextMenus[i]();
						contextMenu.move( mx, my+i*16 );
						it.contextMenus.push( contextMenu );
					}
					return;
				}else{
					var multipleContextMenus = [];

					multipleContextMenus.push( function(){
						var contextMenu = new Nightbird.ContextMenu( it );
						contextMenu.setName( 'Activate all' );
						contextMenu.onClick = function(){
							for( var i=0; i<it.targets.length; i++ ){
								var node = it.targets[i];
								node.active = true;
							}
						};
						return contextMenu;
					} );
					multipleContextMenus.push( function(){
						var contextMenu = new Nightbird.ContextMenu( it );
						contextMenu.setName( 'Dectivate all' );
						contextMenu.onClick = function(){
							for( var i=0; i<it.targets.length; i++ ){
								var node = it.targets[i];
								node.active = false;
							}
						};
						return contextMenu;
					} );
					multipleContextMenus.push( function(){
						var contextMenu = new Nightbird.ContextMenu( it );
						contextMenu.setName( 'Disconnect all' );
						contextMenu.onClick = function(){
							for( var i=0; i<it.targets.length; i++ ){
								var node = it.targets[i];
								node.disconnect();
							}
						};
						return contextMenu;
					} );
					multipleContextMenus.push( function(){
						var contextMenu = new Nightbird.ContextMenu( it );
						contextMenu.setName( 'Remove all' );
						contextMenu.onClick = function(){
							for( var i=0; i<it.targets.length; i++ ){
								var node = it.targets[i];
								node.remove();
							}
							it.targets = [];
						};
						return contextMenu;
					} );

					for( var i=0; i<multipleContextMenus.length; i++ ){
						var contextMenu = multipleContextMenus[i]();
						it.contextMenus.push( contextMenu );
						contextMenu.move( mx, my+i*16 );
					}

					return;
				}

			}

		}

		// 空におけるコンテクストメニュー
		it.targets = [];
		var contextMenus = [];

		contextMenus.push( function(){
			var contextMenu = new Nightbird.ContextMenu( it );
			contextMenu.setName( 'ValueNode' );
			contextMenu.onClick = function(){
				var node = new Nightbird.ValueNode( it );
				it.nodes.push( node );
				node.move( mx, my );
			};
			return contextMenu;
		} );
		contextMenus.push( function(){
			var contextMenu = new Nightbird.ContextMenu( it );
			contextMenu.setName( 'TimeNode' );
			contextMenu.onClick = function(){
				var node = new Nightbird.TimeNode( it );
				it.nodes.push( node );
				node.move( mx, my );
			};
			return contextMenu;
		} );
		contextMenus.push( function(){
			var contextMenu = new Nightbird.ContextMenu( it );
			contextMenu.setName( 'FormulaNode' );
			contextMenu.onClick = function(){
				var node = new Nightbird.FormulaNode( it );
				it.nodes.push( node );
				node.move( mx, my );
			};
			return contextMenu;
		} );
		contextMenus.push( function(){
			var contextMenu = new Nightbird.ContextMenu( it );
			contextMenu.setName( 'Load files' );
			contextMenu.onClick = function(){
				it.input.click();
			};
			return contextMenu;
		} );

		for( var i=0; i<contextMenus.length; i++ ){
			var contextMenu = contextMenus[i]();
			it.contextMenus.push( contextMenu );
			contextMenu.move( mx, my+i*16 );
		}

	}

	function dist( _x1, _y1, _x2, _y2 ){
		return Math.sqrt( (_x2-_x1)*(_x2-_x1)+(_y2-_y1)*(_y2-_y1) );
	}

};

Nightbird.prototype.mousemove = function( _e ){

	var it = this;

	var mx = _e.layerX;
	var my = _e.layerY;

	if( it.selectContextMenu ){
		var contextMenu = it.selectContextMenu;
		if( 0 <= mx-contextMenu.posX && mx-contextMenu.posX < contextMenu.width && 0 <= my-contextMenu.posY && my-contextMenu.posY < contextMenu.height ){
		}else{
			it.selectContextMenu.selected = false;
			it.selectContextMenu = null;
		}
	}

	if( it.operateNode && typeof it.operateNode.operateMove == 'function' ){
		var x = mx-it.operateNode.posX;
		var y = my-it.operateNode.posY;
		it.operateNode.operateMove( x, y );
	}

	if( it.grabNode ){
		for( var i=0; i<it.targets.length; i++ ){
			var target = it.targets[i];
			if( target != it.grabNode ){
				var deltaX = mx-it.grabOffsetX-it.grabNode.posX;
				var deltaY = my-it.grabOffsetY-it.grabNode.posY;
				target.move( target.posX+deltaX, target.posY+deltaY );
			}
		}
		it.grabNode.move( mx-it.grabOffsetX, my-it.grabOffsetY );
	}

	for( var link of it.grabLinks ){
		link.move( mx, my );
	}

	if( it.multipleRect ){
		it.multipleRectX2 = mx;
		it.multipleRectY2 = my;
	}

};

Nightbird.prototype.dragover = function( _e ){

	var it = this;

  _e.dataTransfer.dropEffect = 'copy';

};

Nightbird.prototype.drop = function( _e ){

	var it = this;

  it.loadFiles( _e.dataTransfer.files );

};

Nightbird.prototype.loadFiles = function( _files ){

	var it = this;

	for( var i=0, file; file=_files[i]; i++ ){

		var ext = '';
		if( /\.([^.]+)$/.test( file.name ) ){
			ext = /\.([^.]+)$/.exec( file.name )[1];
		}else{
			console.error( file.name+' has no extension' );
		}

		if( ext == 'glsl' ){
			var node = new Nightbird.ShaderNode( it, file );
			it.nodes.push( node );
			node.move( it.modular.width/2-70+(i%8)*10, it.modular.height/2-70+(i%8)*10 );
		}else if( ext == 'gif' ){
			var node = new Nightbird.GifNode( it, file );
			it.nodes.push( node );
			node.move( it.modular.width/2-70+(i%8)*10, it.modular.height/2-70+(i%8)*10 );
		}else{
			console.error( file.name+' is unsupported extension' );
		}

	}

};

Nightbird.prototype.setSize = function( _w, _h ){

	var it = this;

	it.canvas.width = _w;
	it.canvas.height = _h;

};

Nightbird.prototype.setModularSize = function( _w, _h ){

	var it = this;

	it.modular.width = _w;
	it.modular.height = _h;

};

Nightbird.prototype.draw = function(){

	var it = this;

	it.time = ( +new Date() - it.begint )*1e-3;

	it.modularContext.fillStyle = '#111';
	it.modularContext.fillRect( 0, 0, it.modular.width, it.modular.height );

	for( var link of it.links ){
		link.draw();
	}

	for( var link of it.movingLinks ){
		link.drawMoving();
	}

	for( var node of it.nodes ){
		node.draw();
	}

	for( var node of it.targets ){
		node.drawTarget();
	}

	if( it.multipleRect ){
		var x = Math.min( it.multipleRectX1, it.multipleRectX2 );
		var y = Math.min( it.multipleRectY1, it.multipleRectY2 );
		var w = Math.abs( it.multipleRectX2-it.multipleRectX1 );
		var h = Math.abs( it.multipleRectY2-it.multipleRectY1 );
		it.modularContext.globalAlpha = Math.min( Math.max( w, h )*.01, .2 );
		it.modularContext.fillStyle = '#888';
		it.modularContext.fillRect( x, y, w, h );
		it.modularContext.strokeStyle = '#fff';
		it.modularContext.lineWidth = 1;
		it.modularContext.strokeRect( x, y, w, h );
		it.modularContext.globalAlpha = 1;
	}

	for( var contextMenu of it.contextMenus ){
		contextMenu.draw();
	}

};
