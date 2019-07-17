import Search from './models/Search';
import Recipe from './models/Recipe';
import * as searchView from './views/searchView';
import {elements, renderLoader, clearLoader} from "./views/base";

const state = {};

const controlSearch = async () => {
    const query = searchView.getInput();
    if (query) {
        state.search = new Search(query);
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchResult);
        try {
            await state.search.getResults();
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch (e) {
            console.log(e);
            clearLoader();
        }
    }
};

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPage.addEventListener('click', e => {
    let btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});


const controlRecipe = async () => {
    const id = window.location.hash.replace('#', '');
    if (id) {

        state.recipe = new Recipe(id);
        try {
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();
            state.recipe.calcServings();
            state.recipe.calcTime();
            console.log(state.recipe);
        } catch (e) {
            console.log(e);
        }

    }
};

['hashchange', 'load'].forEach(e => window.addEventListener(e, controlRecipe));
