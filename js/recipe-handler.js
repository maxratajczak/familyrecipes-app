const mongoose = require("mongoose");
const dayjs = require("dayjs");
const path = require("path");
const sharp = require("sharp");
const clc = require("./cmdlinecolor.js");
const {Recipe} = require("./mongoCollections/recipe.js");
const { User } = require("./mongoCollections/user.js");

function processRecipeImage(image, fileName) {
    return new Promise((resolve, reject) => {
        var acceptedTypes = ["image/jpeg", "image/jpg", "image/png", "image/heic", "image/heif", "image/webp"];
        var valid = true;

        if(image.size >= 10000000) reject("File size too large > 10mb")

        for(let i = 0; i < acceptedTypes.length; i++) {
            if(acceptedTypes[i] === image.mimetype) {
                valid = true
                break
            }
            else valid = false
        }

        if(valid) {
            const directory = (path.join(".", "static", "images", "recipeImages") + "/")
            sharp(image.buffer)
            .withMetadata()
            .webp({
                quality: 80,
            })
            .resize({
                width: 1080,
                withoutEnlargement: true
            })
            .toFile(directory + fileName, (err, info) => {
                if(err) reject(err)
                else resolve(info.size)
            })
        }
        else reject("Unsupported file type was submitted: " + image.mimetype)
    })
}

module.exports = {
    createRecipe: function(recipe, imageFile, userId) {
        return new Promise((resolve, reject) => {
            if(userId) {
                let newRecipe = new Recipe(recipe);
                newRecipe._id = mongoose.Types.ObjectId();

                User.find({_id: userId}).exec()
                .then((users) => {
                    var data = users.map(value => value.toObject());
                    if(data.length === 0) reject("No users found")
                    else {
                        newRecipe.createdBy.userId = userId;
                        newRecipe.createdBy.firstName = data[0].firstName;
                        newRecipe.createdBy.lastName = data[0].lastName;
                    }
                })

                var presentDate = dayjs();
                newRecipe.dateCreated = dayjs(presentDate).format("dddd MMMM DD YYYY hh:mm:ss A");
                newRecipe.lastUpdated = newRecipe.dateCreated;
                newRecipe.dateCreatedAsDateNum = Date.now()

                newRecipe.ingredientCount = 0;
                newRecipe.directionCount = 0;
                if(newRecipe.ingredients.length != 0) for(var i = 0; i < recipe.ingredients.length; i++) newRecipe.ingredientCount++;
                if(newRecipe.directions.length != 0) for(var i = 0; i < recipe.directions.length; i++) newRecipe.directionCount++;
                
                newRecipe.image.imageFile = mongoose.Types.ObjectId() + ".webp";
                processRecipeImage(imageFile, newRecipe.image.imageFile)
                .then((newFileSize) => {
                    newRecipe.image.fileSize = newFileSize;
                    newRecipe.save((err) => {
                        if(err) reject("Could not save recipe")
                        else resolve();
                    })
                })
                .catch((err) => {reject(err)})
            }
            else reject("User not logged in")
        })
    },

    getRecipesByCategory: function(category) {
        return new Promise((resolve, reject) => {
            Recipe.find({recipeCategory: category}).exec()
            .then((recipes) => {
                var data = recipes.map(value => value.toObject())
                if(data.length === 0) reject("No recipes available")
                else {
                    console.log(data);
                    resolve(data);
                }
            })
        })
    },

    getRecipesByUserId: function(userId) {
        return new Promise((resolve, reject) => {
            Recipe.find({"createdBy.userId": userId}).exec()
            .then((recipes) => {
                var userRecipes = {}
                userRecipes.recipes = recipes.map(value => value.toObject())
                if(userRecipes.recipes.length === 0) reject(true)
                else {
                    User.find({_id: userId}).exec()
                    .then((users) => {
                        var data = users.map(value => value.toObject())
                        if(data.length === 0) userRecipes.firstName = "Unknown"
                        userRecipes.firstName = data[0].firstName
                        resolve(userRecipes)
                    })
                }
            })
        })
    },

    getRecentlyAddedRecipes: function(howMany) {
        return new Promise((resolve, reject) => {
            Recipe.find({}).sort({dateCreatedAsDateNum: -1}).exec()
            .then((recipes) => {
                var data = recipes.map(value => value.toObject())
                if(data.length === 0) reject("No recipes")
                else {
                    let topRecipes = [];
                    for(let i = 0; i < howMany; i++) {
                        topRecipes.push(data[i]);
                        if(typeof topRecipes[i] == "undefined") topRecipes.pop();
                    }
                    resolve(topRecipes);
                }
            })
        })
    }
    
}