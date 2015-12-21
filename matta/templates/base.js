
/**
 * {% if author_comment %}{{ author_comment }}{% endif %}
 * {{ visualization_name }} was scaffolded using matta - https://github.com/carnby/matta
 * Variables that start with an underscore (_) are passed as arguments in Python.
 * Variables that start with _data are data parameters of the visualization, and expected to be given as datum.
 *
 * For instance, d3.select('#figure').datum({'graph': a_json_graph, 'dataframe': a_json_dataframe}).call(visualization)
 * will fill the variables _data_graph and _data_dataframe.
 *
 */

var matta_{{ visualization_name }} = function() {
    "use strict";

    var __fill_data__ = function(__data__) {
        // {{ __data_variables__ }}
        {% for var_name in __data_variables__ %}
            if (__data__.hasOwnProperty('{{ var_name }}')) {
                func_{{ visualization_name }}.{{ var_name }}(__data__.{{ var_name }});
            } else {
                func_{{ visualization_name }}.{{ var_name }}(null);
            }
        {% endfor %}
    };

    {% if options.events %}
        var dispatch = d3.dispatch('{{ options.events|join('\', \'') }}');
    {% endif %}

    var func_{{ visualization_name }} = function (selection) {
        var _vis_width = _width - _padding.left - _padding.right;
        var _vis_height = _height - _padding.top - _padding.bottom;

        selection.each(function(__data__) {
            __fill_data__(__data__);

            var container = null;
            var figure_dom_element = this;
            var container_legends = null;

            if (d3.select(this).select('{{ container_type }}.{{ visualization_name }}-container').empty()) {
                {% if container_type == 'svg' %}
                    var svg = d3.select(this).append('svg')
                        .attr('width', _width)
                        .attr('height', _height)
                        .attr('class', '{{ visualization_name }}-container');

                    {% if options.background_color %}
                        svg.append('rect')
                            .attr('width', _width)
                            .attr('height', _height)
                            .attr('fill', '{{ options.background_color }}');
                    {% endif %}

                    container = svg.append('g')
                        .classed('{{ visualization_name }}-container', true)
                        .attr('transform', 'translate(' + _padding.left + ',' + _padding.top + ')');

                    container_legends = svg.append('g')
                        .classed('{{ visualization_name }}-legends', true)
                        .attr('transform', 'translate(' + _padding.left + ',' + _padding.top + ')');

                {% elif container_type == 'div' %}
                    // NOTE: a vis. of this kind should manage the legends container (which should be an svg) by itself.
                    var div = d3.select(this).append('div')
                        .style({
                            {% if not options.skip_figure_size %}
                            'width': _width + 'px',
                            'height': _height + 'px',
                            {% endif %}
                            'position': 'relative',
                            'display': 'block'
                        })
                        .classed('{{ visualization_name }}-container', true);

                    {% if options.background_color %}
                        div.style('background', '{{ options.background_color }}');
                    {% endif %}

                    container = div;

                {% else %}
                    console.log('unsupported container type!');
                    return;
                {% endif %}
            } else {
                container = d3.select(this).select('{{ container_type }}.{{ visualization_name }}-container');
            }

            {% if functions_js %}{{ functions_js }}{% endif %}
            {% if visualization_js %}{{ visualization_js }}{% endif %}
        });
    };

    {% for var_name in __data_variables__ %}
        var _data_{{ var_name }} = null;
        func_{{ visualization_name }}.{{ var_name }} = function(__) {
            console.log('DATA {{ var_name }}', arguments);
            if (arguments.length) {
                _data_{{ var_name }} = __;
                console.log('SET DATA {{ var_name }}', _data_{{ var_name }});
                return func_{{ visualization_name }};
            }
            return _data_{{ var_name }};
        };
    {% endfor %}

    var active_legends = [];

    {% include 'base.attributes.js' %}
    {% include 'base.colorables.js' %}

    // TODO: make a more flexible system.
    // TODO: Allow "outer", "middle" and "center"
    var allowed_locations = [['upper', 'right'], ['lower', 'right'], ['lower', 'left'], ['upper', 'left']];

    var draw_legends = function(container_legends, width, height) {
        /**
         * This function draws the current legends into the specified container.
         */

        var legend = container_legends.selectAll('g.matta-legend')
            .data(active_legends, function(d) { return d['variable']; });

        legend.enter()
            .append('g')
            .attr('class', function(d) { return 'matta-legend'; });

        legend.exit()
            .remove();

        legend.each(function(d, i) {
            console.log('each legend', d, this);
            var self = d3.select(this);
            self.call(d);
            var bbox = self.node().getBBox();
            console.log('bbox', bbox);

            // hack to avoid problems with too many legends.
            var location = allowed_locations[i % allowed_locations.length];
            console.log('location', location);

            var pos_y = location[0] === 'upper' ? 15 : height - 15 - bbox.height;
            var pos_x = location[1] === 'left' ? 15 : width - 15 - bbox.width;
            console.log(pos_x, pos_y);
            self.attr('transform', 'translate(' + [pos_x, pos_y] + ')');
        });
    };

    {% if read_only %}
    {% for var_name in read_only %}
        var _{{ var_name }} = null;
        func_{{ visualization_name }}.{{ var_name }} = function() {
            return _{{ var_name }};
        };
    {% endfor %}
    {% endif %}

    {% if variables %}
    {% for var_name, var_value in variables.items() %}
        var _{{ var_name }} = {{ var_value }};
        func_{{ visualization_name }}.{{ var_name }} = function(__) {
            if (arguments.length) {
                _{{ var_name }} = __;
                console.log('set {{ var_name }}', _{{ var_name }});
                return func_{{ visualization_name }};
            }
            return _{{ var_name }};
        };
    {% endfor %}
    {% endif %}

    {% if auxiliary %}
        var auxiliary = {};
    {% for var_name in auxiliary %}
        auxiliary.{{ var_name }} = null;
    {% endfor %}
    {% endif %}

    {% if options.events %}
        {% for event in options.events %}
            d3.rebind(func_{{ visualization_name }}, dispatch, '{{ event }}');
        {% endfor %}
        d3.rebind(func_{{ visualization_name }}, dispatch, 'on');
    {% endif %}

    return func_{{ visualization_name }};
};
