(function () {
    'use strict';


    let menu = document.querySelector(".navbar-nav");
    let toggler = document.querySelector('.bars')

    toggler.addEventListener('click', () => {
        menu.classList.toggle('active')

    })



}())