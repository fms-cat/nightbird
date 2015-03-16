var Nightbird = function( _w, _h ){

	var nightbird = this;

	nightbird.width = _w;
	nightbird.height = _h;

	nightbird.begint = +new Date();
	nightbird.time = 0;
	nightbird.bpm = 120;

	nightbird.nodes = [];
	nightbird.links = [];
	nightbird.contextMenus = [];

	nightbird.operateNode = null;
	nightbird.grabNode = null;
	nightbird.grabLinks = [];
	nightbird.movingLinks = [];
	nightbird.grabTime = 0;
	nightbird.selectContextMenu = null;
	nightbird.grabOffsetX = 0;
	nightbird.grabOffsetY = 0;
	nightbird.multipleRectX1 = 0;
	nightbird.multipleRectY1 = 0;
	nightbird.multipleRectX2 = 0;
	nightbird.multipleRectY2 = 0;
	nightbird.multipleRect = false;
	nightbird.targets = [];

	nightbird.textbox = null;

	var subWindow = window.open( 'about:blank', 'sub', 'width='+nightbird.width+',height='+nightbird.height+',menubar=no' );
	subWindow.document.body.style.padding = 0;
	subWindow.document.body.style.margin = 0;
	subWindow.document.body.style.overflow = 'hidden';

	nightbird.master = new Nightbird.MasterNode( nightbird );
	nightbird.nodes.push( nightbird.master );
	subWindow.document.body.appendChild( nightbird.master.canvas );
	subWindow.onresize = function(){
		nightbird.master.canvas.style.width = subWindow.innerWidth;
		nightbird.master.canvas.style.height = subWindow.innerHeight;
	};

	nightbird.modular = document.createElement( 'canvas' );
	nightbird.modular.width = 512;
	nightbird.modular.height = 512;
	nightbird.modularContext = nightbird.modular.getContext( '2d' );

	document.body.appendChild( nightbird.modular );

	nightbird.modular.addEventListener( 'mousedown', function( _e ){

		_e.preventDefault();

		var mx = _e.layerX;
		var my = _e.layerY;

		if( nightbird.textbox ){
			nightbird.textbox.remove();
		}

		if( _e.which == 1 ){

			// contextMenuのクリック判定
			for( var i=0; i<nightbird.contextMenus.length; i++ ){
				var contextMenu = nightbird.contextMenus[i];
				if( 0 <= mx-contextMenu.posX && mx-contextMenu.posX < contextMenu.width && 0 <= my-contextMenu.posY && my-contextMenu.posY < contextMenu.height ){
					nightbird.selectContextMenu = contextMenu;
					contextMenu.selected = true;
					return;
				}
			}
			nightbird.contextMenus = [];

			for( var i=nightbird.nodes.length-1; 0<=i; i-- ){
				var node = nightbird.nodes[i];

				// nodeのクリック（移動開始）
				if( 0 <= mx-node.posX && mx-node.posX < node.width && 0 <= my-node.posY && my-node.posY < node.height ){
					// もし操作可能箇所だったら操作
					if(	typeof node.operateDown == 'function' && nightbird.targets.indexOf( node ) == -1 && node.operateDown( mx-node.posX, my-node.posY ) ){
						nightbird.operateNode = node;
					}else{
						if( nightbird.targets.indexOf( node ) == -1 ){
							nightbird.targets = [];
						}
						nightbird.grabOffsetX = mx-node.posX;
						nightbird.grabOffsetY = my-node.posY;
						nightbird.grabNode = node;
						nightbird.grabTime = nightbird.time;
						nightbird.nodes.push( nightbird.nodes.splice( i, 1 )[0] );
					}
					return;
				}

				// nodeのinputのクリック（link開始）
				for( var ic=0; ic<node.inputs.length; ic++ ){
					var connector = node.inputs[ic];
					if( dist( connector.posX, connector.posY, mx, my ) < connector.radius ){
						var link = new Nightbird.Link( nightbird, connector );
						nightbird.links.push( link );
						nightbird.grabLinks.push( link );
						nightbird.grabTime = nightbird.time;
						return;
					}
				}

				// nodeのoutputのクリック（link開始）
				for( var ic=0; ic<node.outputs.length; ic++ ){
					var connector = node.outputs[ic];
					if( dist( connector.posX, connector.posY, mx, my ) < connector.radius ){
						var link = new Nightbird.Link( nightbird, connector );
						nightbird.links.push( link );
						nightbird.grabLinks.push( link );
						nightbird.grabTime = nightbird.time;
						return;
					}
				}
			}

			// 空の場所でのクリック（範囲選択開始）
			nightbird.targets = [];
			nightbird.multipleRect = true;
			nightbird.multipleRectX1 = mx;
			nightbird.multipleRectY1 = my;
			nightbird.multipleRectX2 = mx;
			nightbird.multipleRectY2 = my;

		}else if( _e.which == 3 ){

			nightbird.contextMenus = [];

			for( var i=nightbird.nodes.length-1; 0<=i; i-- ){
				var node = nightbird.nodes[i];

				// nodeのinputの右クリック
				for( var ic=0; ic<node.inputs.length; ic++ ){
					var connector = node.inputs[ic];
					if( dist( connector.posX, connector.posY, mx, my ) < connector.radius && connector.links.length ){
						for( var i=connector.links.length-1; 0<=i; i-- ){
							nightbird.movingLinks.push( connector.links[i] );
							var link = new Nightbird.Link( nightbird, connector.links[i].start );
							nightbird.links.push( link );
							nightbird.grabLinks.push( link );
						}
						nightbird.grabTime = nightbird.time;
						return;
					}
				}

				// nodeのoutputの右クリック
				for( var ic=0; ic<node.outputs.length; ic++ ){
					var connector = node.outputs[ic];
					if( dist( connector.posX, connector.posY, mx, my ) < connector.radius && 0 < connector.links.length ){
						for( var i=connector.links.length-1; 0<=i; i-- ){
							nightbird.movingLinks.push( connector.links[i] );
							var link = new Nightbird.Link( nightbird, connector.links[i].end );
							nightbird.links.push( link );
							nightbird.grabLinks.push( link );
						}
						nightbird.grabTime = nightbird.time;
						return;
					}
				}

			}

		}

		function dist( _x1, _y1, _x2, _y2 ){
			return Math.sqrt( (_x2-_x1)*(_x2-_x1)+(_y2-_y1)*(_y2-_y1) );
		}
	}, false );

	nightbird.modular.addEventListener( 'mouseup', function( _e ){

		_e.preventDefault();

		var mx = _e.layerX;
		var my = _e.layerY;

		if( _e.which == 1 ){

			// contextMenuのクリック完了
			if( nightbird.selectContextMenu ){
				var contextMenu = nightbird.selectContextMenu;
				nightbird.selectContextMenu.onClick();
				nightbird.selectContextMenu.selected = false;
				nightbird.selectContextMenu = null;
				nightbird.contextMenus = [];
			}

			// nodeの操作完了
			if( nightbird.operateNode && typeof nightbird.operateNode.operateUp == 'function' ){
				nightbird.operateNode.operateUp( mx-nightbird.operateNode.posX, my-nightbird.operateNode.posY );
				nightbird.operateNode = null;
			}

			// nodeの移動完了
			if( nightbird.grabNode ){
				nightbird.grabNode = null;
			}

			// linkの移動完了
			if( 0 < nightbird.grabLinks.length ){
				var link = nightbird.grabLinks[0];
				nightbird.grabLinks = [];

				for( var i=nightbird.nodes.length-1; 0<=i; i-- ){
					var node = nightbird.nodes[i];

					if( link.grabStart ){
						for( var ic=0; ic<node.outputs.length; ic++ ){
							var connector = node.outputs[ic];
							if( connector.type == link.type && dist( connector.posX, connector.posY, mx, my ) < connector.radius ){
								if( link.end.links.length == 1 ){ // inputには1つしかlinkできない
									nightbird.links.splice( nightbird.links.indexOf( link.end.links[0] ), 1 );
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
									nightbird.links.splice( nightbird.links.indexOf( connector.links[0] ), 1 );
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
				nightbird.links.splice( nightbird.links.indexOf( link ), 1 );

				function dist( _x1, _y1, _x2, _y2 ){
					return Math.sqrt( (_x2-_x1)*(_x2-_x1)+(_y2-_y1)*(_y2-_y1) );
				}
			}

			// 範囲選択完了
			if( nightbird.multipleRect ){

				nightbird.multipleRect = false;

				nightbird.targets = [];

				var x1 = nightbird.multipleRectX1;
				var y1 = nightbird.multipleRectY1;
				var x2 = nightbird.multipleRectX2;
				var y2 = nightbird.multipleRectY2;
				var x = Math.min( x1, x2 );
				var y = Math.min( y1, y2 );
				var w = Math.abs( x2-x1 );
				var h = Math.abs( y2-y1 );

				// nodeが範囲内かを判定
				for( var i=nightbird.nodes.length-1; 0<=i; i-- ){
					var node = nightbird.nodes[i];

					if(
						x <= node.posX && node.posX < x+w && y <= node.posY && node.posY <= y+h &&
						x <= node.posX+node.width && node.posX+node.width < x+w && y <= node.posY+node.height && node.posY+node.height <= y+h
					){
						nightbird.targets.push( node );
					}

				}

			}

		}else if( _e.which == 3 ){

			if( 0 < nightbird.grabLinks.length ){

				if( nightbird.time-nightbird.grabTime < .3 ){ // すぐ離した場合リンクを消去

					for( var i=nightbird.grabLinks.length-1; 0<=i; i-- ){
						var link = nightbird.grabLinks[i];
						nightbird.links.splice( nightbird.links.indexOf( link ), 1 );
					}
					nightbird.grabLinks = [];
					for( var i=nightbird.movingLinks.length-1; 0<=i; i-- ){
						var link = nightbird.movingLinks[i];
						nightbird.links.splice( nightbird.links.indexOf( link ), 1 );
						link.remove();
					}
					nightbird.movingLinks = [];

				}else{

					// linkの移動完了
					var links = nightbird.grabLinks;
					nightbird.grabLinks = [];

					for( var i=nightbird.nodes.length-1; 0<=i; i-- ){
						var node = nightbird.nodes[i];
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
									for( var i=nightbird.movingLinks.length-1; 0<=i; i-- ){
										var link = nightbird.movingLinks[i];
										nightbird.links.splice( nightbird.links.indexOf( link ), 1 );
										link.remove();
									}
									nightbird.movingLinks = [];
									return;
								}
							}
						}
						if( links[0].grabEnd ){
							for( var ic=0; ic<node.inputs.length; ic++ ){
								var connector = node.inputs[ic];
								if( connector.type == links[0].type && dist( connector.posX, connector.posY, mx, my ) < connector.radius ){
									if( connector.link ){
										nightbird.links.splice( nightbird.links.indexOf( connector.link ), 1 );
										connector.link.remove();
									}
									links[0].end = connector;
									connector.setLink( links[0] );
									links[0].start.setLink( links[0] );
									links[0].grabEnd = false;
									for( var i=nightbird.movingLinks.length-1; 0<=i; i-- ){
										var link = nightbird.movingLinks[i];
										nightbird.links.splice( nightbird.links.indexOf( link ), 1 );
										link.remove();
									}
									nightbird.movingLinks = [];
									return;
								}
							}
						}
					}

					// コネクトできなかった場合、リンクを消す
					for( var i=links.length-1; 0<=i; i-- ){
						var link = links[i];
						nightbird.links.splice( nightbird.links.indexOf( link ), 1 );
					}
					nightbird.grabLinks = [];
					nightbird.movingLinks = [];

					function dist( _x1, _y1, _x2, _y2 ){
						return Math.sqrt( (_x2-_x1)*(_x2-_x1)+(_y2-_y1)*(_y2-_y1) );
					}

				}

			}else{ // リンク移動中でない場合、コンテクストメニュー系

				for( var i=nightbird.nodes.length-1; 0<=i; i-- ){
					var node = nightbird.nodes[i];

					if( 0 <= mx-node.posX && mx-node.posX < node.width && 0 <= my-node.posY && my-node.posY < node.height ){
						// 範囲選択されたnodeか、それ以外か
						if( nightbird.targets.indexOf( node ) == -1 ){
							nightbird.targets = [];
							for( var i=0; i<node.contextMenus.length; i++ ){
								var contextMenu = node.contextMenus[i]();
								contextMenu.move( mx, my+i*16 );
								nightbird.contextMenus.push( contextMenu );
							}
							return;
						}else{
							var multipleContextMenus = [];

							multipleContextMenus.push( function(){
								var contextMenu = new Nightbird.ContextMenu( nightbird );
								contextMenu.setName( 'Activate all' );
								contextMenu.onClick = function(){
									for( var i=0; i<nightbird.targets.length; i++ ){
										var node = nightbird.targets[i];
										node.active = true;
									}
								};
								return contextMenu;
							} );
							multipleContextMenus.push( function(){
								var contextMenu = new Nightbird.ContextMenu( nightbird );
								contextMenu.setName( 'Dectivate all' );
								contextMenu.onClick = function(){
									for( var i=0; i<nightbird.targets.length; i++ ){
										var node = nightbird.targets[i];
										node.active = false;
									}
								};
								return contextMenu;
							} );
							multipleContextMenus.push( function(){
								var contextMenu = new Nightbird.ContextMenu( nightbird );
								contextMenu.setName( 'Disconnect all' );
								contextMenu.onClick = function(){
									for( var i=0; i<nightbird.targets.length; i++ ){
										var node = nightbird.targets[i];
										node.disconnect();
									}
								};
								return contextMenu;
							} );
							multipleContextMenus.push( function(){
								var contextMenu = new Nightbird.ContextMenu( nightbird );
								contextMenu.setName( 'Remove all' );
								contextMenu.onClick = function(){
									for( var i=0; i<nightbird.targets.length; i++ ){
										var node = nightbird.targets[i];
										node.remove();
									}
									nightbird.targets = [];
								};
								return contextMenu;
							} );

							for( var i=0; i<multipleContextMenus.length; i++ ){
								var contextMenu = multipleContextMenus[i]();
								nightbird.contextMenus.push( contextMenu );
								contextMenu.move( mx, my+i*16 );
							}

							return;
						}

					}

				}

				// 空におけるコンテクストメニュー
				nightbird.targets = [];
				var contextMenus = [];

				contextMenus.push( function(){
					var contextMenu = new Nightbird.ContextMenu( nightbird );
					contextMenu.setName( 'ValueNode' );
					contextMenu.onClick = function(){
						var node = new Nightbird.ValueNode( nightbird );
						nightbird.nodes.push( node );
						node.move( mx, my );
					};
					return contextMenu;
				} );
				contextMenus.push( function(){
					var contextMenu = new Nightbird.ContextMenu( nightbird );
					contextMenu.setName( 'TimeNode' );
					contextMenu.onClick = function(){
						var node = new Nightbird.TimeNode( nightbird );
						nightbird.nodes.push( node );
						node.move( mx, my );
					};
					return contextMenu;
				} );
				contextMenus.push( function(){
					var contextMenu = new Nightbird.ContextMenu( nightbird );
					contextMenu.setName( 'FormulaNode' );
					contextMenu.onClick = function(){
						var node = new Nightbird.FormulaNode( nightbird );
						nightbird.nodes.push( node );
						node.move( mx, my );
					};
					return contextMenu;
				} );
				contextMenus.push( function(){
					var contextMenu = new Nightbird.ContextMenu( nightbird );
					contextMenu.setName( 'Load files' );
					contextMenu.onClick = function(){
						nightbird.input.click();
					};
					return contextMenu;
				} );

				for( var i=0; i<contextMenus.length; i++ ){
					var contextMenu = contextMenus[i]();
					nightbird.contextMenus.push( contextMenu );
					contextMenu.move( mx, my+i*16 );
				}

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
				nightbird.selectContextMenu.selected = false;
				nightbird.selectContextMenu = null;
			}
		}

		if( nightbird.operateNode && typeof nightbird.operateNode.operateMove == 'function' ){
			var x = mx-nightbird.operateNode.posX;
			var y = my-nightbird.operateNode.posY;
			nightbird.operateNode.operateMove( x, y );
		}

		if( nightbird.grabNode ){
			for( var i=0; i<nightbird.targets.length; i++ ){
				var target = nightbird.targets[i];
				if( target != nightbird.grabNode ){
					var deltaX = mx-nightbird.grabOffsetX-nightbird.grabNode.posX;
					var deltaY = my-nightbird.grabOffsetY-nightbird.grabNode.posY;
					target.move( target.posX+deltaX, target.posY+deltaY );
				}
			}
			nightbird.grabNode.move( mx-nightbird.grabOffsetX, my-nightbird.grabOffsetY );
		}

		for( var link of nightbird.grabLinks ){
			link.move( mx, my );
		}

		if( nightbird.multipleRect ){
			nightbird.multipleRectX2 = mx;
			nightbird.multipleRectY2 = my;
		}

	}, false );

	nightbird.modular.addEventListener( 'contextmenu', function( _e ){

		_e.preventDefault();

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

	nightbird.modularContext.fillStyle = '#111';
	nightbird.modularContext.fillRect( 0, 0, nightbird.modular.width, nightbird.modular.height );

	for( var link of nightbird.links ){
		link.draw();
	}

	for( var node of nightbird.nodes ){
		node.draw();
	}

	for( var node of nightbird.targets ){
		nightbird.modularContext.globalAlpha = .2;
		nightbird.modularContext.fillStyle = '#846';
		nightbird.modularContext.fillRect( node.posX-5, node.posY-5, node.width+10, node.height+10 );
		nightbird.modularContext.strokeStyle = '#eac';
		nightbird.modularContext.lineWidth = 1;
		nightbird.modularContext.strokeRect( node.posX-5, node.posY-5, node.width+10, node.height+10 );
		nightbird.modularContext.globalAlpha = 1;
	}

	if( nightbird.multipleRect ){
		var x = Math.min( nightbird.multipleRectX1, nightbird.multipleRectX2 );
		var y = Math.min( nightbird.multipleRectY1, nightbird.multipleRectY2 );
		var w = Math.abs( nightbird.multipleRectX2-nightbird.multipleRectX1 );
		var h = Math.abs( nightbird.multipleRectY2-nightbird.multipleRectY1 );
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
