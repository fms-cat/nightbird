Nightbird.MasterNode = function( _nightbird ){

	var masterNode = this;

	Nightbird.Node.call( masterNode, _nightbird );

	masterNode.name = 'Master';
	masterNode.width = 160;
	masterNode.height = 160*masterNode.nightbird.height/masterNode.nightbird.width;

	masterNode.canvas = document.createElement( 'canvas' );
	masterNode.canvas.width = masterNode.nightbird.width;
	masterNode.canvas.height = masterNode.nightbird.height;

	masterNode.input = null;

	masterNode.context = masterNode.canvas.getContext( '2d' );

	var inputCanvas = new Nightbird.Connector( masterNode.nightbird, false, 'canvas' );
	inputCanvas.setName( 'input' );
	inputCanvas.onTransfer = function( _data ){
		masterNode.input = _data;
	};
	masterNode.inputs.push( inputCanvas );
	masterNode.move();

	masterNode.contextMenus.pop();
	masterNode.contextMenus.unshift( function(){
		var contextMenu = new Nightbird.ContextMenu( masterNode.nightbird );
		contextMenu.setName( 'Open master window' );
		contextMenu.onClick = function(){
			var subWindow = window.open( 'about:blank', 'sub', 'width='+nightbird.width+',height='+nightbird.height+',menubar=no' );
			subWindow.document.body.style.padding = 0;
			subWindow.document.body.style.margin = 0;
			subWindow.document.body.style.overflow = 'hidden';
			
			subWindow.document.body.appendChild( nightbird.master.canvas );
			subWindow.onresize = function(){
				nightbird.master.canvas.style.width = subWindow.innerWidth;
				nightbird.master.canvas.style.height = subWindow.innerHeight;
			};
		};
		return contextMenu;
	} );

};

Nightbird.MasterNode.prototype = Object.create( Nightbird.Node.prototype );
Nightbird.MasterNode.prototype.constructor = Nightbird.MasterNode;

Nightbird.MasterNode.prototype.remove = function(){

	var masterNode = this;

	masterNode.disconnect();

};

Nightbird.MasterNode.prototype.draw = function(){

	var masterNode = this;

	if( masterNode.active ){
		if( masterNode.input ){
			masterNode.context.drawImage( masterNode.input, 0, 0, masterNode.canvas.width, masterNode.canvas.height );
		}else{
			masterNode.context.fillRect( 0, 0, masterNode.canvas.width, masterNode.canvas.height );
		}
	}

	masterNode.nightbird.modularContext.drawImage( masterNode.canvas, masterNode.posX, masterNode.posY, masterNode.width, masterNode.height );

	Nightbird.Node.prototype.draw.call( masterNode );

};
