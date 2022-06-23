class Memo {
    memoList = [];
    memoCount = 0;

    createMemoItem(memoDate, memoContent) {
        this.memoList.push({
            id: this.memoCount,
            updatedDate: memoDate,
            content: memoContent,
        });

        this.memoCount++;
    }

    createInitialMemo(savedData) {
        if (savedData === null || savedData === undefined) return;

        for (let data of savedData) {
            this.createMemoItem(data.updatedDate, data.content);
        }
    }

    updateMemoItem(memoId, newContent) {
        let matchedIdx = this.findMemoIndex(memoId);

        if (matchedIdx === -1) return;

        this.memoList[matchedIdx].updatedDate = Date.now();
        this.memoList[matchedIdx].content = newContent;
    }

    getMemoItem(memoId) {
        return this.memoList.find((item) => item.id === memoId);
    }

    findMemoIndex(memoId) {
        return this.memoList.findIndex((item) => item.id === memoId);
    }

    deleteMemoItem(memoId) {
        let matchedIdx = this.findMemoIndex(memoId);

        if (matchedIdx === -1) return;

        this.memoList.splice(matchedIdx, 1);
    }

    set memoList(newMemoList) {
        this.memoList = newMemoList;
    }

    get memoList() {
        return this.memoList;
    }

    get getLastMemoItem() {
        return this.memoList[this.memoList.length - 1];
    }
}

class LocalStorage {
    saveDatas(dataName, saveData) {
        localStorage.setItem(dataName, JSON.stringify(saveData));
    }

    loadDatas(dataName) {
        return JSON.parse(localStorage.getItem(dataName));
    }
}

class MemoDOM {
    createdItems = [];
    ItemCount = 0;

    createDOM(memoInfo, parentUl) {
        const newLi = document.createElement('li');
        const newP = document.createElement('p');
        const newDiv2 = document.createElement('div');
        const newP2 = document.createElement('p');

        newLi.classList.add('memo-item');
        newP.classList.add('updated-date');
        newDiv2.classList.add('memo-content');

        newP2.innerText = memoInfo.content;
        newDiv2.appendChild(newP2);
        newP.innerText = new Date(memoInfo.updatedDate).toLocaleDateString();
        newLi.dataset.date = memoInfo.updatedDate;
        newLi.appendChild(newP);

        newLi.appendChild(newDiv2);
        newLi.dataset.id = memoInfo.id;

        this.createdItems.push(newLi);

        parentUl.appendChild(newLi);
        newLi.style.maxHeight = newLi.offsetHeight + 'px';

        this.ItemCount++;
    }

    createInitialDOM(memoList, parentUl) {
        for (let memoItem of memoList) {
            this.createDOM(memoItem, parentUl);
        }
    }

    updateDOM(memoInfo) {
        let matchedItem = this.getDOM(memoInfo.id);
        let itemDate = matchedItem.children[0];
        let itemContent = matchedItem.children[1].children[0];

        itemDate.innerText = new Date(memoInfo.updatedDate).toLocaleDateString();
        itemContent.innerText = memoInfo.content;
    }

    getDOM(memoId) {
        return this.createdItems.find((item) => +item.dataset.id === memoId);
    }

    deleteDOM(memoId) {
        let matchedItem = this.getDOM(memoId);
        matchedItem.parentElement.removeChild(matchedItem);
        this.createdItems.splice(this.findDOMIndex(memoId), 1);
    }

    findDOMIndex(memoId) {
        return this.createdItems.findIndex((item) => +item.dataset.id === memoId);
    }

    get createdItems() {
        return this.createdItems;
    }
}

class Modal {
    modalContainer = null;
    isOpen = false;

    constructor(elem, opened = false) {
        this.setContainer(elem);
        this.isOpen = opened;

        elem.addEventListener('wheel', this);
    }

    setContainer(container) {
        this.modalContainer = container;
    }

    showModal() {
        this.isOpen = true;
        this.modalContainer.classList.add('opened');

        if (currentMemoId !== -1) {
            document.querySelector('#memotext').value = myMemo.getMemoItem(currentMemoId).content;
        } else {
            document.querySelector('#memotext').value = '';
        }

        document.querySelector('#memotext').focus();
        document.querySelector('body').style.overflow = 'hidden';
    }

    hideModal() {
        this.isOpen = false;
        document.querySelector('body').style.overflow = '';
        this.modalContainer.classList.remove('opened');
    }

    wheelEvent(event) {
        if (this.isOpen) {
            event.preventDefault();
        }
    }

    handleEvent(event) {
        this[`${event.type}Event`](event);
    }

    get isOpen() {
        return this.isOpen;
    }
}

class PopupMenu {
    popupContainer = null;
    isOpen = false;
    selectedItemIdx = -1;

    constructor(elem, opened = false) {
        this.setContainer(elem);
        this.isOpen = opened;

        window.addEventListener('contextmenu', this);
        elem.addEventListener('click', this);
    }

    setContainer(elem) {
        this.popupContainer = elem;
    }

    contextmenuEvent(event) {
        if (event.target.closest('ul')?.id === 'memo-list') {
            event.preventDefault();

            this.selectedItemIdx = +event.target.closest('li').dataset.id;

            this.setPopupPos(this.mouseX(event), this.mouseY(event));
            this.showPopup();
        }
    }

