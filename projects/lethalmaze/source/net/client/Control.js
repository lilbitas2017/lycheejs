
lychee.define('game.net.client.Control').includes([
	'lychee.net.client.Session'
]).exports(function(lychee, global, attachments) {

	const _Session = lychee.import('lychee.net.client.Session');



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(client) {

		let settings = {};


		settings.autostart = false;
		settings.autolock  = true;
		settings.min       = 2;
		settings.max       = 6;
		settings.sid       = 'wait-for-init';


		_Session.call(this, 'control', client, settings);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('init', function(data) {

			this.setSid(data.sid);
			this.join();

		}, this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			let data = _Session.prototype.serialize.call(this);
			data['constructor'] = 'game.net.client.Control';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		control: function(data) {

			if (data instanceof Object) {

				this.tunnel.send({
					tid:       data.tid,
					position:  data.position,
					action:    data.action,
					direction: data.direction
				}, {
					id:    this.id,
					event: 'control'
				});


				return true;

			}


			return false;

		}

	};


	return Composite;

});

