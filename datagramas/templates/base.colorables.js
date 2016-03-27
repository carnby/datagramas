{% if colorables %}
{% for var_name, var_values in colorables.items() %}
    var _{{ var_name }} = null;
    var _{{ var_name }}_scale = null;
    var _{{ var_name }}_scale_locked = false;
    var _{{ var_name }}_update_scale_func = d3.functor(null);

    func_{{ visualization_name }}.{{ var_name }}_scale_locked = function(__) {
        /**
         * If {{ var_name }}'s color scale is locked, then {{ visualization_name }} will not automatically update it
         * before rendering. Useful to set the scale parameters from outside, or to maintain
         * coherent scaling between succesive renderings.
         */
        if (arguments.length) {
            _{{ var_name }}_scale_locked = __;
            console.log('set {{ var_name }}_scale_locked', _{{ var_name }}_scale_locked);
            return func_{{ visualization_name }};
        }
        return _{{ var_name }}_scale_locked;
    };

    func_{{ visualization_name }}.{{ var_name }}_scale = function() {
        /**
         * Returns the color scale for {{ var_name }}.
         */
        return _{{ var_name }}_scale;
    };

    var _{{ var_name }}_value = {{ var_values.value }};

    // to the outside, this function sets/gets the variable we use
    func_{{ visualization_name }}.{{ var_name }} = function(__) {
        if (arguments.length) {
            //TODO: consider the case when the value is fixed, not a variable
            _{{ var_name }}_value = __;
            return func_{{ visualization_name }};
        }
        return _{{ var_name }}_value;
    };

    // {{ var_values }}
    // TODO: create get/setters for these variables

    var _{{ var_name }}_palette = {{ var_values.palette }};
    var _{{ var_name }}_domain = {{ var_values.domain }};
    var _{{ var_name }}_scale_type = {{ var_values.scale }};
    var _{{ var_name }}_show_legend = {{ var_values.legend }};
    var _{{ var_name }}_legend = null;
    var _{{ var_name }}_legend_container = null;

    if (_{{ var_name }}_palette !== null) {
        if (_{{ var_name }}_scale_type === 'threshold' || _{{ var_name }}_scale_type === 'quantize') {
            _{{ var_name }}_scale = d3.scale.quantize().range(_{{ var_name }}_palette);

        } else if (_{{ var_name }}_scale_type === 'ordinal') {
            _{{ var_name }}_scale = d3.scale.ordinal().range(_{{ var_name }}_palette);
        } else {
            throw '{{ var_name }}: Undefined color scale {{ var_values.scale }}.';
        }

        if (_{{ var_name }}_domain !== null) {
            // if manually specified, we lock the scale
            _{{ var_name }}_scale.domain(_{{ var_name }}_domain);
            _{{ var_name }}_scale_locked = true;
        }

        _{{ var_name }}_update_scale_func = function(data) {
            // updates the domain before draw
            if (_{{ var_name }}_scale_locked) {
                return;
            }

            _{{ var_name }}_scale.domain(
                _{{ var_name }}_scale_type === 'threshold' || _{{ var_name }}_scale_type === 'quantize' ?
                    d3.extent(data, function(d) { return datagramas.get(d, _{{ var_name }}_value); }) :
                    d3.set(data.map(function (d) { return datagramas.get(d, _{{ var_name }}_value); })).values().sort()
            );
            console.log('{{ var_name }} scale range', _{{ var_name }}_scale.range());
            console.log('{{ var_name }} scale domain', _{{ var_name }}_scale.domain());
        };

        _{{ var_name }} = function(d) {
            //console.log('_{{ var_name }}', d, _{{ var_name }}_value, datagramas.get(d, _{{ var_name }}_value), _{{ var_name }}_scale(datagramas.get(d, _{{ var_name }}_value)));
            return _{{ var_name }}_scale(datagramas.get(d, _{{ var_name }}_value));
        };

        console.log('{{ var_name }} show legend', _{{ var_name }}_show_legend);
        // we can create the legend if desired
        if (_{{ var_name }}_show_legend) {
            _{{ var_name }}_legend = datagramas.legend.color()
                    .useClass(false)
                    .scale(_{{ var_name }}_scale)
                    // TODO: this should be automatic or a colorable option
                    .labelFormat(d3.format('.2f'))
                    .title(_{{ var_name }}_value);

            _{{ var_name }}_legend['variable'] = '{{ var_name }}';
            active_legends.push(_{{ var_name }}_legend);
            console.log('{{ var_name }} legend', _{{ var_name }}_legend);
        }

    } else {
        _{{ var_name }} = d3.functor(_{{ var_name }}_value !== null ? _{{ var_name }}_value : 'none');
    }
{% endfor %}
{% endif %}