
lychee.define('game.app.entity.unit.Globuline').includes([
	'game.app.entity.Unit'
]).exports(function(lychee, global, attachments) {

	const _Unit = lychee.import('game.app.entity.Unit');


	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({
			team:   'immune',
			damage: 40,
			health: 80,
			radius: 12,
			speed:  200
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
			data['constructor'] = 'game.app.entity.unit.Globuline';

			return data;

		}

	};


	return Composite;

});

