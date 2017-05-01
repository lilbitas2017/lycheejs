
lychee.define('game.ui.entity.Label').includes([
	'lychee.ui.entity.Label'
]).exports(function(lychee, global, attachments) {

	const _Label = lychee.import('lychee.ui.entity.Label');
	const _FONT  = attachments["fnt"];



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({
			font: _FONT
		}, data);


		_Label.call(this, settings);

		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			let data = _Label.prototype.serialize.call(this);
			data['constructor'] = 'game.ui.entity.Label';


			return data;

		}

	};


	return Composite;

});

