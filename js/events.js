let memoList = [];
let memoCount = 0;

// Item 구조
// let memoItem = {
//     id: 0,
//     updatedDate: Date,
//     content: String,
// }

const menuList = document.querySelector('.menu-list').addEventListener('click', (event) => {
    let action = event.target.closest('button').dataset.action;

    if (action === 'addMemo') {
        setModalData('-1');
        showModal();
    } else if (action === 'settings') {
        alert('settings');
    }
});

const popupMenuList = document.querySelector('#popup-menu').addEventListener('click', (event) => {
    let action = event.target.dataset.action;

    showPopup(false);
    if (action === 'edit') {
        showModal();
    } else if (action === 'delete') {
        let itemId = +document.querySelector('#modal-container').dataset.id;
        console.log(itemId);
        deleteMemoItem(itemId);
    }
});

const memoItemList = document
    .querySelector('.memo-list-container')
    .addEventListener('dblclick', (event) => {
        if (event.target.className === 'memo-item') {
            setModalData(event.target.dataset.id);
            showModal();
        }
    });

document.querySelector('.close-field').addEventListener('click', (event) => {
    showModal(false);
});

document.querySelector('#searchMemo').addEventListener('input', (event) => {
    let searchMemo = document.querySelector('#searchMemo').value;
    let result = memoList.filter((item) => {
        if (item.content.indexOf(searchMemo) > -1) return true;
    });
});

const saveMemoDatas = () => {
    if (memoList.length === 0) return;
    localStorage.setItem('memoList', JSON.stringify(memoList));
};

const loadMemoDatas = () => {
    let tmpMemoList = localStorage.getItem('memoList');

    if (tmpMemoList === null) return;

    memoList = JSON.parse(tmpMemoList);
    memoCount = memoList.length;
};

const createMemoDOM = (itemInfo) => {
    const newLi = document.createElement('li');
    const newP = document.createElement('p');
    const newDiv2 = document.createElement('div');
    const newP2 = document.createElement('p');

    newLi.classList.add('memo-item');
    newP.classList.add('updated-date');
    newDiv2.classList.add('memo-content');

    newP2.innerText = itemInfo.content;
    newDiv2.appendChild(newP2);
    newP.innerText = new Date(itemInfo.updatedDate).toLocaleDateString();
    newLi.dataset.date = itemInfo.updatedDate;
    newLi.appendChild(newP);

    newLi.appendChild(newDiv2);
    newLi.dataset.id = itemInfo.id;

    return newLi;
};

const updateMemoItem = (memoId) => {
    let curItem = document.querySelector(`.memo-item[data-id="${memoId}"]`);
    if (curItem === null) return;

    let itemDate = curItem.querySelector('p');
    let itemContent = curItem.querySelector('div.memo-content p');

    let lstIdx = memoList.findIndex((item) => item.id === memoId);

    itemDate.innerText = new Date(memoList[lstIdx].updatedDate).toLocaleDateString();
    itemContent.innerText = memoList[lstIdx].content;
};

const updateMemoList = () => {
    let noItem = document.querySelector('.memo-item.no-item');

    if (noItem !== null && memoList.length !== 0) {
        noItem.parentElement.removeChild(noItem);
    }

    let newList = memoList.sort((a, b) => a.updatedDate - b.updatedDate);

    if (newList.length === 0) return;

    let createdItems = [...document.querySelectorAll('#memo-list li')];
    let createdIds = createdItems.map((item) => +item.dataset.id) || [];

    let deletedList =
        createdIds.filter((item) => ![...newList.map((item) => item.id)].includes(item)) || [];

    let addedList = newList.filter((item) => !createdIds.includes(item.id));

    let updatedList = [];

    newList.forEach((item) => {
        let matchedItem = createdItems.filter((elem) => +elem.dataset.id === item.id);
        if (matchedItem.length !== 0 && +matchedItem[0]?.dataset.date !== item.updatedDate) {
            updatedList.push(item);
        }
    });

    console.log(
        `createdIds: ${createdIds}
        addedList: ${addedList}
        deletedList: ${deletedList}
        updatedList: ${updatedList}`
    );

    let parentUl = document.querySelector('#memo-list');

    if (updatedList.length !== 0) {
        for (let updatedItem of updatedList) {
            console.log(updatedItem);
            deleteMemoItem(updatedItem.id, true);
            let newItem = createMemoDOM(updatedItem);
            parentUl.appendChild(newItem);
            newItem.style.maxHeight = newItem.offsetHeight + 'px';
        }
    } else if (deletedList.length !== 0) {
        for (let deletedItemId of deletedList) {
            let elem = document.querySelector(`li[data-id="${deletedItemId}"]`);
            elem.style.maxHeight = '0px';
            elem.classList.add('hide');
            memoCount--;
        }
    } else if (addedList.length !== 0) {
        for (let addedItem of addedList) {
            const newItem = createMemoDOM(addedItem);
            parentUl.appendChild(newItem);
            newItem.style.maxHeight = newItem.offsetHeight + 'px';
            memoCount++;
        }
    }
};

