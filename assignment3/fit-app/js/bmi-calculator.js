async function loadBmiCategories() {
  const response = await fetch("../resources/categories.json");
  return await response.json();
}

function findBmiCategory(bmi, categories) {
  for (const categories of categories) {
    const subCategories = categories.subCategories || [];

    if (subCategories.length > 0) {
      for (const subCategory of subCategories) {
        const hasLowValue = subCategory.low === null || bmi >= subCategory.low;
        const hasHighValue = subCategory.high === null || bmi < subCategory.high;

        if (hasLowValue && hasHighValue) {
          return {
            category: categories.name,
            subCategory: subCategory.name,
          };
        }
      }
    } else {
      const hasLowValue = categories.low === null || bmi >= categories.low;
      const hasHighValue = categories.high === null || bmi < categories.high;

      if (hasLowValue && hasHighValue) {
        return {
          category: categories.name,
          subCategory: null,
        };
      }
    }
  }

  return null;
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("bmi-form");
  const resultDiv = document.getElementById("result");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const weight = parseFloat(document.getElementById("weight").value);
    const height = parseFloat(document.getElementById("height").value);

    const bmi = weight / Math.pow(height / 100, 2);
    const rounded = bmi.toFixed(1);

    loadBmiCategories().then(categories => {
      const info = findBmiCategory(bmi, categories);

      if (info) {
        if (info.subCategory) {
          resultDiv.innerHTML = `
        Ihr BMI ist: <strong>${rounded}</strong><br>
        Kategorie: <strong>${info.category}</strong> (${info.subCategory})<br>
      `;
        } else {
          resultDiv.innerHTML = `
        Ihr BMI ist: <strong>${rounded}</strong><br>
        BMI Kategorie: <strong>${info.category}</strong><br>
      `;
        }
      } else {
        resultDiv.textContent = `Ihr BMI ist: ${rounded}`;
      }
    });
  });
});
