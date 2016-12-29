require('d3');
require('nvd3');

fetch('/gas/chart')
  .then(r => r.json())
  .then(raw => raw.filter(el =>
    el.key === 'Gasolina simples 95' ||
    el.key === 'Gasolina 98' ||
    el.key == 'Gasóleo simples')
  )
  .then(data => {
    nv.addGraph(() => {
      let chart = nv.models.lineChart();

      // customization
      chart.margin({left: 40})
      chart.color(['#FB8B1E','#668BFC','#FC566A'])
      chart.showLegend(false);

      //axis
      //x
      chart.xScale(d3.time.scale());
      chart.xAxis.ticks(10);
      chart.xAxis.tickFormat(function(d) {
        const dd = new Date(d);
        if (dd.getDate() !== 1)
          return d3.time.format('%e')(dd)
        else
          return d3.time.format('%e%b')(dd)
      });
      const maxDate = data[0].values[0].x;
      var d = new Date(maxDate)
      var md = d;
      d.setMonth(d.getMonth() - 1);
      chart.forceX([d.getTime(), maxDate]);

      //y
      chart.yAxis.ticks(10)
      chart.yAxix.tickFormat(function(d) { return (d) + '€' });
      chart.forceY([1, 1.8])

      //data
      d3.select("svg")
        .datum(data)
        .transition().duration(500).call(chart);

      //utils
      nv.utils.windowResize(
        function() {
          chart.update();
        }
      );

      return chart;
    });
  })

fetch('/gas/daily')
  .then(r => r.json())
  .then(data => {
    const g95 = data.data['Gasolina simples 95'];
    const g98 = data.data['Gasolina 98'];
    const dis = data.data['Gasóleo simples'];

    //Gasolina 95
    const p95 = document.getElementById('g95p');
    p95.childNodes[0].nodeValue = `${g95[0]}€`;
    g95[1] = g95[1].toFixed(4);
    if (g95[1] !== 0) {
      if (g95[1] > 0) p95.childNodes[1].classList.add('up');
      else if (g95[1] < 0) p95.childNodes[1].classList.add('down');
      p95.childNodes[1].innerText = `${g95[1]}€`;
    }

    //Gasolina 98
    const p98 = document.getElementById('g98p');
    p98.childNodes[0].nodeValue = `${g98[0]}€`;
    g98[1] = g98[1].toFixed(4);
    Math.trunc(g98[1]);
    if (g98[1] !== 0) {
      if (g98[1] > 0) p98.childNodes[1].classList.add('up');
      else if (g98[1] < 0) p98.childNodes[1].classList.add('down');
      p98.childNodes[1].innerText = `${g98[1]}€`;
    }

    //Gasóleo
    const pdis = document.getElementById('disp');
    pdis.childNodes[0].nodeValue = `${dis[0]}€`;
    dis[1] = dis[1].toFixed(4);
    Math.trunc(dis[1]);
    if (dis[1] !== 0) {
      if (dis[1] > 0) pdis.childNodes[1].classList.add('up');
      else if (dis[1] < 0) pdis.childNodes[1].classList.add('down');
      pdis.childNodes[1].innerText = `${dis[1]}€`;
    }
  })
  .catch(e => console.log(e))