const deleteMemoDOM = (memoId) => {
    let parentUl = document.querySelector('#memo-list');
    let elem = document.querySelector(`li[data-id="${memoId}"]`);

    parentUl.removeChild(elem);
};

const deleteMemoItem = (memoId, preventUpdate = false) => {
    let lstIdx = memoList.findIndex((item) => item.id === memoId);
    if (lstIdx === -1) return;

    memoList.splice(lstIdx, 1);
    memoCount--;
    if (!preventUpdate) saveMemoDatas();
    deleteMemoDOM(memoId);
};

const setModalData = (value) => {
    const myContainer = document.querySelector('#modal-container');
    myContainer.dataset.id = value;
    if (value === '') myContainer.dataset.id = '';
};

const showModal = (isOpen = true) => {
    const myContainer = document.querySelector('#modal-container');
    const body = document.querySelector('body');

    if (isOpen) {
        let memoId = memoList.findIndex((item) => item.id === +myContainer.dataset.id);
        document.querySelector('#memotext').value = memoId !== -1 ? memoList[memoId].content : '';

        body.style.overflow = 'hidden';

        myContainer.classList.add('opened');
        document.querySelector('#memotext').focus();
    } else {
        body.style.overflowY = '';
        myContainer.classList.remove('opened');
    }
};

const auto_grow = (element) => {
    element.style.height = '5px';
    element.style.height = element.scrollHeight + 'px';
};

const setPopupPos = (posX, posY) => {
    let popupMenu = document.querySelector('#popup-menu');

    popupMenu.style.top = posY + 'px';
    popupMenu.style.left = posX + 'px';
};

const showPopup = (show = true) => {
    let popupMenu = document.querySelector('#popup-menu');

    if (show) {
        popupMenu.classList.add('show');
    } else {
        popupMenu.classList.remove('show');
        document.querySelector('#memotext').value = '';
    }
};

window.addEventListener('keydown', (event) => {
    if (event.code === 'Escape') {
        const myContainer = document.querySelector('#modal-container');

        if (myContainer.classList.contains('opened')) {
            let memoContent = document.querySelector('#memotext').value;

            let item = {
                id: +myContainer.dataset.id < 0 ? memoCount : +myContainer.dataset.id,
                updatedDate: Date.now(),
                content: memoContent,
            };

            console.log(item);

            let itemIdx = memoList.filter((elem) => elem.id === item.id)[0];

            console.log(itemIdx);

            if (itemIdx === undefined) {
                memoList.push(item);
            } else {
                memoList[itemIdx] = item;
            }

            saveMemoDatas();
            updateMemoList();

            showModal(false);
        }
    }
});

window.addEventListener('DOMContentLoaded', (event) => {
    loadMemoDatas();
    updateMemoList();
});

window.addEventListener('contextmenu', (event) => {
    if (event.target.closest('ul')?.id === 'memo-list') {
        event.preventDefault();

        setModalData(event.target.dataset.id);
        setPopupPos(mouseX(event), mouseY(event));
        showPopup();
    }
});

window.addEventListener('click', (event) => {
    if (event.target.closest('div')?.className !== 'popup-content') {
        showPopup(false);
    }
});

window.addEventListener(
    'wheel',
    (event) => {
        const myContainer = document.querySelector('#modal-container');

        if (myContainer.classList.contains('opened')) {
            event.preventDefault();
        }
    },
    { passive: false }
);

const mouseX = (evt) => {
    if (evt.pageX) {
        return evt.pageX;
    } else if (evt.clientX) {
        return (
            evt.clientX +
            (document.documentElement.scrollLeft
                ? document.documentElement.scrollLeft
                : document.body.scrollLeft)
        );
    } else {
        return null;
    }
};

const mouseY = (evt) => {
    if (evt.pageY) {
        return evt.pageY;
    } else if (evt.clientY) {
        return (
            evt.clientY +
            (document.documentElement.scrollTop
                ? document.documentElement.scrollTop
                : document.body.scrollTop)
        );
    } else {
        return null;
    }
};