    clickEvent(event) {
        if (event.target.tagName.toLowerCase() === 'button') {
            switch (event.target.dataset.action) {
                case 'edit':
                    myPopup.hidePopup();
                    myModal.showModal();
                    break;
                case 'delete':
                    myPopup.hidePopup();
                    myMemo.deleteMemoItem(this.selectedItemIdx);
                    // myMemoDOM.deleteDOM(this.selectedItemIdx);
                    myData.saveDatas('memo_list', myMemo.memoList);
                    updateListDOM();
                    break;
            }
        }
    }

    handleEvent(event) {
        this[`${event.type}Event`](event);
    }

    showPopup() {
        this.popupContainer.classList.add('show');
    }

    hidePopup() {
        this.popupContainer.classList.remove('show');
    }

    setPopupPos(posX, posY) {
        this.popupContainer.style.top = posY + 'px';
        this.popupContainer.style.left = posX + 'px';
    }

    mouseX(evt) {
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
    }

    mouseY(evt) {
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
    }

    get isOpen() {
        return this.isOpen;
    }

    get selectedItemIdx() {
        return this.selectedItemIdx;
    }
}

let currentMemoId = -1;

let parentUl = document.querySelector('#memo-list');

let myMemo = new Memo();
let myMemoDOM = new MemoDOM();
let myPopup = new PopupMenu(document.querySelector('#popup-menu'));
let myData = new LocalStorage();
let myModal = new Modal(document.querySelector('#modal-container'));

myMemo.createInitialMemo(myData.loadDatas('memo_list'));
myMemoDOM.createInitialDOM(myMemo.memoList, document.querySelector('#memo-list'));

const clickEvent = (event) => {
    if (event.target.closest('button') !== null) {
        switch (event.target.closest('button').dataset.action) {
            case 'addMemo':
                currentMemoId = -1;
                myModal.showModal();
                break;

            case 'setting':
                break;
        }
    }

    if (event.target.closest('div')?.className !== 'popup-content') {
        myPopup.hidePopup();
    }
};

const dblclick = (event) => {
    if (event.target.className === 'memo-item') {
        currentMemoId = +event.target.dataset.id;
        myModal.showModal();
    }
};

const keydownEvent = (event) => {
    if (event.code === 'Escape' && myModal.isOpen) {
        let memoContent = document.querySelector('#memotext').value;

        if (currentMemoId === -1) {
            myMemo.createMemoItem(Date.now(), memoContent);
        } else {
            myMemo.updateMemoItem(currentMemoId, memoContent);
        }

        myData.saveDatas('memo_list', myMemo.memoList);
        myModal.hideModal();

        updateListDOM();
    }
};

const contextmenuEvent = (event) => {
    if (event.target.closest('li')?.className === 'memo-item') {
        currentMemoId = myPopup.selectedItemIdx;
    }
};

const handleEvent = (event) => {
    switch (event.type) {
        case 'click':
            clickEvent(event);
            break;

        case 'dblclick':
            dblclick(event);
            break;

        case 'keydown':
            keydownEvent(event);
            break;

        case 'contextmenu':
            contextmenuEvent(event);
            break;
    }
};

window.addEventListener('click', handleEvent);
window.addEventListener('dblclick', handleEvent);
window.addEventListener('keydown', handleEvent);
window.addEventListener('contextmenu', handleEvent);

parentUl.addEventListener('animationend', (event) => {
    if (event.target.classList.contains('hide')) {
        if (parentUl.contains(event.target)) {
            myMemoDOM.deleteDOM(currentMemoId);
        }
    }
});

const updateListDOM = () => {
    let noItem = document.querySelector('.memo-item.no-item');

    if (noItem !== null && myMemo.memoCount !== 0) {
        noItem.parentElement.removeChild(noItem);
    }

    let newList = myMemo.memoList.sort((a, b) => a.updatedDate - b.updatedDate);
    if (newList.length === 0) return;

    let createdIds = myMemoDOM.createdItems.map((item) => +item.dataset.id);
    let deletedList = createdIds.filter(
        (elem) => ![...newList.map((item) => item.id)].includes(elem)
    );
    let addedList = newList.filter((item) => !createdIds.includes(item.id));

    let updatedList = [];

    newList.forEach((item) => {
        let matchedItem = myMemoDOM.createdItems.filter((elem) => +elem.dataset.id === item.id);
        if (matchedItem.length !== 0 && +matchedItem[0]?.dataset.date !== item.updatedDate) {
            updatedList.push(item);
        }
    });

    // console.log(
    //     `createdIds: ${createdIds}
    //     addedList: ${addedList}
    //     deletedList: ${deletedList}
    //     updatedList: ${updatedList}`
    // );

    if (updatedList.length !== 0) {
        for (let updatedItem of updatedList) {
            myMemoDOM.deleteDOM(updatedItem.id);
            myMemoDOM.createDOM(updatedItem, parentUl);
        }
    } else if (deletedList.length !== 0) {
        for (let deletedItemId of deletedList) {
            let elem = myMemoDOM.getDOM(deletedItemId);
            elem.style.maxHeight = '0px';
            elem.classList.add('hide');
        }
    } else if (addedList.length !== 0) {
        for (let addedItem of addedList) {
            myMemoDOM.createDOM(addedItem, parentUl);
        }
    }
};

const autoHeight = (element) => {
    element.style.height = '5px';
    element.style.height = element.scrollHeight + 'px';
};

updateListDOM();
