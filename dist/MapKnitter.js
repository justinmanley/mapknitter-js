(function(window, document, undefined) {

"use strict";

window.MapKnitter = {};

/* 
 * MapKnitter.Class: A bare-bones version of Leaflet's Class feature, 
 * for simple classical inheritance. 
 * See https://github.com/Leaflet/Leaflet/blob/master/src/core/Class.js.
 */

MapKnitter.Class = function() {};
MapKnitter.Class.extend = function(obj) {
	var NewClass = function() {
		if (this.initialize) {
			this.initialize.apply(this, arguments);
		}
	};

	var F = function() {};
	F.prototype = this.prototype;

	var proto = new F();
	proto.constructor = NewClass;

	NewClass.prototype = proto;

	for (var i in this) {
		if (this.hasOwnProperty(i) && i !== 'prototype') {
			NewClass[i] = this[i];
		}
	}

	L.extend(proto, obj);

	var parent = this;
	NewClass.__super__ = parent.prototype;

	return NewClass;
};
MapKnitter.Class.include = function(obj) {
	L.extend(this.prototype, obj);
};
MapKnitter.Resources = MapKnitter.Class.extend({

	supported: [ 'Annotation' ],

	baseUrl: 'http://localhost:3000',

	initialize: function(options) {
		this._map_id = options.map_id;

		console.log(this.baseUrl);

		this._mapUrl = this.baseUrl + '/maps/' + this._map_id + '/';
		this._resourcesUrl = this._mapUrl + this._name + 's' + '.json';

		this._getResources = jQuery.ajax({
			url: this._resourcesUrl,
			dataType: 'json',
			context: this,
			success: function(data) { console.log(data); this._resources = data; },
			error: function(jqXHR, status, thrownError) { console.log(thrownError);	}
		});
	},

	create: function(annotation) {
		this._getResources.done.call(this, function() {
			var newResource;

			this._createResource(annotation, newResource)
				.done.call(this, function() {
					this._resources.push(newResource);
				});
		});
	},

	update: function() {	
		// PUT to /maps/:map_id/:resources/:id
	},

	delete: function() {

	},

	_createResource: function(annotation, dest) {
		/* POST to /maps/<%= this._map_id %>/<%= this._name %> */
		var data = { map_id: this._map_id };
		data[this._name] = this.toJSON(resource);

		return jQuery.ajax({
			url: 		this._resourcesUrl + '/new',
			data: 		data,
			type: 		'POST',
			success: 	function(data) { dest = data; },
			error: 		function(jqXHR, status, thrownError) { console.log(thrownError);	}
		});
	}

});

/* Automatically define classes extending MapKnitter.Resources for all supported resources types. */
(function() {
	for (var i = 0; i < MapKnitter.Resources.prototype.supported.length; i++) {
		var resource = MapKnitter.Resources.prototype.supported[i];

		MapKnitter[resource + 's'] = MapKnitter.Resources.extend({
			_name: resource.toLowerCase()
		});	
	}
})();
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

			this._drawnItems.addLayer(layer);
		}, this);			
	},

	toJSON: function(annotation) {
		console.log(annotation);
	}

});
MapKnitter.Map = MapKnitter.Class.extend({

	initialize: function(options) {
		this._zoom = options.zoom || 0;
		this._latlng = L.latLng(options.latlng);

		this._map = L.map('knitter-map-pane', { zoomControl: false })
			.setView(this._latlng, this._zoom);

		/* Set up basemap and drawing toolbars. */
		this.setupMap();

		/* Load warpables data via AJAX request. */
		// this._warpablesUrl = options.warpablesUrl;
		// this.withWarpables();

		/* Enable users to drag images from the sidebar onto the map. */
		this.enableDragAndDrop();
	},

	getMap: function() {
		return this._map;
	},

	placeImage: function(event, ui) {
		var that = this,
			$img = jQuery(ui.helper),
			url = $img.attr("src"),
			id = $img.attr("data-warpable-id"),
			imgPosition = $img.offset(),
			upperLeft = L.point(imgPosition.left, imgPosition.top),
			size = L.point($img.width(), $img.height()),
			lowerRight = upperLeft.add(size);

		/* Place low-resolution image on the map. */
		var lowres = L.imageOverlay(url, [
			this._map.containerPointToLatLng(upperLeft), 
			this._map.containerPointToLatLng(lowerRight)
		]).addTo(this._map);

		/* Load the high-resolution version on top of the low-res version. */
		this.withWarpable(id, "original", function(img) {
			var url = jQuery(img).attr("src");
			L.imageOverlay(url, [
				that._map.containerPointToLatLng(upperLeft), 
				that._map.containerPointToLatLng(lowerRight)
			]).addTo(that._map);
			that._map.removeLayer(lowres);
		});
	},

	withWarpables: function(callback) {
		if (this._warpables) {
			if (callback) { callback(this._warpables); }
		} else {
			jQuery.getJSON(this._warpablesUrl, function(warpablesData) {
				this._warpables = warpablesData;
				if (callback) { callback(this._warpables); }
			});	
		}
	},

	withWarpable: function(id, size, callback) {
		this.withWarpables(function(warpables) {
			var url = warpables[id][size],
				img = jQuery("<img/>").attr("src", url).attr("data-warpable-id", id);
			callback(img);
		});
	},

	setupMap: function() {
		var map = this._map;

		L.control.zoom({ position: 'topright' }).addTo(map);
		L.tileLayer.provider('Esri.WorldImagery').addTo(map);
	},

	enableDragAndDrop: function() {
		var that = this;

		jQuery("#knitter-map-pane")
			.droppable({ drop: this.placeImage.bind(this) });

		var $selection = jQuery(".warpables-all tr img");

		$selection.draggable({ revert: "invalid" });

		$selection.each(function(index, warpable) {
			var id = jQuery(warpable).attr("data-warpable-id");
			that.withWarpable(id, "medium", function(img) {
				jQuery(warpable).draggable("option", "helper", function() { return img; });
			});
		});
	},

	addMetadata: function() {

	}
});

}(window, document));