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
	},

	toJSON: function(annotation) {
		var json = {
			type: 			annotation.type,
			coordinates: 	this._getGeoJSONCoordinates(annotation),
			text: 			this._getContent(annotation),
		};

		/* If the annotationa already exists in the database. */
		if (annotation._mapknitter_id) {
			json.id = annotation._mapknitter_id;
		}

		return json;
	},

	_getGeoJSONCoordinates: function(annotation) {
		var coordinates = [],
			latlngs,
			coord;

		if (annotation.getLatLng) {
			latlngs = [annotation.getLatLng()];
		} else if (annotation.getLatLngs) {
			latlngs = annotation.getLatLngs();
		}			

		for (var i = 0; i < latlngs.length; i++) {
			coord = latlngs[i];
			coordinates.push([coord.lng, coord.lat]);
		}

		return coordinates;
	},

	_getContent: function(annotation) {
		var content = '';

		if (annotation.getContent) {
			content = annotation.getContent();
		}

		return content;
	}

});