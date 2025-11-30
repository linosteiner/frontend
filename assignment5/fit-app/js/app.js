document.addEventListener("DOMContentLoaded", () => {
  navigate('home');

  document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = e.target.getAttribute('data-target');
      navigate(target);

      const navbarCollapse = document.getElementById('navbarNav');
      if (navbarCollapse.classList.contains('show')) {
        const bsCollapse = new bootstrap.Collapse(navbarCollapse, {toggle: true});
        bsCollapse.hide();
      }
    });
  });
});

function navigate(view) {
  const app = document.getElementById('app');

  document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('data-target') === view) {
      link.classList.add('active');
    }
  });

  switch (view) {
    case 'home':
      renderHome(app);
      break;
    case 'calculator':
      renderCalculator(app);
      break;
    case 'categories':
      renderCategories(app);
      break;
    case 'statistics':
      renderStatistics(app);
      break;
    default:
      renderHome(app);
  }
}

function renderHome(container) {
  container.innerHTML = `
        <div class="text-center">
            <h1 class="display-4 mb-4">FitApp</h1>
            <div id="hero" class="lead">
                <p>Willkommen zu FitApp!</p>
                <p>
                    Das ist eine simple Webapplikation zum Thema "BMI".
                    BMI steht für Body-Mass-Index und ist ein Wert, der sich vom Gewicht und der Grösse einer Person ableiten lässt.
                </p>
                <div class="alert alert-info d-inline-block mt-3">
                    <p class="mb-2">Die Formel zum Berechnen des BMI lautet:</p>
                    <p class="mb-0">
                        <math display="inline">
                            <mi>BMI</mi>
                            <mo>=</mo>
                            <mfrac>
                                <msub><ms>mass</ms><msub>kg</msub></msub>
                                <msub><ms>height</ms><msup><ms>m</ms><msub>2</msub></msup></msub>
                            </mfrac>
                        </math>
                    </p>
                </div>
            </div>
        </div>
    `;
}

function renderCalculator(container) {
  container.innerHTML = `
        <h1 class="text-center mb-4">BMI Rechner</h1>
        <div class="row justify-content-center">
            <div class="col-md-6 col-lg-4">
                <form id="bmi-form" class="card p-4 shadow-sm">
                    <div class="mb-3">
                        <label class="form-label" for="weight">Gewicht in kg</label>
                        <input type="number" class="form-control" id="weight" required min="40" max="200" step="1">
                    </div>
                    <div class="mb-3">
                        <label class="form-label" for="height">Grösse in cm</label>
                        <input type="number" class="form-control" id="height" required min="120" max="250" step="1">
                    </div>
                    <div class="d-grid">
                        <input type="submit" class="btn btn-primary" value="Berechnen"/>
                    </div>
                </form>
                <div id="result" class="alert mt-4 text-center" style="display:none;" role="alert"></div>
            </div>
        </div>
    `;

  const form = document.getElementById('bmi-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseFloat(document.getElementById('height').value);
    const resultDiv = document.getElementById('result');

    if (weight > 0 && height > 0) {
      const bmi = weight / Math.pow(height / 100, 2);
      const rounded = bmi.toFixed(1);

      try {
        const response = await fetch('../../global/resources/categories.json');
        const categories = await response.json();
        const info = findBmiCategory(bmi, categories);

        let output = `Ihr BMI ist: <strong>${rounded}</strong><br>`;
        resultDiv.className = 'alert mt-4 text-center alert-secondary';

        if (info) {
          output += `Kategorie: <strong>${info.category}</strong>`;
          if (info.subCategory) {
            output += ` (${info.subCategory})`;
          }
          if (info.category === 'Normalgewicht') {
            resultDiv.className = 'alert mt-4 text-center alert-success';
          } else if (info.category.includes('Übergewicht')) {
            resultDiv.className = 'alert mt-4 text-center alert-warning';
          } else if (info.category.includes('Fettleibigkeit')) {
            resultDiv.className = 'alert mt-4 text-center alert-danger';
          }
        }
        resultDiv.innerHTML = output;
        resultDiv.style.display = 'block';
      } catch (error) {
        console.error("Error fetching categories:", error);
        resultDiv.className = 'alert mt-4 text-center alert-danger';
        resultDiv.innerHTML = `Ihr BMI ist: <strong>${rounded}</strong><br>(Kategorien konnten nicht geladen werden)`;
        resultDiv.style.display = 'block';
      }
    }
  });
}

function findBmiCategory(bmi, categories) {
  for (const cat of categories) {
    if (cat.subCategories && cat.subCategories.length > 0) {
      for (const sub of cat.subCategories) {
        if ((sub.low === null || bmi >= sub.low) && (sub.high === null || bmi < sub.high)) {
          return {category: cat.name, subCategory: sub.name};
        }
      }
    }
    if ((cat.low === null || bmi >= cat.low) && (cat.high === null || bmi < cat.high)) {
      return {category: cat.name, subCategory: null};
    }
  }
  return null;
}

