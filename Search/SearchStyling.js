$(document).ready(function() {

    $('.right.dropdown.item')
        .popup({
            on : 'click',
            popup: '.search.popup',
            position: 'bottom left'
        });
});


$(document).ready(function() {

    $('.browse.item.active')
        .popup({
            on : 'click',
            popup: '.special.popup',
            position: 'bottom right'
        });
});

function searchByTitle() {
    alert("Search by Title");
}

function searchByIngredient() {
    alert("Search by Ingredient");
}

function searchByCountry() {
    alert("searchByCountry");
}