
lychee.define('studio.state.Asset').includes([
	'lychee.ui.State'
]).requires([
	'studio.codec.FONT',
	'studio.ui.element.modify.Font',
//	'studio.ui.element.modify.Music',
//	'studio.ui.element.modify.Sound',
	'studio.ui.element.modify.Sprite',
	'studio.ui.element.preview.Font',
//	'studio.ui.element.preview.Music',
//	'studio.ui.element.preview.Sound',
	'studio.ui.element.preview.Sprite',
	'lychee.ui.Blueprint',
	'lychee.ui.Element',
	'lychee.ui.Layer',
	'lychee.ui.element.Search'
]).exports(function(lychee, global, attachments) {

	const _State   = lychee.import('lychee.ui.State');
	const _modify  = lychee.import('studio.ui.element.modify');
	const _preview = lychee.import('studio.ui.element.preview');
	const _FONT    = lychee.import('studio.codec.FONT');
	const _BLOB    = attachments["json"].buffer;



	/*
	 * HELPERS
	 */

	const _validate_asset = function(asset) {

		return (
			asset instanceof Config
			|| asset instanceof Font
			|| asset instanceof Music
			|| asset instanceof Sound
			|| asset instanceof Texture
			|| asset instanceof Stuff
		);

	};

	const _update_view = function(type, asset) {

		let layer   = this.query('ui > asset');
		let modify  = this.query('ui > asset > modify');
		let preview = this.query('ui > asset > preview');


		if (!(modify instanceof _modify[type])) {

			if (modify !== null) {
				layer.removeEntity(modify);
				modify = null;
			}

			modify = new _modify[type]({
				width:   320,
				height:  620,
				value:   asset,
				visible: true
			});

			modify.bind('change', _on_modify_change, this);
			layer.setEntity('modify', modify);

		} else {

			modify.visible = true;
			modify.setValue(asset);

		}


		if (!(preview instanceof _preview[type])) {

			if (preview !== null) {
				layer.removeEntity(preview);
				preview = null;
			}

			preview = new _preview[type]({
				width:   400,
				height:  620,
				value:   asset,
				visible: true
			});

			preview.bind('change', _on_preview_change, this);
			layer.setEntity('preview', preview);

		} else {

			preview.visible = true;
			preview.setValue(asset);

			setTimeout(function() {
				preview.trigger('relayout');
			}, 200);

		}


		layer.trigger('relayout');

	};

	const _on_select_change = function(value) {

		let that    = this;
		let project = this.main.project;
		let path    = project.identifier + '/source/' + value;
		let ext     = value.split('.').pop();
		let ns      = value.split('/')[0];


		if (ext === 'fnt') {

			let asset = new Font(path);

			asset.onload = function(result) {
				_update_view.call(that, 'Font', asset);
			}.bind(this);

			asset.load();

		} else if (ext === 'png' || (ext === 'json' && /^(app|entity|sprite|ui)$/g.test(ns))) {

			let tmp   = path.split('.');
			let asset = {
				texture: null,
				config:  null
			};

			if (ext === 'png') {

				tmp[tmp.length - 1] = 'json';
				asset.texture = new Texture(path);
				asset.config  = new Config(tmp.join('.'));

			} else if (ext === 'json') {

				tmp[tmp.length - 1] = 'png';
				asset.texture = new Texture(tmp.join('.'));
				asset.config  = new Config(path);

			}


			asset.texture.onload = function() {

				asset.config.onload = function() {
					_update_view.call(that, 'Sprite', asset);
				};

				asset.config.load();

			};

			asset.texture.load();

		} else if (ext === 'json') {

			// TODO: Config support

		} else if (ext === 'msc') {

			// TODO: Music support

		} else if (ext === 'snd') {

			// TODO: Sound support

		}


		let notice = this.query('ui > notice');
		if (notice !== null) {
			notice.setLabel('Asset opened.');
			notice.setState('active');
		}

	};

	const _on_modify_change = function(value) {

		let preview = this.query('ui > asset > preview');
		if (preview !== null) {

			preview.setValue(value);

			setTimeout(function() {
				preview.trigger('relayout');
			}, 200);

		}

	};

	const _on_preview_change = function(action) {

		let select = this.query('ui > asset > select');
		let modify = this.query('ui > asset > modify');
		let notice = this.query('ui > notice');

		if (select !== null && modify !== null) {

			if (action === 'save') {

				let stash = this.main.stash || null;
				let asset = modify.value || null;

				if (stash !== null) {

					if (_validate_asset(asset) === true) {

						stash.write(asset.url, asset);

						if (notice !== null) {
							notice.setLabel('Asset saved.');
							notice.setState('active');
						}

					} else if (asset instanceof Object) {

						for (let id in asset) {

							let subasset = asset[id];
							if (_validate_asset(subasset) === true) {
								stash.write(subasset.url, subasset);
							}

						}

						if (notice !== null) {
							notice.setLabel('Assets saved.');
							notice.setState('active');
						}

					}

				}

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(main) {

		_State.call(this, main);


		this.api = main.api || null;


		this.deserialize(_BLOB);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			let data = _State.prototype.serialize.call(this);
			data['constructor'] = 'studio.state.Asset';


			return data;

		},

		deserialize: function(blob) {

			_State.prototype.deserialize.call(this, blob);


			let select = this.query('ui > asset > select');
			if (select !== null) {
				select.bind('change', _on_select_change, this);
			}


			let modify  = this.query('ui > asset > modify');
			let preview = this.query('ui > asset > preview');

			if (modify !== null && preview !== null) {

				modify.bind('change', function(value) {

					preview.setValue(value);

					setTimeout(function() {
						preview.trigger('relayout');
					}, 200);

				}, this);
				preview.bind('change', _on_preview_change, this);

			}

		},

		enter: function(oncomplete, data) {

			let project = this.main.project;
			let select  = this.query('ui > asset > select');

			if (project !== null && select !== null) {

				let filtered = [];
				let assets   = project.getAssets();

				assets.forEach(function(asset) {

					let ext  = asset.split('.').pop();
					let path = asset.split('.').slice(0, -1).join('.');
					let map  = assets.indexOf(path + '.json');

					if (ext === 'png' && map !== -1) {
						filtered.push(path + '.png');
					} else if (ext === 'fnt') {
						filtered.push(path + '.fnt');
					} else if (ext === 'msc') {
						filtered.push(path + '.msc');
					} else if (ext === 'snd') {
						filtered.push(path + '.snd');
					}

				});

				select.setData(filtered);

			}


			_State.prototype.enter.call(this, oncomplete, data);

		}

	};


	return Composite;

});

