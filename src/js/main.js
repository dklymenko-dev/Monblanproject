import '../scss/main.scss';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import postsData from '../data/posts.json';

const state = {
    posts: postsData,
    filteredPosts: postsData,
    currentPage: 1,
    view: 'tiles'
};

function getPerPage() {
    return state.view === 'rows'
        ? 9
        : 8;
}

const postsEl = document.getElementById('posts');
const loadBtn = document.getElementById('loadMore');
const countEl = document.querySelector('.header__stats_posts--count');

const tilesBtn = document.getElementById('tilesBtn');
const rowsBtn = document.getElementById('rowsBtn');

let fromDate = null;
let toDate = null;

const customLocale = {
    firstDayOfWeek: 0,

    weekdays: {
        shorthand: [
            'Su',
            'Mo',
            'Tu',
            'We',
            'Th',
            'Fr',
            'Sa'
        ],

        longhand: [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday'
        ]
    }
};

function highlightSundays(instance) {

    instance.days.childNodes.forEach(day => {

        if (
            day.classList.contains('prevMonthDay') ||
            day.classList.contains('nextMonthDay')
        ) {
            return;
        }

        if (day.dateObj?.getDay() === 0) {
            day.classList.add('is-sunday');
        }

    });

}

const datepickerOptions = {
    dateFormat: 'd-m-Y',
    disableMobile: true,
    locale: customLocale,

    onReady(_, __, instance) {
        highlightSundays(instance);
    },

    onMonthChange(_, __, instance) {
        highlightSundays(instance);
    },

    onYearChange(_, __, instance) {
        highlightSundays(instance);
    }
};

function createDatepicker(selector, callback) {

    return flatpickr(selector, {
        ...datepickerOptions,

        onChange: dates => {
            callback(dates[0] || null);
            filterPosts();
        }
    });

}

const fromPicker = createDatepicker(
    '#from',
    date => fromDate = date
);

const toPicker = createDatepicker(
    '#to',
    date => toDate = date
);

document
    .querySelectorAll('.header__date--field-clear')
    .forEach(btn => {

        btn.addEventListener('click', () => {

            const target = btn.dataset.target;

            if (target === 'from') {
                fromPicker.clear();
                fromDate = null;
            }

            if (target === 'to') {
                toPicker.clear();
                toDate = null;
            }

            filterPosts();

        });

    });

function filterPosts() {

    state.filteredPosts = state.posts.filter(post => {

        const dt = new Date(post.createdAt);

        return (
            (!fromDate || dt >= fromDate) &&
            (!toDate || dt <= toDate)
        );

    });

    state.currentPage = 1;

    render();

}

function createPostTemplate(post) {

    return `
        <article class="post">

            <img
                class="post__image"
                src="${post.image}"
                alt="Post image"
            >

            <div class="post__cover">

                <div class="post__today">

                    <p class="post__today--text text__semibold">
                        Today
                    </p>

                    <div class="post__wrapper">

                        <div class="post__likes">
                            <img
                                src="/images/heart-icon.svg"
                                alt="like"
                            >

                            <span class="text__semibold text__small">
                                128
                            </span>
                        </div>

                        <div class="post__comments">
                            <img
                                src="/images/message-icon.svg"
                                alt="comment"
                            >

                            <span class="text__semibold text__small">
                                31
                            </span>
                        </div>

                    </div>

                </div>

                <div class="post__date">

                    <p class="post__date--text text__semibold">
                        ${post.createdAt}
                    </p>

                    <div class="post__wrapper">

                        <div class="post__likes">
                            <img
                                src="/images/heart-icon.svg"
                                alt="like"
                            >

                            <span class="text__semibold text__small">
                                ${post.likes}
                            </span>
                        </div>

                        <div class="post__comments">
                            <img
                                src="/images/message-icon.svg"
                                alt="comment"
                            >

                            <span class="text__semibold text__small">
                                ${post.comments}
                            </span>
                        </div>

                    </div>

                </div>

                <div class="post__footer">

                    <p class="post__date--text text__semibold">
                        Image upload
                    </p>

                    <div class="post__footer--date text__semibold text__small">
                        11-04-2016
                    </div>

                </div>

            </div>

        </article>
    `;
}

function render() {

    const visiblePosts = state.filteredPosts.slice(
        0,
        state.currentPage * getPerPage()
    );

    postsEl.innerHTML = visiblePosts
        .map(createPostTemplate)
        .join('');

    countEl.textContent = state.filteredPosts.length;

    loadBtn.disabled =
        visiblePosts.length >= state.filteredPosts.length;

}

function setView(view) {

    state.view = view;

    postsEl.className = `posts posts--${view}`;

    tilesBtn.classList.toggle(
        'active',
        view === 'tiles'
    );

    rowsBtn.classList.toggle(
        'active',
        view === 'rows'
    );

    localStorage.setItem(
        'postsView',
        view
    );

    state.currentPage = 1;

    render();
}

loadBtn.addEventListener('click', () => {

    state.currentPage++;

    render();

});

tilesBtn.addEventListener('click', () => {
    setView('tiles');
});

rowsBtn.addEventListener('click', () => {
    setView('rows');
});

const savedView =
    localStorage.getItem('postsView') || 'tiles';

setView(savedView);