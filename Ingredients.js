
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

        let regex = /[0-9.\u00BC-\u00BE\u2150-\u215E]+\s*[a-z]+[\s()\t\n]/ig;

        console.log("items: ", items);

        // for each ingredient, find the amount
        for (const item of items){

            let amount = item.match(regex);

            //console.log("Amount regex matches: ", amount);

            // Remove whitespace from amount, then seperate the units
            // If there were more than one units found, use the first valid one
            let new_amount = {quant: null, unit: null};
            
            if (amount) {
                for (let i = 0; i< amount.length; i++) {
                    amount[i] = amount[i].replace(/[\s()]/g,'');
                    let quant = amount[i].match(/[0-9.\u00BC-\u00BE\u2150-\u215E]+/)[0].trim();
                    let unit = amount[i].match(/[a-z]+/gi)[0];

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

    convertAmounts(selection) {

        let convertedIngredientList = [];

        for (let i = 0; i < this.ingredientList.length; i++){
            let quant = this.ingredientList[i].quant;
            let unit = this.ingredientList[i].unit;

            console.log("current amount: ", quant, unit);

            quant = this.checkVulgar(quant);

            let factor = quant ? this.getConversionFactor(unit) : -1;
            let type = this.findUnitType(unit);

            if (factor <= 0) {convertedIngredientList.push(`${this.ingredientList[i].item}`);}
            else {
                unit = type == 'volume' ? 'ml' : 'g';
                convertedIngredientList.push(`(${quant * factor} ${unit}) ${this.ingredientList[i].item}`);
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
        if (["ml", "mil", "milliliter", "milliliters", "millilitre", "millilitres", "l", "litre", "litres", "litre", "litres", "tsp",
            "teaspoon", "teaspoons", "tbsp", "tablespoon", "tablespoons", "fl oz", "fluid ounce", "cup", "cups",
            "pint", "pints"].includes(unit)) 
            {return 'volume';}
        else {return 'mass'}
    }
}