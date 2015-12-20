
{% if options.fit_labels %}
    var target_angle = Math.atan2(1.0 / _target_ratio, 1.0);
    console.log('target angle', target_angle);

    var font_scale = d3.scale.linear().domain([_width * _height * 0.05, _width * _height]).range([_font_size, 120]).clamp(true);
    var font_ratio = d3.scale.linear().domain([0, target_angle]).range([80, 8]).clamp(true);

    var calc_fontsize = function(d) {
        var angle = Math.atan2(d.dy, d.dx);
        var diff = 1.0 - Math.abs(angle - target_angle);
        
        var ratio_size = font_ratio(Math.abs(angle - target_angle));
        var diag_size = font_scale(d.dy * d.dx);
        return ((0.9 * diag_size) + (0.1 * ratio_size));
    };

    var adapt_fontsize = function(node, target_fs, target_w, target_h) {
        var width = node.scrollWidth;
        var height = node.scrollHeight;
        console.log(node, target_fs, height, target_h);
        var ratio = target_h / _height;
        d3.select(node).style("font-size", (target_fs * Math.sqrt(ratio)) + "px")
    };
{% else %}
    var calc_fontsize = d3.functor(_font_size);
{% endif %}

var treemap = d3.layout.treemap()
    .size([_width, _height])
    .value(function(d) { return matta.get(d, _node_value); })
    .children(function(d) { return matta.get(d, _node_children); })
    .padding(_node_padding)
    .ratio(_target_ratio)
    .mode(_mode)
    .sticky(_sticky);

//_node_color_update_scale_func()

var root = treemap.nodes(_data_tree);
console.log('root', root);
_node_color_update_scale_func(root);

console.log('nodes', root);
var cell = container
    .selectAll("div.node")
    .data(root, function(d) {
        return matta.get(d, _node_id);
    });

var node_background = function(d) {
    if (_color_level >= 0 && _color_level !== d.depth) {
        return 'none';
    }

    if (matta.get(d, _node_children) !== null) {
        return 'none';
    }

    console.log('colorable', matta.get(d, _node_label), matta.get(d, _node_value), _node_color(d), d);
    return _node_color(d);
};

var node_text = function(d) {
    if (_label_leaves_only && matta.get(d, _node_children) != null) {
        return null;
    }
    return _node_label != null ? matta.get(d, _node_label) : null;
};

var node_color = function(d) {
    var color = node_background(d);
    if (node_text(d) !== null && color !== 'none') {
        return matta.text_color(color);
    }

    return null;
};

cell.enter()
    .append("div")
    .classed('node', true)
    .style({
        'font-size': function(d) { return calc_fontsize(d) + 'px'; },
        'position': 'absolute',
        'background-color': node_background,
        'border': _border_color + ' ' + _node_border + 'px solid',
        'overflow': 'hidden',
        'color': node_color
    })
    .text(node_text);

cell.style({
    'left': function(d) { return d.x + 'px'; },
    'top': function(d) { return d.y + 'px'; },
    'width': function(d) { return Math.max(0, d.dx - (2 * _node_padding)) + 'px'; },
    'height': function(d) { return Math.max(0, d.dy - (2 * _node_padding)) + 'px'; }
});

cell.sort(function(a, b) { return d3.ascending(a.depth, b.depth); });

{% if options.fit_labels %}
cell.each(function(d) {
    adapt_fontsize(this, calc_fontsize(d), d.dx, d.dy);
});
{% endif %}





