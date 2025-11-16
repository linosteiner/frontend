fetch('../resources/categories.json')
  .then(response => response.json())
  .then(categoriesData => {
    const tbody = document.getElementById('bmi-categories');

    categoriesData.forEach(category => {
      const subCategories = category.subCategories || [];

      if (subCategories.length === 0) {
        const tr = document.createElement("tr");

        const categoryCell = document.createElement("td");
        categoryCell.textContent = category.name;
        tr.appendChild(categoryCell);

        const emptySubCell = document.createElement("td");
        emptySubCell.textContent = "";
        tr.appendChild(emptySubCell);

        const lowCell = document.createElement("td");
        lowCell.textContent = category.low != null ? category.low : "";
        tr.appendChild(lowCell);

        const highCell = document.createElement("td");
        highCell.textContent = category.high != null ? category.high : "";
        tr.appendChild(highCell);

        tbody.appendChild(tr);
        return;
      }

      subCategories.forEach((subCategory, index) => {
        const tr = document.createElement("tr");

        if (index === 0) {
          const categoryCell = document.createElement("td");
          categoryCell.rowSpan = subCategories.length;
          categoryCell.textContent = category.name;
          tr.appendChild(categoryCell);
        }

        const subNameCell = document.createElement("td");
        subNameCell.textContent = subCategory.name || "";
        tr.appendChild(subNameCell);

        const lowCell = document.createElement("td");
        lowCell.textContent = subCategory.low != null ? parseFloat(subCategory.low).toFixed(1) : "";
        tr.appendChild(lowCell);

        const highCell = document.createElement("td");
        highCell.textContent = subCategory.high != null ? parseFloat(subCategory.high).toFixed(1) : "";
        tr.appendChild(highCell);

        tbody.appendChild(tr);
      });
    });
  });
