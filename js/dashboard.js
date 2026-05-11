let globalData = [];

let currentFeature = "danceability";


// =========================
// 加载数据并转换字段
// =========================
d3.csv("data/spotify.csv").then(data => {

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


  // 默认随机采样1000个
  const sampled = randomSample(globalData, 1000);

  drawScatter(sampled);

  drawGenreChart(sampled);

  drawRadarChart(sampled[0]);

  setupSampleSlider();

  setupFeatureSelector();
});


// =========================
// 随机采样
// =========================
function randomSample(data, n) {

  const shuffled =
    [...data].sort(() => 0.5 - Math.random());

  return shuffled.slice(0, n);
}


// =========================
// Sample Slider
// =========================
function setupSampleSlider() {

  const slider =
    document.getElementById("sampleSlider");

  const label =
    document.getElementById("sampleValue");

  slider.addEventListener("input", () => {

    const n = +slider.value;

    label.textContent = n;

    const sampled =
      randomSample(globalData, n);

    redrawAll(sampled);
  });
}


// =========================
// Feature Selector
// =========================
function setupFeatureSelector() {

  const featureSelect =
    document.getElementById("featureSelect");

  featureSelect.addEventListener("change", () => {

    currentFeature =
      featureSelect.value;

    const n =
      +document.getElementById("sampleSlider").value;

    const sampled =
      randomSample(globalData, n);

    redrawAll(sampled);
  });
}


// =========================
// 重绘所有图表
// =========================
function redrawAll(data) {

  document.getElementById("scatter").innerHTML = "";

  document.getElementById("genreChart").innerHTML = "";

  drawScatter(data);

  drawGenreChart(data);

  drawRadarChart(data[0]);
}


// =========================
// Scatter Plot
// =========================
function drawScatter(data) {

  const spec = {

    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",

    width: "container",

    height: 500,

    background: "transparent",

    data: {
      values: data
    },

    config: {

      axis: {
        labelColor: "#b3b3b3",
        titleColor: "#ffffff",
        gridColor: "#333333"
      },

      legend: {
        labelColor: "#b3b3b3",
        titleColor: "#ffffff"
      },

      view: {
        stroke: "transparent"
      }
    },

    layer: [

      // 散点
      {

        mark: {
          type: "circle",
          tooltip: true,
          opacity: 0.6
        },

        encoding: {

          x: {
            field: currentFeature,
            type: "quantitative",
            title: currentFeature
          },

          y: {
            field: "popularity",
            type: "quantitative",
            title: "Popularity"
          },

          size: {
            field: "energy",
            type: "quantitative",
            title: "Energy"
          },

          color: {
            field: "track_genre",
            type: "nominal",
            scale: {
              scheme: "category20"
            },
            title: "Genre"
          },

          tooltip: [

            {
              field: "track_name",
              title: "Song"
            },

            {
              field: "artists",
              title: "Artist"
            },

            {
              field: "track_genre",
              title: "Genre"
            },

            {
              field: "popularity",
              title: "Popularity"
            },

            {
              field: currentFeature,
              title: currentFeature
            }
          ]
        }
      },


      // 回归趋势线
      {

        transform: [
          {
            regression: "popularity",
            on: currentFeature
          }
        ],

        mark: {
          type: "line",
          color: "#1DB954",
          strokeWidth: 4
        },

        encoding: {

          x: {
            field: currentFeature,
            type: "quantitative"
          },

          y: {
            field: "popularity",
            type: "quantitative"
          }
        }
      }
    ]
  };


  vegaEmbed("#scatter", spec).then(result => {

    const view = result.view;

    // 点击歌曲更新 radar chart
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

    height: {
      "step": 15
    },

    background: "transparent",

    data: {
      values: data
    },

    config: {

      axis: {
        labelColor: "#b3b3b3",
        titleColor: "#ffffff",
        gridColor: "#333333"
      },

      view: {
        stroke: "transparent"
      }
    },

    mark: "bar",

    params: [

      {
        name: "genreSelect",

        select: {
          type: "point",
          fields: ["track_genre"],
          on: "click"
        }
      }
    ],

    encoding: {

      y: {
        field: "track_genre",
        type: "nominal",
        sort: "-x",
        title: "Genre"
      },

      x: {
        aggregate: "count",
        type: "quantitative",
        title: "Songs"
      },

      color: {

        condition: {
          param: "genreSelect",
          value: "#1DB954"
        },

        value: "gray"
      }
    }
  };


  vegaEmbed("#genreChart", spec).then(result => {

    const view = result.view;

    view.addSignalListener(
      "genreSelect",
      (name, value) => {

        // 没选中 → 恢复当前 sample
        if (!value || !value.track_genre || !value.track_genre.length) {

          const n =
            +document.getElementById("sampleSlider").value;

          const sampled =
            randomSample(globalData, n);

          drawScatter(sampled);

          return;
        }

        const genre =
          value.track_genre[0]
            .trim()
            .toLowerCase();

        const n =
          +document.getElementById("sampleSlider").value;

        const sampled =
          randomSample(globalData, n);

        const filtered =
          sampled.filter(d =>
            d.track_genre
              .trim()
              .toLowerCase() === genre
          );

        drawScatter(filtered);
      }
    );
  });
}