const spec = {

  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",

  width: 900,
  height: 500,

  data: {
    url: "data/spotify.csv"
  },

  mark: {
    type: "circle",
    tooltip: true
  },

  encoding: {

    x: {
      field: "danceability",
      type: "quantitative",
      title: "Danceability"
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
        field: "popularity",
        title: "Popularity"
      },

      {
        field: "danceability",
        title: "Danceability"
      },

      {
        field: "energy",
        title: "Energy"
      }
    ]
  },

  selection: {
    zoom: {
      type: "interval",
      bind: "scales"
    }
  }
};

vegaEmbed('#scatter', spec);