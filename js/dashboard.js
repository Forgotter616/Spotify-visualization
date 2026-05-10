let globalData = [];

// =========================
// 加载数据并转换字段
// =========================
d3.csv("data/spotify.csv").then(data => {

  // 转换数值字段，并去掉 track_genre 空格
  globalData = data.map(d => ({
    ...d,
    danceability: +d.danceability,
    popularity: +d.popularity,
    energy: +d.energy,
    speechiness: +d.speechiness,
    acousticness: +d.acousticness,
    instrumentalness: +d.instrumentalness,
    liveness: +d.liveness,
    valence: +d.valence,
    tempo: +d.tempo,
    track_genre: d.track_genre.trim()
  }));

  drawScatter(globalData);       // 默认显示全部数据
  drawGenreChart(globalData);    // 绘制右边 genre 条形图
  drawRadarChart(globalData[0]); // 默认 radar chart 显示第一首歌
});


// =========================
// Scatter Plot
// =========================
function drawScatter(data) {

  const spec = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    width: 800,
    height: 500,
    data: { values: data },
    mark: { type: "circle", tooltip: true },
    encoding: {
      x: { field: "danceability", type: "quantitative", title: "Danceability" },
      y: { field: "popularity", type: "quantitative", title: "Popularity" },
      size: { field: "energy", type: "quantitative", title: "Energy" },
      color: { field: "track_genre", type: "nominal", scale: { scheme: "category20" }, title: "Genre" },
      tooltip: [
        { field: "track_name", title: "Song" },
        { field: "artists", title: "Artist" },
        { field: "track_genre", title: "Genre" },
        { field: "popularity", title: "Popularity" },
        { field: "danceability", title: "Danceability" },
        { field: "energy", title: "Energy" }
      ]
    }
  };

  // 清空旧 scatter
  document.getElementById("scatter").innerHTML = "";

  vegaEmbed("#scatter", spec).then(result => {

    const view = result.view;

    // 点击 scatter 点显示 radar chart
    view.addEventListener("click", (event, item) => {
      if (item && item.datum) {
        drawRadarChart(item.datum);
      }
    });
  });
}


// =========================
// Genre Chart
// =========================
function drawGenreChart(data) {

  const spec = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    width: 250,
    height: { "step": 15 }, // 根据类别数量自适应高度，避免标签遮挡
    data: { values: data },
    mark: "bar",
    params: [{
      name: "genreSelect",
      select: {
        type: "point",
        fields: ["track_genre"],
        on: "click"
      }
    }],
    encoding: {
      y: { field: "track_genre", type: "nominal", sort: "-x", title: "Genre" },
      x: { aggregate: "count", type: "quantitative", title: "Songs" },
      color: {
        condition: { param: "genreSelect", value: "#1DB954" },
        value: "gray"
      }
    }
  };

  vegaEmbed("#genreChart", spec).then(result => {

    const view = result.view;

    // 点击 genre 条形图更新 scatter plot
    view.addSignalListener("genreSelect", (name, value) => {

      if (!value || !value.track_genre || !value.track_genre.length) {
        // 取消选择 → 显示全部数据
        drawScatter(globalData);
        return;
      }

      const genre = value.track_genre[0].trim().toLowerCase();

      const filtered = globalData.filter(d =>
        d.track_genre.trim().toLowerCase() === genre
      );

      drawScatter(filtered);
    });
  });
}