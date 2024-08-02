import {moveInstrumentation} from '../../scripts/scripts.js';

function decorateButton(viewMoreButton) {
    viewMoreButton.addEventListener('click', () => {
        const faqItems = document.querySelectorAll('.faq-item');
        for (let i = 0; i < faqItems.length; i++) {
            faqItems[i].style.display = 'block';
        }
        document.getElementById('viewMoreBtn').style.display = 'none';
    });
}

export default function decorate(block) {
    addClassesToElements(block);
    const faqListWrapper = createFaqItems(block);
    appendElementsToBlock(block, faqListWrapper);
    decorateButton(block.children[0].children[2]);
}

function addClassesToElements(block) {
    block.children[0].classList.add('faq-title');
    block.children[1].classList.add('faq-picture');
    block.children[2].id = 'viewMoreBtn';
    block.children[2].classList.add('view-more-faq');
}

function createFaqItems(block) {
    const remainingDivs = Array.from(block.querySelectorAll('div:nth-child(n+4)'));
    const faqListWrapper = document.createElement('div');
    faqListWrapper.classList.add('faq-list');

    remainingDivs.forEach(div => {
        const details = createFaqItem(div);
        div.replaceWith(details);
        faqListWrapper.appendChild(details);
    });

    const faq = faqListWrapper.getElementsByTagName("details");
    faq[0].setAttribute("open", "");
    addEventListenerToFaqItems(faq);

    return faqListWrapper;
}

function createFaqItem(div) {
    const label = div.children[0];
    label.classList.add('faq-item-label');
    const summary = document.createElement('summary');
    summary.className = 'faq-item-label';
    summary.append(...label.childNodes);
    const body = div.children[1];
    body.classList.add('faq-item-body');
    const details = document.createElement('details');
    moveInstrumentation(div, details);
    details.className = 'faq-item';
    details.append(summary, body);

    return details;
}

function addEventListenerToFaqItems(faq) {
    for (let i = 0; i < faq.length; i++) {
        faq[i].addEventListener("click", function() {
            for (let j = 0; j < faq.length; j++) {
                if (j !== i) faq[j].removeAttribute("open");
            }
        });
    }
}

function appendElementsToBlock(block, faqListWrapper) {
    block.appendChild(faqListWrapper);

    const faqContentLeft = document.createElement('div');
    faqContentLeft.classList.add('faq-content-left');
    faqContentLeft.appendChild(block.querySelector('.faq-title'));
    faqContentLeft.appendChild(block.querySelector('.faq-list'));
    faqContentLeft.appendChild(block.querySelector('.view-more-faq'));

    const faqContentRight = document.createElement('div');
    faqContentRight.classList.add('faq-content-right');
    faqContentRight.appendChild(block.querySelector('.faq-picture'));

    block.appendChild(faqContentLeft);
    block.appendChild(faqContentRight);
}
