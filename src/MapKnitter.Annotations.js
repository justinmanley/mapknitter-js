MapKnitter.Annotations.include({

	initialize: function(options) {
		MapKnitter.Resources.prototype.initialize.call(this, options);

		var map = options.map;

		this._map = map;
		this._drawnItems = new L.FeatureGroup().addTo(map);

		new L.Illustrate.Control({
			position: 'topright',
			edit: { featureGroup: this._drawnItems }
		}).addTo(map);

		new L.Control.Draw({
			position: 'topright',
			edit: { featureGroup: this._drawnItems }
		}).addTo(map);

		this._initEvents();

		/* Get annotations for this map. */
		this.retrieve(function(annotations) {
			new L.GeoJSON(annotations, { pointToLayer: this.fromGeoJSON })
				.addTo(map);
		});
	},

	_initEvents: function() {
		var map = this._map;

		map.on('draw:created', function(event) {
			var layer = event.layer;

			/* Display annotation on the map. */
			this._drawnItems.addLayer(layer);

			/* Create new database record via AJAX request; see MapKnitter.Resources#create. */
			this.create(layer);
		}, this);

		map.on('draw:edit', function() {

		});
	},

	toJSON: function(annotation) {
		var geojson = annotation.toGeoJSON(),
			type = geojson.properties.pointType;

		geojson.properties.annotation_type = type;

		return geojson;
	},

	fromGeoJSON: function(geojson, latlng) {
		var textbox = new L.Illustrate.Textbox(latlng, {
			minWidth: geojson.properties.style.width,
			minHeight: geojson.properties.style.height,
			text: geojson.properties.text
		});
		return textbox;
	}

});