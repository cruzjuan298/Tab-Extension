const divContainer = document.getElementById("div-container");
const addButton = document.getElementById("add-session-button");
const editButton = document.getElementById("edit-session-button");

let editModeState = false;
let windowCount = 0;


getStoredWindows().forEach((session, index) => {
    const sessionElement = createHtmlList(session.urlsData, session.sessionId, index + 1);
    divContainer.insertBefore(sessionElement, null);
    })


//getting stored windows in order to edit or delete 
function getStoredWindows(){
    return JSON.parse(localStorage.getItem("window-session")) || [];
}
//storing the session in local storage with the value corresponding with the object that gets passed
function storeWindows(sessionData){
    let storedData = getStoredWindows();
    storedData.push(sessionData);
    localStorage.setItem("window-session", JSON.stringify(storedData));
}

//checking if there are no saved browser sessions; displays generic text
function checkPlaceHolder(){
    const ulElements = divContainer.getElementsByClassName("ul-list");
    const placeHolderElement = document.getElementById("placeholder");
    if (ulElements.length === 0 && !placeHolderElement){
        const placeHolderElement = document.createElement('p');
        placeHolderElement.id = "placeholder";
        placeHolderElement.textContent = "Any saved windows will show up here...";
        divContainer.appendChild(placeHolderElement);
    } else if (ulElements.length > 0 && placeHolderElement){
        placeHolderElement.remove();
    }
}

//Add session on click
addButton.addEventListener("click", async () => {
    await addTabsList();
    if (editModeState ){
        updateDeleteButton("visible");
    }
});

//Edit session with click
editButton.addEventListener("click", async () => {
    editModeState = !editModeState;
    const visibility = editModeState ? "visible" : "hidden";
    updateDeleteButton(visibility);
})

//Event Delegation used to target the delete button that is being clicked
divContainer.addEventListener("click", (event) => {
    if (event.target.classList.contains("delete-button")) {
        const deleteButton = event.target;
        const sessionWindow = parseInt(deleteButton.closest(".ul-list").dataset.sessionId);
        console.log(sessionWindow);
        deleteWindow(sessionWindow);
    }
})

//Fetch Urls from the currect session
async function getUrls(){
    return new Promise((resolve) => {
        chrome.tabs.query({currentWindow: true}, (tabs) => {
            const tabsList = tabs.map(tab => tab.url);
            resolve(tabsList);
        });
    });
}
//Create the Html for the session
function createHtmlList(urls, id, index){
    const ulElement = document.createElement("ul");
    ulElement.classList.add("ul-list");
    ulElement.textContent = `Browser Session ${index}`;
    ulElement.dataset.sessionId = id;

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-button");
    deleteButton.style.visibility = "hidden";
    deleteButton.textContent = `Delete Session ${index}`;
    //console.log(windowNum)
    ulElement.appendChild(deleteButton);

    urls.forEach(url => {
        let liElement = document.createElement('li');
        liElement.classList.add("li-list");

        let aElement= document.createElement('a');
        aElement.setAttribute('href', url);
        aElement.setAttribute('target', '_blank');
        aElement.textContent = new URL(url).hostname;

        liElement.appendChild(aElement);
        ulElement.appendChild(liElement);
    })

    return ulElement
}
//add new lists to the container
async function addTabsList(){
    const urls = await getUrls();

    const sessionData = {
        urlsData: urls,
        sessionId: Math.floor(Math.random() * 1000000)
    }
    
    storeWindows(sessionData);
    
    const index = getStoredWindows().length
    const tabshHtml =  createHtmlList(urls, sessionData.sessionId, index);
    divContainer.appendChild(tabshHtml);
    checkPlaceHolder();
}

//deleting a session by looking for the specific window
function deleteWindow(sessionId){
    const ulElements = Array.from(divContainer.getElementsByClassName("ul-list"));
    const elementToRemove = ulElements.find(ul => parseInt(ul.dataset.sessionId) === sessionId);

    if(elementToRemove){
        elementToRemove.remove();
        deleteFromLocalStorage(sessionId)
        updateWindows();
    }
}

//updates window so that when a one is added or deleted, the proper data is saved
function updateWindows(){
    const ulElements = Array.from(divContainer.getElementsByClassName("ul-list"));

    ulElements.forEach((ul, index) => {
        const newSessionNumber = index + 1;
        ul.dataset.sessionNumber = newSessionNumber;
        ul.childNodes[0].textContent = `Browser Session ${newSessionNumber}`;
        const deleteButton = ul.querySelector(".delete-button");
        deleteButton.textContent = `Delete Session ${newSessionNumber}`;
    })
    checkPlaceHolder();
}

//updates visibility of the delete buttons
function updateDeleteButton(visibility){
    const deleteButtons = document.getElementsByClassName("delete-button");
    for (let i = 0; i < deleteButtons.length; i++){
    deleteButtons[i].style.visibility = visibility;
    }
}

function deleteFromLocalStorage(sessionId){
    let storedData = getStoredWindows();

    storedData = storedData.filter(session => session.sessionId != sessionId)
    localStorage.setItem("window-session", JSON.stringify(storedData))

}
checkPlaceHolder()
//currect bug where the window count isnt being retirved properly and its causing the sessions to be numbered incorrectly