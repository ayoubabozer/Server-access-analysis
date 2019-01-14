jQuery(document).ready(function() {

  // constants definition
  const methodChartId = 'methodChart';
  const methodChartTitle = 'Distribution of HTTP methods';

  const requestsPerMinuteChartId = 'requestsPerMinuteChart';
  const requestsPerMinuteChartTitle = 'Requests per minute';
  const requestsPerMinuteChartLabel = 'Num of requests';

  const responseCodeChartId = 'responseCodeChart';
  const responseCodeChartTitle = 'Distribution of HTTP answer codes';

  const documentSizeChartId = 'documentSizeChart';
  const documentSizeChartTitle = 'Distribution of the size of the answer of all requests with code 200 and size < 1000B';
  const documentSizeChartLabel = 'Distribution rate';

  const palette = [
      "#3e95cd",
      "#8e5ea2",
      "#3cba9f",
      "#a52a2a",
      "#bdb76b",
      "#ffb6c1",
      "#ff8c00",
      "#add8e6",
      "#ffd700",
  ];

  // get array of colors of given size
  var getColorsFromPalette = function(num){
      var result = [],i;
      var paletteSize = palette.length;
      for(i = 0; i < num; i++) {
          result.push( palette[i % paletteSize] );
      }
      return result;
  };

  // parsed JSON
  var epaDataRecords = JSON.parse(window.epadata);

  // return counted groups by given key
  var getGroupsCounting = function(array, group){
    array[group] = array[group] ? array[group] + 1 : 1;
    return array;
  };

  // return calculated distribution of an obj values
  var getGroupsDistribution = function (obj){
    return Object.values(obj).map((value) => {
            var data = Object.values(obj),
                total = data.reduce((a, b) => a + b, 0);
            return (total > 0) ? ((value / total)*100) : 0;
        }).map((value) => {return parseFloat(Math.round(value*100) / 100).toFixed(2);});
  };

  // get requests per minute groups
  var requestsPerMinuteGroups = epaDataRecords.reduce((count, el) => {
    var day_hour_min = el.datetime.day + 'th ' + el.datetime.hour + ':' + el.datetime.minute;
    return getGroupsCounting(count, day_hour_min);
  }, Object.create(null));

  // get response code groups
  var responseCodeGroups = epaDataRecords.reduce((count, el) => {
    return getGroupsCounting(count, el.response_code);
  }, Object.create(null));

  // get method groups
  var methodGroups = epaDataRecords.reduce((count, el) => {
    return getGroupsCounting(count, el.request.method);
  }, Object.create(null));

  // filter requests to get all requests with code 200 and size < 1000B
  var filteredDocumentSizeGroups = (epaDataRecords).filter(function(el) {
    return el.response_code == 200 && el.document_size < 1000;
  });

    // get filtered groups by document size
  var documentSizeGroups = filteredDocumentSizeGroups.reduce((count, el) => {
    return getGroupsCounting(count, el.document_size);
  }, Object.create(null));

    // object defining the document size chart
  var documentSizeChartObj = {
    id: documentSizeChartId,
    label: documentSizeChartLabel,
    labels: Object.keys(documentSizeGroups),
    data: getGroupsDistribution(Object.values(documentSizeGroups)),
    borderColor: getColorsFromPalette(1),
    backgroundColor: getColorsFromPalette(1),
    options: {
      title: {
        display: true,
        text: documentSizeChartTitle
      }
    }
  };

  // object defining the method chart
  var methodChartObj = {
    id: methodChartId,
    labels: Object.keys(methodGroups),
    data: getGroupsDistribution(Object.values(methodGroups)),
    backgroundColor: getColorsFromPalette(Object.keys(methodGroups).length),
    options: {
      title: {
        display: true,
        text: methodChartTitle
      }
    }
  };

  // object defining the requests per minute chart
  var requestsPerMinuteChartObj = {
    id: requestsPerMinuteChartId,
    label: requestsPerMinuteChartLabel,
    labels: Object.keys(requestsPerMinuteGroups),
    data: Object.values(requestsPerMinuteGroups),
    borderColor: getColorsFromPalette(1),
    backgroundColor: getColorsFromPalette(1),
    options: {
      title: {
        display: true,
        text: requestsPerMinuteChartTitle
      }
    }
  };

  // object defining response code chart
  var responseCodeChartObj = {
    id: responseCodeChartId,
    labels: Object.keys(responseCodeGroups),
    data: getGroupsDistribution(Object.values(responseCodeGroups)),
    backgroundColor: getColorsFromPalette(Object.keys(responseCodeGroups).length),
    options: {
        legend: { display: false },
        title: {
          display: true,
          text: responseCodeChartTitle
        }
      }
  };

  // Pie chart class
  class PieChart {
    constructor(args) {
      this.type = 'pie';
      this.ctx = document.getElementById(args.id).getContext('2d');
      this.labels = args.labels;
      this.data = args.data;
      this.backgroundColor = args.backgroundColor;
      this.options = args.options;
    }

    render() {
      return new Chart(this.ctx, {
        type: this.type,
        data: {
          labels: this.labels,
          datasets: [{
            backgroundColor: this.backgroundColor,
            data: this.data
          }]
        },
        options: this.options
      });
    }
  };

  // Line chart class
  class LineChart {
    constructor(args) {
      this.type = 'line';
      this.ctx = document.getElementById(args.id).getContext('2d');
      this.labels = args.labels;
      this.label = args.label;
      this.data = args.data;
      this.borderColor = args.borderColor;
      this.backgroundColor = args.backgroundColor
      this.fill = 'start';
      this.options = args.options;
    }

    render() {
      return new Chart(this.ctx, {
        type: this.type,
        data: {
          labels: this.labels,
          datasets: [{
            data: this.data,
            label: this.label,
            borderColor: this.borderColor,
            backgroundColor: this.backgroundColor,
            fill: this.fill
          }]
        },
        options: this.options
      });
    }
  };

  // Bar chart class
  class BarChart {
    constructor(args) {
      this.type = 'bar';
      this.ctx = document.getElementById(args.id).getContext('2d');
      this.labels = args.labels;
      this.data = args.data;
      this.backgroundColor = args.backgroundColor;
      this.options = args.options;
    }

    render() {
      return new Chart(this.ctx, {
        type: this.type,
        data: {
          labels: this.labels,
          datasets: [{
            data: this.data,
            backgroundColor: this.backgroundColor,
          }]
        },
        options: this.options
      });
    }
  };

  // render all charts
  var renderCharts = function() {
    new PieChart(methodChartObj).render();
    new LineChart(requestsPerMinuteChartObj).render();
    new BarChart(responseCodeChartObj).render();
    new LineChart(documentSizeChartObj).render();

  };

  renderCharts();

});