function renderCategories(container) {
  container.innerHTML = `
        <h1 class="text-center mb-4">BMI Kategorien</h1>
        <div class="table-responsive">
            <table class="table table-striped table-hover table-bordered">
                <thead class="table-dark">
                    <tr>
                        <th rowspan="2" class="align-middle">Kategorie allgemein</th>
                        <th rowspan="2" class="align-middle">spezifisch</th>
                        <th colspan="2" class="text-center">Werte</th>
                    </tr>
                    <tr>
                        <th>minimal</th>
                        <th>maximal</th>
                    </tr>
                </thead>
                <tbody id="bmi-categories-body">
                    <tr><td colspan="4" class="text-center">Laden...</td></tr>
                </tbody>
            </table>
        </div>
    `;

  fetch('../../global/resources/categories.json')
    .then(response => response.json())
    .then(data => {
      const tbody = document.getElementById('bmi-categories-body');
      tbody.innerHTML = '';

      data.forEach(cat => {
        const subs = cat.subCategories || [];
        if (subs.length === 0) {
          const tr = document.createElement('tr');
          tr.innerHTML = `
                        <td>${cat.name}</td>
                        <td></td>
                        <td>${cat.low !== null ? cat.low : ''}</td>
                        <td>${cat.high !== null ? cat.high : ''}</td>
                    `;
          tbody.appendChild(tr);
        } else {
          subs.forEach((sub, index) => {
            const tr = document.createElement('tr');
            let html = '';
            if (index === 0) {
              html += `<td rowspan="${subs.length}" class="align-middle bg-white">${cat.name}</td>`;
            }
            html += `
                            <td>${sub.name}</td>
                            <td>${sub.low !== null ? parseFloat(sub.low).toFixed(1) : ''}</td>
                            <td>${sub.high !== null ? parseFloat(sub.high).toFixed(1) : ''}</td>
                        `;
            tr.innerHTML = html;
            tbody.appendChild(tr);
          });
        }
      });
    })
    .catch(() => {
      document.getElementById('bmi-categories-body').innerHTML = '<tr><td colspan="4" class="text-center text-danger">Fehler beim Laden der Daten.</td></tr>';
    });
}

function renderStatistics(container) {
  container.innerHTML = `
        <h1 class="text-center mb-4">BMI-Statistiken</h1>
        <h2 id="stats-date" class="h5 text-center text-muted mb-4">Laden...</h2>
        <div class="table-responsive">
            <table class="table table-hover align-middle">
                <thead class="table-dark">
                    <tr>
                        <th rowspan="2" class="align-middle">Name</th>
                        <th rowspan="2" class="align-middle">ISO 3166</th>
                        <th rowspan="2" class="align-middle">Flagge</th>
                        <th rowspan="2" class="align-middle">Rang</th>
                        <th colspan="3" class="text-center">Durchschnittswerte</th>
                    </tr>
                    <tr>
                        <th>gesamt</th>
                        <th>männlich</th>
                        <th>weiblich</th>
                    </tr>
                </thead>
                <tbody id="bmi-statistics-body">
                    <tr><td colspan="7" class="text-center">Laden...</td></tr>
                </tbody>
            </table>
        </div>
    `;

  fetch('../../global/resources/statistics.json')
    .then(response => response.json())
    .then(data => {
      const tbody = document.getElementById('bmi-statistics-body');
      const dateHeader = document.getElementById('stats-date');

      if (data.date) {
        const date = new Date(data.date);
        dateHeader.textContent = `Stand ${date.toLocaleDateString("de-CH", {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })}`;
      }

      tbody.innerHTML = '';

      Object.keys(data.countries).forEach(code => {
        const stats = data.countries[code];
        const tr = document.createElement('tr');
        const flagSrc = `../../global/img/flags/${code.toLowerCase()}.svg`;

        tr.innerHTML = `
                    <td class="fw-bold">${stats.country || code}</td>
                    <td><span class="badge bg-secondary">${code}</span></td>
                    <td><img src="${flagSrc}" alt="${code}" class="img-fluid" style="height: 20px; width: auto;"></td>
                    <td>${stats.rank !== null ? stats.rank : '-'}</td>
                `;

        [stats.both, stats.male, stats.female].forEach(val => {
          const td = document.createElement('td');
          if (val !== null) {
            td.textContent = parseFloat(val).toFixed(1);

            if (val < 18.5) {
              td.className = 'table-danger';
              td.title = 'Untergewicht';
            } else if (val >= 18.5 && val < 25) {
              td.className = 'table-success';
              td.title = 'Normalgewicht';
            } else if (val >= 25 && val < 30) {
              td.className = 'table-warning';
              td.title = 'Übergewicht';
            } else {
              td.className = 'table-danger';
              td.title = 'Fettleibigkeit';
            }
          } else {
            td.textContent = '-';
          }
          tr.appendChild(td);
        });

        tbody.appendChild(tr);
      });
    })
    .catch(err => {
      console.error(err);
      document.getElementById('bmi-statistics-body').innerHTML = '<tr><td colspan="7" class="text-center text-danger">Fehler beim Laden der Daten.</td></tr>';
    });
}
