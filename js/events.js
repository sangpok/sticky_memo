let memoList = [];

// Item 구조
// let memoItem = {
//     id: 0,
//     updatedDate: Date,
//     content: String,
// }

const menuList = document.querySelector('.menu-list').addEventListener('click', (event) => {
    let action = event.target.closest('button').dataset.action;

    if (action === 'addMemo') {
        setModalData(memoList.length);
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
};

const createMemoDOM = (itemInfo) => {
    const newDiv = document.createElement('div');
    const newP = document.createElement('p');
    const newDiv2 = document.createElement('div');
    const newP2 = document.createElement('p');

    newDiv.classList.add('memo-item');
    newP.classList.add('updated-date');
    newDiv2.classList.add('memo-content');

    newP2.innerText = itemInfo.content;
    newDiv2.appendChild(newP2);
    newP.innerText = new Date(itemInfo.updatedDate).toLocaleDateString();
    newP.dataset.date = itemInfo.updatedDate;
    newDiv.appendChild(newP);

    newDiv.appendChild(newDiv2);
    newDiv.dataset.id = itemInfo.id;

    return newDiv;
};

const updateMemoItem = (memoId) => {
    let curItem = document.querySelector(`.memo-item[data-id="${memoId}"]`);
    if (curItem === null) return;

    let itemDate = curItem.querySelector('p');
    let itemContent = curItem.querySelector('div.memo-content p');

    let lstIdx = memoList.findIndex((item) => item.id === memoId);

    itemDate.innerText = memoList[lstIdx].updatedDate;
    itemContent.innerText = memoList[lstIdx].content;
};

const updateMemoList = () => {
    let noItem = document.querySelector('.memo-item.no-item');

    if (noItem !== null && memoList.length !== 0) {
        noItem.parentElement.removeChild(noItem);
    }

    let createdItems = document.querySelectorAll('.memo-item[data-id]');

    // let newMemoList = memoList.sort((a, b) => a.updatedDate - b.updatedDate);

    // for (let memoItem of newMemoList) {
    //     let createdItem = document.querySelector(`.memo-item[data-id="${memoItem.id}"]`);

    //     if (createdItem === null) {
    //         let newItem = createMemoDOM(memoItem);
    //         document.querySelector('.memo-list').appendChild(newItem);
    //     } else {
    //         let tmpDate = +createdItem.querySelector('[data-date]').dataset.date;

    //         if (tmpDate !== memoItem.updatedDate) {
    //             createdItem.querySelector('[data-date]').dataset.date = memoItem.updatedDate;
    //             createdItem.querySelector('[data-date]').innerText = new Date(
    //                 memoItem.updatedDate
    //             ).toLocaleDateString();
    //             createdItem.querySelector('.memo-content p').innerText = memoItem.content;
    //         }
    //     }
    // }
};

const deleteMemoItem = (memoId) => {
    let lstIdx = memoList.findIndex((item) => item.id === memoId);
    console.log(lstIdx);
    if (lstIdx === -1) return;

    memoList.splice(lstIdx, 1);
    saveMemoDatas();
    updateMemoList();
};

const setModalData = (value) => {
    const myContainer = document.querySelector('#modal-container');
    myContainer.dataset.id = value;
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
    }
};

window.addEventListener('keydown', (event) => {
    if (event.code === 'Escape') {
        const myContainer = document.querySelector('#modal-container');

        if (myContainer.classList.contains('opened')) {
            let memoContent = document.querySelector('#memotext').value;

            let item = {
                id: +myContainer.dataset.id || memoList.length,
                updatedDate: Date.now(),
                content: memoContent,
            };

            let itemIdx = memoList.reduce((acc, cur, idx) => {
                if (cur.id === item.id) return idx;
                else return acc;
            }, -1);

            if (itemIdx === -1) {
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
    if (event.target.closest('div')?.className === 'memo-item') {
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

let testList = [
    { id: 0, value: 'A' },
    { id: 1, value: 'B' },
    { id: 2, value: 'C' },
];

document.querySelector('#test-div').addEventListener('click', (event) => {
    if (event.target.id === 'add') {
        // 추가
        testList.push({
            id: testList.length,
            value: testList.length + 1,
        });
    } else if (event.target.id === 'delete') {
        // 제거
        // testList.pop();
        testList.splice(2, 1);
    }
    updateList();
});

const updateList = () => {
    let curList = [...document.querySelectorAll('#test-ul li')];
    let curIdList = curList.map((item) => +item.dataset.id);

    let deletedList = curIdList.filter(
        (item) => ![...testList.map((item) => item.id)].includes(item)
    );

    let addedList = testList.filter((item) => !curIdList.includes(item.id));
    console.log(deletedList, addedList);

    if (deletedList.length !== 0) {
        for (let deletedItemId of deletedList) {
            let elem = document.querySelector(`li[data-id="${deletedItemId}"]`);
            elem.classList.add('hide');
        }
    } else if (addedList.length !== 0) {
        let parentUl = document.querySelector('#test-ul');

        for (let addedItem of addedList) {
            const newLi = document.createElement('li');
            newLi.dataset.id = addedItem.id;
            newLi.innerText = addedItem.value;
            parentUl.appendChild(newLi);
        }
    }
};

let parentUl = document.querySelector('#test-ul');
parentUl.addEventListener('animationend', (event) => {
    if (event.target.classList.contains('hide')) {
        if (parentUl.contains(event.target)) parentUl.removeChild(event.target);
    }
});
parentUl.addEventListener('animationstart', (event) => {
    parentUl.style.height = `${
        event.target.offsetHeight * testList.length + 12 * (testList.length - 1)
    }px`;
});

updateList();
