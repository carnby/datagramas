
var map_width = _width;
var map_height = _height;

var map_container = null;
var path_g;
var mark_g;
var graph_g;


if (_data_geometry !== null && typeof _data_geometry === 'object') {
    if (_feature_name === null) {
        _feature_name = d3.keys(_data_geometry.objects)[0];
    }

    _geometry = topojson.feature(_data_geometry, _data_geometry.objects[_feature_name]);
} else if (_data_geojson !== null && typeof _data_geojson === 'object') {
    _geometry = _data_geojson;
} else {
    // kaboom
    throw 'No valid geography found.';
}

auxiliary.available_feature_ids = d3.set();

_geometry.features.forEach(function(d) {
    auxiliary.available_feature_ids.add(d[_feature_id]);
});

console.log('available ids', auxiliary.available_feature_ids);

var path = d3.geo.path().pointRadius(5);

// TODO: Fix legends.
//var legend = matta.symbol_legend();
//.position({x: 20 + _mark_max_ratio, y: _height - 20});

{% if options.leaflet %}
    // code adapted from https://github.com/mbostock/bost.ocks.org/blob/gh-pages/mike/leaflet/index.html#L131-171
    if (_L == null) {
        _L = leaflet;
    }

    var map_initialized = false;
    var map_svg;
    var overlay_svg;

    if (container.select('div.leaflet-map-pane').empty()) {
        _map = _L.map(container.node()).setView([0, 0], 12);
        container.node()['__leaflet_map__'] = _map;
        _L.tileLayer(_leaflet_tile_layer, {attribution: _leaflet_map_link}).addTo(_map);
        map_initialized = true;
        map_svg = d3.select(_map.getPanes().overlayPane).append('svg');
        map_container = map_svg.append('g').attr('class', 'leaflet-zoom-hide');
    } else {
        _map = container.node()['__leaflet_map__'];
        map_svg = d3.select(_map.getPanes().overlayPane).select('svg');
        map_container = map_svg.select('g.leaflet-zoom-hide');
    }

    if (!container.select('div.leaflet-top.leaflet-left').select('svg.overlay').empty()) {
        overlay_svg = container.select('div.leaflet-top.leaflet-left').select('svg.overlay');
    } else {
        overlay_svg = container.select('div.leaflet-top.leaflet-left')
            .append('svg').classed('overlay', true)
            .attr({'width': _width, 'height': _height})
            .style({'z-index': 1000, 'position': 'absolute', 'top': 0, 'left': 0});
    }

    path_g = map_container.select('g.geo-paths');

    if (path_g.empty()) {
        path_g = map_container.append('g').attr('class', 'geo-paths');
    }

    graph_g = map_container.select('g.graph');
    if (graph_g.empty()) {
        graph_g = map_container.append('g').attr('class', 'graph');
    }

    mark_g = map_container.select('g.marks');
    if (mark_g.empty()) {
        mark_g = map_container.append('g').attr('class', 'marks');
    }

    _projection = d3.geo.transform({
        point: function(x, y) {
            var point = _map.latLngToLayerPoint(new _L.LatLng(y, x));
            this.stream.point(point.x, point.y);
        }
    });

    // Reposition the SVG to cover the features.
    var reset = function() {
        var bounds = path.bounds(_geometry),
            topLeft = bounds[0],
            bottomRight = bounds[1];

        map_svg.attr("width", bottomRight[0] - topLeft[0])
            .attr("height", bottomRight[1] - topLeft[1])
            .style("left", topLeft[0] + "px")
            .style("top", topLeft[1] + "px");

        map_container.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
        //console.log('zoom', _map.getZoom(), _map.getMaxZoom());
        update_mark_positions();
        draw_topojson();
    };

    path.projection(d3.geo.transform());
    var map_bounds = path.bounds(_geometry);
    path.projection(_projection);
    console.log('bounds', map_bounds);

    if (map_initialized) {
        if (_bounding_box) {
            _map.fitBounds(_bounding_box.map(function(d) { return d.reverse(); }));
        } else {
            _map.fitBounds(map_bounds.map(function(d) { return d.reverse(); }));
        }
    }

    if (!overlay_svg.select('g.{{ visualization_name }}-legends').empty()) {
        container_legends = overlay_svg.select('g.{{ visualization_name }}-legends');
    } else {
        container_legends = overlay_svg.append('g').classed('{{ visualization_name }}-legends', true);
    }

    _map.on("viewreset", reset);
    filter_non_valid_marks();
    reset();
{% else %}
    map_container = container;

    path_g = map_container.select('g.geo-paths');

    if (path_g.empty()) {
        path_g = map_container.append('g').attr('class', 'geo-paths');
    }

    graph_g = map_container.select('g.graph');
    if (graph_g.empty()) {
        graph_g = map_container.append('g').attr('class', 'graph');
    }

    mark_g = map_container.select('g.marks');
    if (mark_g.empty()) {
        mark_g = map_container.append('g').attr('class', 'marks');
    }

    _projection = d3.geo.mercator()
        .center([0,0])
        .scale(1)
        .translate([0, 0]);

    path.projection(_projection);

    var st = matta.fit_projection(map_width, map_height, path.bounds(_geometry));
    _projection.scale(st[0]).translate(st[1]);

    filter_non_valid_marks();
    update_mark_positions();
    draw_topojson();
{% endif %}
