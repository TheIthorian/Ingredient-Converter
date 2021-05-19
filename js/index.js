
window.onload = () => {
    console.log(localStorage);
    showHistory();
    console.log("Showing history");

    let buttons = document.querySelectorAll("button,input[type='button']");
    console.log(buttons);
    for (button of buttons) {button.addEventListener("click", createRipple)};
}

var App = {

    config: {},

    history: JSON.parse(localStorage.getItem("history")) ? JSON.parse(localStorage.getItem("history")) : [],

    saveRecipe: function(e) {
        // Get sumbitted values
        let form = document.getElementById("save-recipe");
        let title = form.elements.title.value;
        let dropdown = form.elements.conversion;
        let selection = dropdown.options[dropdown.selectedIndex].value;
        let multiplier = form.elements.multiplier.value;

        let ingredients = new Ingredients(form.elements.ingredients.value);
        

        // Log to history
        logIngredientHistory(
            this.history, 
            {
                "title": title, 
                "ingredients": ingredients.ingredientText
            });

        // Convert the values and display
        displayConversion(ingredients.convertAmounts(selection, multiplier));
    },

    clearHistory: function() {
        this.history = [];
    }
}

function logIngredientHistory(history, input) {

    let log = {"title": input.title, "ingredients": input.ingredients};
    history.push(input);

    localStorage.setItem("history", JSON.stringify(history));

    showHistory();
}

function displayConversion(ingredients) {

    let display = "";

    for (item of ingredients) {
        display += item + "\n";
    }

    document.getElementsByName("ingredients-out")[0].value = display;
}


class Ingredients {
    constructor(ingredientText) {
        // Original input
        this.ingredientText = ingredientText;

        // Clean up and convert to a list
        // [{quantity, unit}, item]
        this.ingredientList = this.formatIngedientList();

        this.convertedIngredientList = [];
    }

    conversions() {
        return {
            // Volume
            "ml": 1,
            "mil": "ml",
            "milliliter": "ml",
            "milliliters": "ml",
            "millilitre": "ml",
            "millilitres": "ml",
        
            "l": 1000,
            "litre": "l",
            "litres": "l",
            "litre": "l",
            "litres": "l",
        
            "tsp": 5,
            "teaspoon": "tsp",
            "teaspoons": "tsp",
        
            "tbsp": 15,
            "tablespoon": "tbsp",
            "tablespoons": "tbsp",
        
            "oz": 30,
            "ounce": "oz",
            "ounces": "oz",
            "fl oz": "oz",
            "fluid ounce": "oz",
        
            "cup": 240,
            "cups": "cup",
        
            "pint": 475,
            "pints": "pint",

            "quart": 945,
            "quarts": "quart",
            "qt": "quart",
        
            // Mass
            "g": 1,
            "gram": "g",
            "grams" : "g",
        
            "kg": 1000,
            "kilo": "kg",
            "kilogram": "kg",
            "kilograms": "kg",
        
            //"oz": 28,
            //"ounce": 28,
        
            "lb": 454,
            "pound": "lb",
            "pounds": "lb",
            
            "st": 6350,
            "stone": "st"
        }
    }

    // Converts string into list
    formatIngedientList() {
        let allItems = []

        // Get the ingradients as a list
        let items = this.ingredientText.split("\n");

        // this needs fixing to allow unitless amounts
        let regex = /[0-9.\u00BC-\u00BE\u2150-\u215E]+\s*[a-z]*[\s()\t\n]/ig;

        console.log("items: ", items);

        // for each ingredient, find the amount
        for (const item of items){

            let amount = item.match(regex);

            console.log("Amount regex matches: ", amount);

            // Remove whitespace from amount, then seperate the units
            // If there were more than one units found, use the first valid one
            // Otherwise set amount to 1
            let new_amount = {quant: 1, unit: null};
            
            if (amount) {
                for (let i = 0; i< amount.length; i++) {
                    amount[i] = amount[i].replace(/[\s()]/g,''); // 
                    console.log("amount[i]: " + amount[i]);
                    let quant = amount[i].match(/[0-9.\u00BC-\u00BE\u2150-\u215E]+/)[0].trim();
                    let unit = amount[i].match(/[a-zA-Z]+/gi) ? amount[i].match(/[a-zA-Z]+/gi)[0].toLowerCase() : null;

                    if (this.conversions()[unit]) {
                        new_amount = { quant: quant, unit: unit };
                        break;
                    }
                    else {new_amount = { quant: quant, unit: null };}
                }
            }

            allItems.push({"quant": new_amount.quant, "unit": new_amount.unit, "item": item});
            
        }
        console.log("Parsed Items: ", allItems);
        return allItems;
    }

    getConversionFactor(unit) {

        let factor = unit;

        // Loop over for cases where the factor is pathed to other unit.
        while (typeof factor == "string") {
            factor = this.conversions()[factor];
        }

        // return -1 if no factor found
        return factor ? factor : -1
    }

