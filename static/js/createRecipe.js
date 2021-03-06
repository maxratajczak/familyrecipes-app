
$("#nameCounter").text($("#recipeName").val().length)

$("#recipeName").keyup(function() {
    $("#nameCounter").text($("#recipeName").val().length)
})


var ingredientInput = `<div class="ingredientContainer">
<i tabindex="0" class="fas fa-times removeIngredient"></i>
<label for="ingredients" hidden>Ingredient</label>
<input enterkeyhint="next" type="text" name="ingredients[]" id="ingredients" class="inputField" placeholder="e.g. 3 Tbsp. sweet paprika" autocomplete="off" required>
</div>`;

var directionInput = `<div class="directionContainer">
<i tabindex="0" class="fas fa-times removeDirection"></i>
<label for="directions" hidden>Direction</label>
<input enterkeyhint="next" type="text" name="directions[]" id="directions" class="inputField" placeholder="e.g. Marinate chicken breasts for 3 hours" autocomplete="off" required>
</div>`;


$("#addIngredient").click(function() {
    $("#addIngredient").before(ingredientInput);
});

$(document).on("click", ".removeIngredient", function() {
    $(this).closest(".ingredientContainer").remove();
});
$(document).on("keypress", ".removeIngredient", function(e) {
    if(e.which == 13) $(this).closest(".ingredientContainer").remove();
    
});

$("#addDirection").click(function() {
    $("#addDirection").before(directionInput);
});

$(document).on("click", ".removeDirection", function() {
    $(this).closest(".directionContainer").remove();
});
$(document).on("keypress", ".removeDirection", function(e) {
    if(e.which == 13) $(this).closest(".directionContainer").remove();
    
});

$(document).ready(function() {
    $("#imageFile").change((e) => {
        var fileName = e.target.files[0].name
        $("#filePath span").text(fileName)
    })
})