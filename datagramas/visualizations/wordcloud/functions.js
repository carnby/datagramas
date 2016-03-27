
var cloud_draw = function(vis_container, words, bounds) {
    statusText.style("display", "none");
    var scale = bounds ? Math.min(
        _vis_width / Math.abs(bounds[1].x - _vis_width / 2),
        _vis_width / Math.abs(bounds[0].x - _vis_width / 2),
        _vis_height / Math.abs(bounds[1].y - _vis_height / 2),
        _vis_height / Math.abs(bounds[0].y - _vis_height / 2)) / 2 : 1;

    var text = vis_container.selectAll("text")
        .data(words, function(d) { return matta.get(d, _text); });

    text.transition()
        .duration(1000)
        .attr("transform", function(d) { return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")"; })
        .style("font-size", function(d) { return d.size + "px"; });

    text.enter().append("text")
        .attr("text-anchor", "middle")
        .attr("transform", function(d) { return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")"; })
        .style("font-size", function(d) { return d.size + "px"; })
        .style("opacity", 1e-6)
        .transition()
        .duration(1000)
        .style("opacity", _font_opacity);

    text.style("font-family", function(d){ return d.font; })
        .style("font-weight", _font_weight)
        .style("fill", _font_color)
        .text(function(d){ return matta.get(d, _text); });
};