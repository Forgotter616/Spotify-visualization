function drawRadarChart(song) {

  d3.select("#radarChart").selectAll("*").remove();

  const svg = d3.select("#radarChart");

  const width = 500;
  const height = 500;

  const centerX = width / 2;
  const centerY = height / 2;

  const radius = 180;

  // 标题
  svg.append("text")
    .attr("x", centerX)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .attr("fill", "#ffffff")
    .attr("font-size", "22px")
    .attr("font-weight", "bold")
    .attr("font-family", "'Montserrat', sans-serif")
    .text(song.track_name);

  const features = [

    {
        axis: "danceability",
        value: +song.danceability
    },

    {
        axis: "energy",
        value: +song.energy
    },

    {
        axis: "speechiness",
        value: +song.speechiness
    },

    {
        axis: "acousticness",
        value: +song.acousticness
    },

    {
        axis: "instrumentalness",
        value: +song.instrumentalness
    },

    {
        axis: "liveness",
        value: +song.liveness
    },

    {
        axis: "valence",
        value: +song.valence
    },

    {
        axis: "tempo",
        value: (+song.tempo) / 200
    }
  ];

  const angleSlice = Math.PI * 2 / features.length;

  // 网格
  for (let level = 1; level <= 5; level++) {

    const r = radius * level / 5;

    let points = [];

    features.forEach((f, i) => {

      const angle = i * angleSlice - Math.PI / 2;

      const x = centerX + r * Math.cos(angle);

      const y = centerY + r * Math.sin(angle);

      points.push([x, y]);
    });

    svg.append("polygon")
      .attr("points", points.map(p => p.join(",")).join(" "))
      .attr("fill", "none")
      .attr("stroke", "#444");
  }

  // 坐标轴
  features.forEach((f, i) => {

    const angle = i * angleSlice - Math.PI / 2;

    const x = centerX + radius * Math.cos(angle);

    const y = centerY + radius * Math.sin(angle);

    svg.append("line")
      .attr("x1", centerX)
      .attr("y1", centerY)
      .attr("x2", x)
      .attr("y2", y)
      .attr("stroke", "#666");

    svg.append("text")
      .attr("x", x)
      .attr("y", y)
      .attr("fill", "white")
      .attr("font-size", "12px")
      .attr("text-anchor", "middle")
      .text(f.axis);
  });

  // 数据点
  let radarPoints = [];
  let pointsData = [];

  features.forEach((f, i) => {

    const angle = i * angleSlice - Math.PI / 2;

    const r = radius * f.value;

    const x = centerX + r * Math.cos(angle);

    const y = centerY + r * Math.sin(angle);

    radarPoints.push([x, y]);
    
    // 保存绘制点的位置和真实数值供 tooltip 使用
    // 注意 tempo 被除以 200，展示的时候需要用真实值
    let displayValue = (f.axis === "tempo") ? song.tempo : f.value;
    pointsData.push({ x, y, feature: f.axis, value: displayValue });
  });

  // 动画 polygon
  svg.append("polygon")
    .attr("points", radarPoints.map(p => p.join(",")).join(" "))
    .attr("fill", "#1DB954")
    .attr("fill-opacity", 0)
    .attr("stroke", "#1DB954")
    .attr("stroke-width", 2)
    .transition()
    .duration(800)
    .attr("fill-opacity", 0.5);

  // 初始化 Tooltip（如果不存在）
  let tooltip = d3.select("body").select(".radar-tooltip");
  if (tooltip.empty()) {
    tooltip = d3.select("body").append("div")
      .attr("class", "radar-tooltip");
  }

  // 绘制圆点并添加交互
  svg.selectAll(".radar-circle")
    .data(pointsData)
    .enter()
    .append("circle")
    .attr("class", "radar-circle")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", 5)
    .attr("fill", "#1DB954")
    .attr("stroke", "white")
    .attr("stroke-width", 1.5)
    .style("cursor", "crosshair")
    .on("mouseover", (event, d) => {
      tooltip.classed("show", true)
        .html(`<strong>${d.feature.toUpperCase()}</strong><br/><span style="color:#1DB954">${(d.value).toString().substring(0,6)}</span>`);
    })
    .on("mousemove", (event) => {
      tooltip.style("left", (event.pageX + 15) + "px")
             .style("top", (event.pageY - 20) + "px");
    })
    .on("mouseout", () => {
      tooltip.classed("show", false);
    });
}