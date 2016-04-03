var diameter = Math.min(_vis_width, _vis_height);

var pack = d3.layout.pack()
    .size([diameter - 4, diameter - 4])
    .value(function(d) { return datagramas.get(d, _node_value); })
    .children(function (d) {
        return datagramas.get(d, _node_children);
    });

var root = pack.nodes(_data_tree);
console.log('root', root);
_node_color_update_scale_func(root.filter(function(d) { return datagramas.get(d, _node_value) > 0; }));

var node = container.selectAll('.node')
    .data(root);

var node_background = function (d) {
    if (_color_level >= 0 && _color_level !== d.depth) {
        return 'none';
    }

    if (datagramas.get(d, _node_children) !== null) {
        return 'none';
    }

    return _node_color(d);
};

var node_text = function (d) {
    if (_label_leaves_only && datagramas.get(d, _node_children) != null) {
        return null;
    }
    return _node_label != null ? datagramas.get(d, _node_label) : null;
};

node.enter().append('g').each(function(d, i) {
    var self = d3.select(this);
    self.append('circle');
    self.append('text').attr('text-anchor', 'middle');

    dispatch.node_selection_enter.apply(this, arguments);
});

node.attr('class', function(d) { return d.children ? 'node node-depth-' + d.depth  : 'node-leaf node node-depth-' + d.depth; })
    .attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; });

node.selectAll('circle')
    .attr({
        'r': function(d) { return d.r - _node_padding; },
        'fill-opacity': _node_opacity,
        'fill': node_background,
        'stroke-width': _node_border,
        'stroke': _node_border_color
    }).on('click', function(d, i) {
        console.log('click!', d, i, this);
        dispatch.node_click.apply(this, arguments);
    });


node.selectAll('text')
    .text(node_text);

node.exit().each(function(d, i) {
        dispatch.node_selection_exit.apply(this, arguments);
    })
    .remove();