    convertAmounts(selection, multiplier) {
        
        multiplier = multiplier.toString();
 
        if (!multiplier.match(/^[0-9]*\.?[0-9]*$/)) {multiplier = 1}

        console.log("multiplier: " + multiplier);

        let convertedIngredientList = [];

        for (let i = 0; i < this.ingredientList.length; i++){
            let quant = this.ingredientList[i].quant;
            let unit = this.ingredientList[i].unit;

            console.log("current amount: ", quant, unit);

            quant = this.checkVulgar(quant) * multiplier;

            let factor = quant ? this.getConversionFactor(unit) : -1;
            let type = this.findUnitType(unit);

            console.log("Quant: " + quant);

            if (factor <= 0) {convertedIngredientList.push(`(${quant})\t${this.ingredientList[i].item}`);}
            else {
                if (type === null) {unit = '';}
                else {unit = type == 'volume' ? 'ml' : 'g';}
                convertedIngredientList.push(`(${quant * factor} ${unit})\t${this.ingredientList[i].item}`);
            }
        }

        if (selection == 'metric') {
            this.convertedIngredientList = convertedIngredientList;
            return this.convertedIngredientList
        }
        else {
            return "us";
        }
    }

    checkVulgar(quantity) {

        let vularValue = {
            '¼': 0.25,
            '½': 0.5,
            '¾': 0.75, 
            '⅐': 1/7, 
            '⅑': 1/9, 
            '⅒': 0.1, 
            '⅓': 1/3, 
            '⅔': 2/3, 
            '⅕': 1/5, 
            '⅖': 2/5, 
            '⅗': 3/5, 
            '⅘': 4/5, 
            '⅙': 1/6, 
            '⅚': 5/6, 
            '⅛': 1/8, 
            '⅜': 3/8, 
            '⅝': 5/8, 
            '⅞': 7/8,
            '\u00BC': 0.25,
            '\u00BD': 0.5,
            '\u00BE': 0.75,
            '\u2150': 1/7,
            '\u2151': 1/9,
            '\u2152': 0.1,
            '\u2153': 1/3,
            '\u2154': 2/3,
            '\u2155': 1/5,
            '\u2156': 2/5,
            '\u2157': 3/5,
            '\u2158': 4/5,
            '\u2159': 1/6,
            '\u215A': 5/6,
            '\u215B': 1/8,
            '\u215C': 3/8,
            '\u215D': 5/8,
            '\u215E': 7/8
        }

        if (['¼', '½', '¾', '⅐', '⅑', '⅒', '⅓', '⅔', '⅕', '⅖', '⅗', '⅘', '⅙', '⅚', '⅛', '⅜', '⅝', '⅞', 
        '\u00BC', '\u00BD', '\u00BE', '\u2150', '\u2151', '\u2152', '\u2153', '\u2154', '\u2155', '\u2156', '\u2157', 
        '\u2158', '\u2159', '\u215A', '\u215B', '\u215C', '\u215D', '\u215E'].includes(quantity)) {

            return vularValue[quantity];

        } else {return quantity;}        
    }

    findUnitType(unit) {
        if (!unit) {return null;}
        if (["ml", "mil", "milliliter", "milliliters", "millilitre", "millilitres", "l", "litre", "litres", "litre", "litres", "tsp",
            "teaspoon", "teaspoons", "tbsp", "tablespoon", "tablespoons", "fl oz", "fluid ounce", "cup", "cups",
            "pint", "pints", "quart", "quarts", "qt"].includes(unit)) 
            {return 'volume';}
        else {return 'mass'}
    }
}

function getHistory(index) {
    let history = JSON.parse(localStorage.getItem("history"));
    index = history.length - index - 1;

    if (history[index]){ return history[index]; }
    else {
        return { title: "null", ingredients: "null" };
    }
}

function showHistory() {
    let list = document.getElementById("history-list");
    let listDisplay = "";

    let records = JSON.parse(localStorage.getItem("history")) ? JSON.parse(localStorage.getItem("history")).reverse() : [];
    let l = records.length;

    for (let i = 0; i < l; i++) {
        let record = records[i];
        listDisplay += `<div class="history-group">
                        <button class="history-item" value="${i}" onclick="displaySelectedHistory(event); createRipple(event);">${record.title}</button>
                        <button onclick="removeHistory(event)">&#10006</button>
                        </div>`
    }

    list.innerHTML = listDisplay;
}

function displaySelectedHistory(event) {
    let index = event.target.value;
    console.log(index);
    let history = getHistory(index);
    console.log(history);
    document.getElementById("input-title").value = history.title;
    document.getElementById("input-ingredients").value = history.ingredients;
}

function clearHistory(App) {
    localStorage.clear('history');
    document.getElementById("history-list").innerHTML = "";
    App.history = [];
}

function validateInput(e, regex) {
    let input = e.target.value;
    e.target.value = input.replace(regex, '');
}

function removeHistory(e) {
    let index = e.target.previousElementSibling.value;
    let l = App.history.length;

    App.history.splice(index, 1);

    let historyList = JSON.parse(localStorage.getItem("history"));
    historyList.splice(l - index - 1, 1);
    localStorage.setItem("history", JSON.stringify(historyList));
    e.target.parentNode.style.display = 'none';
}