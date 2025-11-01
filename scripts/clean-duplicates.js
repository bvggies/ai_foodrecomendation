const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/ghanaian-foods.json'), 'utf8'));

const seen = new Set();
const uniqueFoods = data.foods.filter(food => {
  if (seen.has(food.name)) {
    return false;
  }
  seen.add(food.name);
  return true;
});

const cleaned = { foods: uniqueFoods };
fs.writeFileSync(
  path.join(__dirname, '../data/ghanaian-foods.json'),
  JSON.stringify(cleaned, null, 2),
  'utf8'
);

console.log(`Removed ${data.foods.length - uniqueFoods.length} duplicates. Total unique foods: ${uniqueFoods.length}`);
