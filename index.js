
(load = () => {
    console.log(localStorage);
})();

var App = {

    config: {},

    history: JSON.parse(localStorage.getItem("history")) ? JSON.parse(localStorage.getItem("history")) : [],

    saveRecipe: function(e) {
        // Get sumbitted values
        let form = document.getElementById("save-recipe");
        let title = form.elements.title.value;
        let dropdown = form.elements.conversion;
        let selection = dropdown.options[dropdown.selectedIndex].value;
        let ingredients = new Ingredients(form.elements.ingredients.value);

        // Log to history
        logIngredientHistory(
            this.history, 
            {
                "title": title, 
                "ingredients": ingredients.ingredientText
            });

        // Convert the values and display
        displayConversion(ingredients.convertAmounts(selection));
    }
}

function logIngredientHistory(history, input) {

    let log = {"title": input.title, "ingredients": input.ingredients};
    history.push(input);

    localStorage.setItem("history", JSON.stringify(history));
}

function displayConversion(ingredients) {

    let display = "";

    for (item of ingredients) {
        display += item + "\n";
    }

    document.getElementsByName("ingredients-out")[0].value = display;
}