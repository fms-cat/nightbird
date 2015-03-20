var Nightbird = function( _w, _h ){

	var it = this;

	it.width = _w;
	it.height = _h;

	it.begint = +new Date();
	it.time = 0;

	it.nodes = [];
	it.links = [];
	it.contextMenus = [];

	it.mouseX = 0;
	it.mouseY = 0;
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

		it.mouseX = _e.layerX;
		it.mouseY = _e.layerY;

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

		it.mouseX = _e.layerX;
		it.mouseY = _e.layerY;

		if( _e.which == 1 ){
			it.mouseup1( _e );
		}else if( _e.which == 3 ){
			it.mouseup3( _e );
		}

	}, false );

	it.modular.addEventListener( 'mousemove', function( _e ){

		_e.preventDefault();

		it.mouseX = _e.layerX;
		it.mouseY = _e.layerY;

		it.mousemove( _e );

	}, false );

	it.modular.addEventListener( 'dragover', function( _e ){

		_e.stopPropagation();
	  _e.preventDefault();

		it.mouseX = _e.layerX;
		it.mouseY = _e.layerY;

		it.dragover( _e );

	}, false );

	it.modular.addEventListener( 'drop', function( _e ){

		_e.stopPropagation();
	  _e.preventDefault();

		it.mouseX = _e.layerX;
		it.mouseY = _e.layerY;

		it.drop( _e );

	}, false );

	document.addEventListener( 'keydown', function( _e ){

		it.keydown( _e );

	} );

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

	// contextMenuのクリック判定
	for( var i=0; i<it.contextMenus.length; i++ ){
		var contextMenu = it.contextMenus[i];
		if( 0 <= it.mouseX-contextMenu.posX && it.mouseX-contextMenu.posX < contextMenu.width && 0 <= it.mouseY-contextMenu.posY && it.mouseY-contextMenu.posY < contextMenu.height ){
			it.selectContextMenu = contextMenu;
			return;
		}
	}
	it.selectContextMenu = null;
	it.contextMenus = [];

	for( var i=it.nodes.length-1; 0<=i; i-- ){
		var node = it.nodes[i];

		// nodeのクリック（移動開始）
		if( 0 <= it.mouseX-node.posX && it.mouseX-node.posX < node.width && 0 <= it.mouseY-node.posY && it.mouseY-node.posY < node.height ){
			// もし操作可能箇所だったら操作
			if(	typeof node.operateDown == 'function' && it.targets.indexOf( node ) == -1 && node.operateDown( it.mouseX-node.posX, it.mouseY-node.posY ) ){
				it.operateNode = node;
			}else{
				if( it.targets.indexOf( node ) == -1 ){
					it.targets = [];
				}
				it.grabOffsetX = it.mouseX-node.posX;
				it.grabOffsetY = it.mouseY-node.posY;
				it.grabNode = node;
				it.grabTime = it.time;
				it.nodes.push( it.nodes.splice( i, 1 )[0] );
			}
			return;
		}

		// nodeのinputのクリック（link開始）
		for( var ic=0; ic<node.inputs.length; ic++ ){
			var connector = node.inputs[ic];
			if( Nightbird.dist( connector.posX, connector.posY, it.mouseX, it.mouseY ) < connector.radius ){
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
			if( Nightbird.dist( connector.posX, connector.posY, it.mouseX, it.mouseY ) < connector.radius ){
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
	it.multipleRectX1 = it.mouseX;
	it.multipleRectY1 = it.mouseY;
	it.multipleRectX2 = it.mouseX;
	it.multipleRectY2 = it.mouseY;

};

Nightbird.prototype.mousedown3 = function( _e ){

	var it = this;

	it.selectContextMenu = null;
	it.contextMenus = [];

	for( var i=it.nodes.length-1; 0<=i; i-- ){
		var node = it.nodes[i];

		// nodeのinputの右クリック
		for( var ic=0; ic<node.inputs.length; ic++ ){
			var connector = node.inputs[ic];
			if( Nightbird.dist( connector.posX, connector.posY, it.mouseX, it.mouseY ) < connector.radius && connector.links.length ){
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
			if( Nightbird.dist( connector.posX, connector.posY, it.mouseX, it.mouseY ) < connector.radius && 0 < connector.links.length ){
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

};

Nightbird.prototype.mouseup1 = function( _e ){

	var it = this;

	// contextMenuのクリック完了
	if( it.selectContextMenu ){
		var contextMenu = it.selectContextMenu;
		it.selectContextMenu.onClick();
		it.selectContextMenu = null;
		it.contextMenus = [];
	}

	// nodeの操作完了
	if( it.operateNode && typeof it.operateNode.operateUp == 'function' ){
		it.operateNode.operateUp( it.mouseX-it.operateNode.posX, it.mouseY-it.operateNode.posY );
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
					if( connector.type == link.type && Nightbird.dist( connector.posX, connector.posY, it.mouseX, it.mouseY ) < connector.radius ){
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
					if( connector.type == link.type && Nightbird.dist( connector.posX, connector.posY, it.mouseX, it.mouseY ) < connector.radius ){
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

};

Nightbird.prototype.mouseup3 = function( _e ){

	var it = this;

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
						if( connector.type == links[0].type && Nightbird.dist( connector.posX, connector.posY, it.mouseX, it.mouseY ) < connector.radius ){
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
						if( connector.type == links[0].type && Nightbird.dist( connector.posX, connector.posY, it.mouseX, it.mouseY ) < connector.radius ){
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

			if( 0 <= it.mouseX-node.posX && it.mouseX-node.posX < node.width && 0 <= it.mouseY-node.posY && it.mouseY-node.posY < node.height ){
				// 範囲選択されたnodeか、それ以外か
				if( it.targets.indexOf( node ) == -1 ){
					it.targets = [];
					for( var i=0; i<node.contextMenus.length; i++ ){
						var contextMenu = node.contextMenus[i]();
						contextMenu.move( it.mouseX, it.mouseY+i*16 );
						it.contextMenus.push( contextMenu );
					}
					return;
				}else{
					var multipleContextMenus = [];

					multipleContextMenus.push( function(){
						var contextMenu = new Nightbird.ContextMenu( it );
						contextMenu.setName( 'Activate selected' );
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
						contextMenu.setName( 'Dectivate selected' );
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
						contextMenu.setName( 'Disconnect selected' );
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
						contextMenu.setName( 'Remove selected' );
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
						contextMenu.move( it.mouseX, it.mouseY+i*16 );
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
			contextMenu.setName( 'Load files' );
			contextMenu.onClick = function(){
				it.input.click();
			};
			return contextMenu;
		} );

		for( var i=0; i<contextMenus.length; i++ ){
			var contextMenu = contextMenus[i]();
			it.contextMenus.push( contextMenu );
			contextMenu.move( it.mouseX, it.mouseY+i*16 );
		}

	}

};

Nightbird.prototype.mousemove = function( _e ){

	var it = this;

	if( it.selectContextMenu ){
		var contextMenu = it.selectContextMenu;
		if( 0 <= it.mouseX-contextMenu.posX && it.mouseX-contextMenu.posX < contextMenu.width && 0 <= it.mouseY-contextMenu.posY && it.mouseY-contextMenu.posY < contextMenu.height ){
		}else{
			it.selectContextMenu = null;
		}
	}

	if( it.operateNode && typeof it.operateNode.operateMove == 'function' ){
		var x = it.mouseX-it.operateNode.posX;
		var y = it.mouseY-it.operateNode.posY;
		it.operateNode.operateMove( x, y );
	}

	if( it.grabNode ){
		for( var i=0; i<it.targets.length; i++ ){
			var target = it.targets[i];
			if( target != it.grabNode ){
				var deltaX = it.mouseX-it.grabOffsetX-it.grabNode.posX;
				var deltaY = it.mouseY-it.grabOffsetY-it.grabNode.posY;
				target.move( target.posX+deltaX, target.posY+deltaY );
			}
		}
		it.grabNode.move( it.mouseX-it.grabOffsetX, it.mouseY-it.grabOffsetY );
	}

	for( var link of it.grabLinks ){
		link.move( it.mouseX, it.mouseY );
	}

	if( it.multipleRect ){
		it.multipleRectX2 = it.mouseX;
		it.multipleRectY2 = it.mouseY;
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

Nightbird.prototype.keydown = function( _e ){

	var it = this;

	var k = _e.keyCode;

	if( k == 27 ){
		_e.preventDefault();
		if( it.textbox ){
			it.textbox.remove();
		}
		it.selectContextMenu = null;
		it.contextMenus = [];
	}

	if( document.activeElement != document.body ){ return; }

	if( 0 < it.contextMenus.length ){
		if( k == 27 ){
			_e.preventDefault();
			it.selectContextMenu = null;
			it.contextMenus = [];
		}else if( k == 13 ){
			_e.preventDefault();
			if( it.selectContextMenu ){
				it.selectContextMenu.onClick();
				it.selectContextMenu = null;
				it.contextMenus = [];
			}else{
				it.selectContextMenu = it.contextMenus[0];
			}
		}else if( k == 38 || k == 40 ){
			_e.preventDefault();
			var selected = it.contextMenus.indexOf( it.selectContextMenu );
			if( k == 40 ){
				selected = ( ++selected )%it.contextMenus.length;
			}else if( k == 38 ){
				if( selected == -1 || selected == 0 ){ selected = it.contextMenus.length-1 }
				else{ selected --; }
			}
			it.selectContextMenu = it.contextMenus[selected];
		}
	}

	if( k == 32 ){
		_e.preventDefault();
		it.selectContextMenu = null;
		it.contextMenus = [];
	}

};

Nightbird.prototype.loadFiles = function( _files ){

	var it = this;

	for( var i=0, file; file=_files[i]; i++ ){

		var ext = '';
		if( /\.([^.]+)$/.test( file.name ) ){
			ext = /\.([^.]+)$/.exec( file.name )[1];
			ext = ext.toLowerCase();
		}else{
			console.error( file.name+' has no extension' );
			continue;
		}

		if( ext == 'glsl' ){

			var node = new Nightbird.ShaderNode( it, file );
			it.nodes.push( node );
			node.move( it.mouseX-node.width/2+(i%8)*10, it.mouseY-node.height/2+(i%8)*10 );

		}else if( ext == 'jpg' || ext == 'jpeg' || ext == 'png' ){

			var node = new Nightbird.ImageNode( it, file );
			it.nodes.push( node );
			node.move( it.mouseX-node.width/2+(i%8)*10, it.mouseY-node.height/2+(i%8)*10 );

		}else if( ext == 'mp4' || ext == 'webm' ){

			var node = new Nightbird.VideoNode( it, file );
			it.nodes.push( node );
			node.move( it.mouseX-node.width/2+(i%8)*10, it.mouseY-node.height/2+(i%8)*10 );

		}else if( ext == 'gif' ){

			var node = new Nightbird.GifNode( it, file );
			it.nodes.push( node );
			node.move( it.mouseX-node.width/2+(i%8)*10, it.mouseY-node.height/2+(i%8)*10 );

		}else if( ext == 'js' ){

			var reader = new FileReader();
			reader.onload = function(){
				try{
					eval( reader.result );
				}catch( _e ){
					console.error( _e.message );
				}
				if( Node ){
					var node = new Node( it );
					it.nodes.push( node );
					node.move( it.mouseX-node.width/2+(i%8)*10, it.mouseY-node.height/2+(i%8)*10 );
				}
			}
			reader.readAsText( file );

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

Nightbird.prototype.save = function(){

	var it = this;

	var json = '';
	for( var i=0; i<it.targets.length; i++ ){
		json += JSON.stringify( it.targets[i].save() );
	}

	for( var i=0; i<it.links.length; i++ ){
		var link = it.links[i];
		var startNode = it.targets.indexOf( link.start.node );
		var endNode = it.targets.indexOf( link.end.node );
		if( startNode != -1 && endNode != -1 ){
			var obj = {};
			obj.kind = 'Link';
			obj.startNode = startNode;
			obj.startConnector = it.targets[startNode].outputs.indexOf( link.start );
			obj.endNode = endNode;
			obj.endConnector = it.targets[endNode].inputs.indexOf( link.end );
			json += JSON.stringify( obj );
		}
	}

	var a = document.createElement( 'a' );
	var blob = new Blob( [ json ], { type : 'application/json' } );
	var url = URL.createObjectURL( blob );
	a.href = url;
	a.download = 'nightbird.txt';
	a.click();
	URL.revokeObjectURL( url );

};

Nightbird.prototype.draw = function(){

	var it = this;

	it.time = ( +new Date() - it.begint )*1e-3;

	it.modularContext.fillStyle = '#222';
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
