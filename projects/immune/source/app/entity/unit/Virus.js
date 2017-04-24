
lychee.define('game.app.entity.unit.Virus').includes([
	'game.app.entity.Unit'
]).exports(function(lychee, global, attachments) {

	const _Unit = lychee.import('game.app.entity.Unit');



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({
			team:   'virus',
			damage: 30,
			health: 50,
			radius: 10,
			speed:  300
		}, data);


		_Unit.call(this, settings);

		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			let data = _Unit.prototype.serialize.call(this);
			data['constructor'] = 'game.app.entity.unit.Virus';

			return data;

		}

	};


	return Composite;

});

