import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Like from './models/Like';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likeView from './views/likeView';
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
        recipeView.clearRecipe();
        renderLoader(elements.recipe);
        if (state.search) {
            searchView.highlightSelected(id);
        }
        state.recipe = new Recipe(id);
        try {
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();
            state.recipe.calcServings();
            state.recipe.calcTime();
            clearLoader();
            recipeView.renderRecipe(state.recipe, state.like.isLiked(id));
        } catch (e) {
            console.log(e);
        }

    }
};

['hashchange', 'load'].forEach(e => window.addEventListener(e, controlRecipe));

const controlList = () => {
    if (!state.list) {
        state.list = new List();
    }
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
};

const controlLike = () => {
    if (!state.like) {
        state.like = new Like();
    }
    const currID = state.recipe.id;
    if (!state.like.isLiked(currID)) {
        const newLike = state.like.addLike(
            currID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img,
        );
        likeView.toggleLikeBtn(true);
        likeView.renderLike(newLike);

    } else {
        state.like.deleteLike(currID);
        likeView.toggleLikeBtn(false);
        likeView.deleteLike(currID);
    }
    likeView.toggleLikeMenu(state.like.getNumOfLikes());
};

window.addEventListener('load', () => {
    state.like = new Like();
    state.like.readStorage();
    likeView.toggleLikeMenu(state.like.getNumOfLikes());
    state.like.likes.forEach(like => likeView.renderLike(like));
});

elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIng(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        state.recipe.updateServings('inc');
        recipeView.updateServingsIng(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        controlLike();
    }
});

elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;
    if (e.target.matches('.shopping__delete , .shopping__delete *')) {
        state.list.deleteItem(id);
        listView.deleteItem(id);
    } else if (e.target.matches('.shopping__count-value')) {
        const value = e.target.value;
        state.list.updateCount(id, value)
    }
});
