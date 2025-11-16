fetch('../resources/statistics.json')
  .then(response => response.json())
  .then(data => {
    const tbody = document.getElementById('bmi-statistics-body');

    const dateHeading = document.querySelector('h2');
    if (dateHeading && data.date) {
      const date = new Date(data.date);
      dateHeading.textContent = `Stand ${date.toLocaleDateString("de-CH", {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })}`;
    }

    function addBmiCell(tr, value) {
      const td = document.createElement('td');
      if (value != null) {
        td.textContent = parseFloat(value).toFixed(1);
        td.className = value < 25 ? 'bmi-normal' : 'bmi-overweight';
        td.title = value < 25 ? 'Normalgewicht' : 'Übergewichtig';
      }
      tr.appendChild(td);
    }

    Object.keys(data.countries).forEach(code => {
      const stats = data.countries[code];
      const tr = document.createElement('tr');

      const nameTd = document.createElement('td');
      nameTd.textContent = stats.country || code;
      tr.appendChild(nameTd);

      const isoTd = document.createElement('td');
      isoTd.textContent = code;
      tr.appendChild(isoTd);

      const flagTd = document.createElement('td');
      const img = document.createElement('img');
      img.src = `../../global/img/flags/${code.toLowerCase()}.svg`;
      img.alt = `Flag of ${stats.country || code}`;
      flagTd.appendChild(img);
      tr.appendChild(flagTd);

      const rankTd = document.createElement('td');
      rankTd.textContent = stats.rank != null ? stats.rank : '';
      tr.appendChild(rankTd);

      addBmiCell(tr, stats.both);
      addBmiCell(tr, stats.male);
      addBmiCell(tr, stats.female);

      tbody.appendChild(tr);
    });
  });
